'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Sparkles, ArrowLeft, CheckCircle2, Compass } from 'lucide-react';
import { StreakBadge } from '@/components/streak-badge';
import { HadithCard } from '@/components/hadith-card';
import { ProgressGarden } from '@/components/progress-garden';
import { getHadithOfTheDay } from '@/lib/hadith-service';
import { useCards } from '@/hooks/useCards';
import { useStreak } from '@/hooks/useStreak';
import { useUserState } from '@/hooks/useUserState';
import type { Hadith } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [hadithOfTheDay, setHadithOfTheDay] = useState<Hadith | null>(null);
  const [loadingHadith, setLoadingHadith] = useState(true);
  const { dueCount, memorizedCount, learningCount, isLoaded: cardsLoaded } = useCards();
  const { hasReviewedToday, currentStreak } = useStreak();
  const { enrollHadith, userState, isLoaded: userLoaded } = useUserState();

  const isFullyLoaded = cardsLoaded && userLoaded;

  // Onboarding redirection for first-time users
  useEffect(() => {
    if (userLoaded && !userState.hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [userLoaded, userState.hasCompletedOnboarding, router]);

  useEffect(() => {
    async function loadDailyHadith() {
      try {
        const h = await getHadithOfTheDay();
        setHadithOfTheDay(h);
      } catch (err) {
        console.error('Failed to load hadith of the day:', err);
      } finally {
        setLoadingHadith(false);
      }
    }
    loadDailyHadith();
  }, []);

  // Show a graceful loading skeleton while determining onboarding state or initial data
  if (!isFullyLoaded || !userState.hasCompletedOnboarding) {
    return (
      <div className="py-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-24 bg-surface-200 dark:bg-surface-800 rounded-lg" />
            <div className="h-4 w-48 bg-surface-200 dark:bg-surface-800 rounded" />
          </div>
          <div className="h-8 w-16 bg-surface-200 dark:bg-surface-800 rounded-full" />
        </div>
        <div className="h-64 bg-surface-200 dark:bg-surface-800 rounded-3xl" />
        <div className="h-40 bg-surface-200 dark:bg-surface-800 rounded-2xl" />
      </div>
    );
  }

  const totalSessionCards = Math.max(dueCount, userState.dailyGoal);

  return (
    <div className="py-6 space-y-6">
      {/* Top Header */}
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-ui font-extrabold text-2xl text-primary-800 dark:text-primary-400 tracking-tight">
              مُتقِن
            </h1>
            <span className="text-xs bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300 font-semibold px-2 py-0.5 rounded-full border border-primary-300 dark:border-primary-800">
              الصحيحان فقط
            </span>
          </div>
          <p className="text-xs text-surface-600 dark:text-surface-400 font-ui mt-0.5">
            حفظ وضبط متون البخاري ومسلم بالتكرار المتباعد
          </p>
        </div>

        <StreakBadge showText={true} />
      </header>

      {/* Today's Wird Hero Card */}
      <section className="bg-gradient-to-br from-primary-50 via-surface-100 to-surface-100 dark:from-primary-950/40 dark:via-surface-900 dark:to-surface-900 rounded-3xl border border-primary-200 dark:border-primary-900/60 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-primary-700 dark:text-primary-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>وِردك اليومي</span>
            </div>
            <h2 className="font-ui font-bold text-xl text-surface-900 dark:text-surface-100">
              {hasReviewedToday ? 'أنجزت وِرد اليوم بفضل الله' : 'حان وقت وِرد اليوم'}
            </h2>
          </div>

          {hasReviewedToday ? (
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
          ) : (
            <div className="text-left font-ui">
              <span className="text-xs text-surface-500 dark:text-surface-400 block">المجموع</span>
              <span className="text-lg font-bold text-primary-800 dark:text-primary-400">{totalSessionCards} أحاديث</span>
            </div>
          )}
        </div>

        <p className="text-xs text-surface-600 dark:text-surface-400 font-ui mt-2 leading-relaxed">
          {hasReviewedToday
            ? `أتممت مراجعتك اليوم وواصلت تتابعك (${currentStreak} أيام). يمكنك متابعة المراجعة الإضافية أو استكشاف أحاديث جديدة.`
            : `يتضمن وِرد اليوم ${dueCount} حديثاً مستحقاً للمراجعة، بالإضافة إلى أحاديث جديدة لبناء رصيدك.`}
        </p>

        {/* Stats Row inside Hero */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-primary-200/60 dark:border-primary-900/60 font-ui text-center">
          <div className="p-2 rounded-xl bg-surface-50/70 dark:bg-surface-850/60 border border-surface-200 dark:border-surface-800">
            <span className="block text-xs text-surface-500 dark:text-surface-400">للمراجعة</span>
            <span className="text-base font-bold text-surface-900 dark:text-surface-100">{dueCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-surface-50/70 dark:bg-surface-850/60 border border-surface-200 dark:border-surface-800">
            <span className="block text-xs text-surface-500 dark:text-surface-400">قيد التثبيت</span>
            <span className="text-base font-bold text-amber-700 dark:text-amber-400">{learningCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-surface-50/70 dark:bg-surface-850/60 border border-surface-200 dark:border-surface-800">
            <span className="block text-xs text-surface-500 dark:text-surface-400">المُتقَن</span>
            <span className="text-base font-bold text-primary-700 dark:text-primary-400">{memorizedCount}</span>
          </div>
        </div>

        {/* Main CTA */}
        <div className="mt-5">
          <Link
            href="/wird"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-ui font-bold text-base shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>{hasReviewedToday ? 'متابعة المراجعة الآن' : 'ابدأ الوِرد الآن'}</span>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Hadith of the Day */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-primary-800 dark:text-primary-300 font-bold">
            <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span>حديث اليوم المقترح للحفظ</span>
          </div>

          {hadithOfTheDay && (
            <button
              type="button"
              onClick={() => enrollHadith(hadithOfTheDay.id)}
              className="text-xs text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-semibold underline underline-offset-4 cursor-pointer"
            >
              أضف إلى وِردي
            </button>
          )}
        </div>

        {loadingHadith ? (
          <div className="h-44 bg-surface-200/50 dark:bg-surface-800/50 animate-pulse rounded-2xl" />
        ) : hadithOfTheDay ? (
          <HadithCard hadith={hadithOfTheDay} showActions={true} />
        ) : null}
      </section>

      {/* Progress Garden & Levels */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs text-surface-700 dark:text-surface-300 font-bold">مستوى الحفظ والإتقان</h2>
          <Link
            href="/progress"
            className="text-xs text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium flex items-center gap-1"
          >
            <span>عرض كل الإحصائيات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProgressGarden />
      </section>

      {/* Fast Browse Callout */}
      <section className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-200 dark:bg-surface-800 flex items-center justify-center text-surface-700 dark:text-surface-300">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-ui font-bold text-sm text-surface-900 dark:text-surface-100">
              تصفح صحيحي البخاري ومسلم
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              أكثر من 14,700 حديث مقسمة حسب الأبواب الفقهية
            </p>
          </div>
        </div>

        <Link
          href="/browse"
          className="p-2 rounded-xl bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-800 dark:text-surface-200 transition-colors"
          title="تصفح الأحاديث"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
