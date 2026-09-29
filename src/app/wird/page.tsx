'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Flame, Shield, Award, RotateCcw, Home, CheckCircle2, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useUserState } from '@/hooks/useUserState';
import { useCards } from '@/hooks/useCards';
import { useStreak } from '@/hooks/useStreak';
import { HadithCard } from '@/components/hadith-card';
import { ReviewButtons } from '@/components/review-buttons';
import { fetchStarterHadiths, getHadithById } from '@/lib/hadith-service';
import { initNewCard, type Grade } from '@/lib/fsrs-service';
import type { Hadith, SerializedCard } from '@/types';

interface QueueItem {
  hadith: Hadith;
  card: SerializedCard;
  isNew: boolean;
}

export default function WirdPage() {
  const router = useRouter();
  const { userState, reviewHadith, isLoaded: userLoaded } = useUserState();
  const { currentStreak, streakShields } = useStreak();
  const { currentLevelInfo, memorizedCount } = useCards();

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [sessionReviewedCount, setSessionReviewedCount] = useState(0);

  // Build the session queue once user state is loaded
  useEffect(() => {
    if (!userLoaded) return;

    async function buildSession() {
      setIsLoadingQueue(true);
      try {
        const starter = await fetchStarterHadiths();
        const now = new Date();
        const sessionItems: QueueItem[] = [];

        // 1. Gather due review cards
        const dueEntries = Object.entries(userState.cards).filter(([_, progress]) => {
          return new Date(progress.card.due) <= now;
        });

        for (const [hadithIdStr, progress] of dueEntries) {
          const hId = Number(hadithIdStr);
          const hadith = await getHadithById(hId);
          if (hadith) {
            sessionItems.push({
              hadith,
              card: progress.card,
              isNew: false,
            });
          }
        }

        // 2. If session has fewer cards than daily goal, add new hadiths
        const remainingGoal = Math.max(0, userState.dailyGoal - sessionItems.length);
        if (remainingGoal > 0) {
          const memorizedIds = new Set(Object.keys(userState.cards).map(Number));
          const availableNew = starter.filter(h => !memorizedIds.has(h.id));
          const toAdd = availableNew.slice(0, remainingGoal);

          for (const hadith of toAdd) {
            sessionItems.push({
              hadith,
              card: initNewCard(),
              isNew: true,
            });
          }
        }

        // Fallback: If user finished everything and there's 0 cards, offer top 3 starter hadiths for repetition
        if (sessionItems.length === 0 && starter.length > 0) {
          for (const hadith of starter.slice(0, 3)) {
            const existingProgress = userState.cards[hadith.id];
            sessionItems.push({
              hadith,
              card: existingProgress ? existingProgress.card : initNewCard(),
              isNew: !existingProgress,
            });
          }
        }

        setQueue(sessionItems);
      } catch (err) {
        console.error('Failed to construct session queue:', err);
      } finally {
        setIsLoadingQueue(false);
      }
    }

    buildSession();
  }, [userLoaded, userState.dailyGoal, userState.cards]);

  const currentItem = queue[currentIndex];

  const handleRating = (grade: Grade) => {
    if (!currentItem) return;

    // Apply review through FSRS
    reviewHadith(currentItem.hadith.id, grade);
    setSessionReviewedCount(prev => prev + 1);

    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
    } else {
      // Completed all items in queue
      setIsSessionComplete(true);
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#b8860b', '#d4ae46', '#2e7d32', '#f5eed3'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  if (!userLoaded || isLoadingQueue) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-surface-300 dark:border-surface-700 border-t-primary-600 dark:border-t-primary-400 animate-spin" />
        <p className="text-sm font-ui text-surface-600 dark:text-surface-400">جارٍ إعداد وِردك اليومي المبارك...</p>
      </div>
    );
  }

  // --- Session Complete Screen ---
  if (isSessionComplete) {
    return (
      <div className="py-8 space-y-6 text-center">
        {/* Celebration Header */}
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-ui text-surface-950 dark:text-surface-100">
            أحسنت وتقبل الله!
          </h2>
          <p className="text-xs text-surface-600 dark:text-surface-400 font-ui">
            أتممت وِردك اليومي وثبّتَّ الأحاديث في صدرك
          </p>
        </div>

        {/* Streak & Stats Box */}
        <div className="bg-surface-100 dark:bg-surface-900 rounded-3xl border border-surface-300 dark:border-surface-800 p-6 space-y-5 text-right font-ui shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-primary-600 dark:text-primary-400 fill-primary-600 dark:fill-primary-400" />
              <div>
                <span className="font-bold text-lg text-surface-900 dark:text-surface-100">
                  {currentStreak} {currentStreak === 1 ? 'يوم' : currentStreak === 2 ? 'يومان' : 'أيام'} متتالية
                </span>
                <span className="text-xs text-surface-500 dark:text-surface-400 block">تتابع الحفظ والمراجعة</span>
              </div>
            </div>

            {streakShields > 0 && (
              <div className="flex items-center gap-1 bg-primary-50 dark:bg-primary-950 px-3 py-1.5 rounded-full border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-300 text-xs font-semibold">
                <Shield className="w-4 h-4" />
                <span>{streakShields} درع حماية</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-surface-50 dark:bg-surface-850/60 border border-surface-200 dark:border-surface-800">
              <span className="text-xs text-surface-500 dark:text-surface-400 block">أحاديث الوِرد المكتملة</span>
              <span className="text-xl font-bold text-surface-900 dark:text-surface-100">{sessionReviewedCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-surface-50 dark:bg-surface-850/60 border border-surface-200 dark:border-surface-800">
              <span className="text-xs text-surface-500 dark:text-surface-400 block">إجمالي المحفوظ</span>
              <span className="text-xl font-bold text-primary-700 dark:text-primary-400">{memorizedCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-50/70 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800">
            <Award className="w-7 h-7 text-primary-700 dark:text-primary-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-primary-900 dark:text-primary-200 block">
                المستوى الحالي: {currentLevelInfo.titleAr}
              </span>
              <span className="text-primary-800 dark:text-primary-300">{currentLevelInfo.descriptionAr}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-ui font-bold text-base shadow-sm transition-all"
          >
            <Home className="w-5 h-5" />
            <span>العودة للرئيسية</span>
          </Link>

          <Link
            href="/browse"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-800 dark:text-surface-200 font-ui font-semibold text-sm border border-surface-300 dark:border-surface-700 transition-all"
          >
            <span>استعراض أحاديث إضافية للحفظ</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // --- Active Review Screen ---
  return (
    <div className="py-4 space-y-4">
      {/* Top Header: Progress & Close */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-ui bg-surface-200 dark:bg-surface-800 px-2.5 py-1 rounded-full text-surface-700 dark:text-surface-300">
            {currentIndex + 1} / {queue.length}
          </span>
          {currentItem?.isNew && (
            <span className="text-xs font-semibold font-ui bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300 px-2 py-0.5 rounded-full border border-primary-200 dark:border-primary-800">
              حديث جديد
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex-1 mx-4 h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
          />
        </div>

        <Link
          href="/"
          className="p-1.5 rounded-xl text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
          title="خروج من الوِرد"
        >
          <X className="w-5 h-5" />
        </Link>
      </div>

      {/* Main Hadith Card (With Partial Reveal) */}
      {currentItem && (
        <div className="space-y-4">
          <HadithCard
            hadith={currentItem.hadith}
            isPartialReveal={true}
            isRevealed={isRevealed}
            onReveal={() => setIsRevealed(true)}
            showActions={false}
          />

          {/* Rating Section: Appears once revealed */}
          {isRevealed ? (
            <div className="space-y-2 pt-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-surface-600 dark:text-surface-400 px-1 font-ui">
                <span>كيف كان استذكارك للمتن؟</span>
                <span className="text-surface-500 dark:text-surface-400">اختر لضبط التكرار القادم</span>
              </div>
              <ReviewButtons
                card={currentItem.card}
                onRate={handleRating}
              />
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-surface-500 dark:text-surface-400 font-ui">
                حاول تسميع الحديث في سرك أولاً، ثم انقر للتحقق والتقييم
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
