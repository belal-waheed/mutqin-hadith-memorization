'use client';

import { useMemo } from 'react';
import { Rating, type Grade, getRatingIntervalPreviews } from '@/lib/fsrs-service';
import type { SerializedCard } from '@/types';

interface ReviewButtonsProps {
  card: SerializedCard;
  onRate: (grade: Grade) => void;
  disabled?: boolean;
}

export function ReviewButtons({ card, onRate, disabled = false }: ReviewButtonsProps) {
  const previews = useMemo(() => {
    return getRatingIntervalPreviews(card);
  }, [card]);

  const buttons = [
    {
      grade: Rating.Again as Grade,
      label: 'أعِد',
      interval: previews[Rating.Again].intervalText,
      subtitle: 'نسيان تام',
      colorClass:
        'border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 hover:bg-red-100/90 dark:hover:bg-red-900/50 text-red-900 dark:text-red-200 focus:ring-red-400',
    },
    {
      grade: Rating.Hard as Grade,
      label: 'صعب',
      interval: previews[Rating.Hard].intervalText,
      subtitle: 'استذكار بمشقة',
      colorClass:
        'border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100/90 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 focus:ring-amber-400',
    },
    {
      grade: Rating.Good as Grade,
      label: 'جيد',
      interval: previews[Rating.Good].intervalText,
      subtitle: 'استذكار عادي',
      colorClass:
        'border-primary-300 dark:border-primary-800 bg-primary-50/80 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 text-primary-950 dark:text-primary-200 focus:ring-primary-500 font-semibold',
    },
    {
      grade: Rating.Easy as Grade,
      label: 'سهل',
      interval: previews[Rating.Easy].intervalText,
      subtitle: 'حفظ متقن وسلس',
      colorClass:
        'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-950 dark:text-emerald-200 focus:ring-emerald-500',
    },
  ];

  return (
    <div className="w-full grid grid-cols-4 gap-2 sm:gap-3 font-ui">
      {buttons.map(btn => (
        <button
          key={btn.grade}
          type="button"
          disabled={disabled}
          onClick={() => onRate(btn.grade)}
          className={`flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-xs ${btn.colorClass}`}
        >
          <span className="text-base sm:text-lg font-bold">{btn.label}</span>
          <span className="text-xs opacity-75 mt-0.5 dir-rtl">{btn.interval}</span>
        </button>
      ))}
    </div>
  );
}
