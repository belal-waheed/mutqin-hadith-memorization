'use client';

import { useMemo, useState } from 'react';
import { Calendar, Activity, Flame, Check } from 'lucide-react';
import type { UserReviewLog } from '@/types';
import { getLocalDateString } from '@/lib/date-utils';

interface ReviewHeatmapProps {
  reviewLogs?: UserReviewLog[];
  className?: string;
}

interface DayData {
  date: Date;
  dateStr: string;
  dayOfWeek: number; // 0 = Sat, 1 = Sun, ..., 6 = Fri
  count: number;
  isToday: boolean;
  isFuture: boolean;
}

const DAY_NAMES = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

// Color scale mapping strictly per specifications:
// 0: bg-surface-200 dark:bg-surface-800
// 1-3: bg-primary-300 dark:bg-primary-900
// 4-10: bg-primary-500 dark:bg-primary-700
// 11+: bg-primary-700 dark:bg-primary-500
function getCellColor(count: number, isFuture: boolean): string {
  if (isFuture) {
    return 'opacity-0 pointer-events-none';
  }
  if (count === 0) {
    return 'bg-surface-200 dark:bg-surface-800 border-surface-300/40 dark:border-surface-700/50';
  }
  if (count <= 3) {
    return 'bg-primary-300 dark:bg-primary-900 border-primary-400/60 dark:border-primary-800 text-surface-900 dark:text-surface-100';
  }
  if (count <= 10) {
    return 'bg-primary-500 dark:bg-primary-700 border-primary-600/70 dark:border-primary-600 text-white';
  }
  return 'bg-primary-700 dark:bg-primary-500 border-primary-800 dark:border-primary-400 text-white';
}

