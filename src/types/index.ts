import type { Card as FSRSCard, State, Rating } from 'ts-fsrs';

export type QuizMode = 'partial' | 'blanks' | 'narrator';

export interface Hadith {
  id: number;
  globalId: string;
  bookId: number;       // 1 = Bukhari, 2 = Muslim
  bookName: string;     // صحيح البخاري / صحيح مسلم
  chapterId: number;
  chapterTitle: string;
  idInBook: number;
  arabic: string;
}

export interface Chapter {
  id: number;
  bookId: number;
  arabic: string;
}

export interface BookMetadata {
  id: number;
  name: string;
  author: string;
  totalHadiths: number;
  chapters: Chapter[];
}

export interface AppMetadata {
  books: BookMetadata[];
  totalHadiths: number;
}

export interface SerializedCard {
  due: string;              // ISO string
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: State;
  last_review?: string;     // ISO string
}

export interface UserHadithProgress {
  hadithId: number;
  card: SerializedCard;
  firstLearnedAt: string;   // ISO string
  lastReviewedAt: string;   // ISO string
  totalReviews: number;
}

export interface UserReviewLog {
  id: string;
  hadithId: number;
  rating: Rating;
  reviewedAt: string;       // ISO string
  elapsedDays: number;
  scheduledDays: number;
}

export interface UserState {
  userId: string;
  displayName: string;
  createdAt: string;
  dailyGoal: number;          // Default: 3 new hadiths per day
  currentStreak: number;
  longestStreak: number;
  streakShields: number;      // 1 shield per 7 days streak
  lastReviewDate: string | null; // YYYY-MM-DD
  totalReviews: number;
  level: number;
  cards: Record<number, UserHadithProgress>;
  reviewLogs: UserReviewLog[];
  bookmarkedHadithIds: number[];
  activeHadithIds: number[];   // Currently memorizing/in queue
  hasCompletedOnboarding: boolean;
}

export interface LevelInfo {
  level: number;
  titleAr: string;
  minHadiths: number;
  maxHadiths: number;
  descriptionAr: string;
}

export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    titleAr: 'طالب العلم',
    minHadiths: 0,
    maxHadiths: 40,
    descriptionAr: 'بداية الرحلة المباركة مع سنة المصطفى ﷺ'
  },
  {
    level: 2,
    titleAr: 'حافظ المتون',
    minHadiths: 41,
    maxHadiths: 100,
    descriptionAr: 'رسوخ الحفظ وبداية التمكن من الأصول'
  },
  {
    level: 3,
    titleAr: 'راوي الحديث',
    minHadiths: 101,
    maxHadiths: 300,
    descriptionAr: 'اتساع الصدر برواية أحاديث الصحيحين'
  },
  {
    level: 4,
    titleAr: 'طالب الإسناد',
    minHadiths: 301,
    maxHadiths: 500,
    descriptionAr: 'همة عالية واقتراب من درجة الإتقان'
  },
  {
    level: 5,
    titleAr: 'المُتقِن',
    minHadiths: 501,
    maxHadiths: 100000,
    descriptionAr: 'إتقان راسخ وثبات في حفظ المتون النبوية'
  }
];
