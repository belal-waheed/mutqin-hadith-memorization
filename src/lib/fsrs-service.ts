import { fsrs, createEmptyCard, Rating, State, type Card, type Grade, generatorParameters } from 'ts-fsrs';
import type { SerializedCard, UserHadithProgress, UserReviewLog } from '@/types';

// Default FSRS instance with 90% target retention
const f = fsrs(generatorParameters({ request_retention: 0.9 }));

export { Rating, State };
export type { Grade };

/**
 * Converts a serialized card (from JSON/localStorage) to a ts-fsrs Card object with real Dates
 */
export function deserializeCard(sc: SerializedCard): Card {
  return {
    due: new Date(sc.due),
    stability: sc.stability,
    difficulty: sc.difficulty,
    elapsed_days: sc.elapsed_days,
    scheduled_days: sc.scheduled_days,
    learning_steps: sc.learning_steps ?? 0,
    reps: sc.reps,
    lapses: sc.lapses,
    state: sc.state,
    last_review: sc.last_review ? new Date(sc.last_review) : undefined,
  };
}

/**
 * Converts a ts-fsrs Card object to a plain JSON-serializable object
 */
export function serializeCard(card: Card): SerializedCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : undefined,
  };
}

/**
 * Initializes a new FSRS card for a newly started hadith
 */
export function initNewCard(): SerializedCard {
  const empty = createEmptyCard(new Date());
  return serializeCard(empty);
}

/**
 * Calculates the next review state for all 4 grades (Again, Hard, Good, Easy)
 * Used to display preview intervals on review buttons (e.g. "10 د", "يوم", "3 أيام", "7 أيام")
 */
export function getRatingIntervalPreviews(serializedCard: SerializedCard, now: Date = new Date()) {
  const card = deserializeCard(serializedCard);
  const schedulingCards = f.repeat(card, now);

  const formatInterval = (due: Date) => {
    const diffMs = due.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${Math.max(1, diffMinutes)} د`;
    }
    if (diffHours < 24) {
      return `${diffHours} س`;
    }
    if (diffDays === 1) {
      return 'يوم';
    }
    if (diffDays === 2) {
      return 'يومان';
    }
    if (diffDays <= 10) {
      return `${diffDays} أيام`;
    }
    return `${diffDays} يوم`;
  };

  return {
    [Rating.Again]: {
      label: 'أعِد',
      intervalText: formatInterval(schedulingCards[Rating.Again].card.due),
      card: serializeCard(schedulingCards[Rating.Again].card),
    },
    [Rating.Hard]: {
      label: 'صعب',
      intervalText: formatInterval(schedulingCards[Rating.Hard].card.due),
      card: serializeCard(schedulingCards[Rating.Hard].card),
    },
    [Rating.Good]: {
      label: 'جيد',
      intervalText: formatInterval(schedulingCards[Rating.Good].card.due),
      card: serializeCard(schedulingCards[Rating.Good].card),
    },
    [Rating.Easy]: {
      label: 'سهل',
      intervalText: formatInterval(schedulingCards[Rating.Easy].card.due),
      card: serializeCard(schedulingCards[Rating.Easy].card),
    },
  };
}

/**
 * Applies a review grade to a card and returns the updated progress and log
 */
export function applyReviewRating(
  currentProgress: UserHadithProgress,
  grade: Grade,
  now: Date = new Date()
): { updatedProgress: UserHadithProgress; reviewLog: UserReviewLog } {
  const card = deserializeCard(currentProgress.card);
  const nextResult = f.next(card, now, grade);
  const updatedCard = serializeCard(nextResult.card);

  const reviewLog: UserReviewLog = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log_${Date.now()}_${Math.random()}`,
    hadithId: currentProgress.hadithId,
    rating: grade,
    reviewedAt: now.toISOString(),
    elapsedDays: nextResult.card.elapsed_days,
    scheduledDays: nextResult.card.scheduled_days,
  };

  const updatedProgress: UserHadithProgress = {
    hadithId: currentProgress.hadithId,
    card: updatedCard,
    firstLearnedAt: currentProgress.firstLearnedAt || now.toISOString(),
    lastReviewedAt: now.toISOString(),
    totalReviews: currentProgress.totalReviews + 1,
  };

  return { updatedProgress, reviewLog };
}