export function ReviewHeatmap({ reviewLogs = [], className = '' }: ReviewHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Group reviewLogs by YYYY-MM-DD
  const countsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const log of reviewLogs) {
      if (!log.reviewedAt) continue;
      try {
        const d = new Date(log.reviewedAt);
        const dateKey = getLocalDateString(d);
        map[dateKey] = (map[dateKey] || 0) + 1;
      } catch {
        // Ignore unparseable dates
      }
    }
    return map;
  }, [reviewLogs]);

  // Construct 14 weeks (~98 days) ending at the current week
  const { weeks, totalReviewsInPeriod, activeDaysCount, maxReviewsInDay } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateString(today);

    // Saturday is day 0 in our Arabic week view
    // JS getDay(): 0 is Sunday, 1 is Mon, ..., 6 is Sat
    // Convert so Saturday = 0, Sunday = 1, ..., Friday = 6
    const getArabicDayIndex = (d: Date) => (d.getDay() + 1) % 7;

    const currentDayOfWeek = getArabicDayIndex(today);

    // Number of past weeks to show: 14 weeks = 98 days
    const TOTAL_WEEKS = 14;

    // Find the Saturday of TOTAL_WEEKS - 1 weeks ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDayOfWeek - (TOTAL_WEEKS - 1) * 7);

    const generatedWeeks: DayData[][] = [];
    let cur = new Date(startDate);

    let totalReviews = 0;
    let activeDays = 0;
    let maxReviews = 0;

    for (let w = 0; w < TOTAL_WEEKS; w++) {
      const week: DayData[] = [];
      for (let d = 0; d < 7; d++) {
        const dateCopy = new Date(cur);
        const dateStr = getLocalDateString(dateCopy);
        const isFuture = dateCopy.getTime() > today.getTime();
        const count = isFuture ? 0 : (countsByDate[dateStr] || 0);

        if (!isFuture) {
          totalReviews += count;
          if (count > 0) {
            activeDays += 1;
            if (count > maxReviews) maxReviews = count;
          }
        }

        week.push({
          date: dateCopy,
          dateStr,
          dayOfWeek: d,
          count,
          isToday: dateStr === todayStr,
          isFuture,
        });

        cur.setDate(cur.getDate() + 1);
      }
      generatedWeeks.push(week);
    }

    return {
      weeks: generatedWeeks,
      totalReviewsInPeriod: totalReviews,
      activeDaysCount: activeDays,
      maxReviewsInDay: maxReviews,
    };
  }, [countsByDate]);

  return (
    <section
      className={`bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 shadow-xs space-y-4 font-ui ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <div>
            <h2 className="font-bold text-base text-surface-900 dark:text-surface-100">
              خريطة نشاط المراجعات
            </h2>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              سجل التكرار والاستذكار لآخر ١٠٠ يوم
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 text-xs text-surface-600 dark:text-surface-300 bg-surface-50 dark:bg-surface-850 px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-800 self-start sm:self-auto">
          <span>
            <strong className="font-bold text-primary-700 dark:text-primary-400">{totalReviewsInPeriod}</strong> مراجعة
          </span>
          <span className="text-surface-300 dark:text-surface-700">·</span>
          <span>
            <strong className="font-bold text-surface-900 dark:text-surface-100">{activeDaysCount}</strong> يوماً نشطاً
          </span>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="inline-flex flex-col gap-1 min-w-max">
          <div className="flex gap-2">
            {/* Day of Week Labels (Show alternate days to keep clean) */}
            <div className="flex flex-col justify-between py-0.5 text-[10px] text-surface-400 dark:text-surface-500 w-8 select-none">
              <span>السبت</span>
              <span>الإثنين</span>
              <span>الأربعاء</span>
              <span>الجمعة</span>
            </div>

            {/* Weeks Columns (Right-to-Left or Chronological LTR) */}
            {/* In Arabic, we flow weeks from right to left (past on right, recent on left) or standard LTR */}
            <div className="flex gap-1.5 items-center">
              {weeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1.5">
                  {week.map(day => {
                    const colorClass = getCellColor(day.count, day.isFuture);
                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        disabled={day.isFuture}
                        onMouseEnter={() => !day.isFuture && setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => !day.isFuture && setHoveredDay(day)}
                        aria-label={`${day.dateStr}: ${day.count} مراجعات`}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs border transition-transform hover:scale-125 focus:scale-125 focus:outline-none ${colorClass} ${
                          day.isToday ? 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-surface-900' : ''
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Details: Active Hover Info & Color Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-surface-200 dark:border-surface-800 text-xs">
        {/* Dynamic Tooltip / Status Display */}
        <div className="text-surface-600 dark:text-surface-300 min-h-[20px] flex items-center gap-1.5">
          {hoveredDay ? (
            <span>
              <strong className="text-surface-900 dark:text-surface-100">{hoveredDay.dateStr}</strong>
              {' '}({DAY_NAMES[hoveredDay.dayOfWeek]}):{' '}
              <strong className="text-primary-700 dark:text-primary-400">
                {hoveredDay.count} {hoveredDay.count === 1 ? 'مراجعة' : hoveredDay.count === 2 ? 'مراجعتان' : 'مراجعات'}
              </strong>
            </span>
          ) : (
            <span className="text-surface-400 dark:text-surface-500 text-[11px]">
              مرر فوق المربعات لمعاينة عدد المراجعات لكل يوم
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-surface-500 dark:text-surface-400 select-none">
          <span>أقل</span>
          <span
            className="w-3 h-3 rounded-xs bg-surface-200 dark:bg-surface-800 border border-surface-300/40 dark:border-surface-700/40"
            title="0 مراجعات"
          />
          <span
            className="w-3 h-3 rounded-xs bg-primary-300 dark:bg-primary-900 border border-primary-400/50 dark:border-primary-800"
            title="1 - 3 مراجعات"
          />
          <span
            className="w-3 h-3 rounded-xs bg-primary-500 dark:bg-primary-700 border border-primary-600/50 dark:border-primary-600"
            title="4 - 10 مراجعات"
          />
          <span
            className="w-3 h-3 rounded-xs bg-primary-700 dark:bg-primary-500 border border-primary-800/50 dark:border-primary-400"
            title="11+ مراجعة"
          />
          <span>أكثر</span>
        </div>
      </div>
    </section>
  );
}
