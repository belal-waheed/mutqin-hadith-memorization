'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserState } from '@/types';
import {
  getUserState,
  saveUserState,
  getDefaultUserState,
  USER_STATE_CHANGE_EVENT,
  recordReviewAction,
  toggleBookmarkHadith,
  enrollHadithInWird,
  resetUserState,
  completeOnboarding,
} from '@/lib/user-storage';
import type { Grade } from '@/lib/fsrs-service';

export function useUserState() {
  const [userState, setUserState] = useState<UserState>(getDefaultUserState());
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshState = useCallback(() => {
    setUserState(getUserState());
  }, []);

  useEffect(() => {
    refreshState();
    setIsLoaded(true);

    const handleCustomChange = () => refreshState();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mutqin_user_state_v1') {
        refreshState();
      }
    };

    window.addEventListener(USER_STATE_CHANGE_EVENT, handleCustomChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(USER_STATE_CHANGE_EVENT, handleCustomChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshState]);

  const updateState = useCallback((updater: (prev: UserState) => UserState) => {
    setUserState(prev => {
      const updated = updater(prev);
      saveUserState(updated);
      return updated;
    });
  }, []);

  const reviewHadith = useCallback((hadithId: number, grade: Grade) => {
    const { newState, reviewLog } = recordReviewAction(userState, hadithId, grade);
    setUserState(newState);
    return reviewLog;
  }, [userState]);

  const toggleBookmark = useCallback((hadithId: number) => {
    return toggleBookmarkHadith(hadithId);
  }, []);

  const enrollHadith = useCallback((hadithId: number) => {
    enrollHadithInWird(hadithId);
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = resetUserState();
    setUserState(fresh);
    return fresh;
  }, []);

  const finishOnboarding = useCallback((dailyGoal?: number) => {
    const completed = completeOnboarding(dailyGoal);
    setUserState(completed);
    return completed;
  }, []);

  return {
    userState,
    isLoaded,
    updateState,
    reviewHadith,
    toggleBookmark,
    enrollHadith,
    resetProgress,
    finishOnboarding,
    refreshState,
  };
}
