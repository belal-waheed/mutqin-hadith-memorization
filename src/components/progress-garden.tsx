'use client';

import { Award, Sprout, CheckCircle2 } from 'lucide-react';
import { useCards } from '@/hooks/useCards';

export function ProgressGarden() {
  const {
    memorizedCount,
    learningCount,
    currentLevelInfo,
    nextLevelInfo,
    progressToNextLevel,
    isLoaded,
  } = useCards();

  if (!isLoaded) {
    return <div className="h-44 bg-surface-200/50 dark:bg-surface-800/50 animate-pulse rounded-2xl" />;
  }

  // Visual Garden: display up to 24 icons representing memorized trees/sprouts
  const visualItemsCount = Math.min(24, Math.max(4, memorizedCount + learningCount));
  const gardenItems = Array.from({ length: visualItemsCount }).map((_, idx) => {
    const isMastered = idx < memorizedCount;
    const isLearning = idx < memorizedCount + learningCount;
    return { id: idx, isMastered, isLearning };
  });

  return (
    <div className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 shadow-xs">
      {/* Level Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 border border-primary-300 dark:border-primary-800 flex items-center justify-center text-primary-800 dark:text-primary-400">
            <Award className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-primary-800 dark:text-primary-300 font-semibold bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-full border border-primary-200 dark:border-primary-800">
                المستوى {currentLevelInfo.level}
              </span>
              <h3 className="font-ui font-bold text-base text-surface-900 dark:text-surface-100">
                {currentLevelInfo.titleAr}
              </h3>
            </div>
            <p className="text-xs text-surface-600 dark:text-surface-400 mt-0.5">
              {currentLevelInfo.descriptionAr}
            </p>
          </div>
        </div>

        <div className="text-left font-ui">
          <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">{memorizedCount}</span>
          <span className="text-xs text-surface-500 dark:text-surface-400 block">حديث مُتقَن</span>
        </div>
      </div>

      {/* Level Progress Bar */}
      {nextLevelInfo && (
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs font-ui text-surface-600 dark:text-surface-400">
            <span>التقدم نحو: {nextLevelInfo.titleAr}</span>
            <span className="font-semibold">{progressToNextLevel}%</span>
          </div>
          <div className="w-full h-2.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>
      )}

      {/* Visual Garden: Metaphor of Seeds & Growth */}
      <div className="pt-3 border-t border-surface-200 dark:border-surface-800">
        <div className="flex items-center justify-between text-xs text-surface-600 dark:text-surface-400 mb-2">
          <div className="flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
            <span className="font-medium">بستان المحفوظات</span>
          </div>
          <span className="text-[11px] text-surface-500 dark:text-surface-400">
            كل حديث يثبت يُزهر في بستانك
          </span>
        </div>

        <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 py-1">
          {gardenItems.map(item => (
            <div
              key={item.id}
              className={`h-7 rounded-lg flex items-center justify-center transition-transform hover:scale-110 ${
                item.isMastered
                  ? 'bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-400 border border-primary-300 dark:border-primary-800'
                  : item.isLearning
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  : 'bg-surface-200/50 dark:bg-surface-800/50 text-surface-400 dark:text-surface-500 border border-surface-300/40 dark:border-surface-700/40'
              }`}
              title={
                item.isMastered
                  ? 'حديث مُتقَن وثابت'
                  : item.isLearning
                  ? 'حديث قيد التكرار والتثبيت'
                  : 'موضع حديث جديد'
              }
            >
              {item.isMastered ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : item.isLearning ? (
                <Sprout className="w-3.5 h-3.5" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-surface-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
