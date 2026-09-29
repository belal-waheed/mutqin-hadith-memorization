'use client';

import { useMemo } from 'react';
import { Award, Flame, CheckCircle2, Sprout, Clock, BookOpen, Layers } from 'lucide-react';
import { useUserState } from '@/hooks/useUserState';
import { useCards } from '@/hooks/useCards';
import { useStreak } from '@/hooks/useStreak';
import { LEVELS } from '@/types';
import { ProgressGarden } from '@/components/progress-garden';

export default function ProgressPage() {
  const { userState, isLoaded: userLoaded } = useUserState();
  const {
    memorizedCount,
    learningCount,
    dueCount,
  } = useCards();
  const { currentStreak, longestStreak } = useStreak();

  // Calculate book breakdown from cards
  const bookBreakdown = useMemo(() => {
    let bukhariMemorized = 0;
    let muslimMemorized = 0;

    for (const [hadithIdStr, progress] of Object.entries(userState.cards)) {
      const id = Number(hadithIdStr);
      const isMastered = progress.card.state === 2 || progress.card.reps >= 2;
      if (isMastered) {
        if (id < 100000) {
          bukhariMemorized++;
        } else {
          muslimMemorized++;
        }
      }
    }

    return {
      bukhari: bukhariMemorized,
      muslim: muslimMemorized,
    };
  }, [userState.cards]);

  if (!userLoaded) {
    return (
      <div className="py-8 space-y-4">
        <div className="h-8 w-40 bg-surface-200 dark:bg-surface-800 animate-pulse rounded-lg" />
        <div className="h-64 bg-surface-200 dark:bg-surface-800 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-ui font-extrabold text-2xl text-surface-950 dark:text-surface-100">
          إحصائيات الحفظ والإتقان
        </h1>
        <p className="text-xs text-surface-600 dark:text-surface-400 font-ui mt-0.5">
          متابعة مستمرة لرسوخ متون الأحاديث النبوية
        </p>
      </div>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-ui">
        <div className="bg-surface-100 dark:bg-surface-900 p-4 rounded-2xl border border-surface-300 dark:border-surface-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-primary-700 dark:text-primary-400 font-semibold mb-1">
            <Flame className="w-4 h-4 text-primary-600 dark:text-primary-400 fill-primary-600 dark:fill-primary-400" />
            <span>التتابع الحالي</span>
          </div>
          <span className="text-2xl font-bold text-surface-900 dark:text-surface-100">{currentStreak}</span>
          <span className="text-[11px] text-surface-500 dark:text-surface-400 block mt-0.5">
            الأطول: {longestStreak} أيام
          </span>
        </div>

        <div className="bg-surface-100 dark:bg-surface-900 p-4 rounded-2xl border border-surface-300 dark:border-surface-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-400 font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>المُتقَن الراسخ</span>
          </div>
          <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">{memorizedCount}</span>
          <span className="text-[11px] text-surface-500 dark:text-surface-400 block mt-0.5">
            في مرحلة المراجعة
          </span>
        </div>

        <div className="bg-surface-100 dark:bg-surface-900 p-4 rounded-2xl border border-surface-300 dark:border-surface-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-400 font-semibold mb-1">
            <Sprout className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>قيد التثبيت</span>
          </div>
          <span className="text-2xl font-bold text-amber-900 dark:text-amber-300">{learningCount}</span>
          <span className="text-[11px] text-surface-500 dark:text-surface-400 block mt-0.5">
            تكرار متقارب
          </span>
        </div>

        <div className="bg-surface-100 dark:bg-surface-900 p-4 rounded-2xl border border-surface-300 dark:border-surface-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-surface-300 font-semibold mb-1">
            <Clock className="w-4 h-4 text-surface-500 dark:text-surface-400" />
            <span>إجمالي المراجعات</span>
          </div>
          <span className="text-2xl font-bold text-surface-900 dark:text-surface-100">{userState.totalReviews}</span>
          <span className="text-[11px] text-surface-500 dark:text-surface-400 block mt-0.5">
            تكرار مسجل
          </span>
        </div>
      </div>

      {/* Progress Garden Component */}
      <ProgressGarden />

      {/* Books Progress Breakdown */}
      <section className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-700 dark:text-primary-400" />
          <h2 className="font-ui font-bold text-base text-surface-900 dark:text-surface-100">
            توزيع الحفظ حسب الصحيحين
          </h2>
        </div>

        {/* Bukhari Progress */}
        <div className="space-y-1.5 font-ui">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-surface-800 dark:text-surface-200">صحيح البخاري</span>
            <span className="text-surface-600 dark:text-surface-400">
              {bookBreakdown.bukhari} من 7,277 حديث
            </span>
          </div>
          <div className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full"
              style={{
                width: `${Math.max(
                  0.5,
                  (bookBreakdown.bukhari / 7277) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Muslim Progress */}
        <div className="space-y-1.5 font-ui pt-2 border-t border-surface-200 dark:border-surface-800">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-surface-800 dark:text-surface-200">صحيح مسلم</span>
            <span className="text-surface-600 dark:text-surface-400">
              {bookBreakdown.muslim} من 7,459 حديث
            </span>
          </div>
          <div className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-700 dark:bg-emerald-600 rounded-full"
              style={{
                width: `${Math.max(
                  0.5,
                  (bookBreakdown.muslim / 7459) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Spaced Repetition (FSRS) State Distribution */}
      <section className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 space-y-3 font-ui shadow-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary-700 dark:text-primary-400" />
          <h2 className="font-bold text-base text-surface-900 dark:text-surface-100">
            حالة خوارزمية التكرار (FSRS)
          </h2>
        </div>

        <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
          تستخدم المنظومة خوارزمية FSRS الحديثة لحساب الاستقرار الذهني (Stability) وصعوبة المتن (Difficulty) لضمان نسبة استبقاء لا تقل عن 90% بأقل عدد ممكن من التكرارات.
        </p>

        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
          <div className="p-3 bg-surface-50 dark:bg-surface-850/60 rounded-xl border border-surface-200 dark:border-surface-800">
            <span className="text-surface-500 dark:text-surface-400 block">مستحقة للمراجعة</span>
            <span className="text-lg font-bold text-red-800 dark:text-red-400 mt-1 block">{dueCount}</span>
          </div>
          <div className="p-3 bg-surface-50 dark:bg-surface-850/60 rounded-xl border border-surface-200 dark:border-surface-800">
            <span className="text-surface-500 dark:text-surface-400 block">قيد الرسوخ</span>
            <span className="text-lg font-bold text-amber-800 dark:text-amber-400 mt-1 block">{learningCount}</span>
          </div>
          <div className="p-3 bg-surface-50 dark:bg-surface-850/60 rounded-xl border border-surface-200 dark:border-surface-800">
            <span className="text-surface-500 dark:text-surface-400 block">أحاديث مستقرة</span>
            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mt-1 block">{memorizedCount}</span>
          </div>
        </div>
      </section>

      {/* Milestone Levels Ladder */}
      <section className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 space-y-3 font-ui shadow-xs">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-700 dark:text-primary-400" />
          <h2 className="font-bold text-base text-surface-900 dark:text-surface-100">
            رتب حفظة الحديث
          </h2>
        </div>

        <div className="space-y-2 pt-1">
          {LEVELS.map(lvl => {
            const isCurrent = lvl.level === userState.level;
            const isCompleted = userState.level > lvl.level;

            return (
              <div
                key={lvl.level}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  isCurrent
                    ? 'bg-primary-50/80 dark:bg-primary-950/70 border-primary-300 dark:border-primary-700 text-primary-950 dark:text-primary-200 font-semibold shadow-xs'
                    : isCompleted
                    ? 'bg-surface-50 dark:bg-surface-850/50 border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300'
                    : 'bg-surface-50/40 dark:bg-surface-950/30 border-surface-200/50 dark:border-surface-850/40 text-surface-400 dark:text-surface-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isCurrent
                        ? 'bg-primary-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-surface-200 dark:bg-surface-800 text-surface-500 dark:text-surface-400'
                    }`}
                  >
                    {lvl.level}
                  </div>
                  <div>
                    <span className="text-sm block">{lvl.titleAr}</span>
                    <span className="text-[11px] font-normal opacity-80">{lvl.descriptionAr}</span>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-200/60 dark:bg-surface-800 text-surface-700 dark:text-surface-300">
                  {lvl.minHadiths} - {lvl.maxHadiths < 10000 ? lvl.maxHadiths : '+'} حديث
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
