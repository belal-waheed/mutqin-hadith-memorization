import type { UserState, UserHadithProgress, UserReviewLog } from '@/types';
import { LEVELS } from '@/types';
import { getLocalDateString, getDaysDifference } from './date-utils';
import { initNewCard, applyReviewRating, type Grade, State } from './fsrs-service';

const STORAGE_KEY = 'mutqin_user_state_v1';
export const USER_STATE_CHANGE_EVENT = 'mutqin_user_state_change';

export function getDefaultUserState(): UserState {
  const userId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`;
  return {
    userId,
    displayName: 'طالب العلم',
    createdAt: new Date().toISOString(),
    dailyGoal: 3,
    currentStreak: 0,
    longestStreak: 0,
    streakShields: 0,
    lastReviewDate: null,
    totalReviews: 0,
    level: 1,
    cards: {},
    reviewLogs: [],
    bookmarkedHadithIds: [],
    activeHadithIds: [],
    hasCompletedOnboarding: false,
  };
}

export function calculateLevel(totalMemorized: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalMemorized >= LEVELS[i].minHadiths) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

export function getUserState(): UserState {
  if (typeof window === 'undefined') {
    return getDefaultUserState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultState = getDefaultUserState();
      saveUserState(defaultState);
      return defaultState;
    }
    const state: UserState = JSON.parse(raw);

    // Gracefully handle existing users without hasCompletedOnboarding
    if (typeof state.hasCompletedOnboarding === 'undefined') {
      const hasExistingProgress =
        (state.totalReviews && state.totalReviews > 0) ||
        (state.cards && Object.keys(state.cards).length > 0) ||
        (state.currentStreak && state.currentStreak > 0);
      state.hasCompletedOnboarding = Boolean(hasExistingProgress);
      saveUserState(state);
    }

    const updatedState = verifyAndRepairStreak(state);
    return updatedState;
  } catch (err) {
    console.error('Error loading user state from localStorage:', err);
    return getDefaultUserState();
  }
}

export function saveUserState(state: UserState): void {
  if (typeof window === 'undefined') return;

  try {
    // Re-evaluate level based on active memorized cards
    const memorizedCount = Object.values(state.cards).filter(
      c => c.card.state === State.Review || c.card.reps >= 2
    ).length;
    state.level = calculateLevel(memorizedCount);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(USER_STATE_CHANGE_EVENT));
  } catch (err) {
    console.error('Error saving user state to localStorage:', err);
  }
}

/**
 * Checks streak against current date.
 * If user missed a day and has shields, shield is consumed.
 * If user missed multiple days or has no shields, streak resets to 0.
 */
export function verifyAndRepairStreak(state: UserState): UserState {
  if (!state.lastReviewDate || state.currentStreak === 0) {
    return state;
  }

  const today = getLocalDateString();
  const daysDiff = getDaysDifference(state.lastReviewDate, today);

  if (daysDiff <= 1) {
    // 0 = today, 1 = yesterday. Streak is valid and ready to continue.
    return state;
  }

  let modified = false;
  const newState = { ...state };

  if (daysDiff === 2 && newState.streakShields > 0) {
    // Consumed shield
    newState.streakShields -= 1;
    // Set lastReviewDate to yesterday to keep streak active
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    newState.lastReviewDate = getLocalDateString(yesterday);
    modified = true;
  } else if (daysDiff > 1) {
    // Lost streak
    newState.currentStreak = 0;
    modified = true;
  }

  if (modified) {
    saveUserState(newState);
  }

  return newState;
}

/**
 * Called when a user completes a review or completes their daily wird
 */
export function recordReviewAction(
  state: UserState,
  hadithId: number,
  grade: Grade
): { newState: UserState; reviewLog: UserReviewLog } {
  const now = new Date();
  const todayStr = getLocalDateString(now);

  let currentCardProgress = state.cards[hadithId];
  if (!currentCardProgress) {
    // Initialize brand new card
    currentCardProgress = {
      hadithId,
      card: initNewCard(),
      firstLearnedAt: now.toISOString(),
      lastReviewedAt: now.toISOString(),
      totalReviews: 0,
    };
  }

  const { updatedProgress, reviewLog } = applyReviewRating(currentCardProgress, grade, now);

  const updatedCards = {
    ...state.cards,
    [hadithId]: updatedProgress,
  };

  const updatedLogs = [reviewLog, ...state.reviewLogs].slice(0, 500); // keep last 500 logs

  let newStreak = state.currentStreak;
  let newLongest = state.longestStreak;
  let newShields = state.streakShields;

  // If today is a new review day, advance streak
  if (state.lastReviewDate !== todayStr) {
    newStreak = state.currentStreak + 1;
    newLongest = Math.max(newLongest, newStreak);
    // Earn 1 shield for every 7 days of streak (up to max 3 shields)
    if (newStreak % 7 === 0 && newShields < 3) {
      newShields += 1;
    }
  }

  const newState: UserState = {
    ...state,
    cards: updatedCards,
    reviewLogs: updatedLogs,
    totalReviews: state.totalReviews + 1,
    currentStreak: newStreak,
    longestStreak: newLongest,
    streakShields: newShields,
    lastReviewDate: todayStr,
  };

  saveUserState(newState);
  return { newState, reviewLog };
}

/**
 * Toggle bookmarking a hadith
 */
export function toggleBookmarkHadith(hadithId: number): boolean {
  const state = getUserState();
  const isBookmarked = state.bookmarkedHadithIds.includes(hadithId);
  const updatedBookmarks = isBookmarked
    ? state.bookmarkedHadithIds.filter(id => id !== hadithId)
    : [...state.bookmarkedHadithIds, hadithId];

  saveUserState({
    ...state,
    bookmarkedHadithIds: updatedBookmarks,
  });

  return !isBookmarked;
}

/**
 * Adds a hadith into the active memorization queue
 */
export function enrollHadithInWird(hadithId: number): void {
  const state = getUserState();
  if (state.cards[hadithId]) return; // already active

  const newCardProgress: UserHadithProgress = {
    hadithId,
    card: initNewCard(),
    firstLearnedAt: new Date().toISOString(),
    lastReviewedAt: new Date().toISOString(),
    totalReviews: 0,
  };

  saveUserState({
    ...state,
    cards: {
      ...state.cards,
      [hadithId]: newCardProgress,
    },
    activeHadithIds: state.activeHadithIds.includes(hadithId)
      ? state.activeHadithIds
      : [...state.activeHadithIds, hadithId],
  });
}

/**
 * Resets user state to default initial state
 */
export function resetUserState(): UserState {
  const defaultState = getDefaultUserState();
  saveUserState(defaultState);
  return defaultState;
}

/**
 * Marks onboarding as completed and optionally updates daily goal
 */
export function completeOnboarding(dailyGoal?: number): UserState {
  const state = getUserState();
  const updated: UserState = {
    ...state,
    hasCompletedOnboarding: true,
    dailyGoal: dailyGoal && dailyGoal > 0 ? dailyGoal : state.dailyGoal,
  };
  saveUserState(updated);
  return updated;
}
