import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, userCards, reviewLogs, userBookmarks } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type { UserState, UserHadithProgress, UserReviewLog } from "@/types";
import { getLocalDateString } from "@/lib/date-utils";
import { calculateLevel } from "@/lib/user-storage";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const action = body.action as "pull" | "push";

    if (!action || (action !== "pull" && action !== "push")) {
      return NextResponse.json(
        { error: "Invalid action. Expected 'pull' or 'push'." },
        { status: 400 }
      );
    }

    if (action === "pull") {
      // 1. Fetch user record
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const userRow = userRows[0];

      // 2. Fetch user cards
      const cardRows = await db
        .select()
        .from(userCards)
        .where(eq(userCards.userId, userId));

      const cards: Record<number, UserHadithProgress> = {};
      for (const row of cardRows) {
        cards[row.hadithId] = {
          hadithId: row.hadithId,
          card: {
            due: row.due.toISOString(),
            stability: row.stability,
            difficulty: row.difficulty,
            elapsed_days: row.elapsed_days,
            scheduled_days: row.scheduled_days,
            learning_steps: 0,
            reps: row.reps,
            lapses: row.lapses,
            state: row.state as any,
            last_review: row.last_review ? row.last_review.toISOString() : undefined,
          },
          firstLearnedAt: row.createdAt.toISOString(),
          lastReviewedAt: row.last_review
            ? row.last_review.toISOString()
            : row.updatedAt.toISOString(),
          totalReviews: row.reps,
        };
      }

      // 3. Fetch review logs (up to 500)
      const logRows = await db
        .select()
        .from(reviewLogs)
        .where(eq(reviewLogs.userId, userId))
        .orderBy(desc(reviewLogs.reviewedAt))
        .limit(500);

      const reviewLogsList: UserReviewLog[] = logRows.map((log) => ({
        id: log.id,
        hadithId: log.hadithId,
        rating: log.rating as any,
        reviewedAt: log.reviewedAt.toISOString(),
        elapsedDays: 0,
        scheduledDays: 0,
      }));

      // 4. Fetch bookmarks
      const bookmarkRows = await db
        .select()
        .from(userBookmarks)
        .where(eq(userBookmarks.userId, userId));

      const bookmarkedHadithIds = bookmarkRows.map((b) => b.hadithId);
      const activeHadithIds = Object.keys(cards).map(Number);

      const memorizedCount = Object.values(cards).filter(
        (c) => c.card.state === 2 || c.card.reps >= 2
      ).length;
      const level = calculateLevel(memorizedCount);
      const totalReviews = Object.values(cards).reduce(
        (acc, c) => acc + (c.totalReviews || 0),
        0
      );

      const hasCompletedOnboarding = Boolean(
        userRow &&
          (userRow.currentStreak > 0 ||
            Object.keys(cards).length > 0 ||
            reviewLogsList.length > 0)
      );

      const userState: UserState = {
        userId,
        displayName: userRow?.name || session.user.name || "طالب العلم",
        createdAt:
          userRow?.emailVerified?.toISOString() || new Date().toISOString(),
        dailyGoal: userRow?.dailyGoal ?? 3,
        currentStreak: userRow?.currentStreak ?? 0,
        longestStreak: userRow?.highestStreak ?? 0,
        streakShields: userRow?.shields ?? 0,
        lastReviewDate: userRow?.lastActiveAt
          ? getLocalDateString(new Date(userRow.lastActiveAt))
          : null,
        totalReviews,
        level,
        cards,
        reviewLogs: reviewLogsList,
        bookmarkedHadithIds,
        activeHadithIds,
        hasCompletedOnboarding,
      };

      return NextResponse.json({ success: true, state: userState });
    }

    if (action === "push") {
      const state = (body.state || body) as UserState;
      if (!state || typeof state !== "object") {
        return NextResponse.json(
          { error: "Missing state object in push request" },
          { status: 400 }
        );
      }

      // 1. Upsert users table
      const lastActiveDate = state.lastReviewDate
        ? new Date(state.lastReviewDate + "T00:00:00")
        : null;

      await db
        .update(users)
        .set({
          dailyGoal: state.dailyGoal ?? 3,
          currentStreak: state.currentStreak ?? 0,
          highestStreak: Math.max(
            state.longestStreak ?? 0,
            state.currentStreak ?? 0
          ),
          shields: state.streakShields ?? 0,
          lastActiveAt: lastActiveDate,
        })
        .where(eq(users.id, userId));

      // 2. Upsert userCards in safe batches
      const cardsList = Object.values(state.cards || {}) as UserHadithProgress[];
      if (cardsList.length > 0) {
        const cardValues = cardsList.map((item) => ({
          userId,
          hadithId: item.hadithId,
          state: item.card.state,
          due: new Date(item.card.due),
          stability: item.card.stability,
          difficulty: item.card.difficulty,
          elapsed_days: item.card.elapsed_days,
          scheduled_days: item.card.scheduled_days,
          reps: item.card.reps,
          lapses: item.card.lapses,
          last_review: item.card.last_review
            ? new Date(item.card.last_review)
            : null,
          createdAt: item.firstLearnedAt
            ? new Date(item.firstLearnedAt)
            : new Date(),
          updatedAt: new Date(),
        }));

        const chunkSize = 100;
        for (let i = 0; i < cardValues.length; i += chunkSize) {
          const chunk = cardValues.slice(i, i + chunkSize);
          await db
            .insert(userCards)
            .values(chunk)
            .onConflictDoUpdate({
              target: [userCards.userId, userCards.hadithId],
              set: {
                state: sql`excluded."state"`,
                due: sql`excluded."due"`,
                stability: sql`excluded."stability"`,
                difficulty: sql`excluded."difficulty"`,
                elapsed_days: sql`excluded."elapsed_days"`,
                scheduled_days: sql`excluded."scheduled_days"`,
                reps: sql`excluded."reps"`,
                lapses: sql`excluded."lapses"`,
                last_review: sql`excluded."last_review"`,
                updatedAt: sql`excluded."updatedAt"`,
              },
            });
        }
      }

      // 3. Insert review logs if provided
      if (state.reviewLogs && state.reviewLogs.length > 0) {
        const logsToInsert = state.reviewLogs.slice(0, 500).map((log) => ({
          id: log.id || crypto.randomUUID(),
          userId,
          hadithId: log.hadithId,
          rating: log.rating,
          state: (log as any).state ?? 2,
          reviewedAt: new Date(log.reviewedAt),
        }));

        const chunkSize = 100;
        for (let i = 0; i < logsToInsert.length; i += chunkSize) {
          const chunk = logsToInsert.slice(i, i + chunkSize);
          await db
            .insert(reviewLogs)
            .values(chunk)
            .onConflictDoNothing({ target: reviewLogs.id });
        }
      }

      // 4. Sync bookmarks
      if (Array.isArray(state.bookmarkedHadithIds)) {
        await db
          .delete(userBookmarks)
          .where(eq(userBookmarks.userId, userId));

        if (state.bookmarkedHadithIds.length > 0) {
          const bookmarkValues = state.bookmarkedHadithIds.map((hadithId) => ({
            userId,
            hadithId,
            createdAt: new Date(),
          }));
          const chunkSize = 100;
          for (let i = 0; i < bookmarkValues.length; i += chunkSize) {
            const chunk = bookmarkValues.slice(i, i + chunkSize);
            await db
              .insert(userBookmarks)
              .values(chunk)
              .onConflictDoNothing();
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Synced successfully",
      });
    }

    return NextResponse.json({ error: "Unhandled action" }, { status: 400 });
  } catch (error: any) {
    console.error("Sync API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
