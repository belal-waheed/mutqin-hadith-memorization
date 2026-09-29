'use client';

import { useMemo } from 'react';
import { useUserState } from './useUserState';
import { State } from '@/lib/fsrs-service';
import { LEVELS, type LevelInfo } from '@/types';

export function useCards() {
  const { userState, isLoaded } = useUserState();

  const cardsSummary = useMemo(() => {
    const now = new Date();
    const allCards = Object.values(userState.cards);

    const dueCards: typeof allCards = [];
    const learningCards: typeof allCards = [];
    const matureCards: typeof allCards = [];
    const newCards: typeof allCards = [];

    for (const item of allCards) {
      const dueDate = new Date(item.card.due);
      if (dueDate <= now) {
        dueCards.push(item);
      }

      if (item.card.state === State.New) {
        newCards.push(item);
      } else if (item.card.state === State.Learning || item.card.state === State.Relearning) {
        learningCards.push(item);
      } else if (item.card.state === State.Review) {
        matureCards.push(item);
      }
    }

    const memorizedCount = matureCards.length;
    const currentLevelInfo = LEVELS.find(l => l.level === userState.level) || LEVELS[0];
    const nextLevelInfo = LEVELS.find(l => l.level === userState.level + 1);

    let progressToNextLevel = 100;
    if (nextLevelInfo) {
      const levelSpan = nextLevelInfo.minHadiths - currentLevelInfo.minHadiths;
      const progressInLevel = Math.max(0, memorizedCount - currentLevelInfo.minHadiths);
      progressToNextLevel = Math.min(100, Math.round((progressInLevel / levelSpan) * 100));
    }

    return {
      totalActive: allCards.length,
      dueCards,
      dueCount: dueCards.length,
      learningCount: learningCards.length,
      matureCount: matureCards.length,
      newCount: newCards.length,
      memorizedCount,
      currentLevelInfo,
      nextLevelInfo,
      progressToNextLevel,
      dailyGoal: userState.dailyGoal,
    };
  }, [userState]);

  return {
    ...cardsSummary,
    isLoaded,
  };
}
