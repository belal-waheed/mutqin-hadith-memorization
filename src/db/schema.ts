import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  real,
  unique,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

// ==========================================
// Auth.js (NextAuth) Tables
// ==========================================

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  
  // Mutqin Specific Application Data
  dailyGoal: integer("dailyGoal").default(3).notNull(),
  currentStreak: integer("currentStreak").default(0).notNull(),
  highestStreak: integer("highestStreak").default(0).notNull(),
  shields: integer("shields").default(0).notNull(),
  lastActiveAt: timestamp("lastActiveAt", { mode: "date" }),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
)

// ==========================================
// Mutqin Domain Tables (FSRS & Progress)
// ==========================================

export const userCards = pgTable("user_card", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  hadithId: integer("hadithId").notNull(),
  
  // FSRS Core State Fields
  state: integer("state").notNull(), // 0: New, 1: Learning, 2: Review, 3: Relearning
  due: timestamp("due", { mode: "date" }).notNull(),
  stability: real("stability").notNull(),
  difficulty: real("difficulty").notNull(),
  elapsed_days: integer("elapsed_days").notNull(),
  scheduled_days: integer("scheduled_days").notNull(),
  reps: integer("reps").notNull(),
  lapses: integer("lapses").notNull(),
  last_review: timestamp("last_review", { mode: "date" }),
  
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
}, (table) => [
  unique().on(table.userId, table.hadithId),
])

export const reviewLogs = pgTable("review_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  hadithId: integer("hadithId").notNull(),
  
  rating: integer("rating").notNull(), // 1: Again, 2: Hard, 3: Good, 4: Easy
  state: integer("state").notNull(), // The state of the card when reviewed
  reviewedAt: timestamp("reviewedAt", { mode: "date" }).defaultNow().notNull(),
})

export const userBookmarks = pgTable("user_bookmark", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  hadithId: integer("hadithId").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
}, (table) => [
  primaryKey({
    columns: [table.userId, table.hadithId],
  }),
])
