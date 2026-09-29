'use client';

import { useMemo } from 'react';
import { useUserState } from './useUserState';
import { getLocalDateString, getDaysDifference } from '@/lib/date-utils';

export function useStreak() {
  const { userState, isLoaded } = useUserState();

  const streakInfo = useMemo(() => {
    const today = getLocalDateString();
    const hasReviewedToday = userState.lastReviewDate === today;
    
    let isStreakAtRisk = false;
    if (userState.lastReviewDate && !hasReviewedToday) {
      const daysDiff = getDaysDifference(userState.lastReviewDate, today);
      if (daysDiff === 1) {
        // Reviewed yesterday, need to review today to maintain streak!
        isStreakAtRisk = true;
      }
    }

    return {
      currentStreak: userState.currentStreak,
      longestStreak: userState.longestStreak,
      streakShields: userState.streakShields,
      hasReviewedToday,
      isStreakAtRisk,
      lastReviewDate: userState.lastReviewDate,
    };
  }, [userState]);

  return {
    ...streakInfo,
    isLoaded,
  };
}
