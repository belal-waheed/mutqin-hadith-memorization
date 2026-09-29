'use client';

import { Flame, Shield } from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';

interface StreakBadgeProps {
  className?: string;
  showText?: boolean;
}

export function StreakBadge({ className = '', showText = false }: StreakBadgeProps) {
  const { currentStreak, streakShields, hasReviewedToday, isStreakAtRisk, isLoaded } = useStreak();

  if (!isLoaded) {
    return <div className="h-8 w-16 bg-surface-200/50 dark:bg-surface-800/50 animate-pulse rounded-full" />;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-900 border border-surface-300 dark:border-surface-800 text-surface-900 dark:text-surface-100 shadow-xs ${className}`}
      title={
        hasReviewedToday
          ? 'أنجزت وِردك اليوم وحافظت على تتابعك المبارك'
          : isStreakAtRisk
          ? 'وِرد اليوم لم يكتمل بعد! راجع لتثبيت تتابعك'
          : 'أتمم وِردك يومياً لبناء عادة الحفظ'
      }
    >
      <Flame
        className={`w-4 h-4 transition-colors ${
          currentStreak > 0
            ? hasReviewedToday
              ? 'text-primary-600 dark:text-primary-400 fill-primary-600 dark:fill-primary-400'
              : 'text-amber-500 fill-amber-500 animate-pulse'
            : 'text-surface-400 dark:text-surface-600'
        }`}
      />
      <span className="font-ui font-bold text-sm tracking-tight">
        {currentStreak}
      </span>
      {showText && (
        <span className="text-xs text-surface-600 dark:text-surface-400 font-ui">
          {currentStreak === 1 ? 'يوم' : currentStreak === 2 ? 'يومان' : currentStreak <= 10 ? 'أيام' : 'يوماً'}
        </span>
      )}

      {streakShields > 0 && (
        <div
          className="flex items-center gap-0.5 text-xs text-primary-700 dark:text-primary-400 mr-1 border-r border-surface-300 dark:border-surface-800 pr-1.5"
          title={`درع الحماية: لديك ${streakShields} درع يحميك من فوات يوم واحد`}
        >
          <Shield className="w-3.5 h-3.5 fill-primary-200 dark:fill-primary-900/60 text-primary-700 dark:text-primary-400" />
          <span className="font-ui font-semibold text-xs">{streakShields}</span>
        </div>
      )}
    </div>
  );
}
