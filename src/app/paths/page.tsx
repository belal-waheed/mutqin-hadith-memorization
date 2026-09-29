'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Route,
  Check,
  Plus,
  BookOpen,
  Sparkles,
  Layers,
  ChevronDown,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useUserState } from '@/hooks/useUserState';

interface CurriculumPath {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  hadithIds: number[];
  category: string;
}

const CURRICULUM_PATHS: CurriculumPath[] = [
  {
    id: 'faith-and-intent',
    title: 'نواة الإيمان (أحاديث العقيدة والنية)',
    subtitle: 'أصول التوحيد والنية وصلاح العمل',
    description:
      'أحاديث جامعة تؤصل للإخلاص، وأركان الإيمان، وحقيقة الإسلام، وبناء العقيدة الصافية في قلب المسلم.',
    hadithIds: [1, 50, 51, 52, 53],
    category: 'العقيدة والنية',
  },
  {
    id: 'tahara-and-salah',
    title: 'أبواب الطهارة والصلاة',
    subtitle: 'فقه الطهارة وعماد الدين',
    description:
      'أصول أحكام الوضوء والطهارة واستقبال القبلة وإقامة الركن الثاني من أركان الإسلام وفق السنة المطهرة.',
    hadithIds: [135, 136, 137, 138],
    category: 'العبادات',
  },
  {
    id: 'jawami-al-kalim',
    title: 'جوامع الكلم (الأحاديث القصيرة الشاملة)',
    subtitle: 'درر نبوية موجزة وعظيمة الأثر',
    description:
      'درر نبوية موجزة الألفاظ عظيمة المعاني، تجمع الآداب والأخلاق ومقاصد الشريعة، سهلة الحفظ راسخة الأثر.',
    hadithIds: [5997, 5998, 5999],
    category: 'الآداب والمواعظ',
  },
];

export default function PathsPage() {
  const { userState, enrollHadith, isLoaded } = useUserState();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedPathId, setExpandedPathId] = useState<string | null>(null);
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => (prev === message ? null : prev));
    }, 4000);
  };

  const handleEnrollPath = (path: CurriculumPath) => {
    // Iterate over hadith IDs and enroll each into the user's wird queue
    for (const id of path.hadithIds) {
      enrollHadith(id);
    }

    setEnrolledMap(prev => ({
      ...prev,
      [path.id]: true,
    }));

    showToast(`تم ضم مسار "${path.title}" إلى وِردك اليومي بنجاح`);
  };

  const toggleExpand = (pathId: string) => {
    setExpandedPathId(prev => (prev === pathId ? null : pathId));
  };

  if (!isLoaded) {
    return (
      <div className="py-8 space-y-4">
        <div className="h-8 w-44 bg-surface-200 dark:bg-surface-800 animate-pulse rounded-lg" />
        <div className="h-4 w-64 bg-surface-200 dark:bg-surface-800 animate-pulse rounded" />
        <div className="space-y-4 pt-4">
          <div className="h-44 bg-surface-200 dark:bg-surface-800 animate-pulse rounded-2xl" />
          <div className="h-44 bg-surface-200 dark:bg-surface-800 animate-pulse rounded-2xl" />
          <div className="h-44 bg-surface-200 dark:bg-surface-800 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-surface-900 text-surface-50 dark:bg-surface-100 dark:text-surface-950 p-4 rounded-xl shadow-lg border border-surface-700 dark:border-surface-300 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-accent/20 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-accent" />
              </div>
              <p className="text-xs sm:text-sm font-ui font-medium leading-snug">{toastMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 text-surface-400 hover:text-surface-100 dark:hover:text-surface-900 transition-colors shrink-0 cursor-pointer"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Route className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h1 className="font-ui font-extrabold text-2xl text-surface-950 dark:text-surface-100">
            المسارات المنهجية
          </h1>
        </div>
        <p className="text-xs text-surface-600 dark:text-surface-400 font-ui">
          خطط حفظ موضوعية مصنفة تعينك على التدرج وضبط أصول السنة النبوية الشريفة
        </p>
      </div>

      {/* Overview Banner */}
      <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/60 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary-700 dark:text-primary-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-surface-700 dark:text-surface-300 font-ui leading-relaxed">
          <span className="font-bold text-primary-900 dark:text-primary-200">
            كيف تعمل المسارات المنهجية؟
          </span>
          <p className="mt-1 text-xs text-surface-600 dark:text-surface-400">
            عند ضم مسار إلى وِردك، تُضاف أحاديثه تلقائياً إلى خوارزمية التكرار المتباعد لتظهر تباعاً في جلسات الحفظ والمراجعة اليومية.
          </p>
        </div>
      </div>

      {/* Curriculum Paths List */}
      <div className="space-y-4">
        {CURRICULUM_PATHS.map(path => {
          // Count how many hadiths in this path are already enrolled
          const enrolledCount = path.hadithIds.filter(id => Boolean(userState.cards[id])).length;
          const isAllEnrolled = enrolledCount === path.hadithIds.length;
          const wasJustEnrolled = Boolean(enrolledMap[path.id]);
          const isEnrolledState = isAllEnrolled || wasJustEnrolled;
          const isExpanded = expandedPathId === path.id;

          return (
            <article
              key={path.id}
              className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                {/* Path Header Tags */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-surface-200 dark:border-surface-800 text-xs font-ui">
                  <span className="bg-primary-100/80 dark:bg-primary-950/80 text-primary-800 dark:text-primary-300 px-2.5 py-1 rounded-md font-semibold">
                    {path.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-surface-500 dark:text-surface-400">
                    <Layers className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    <span>{path.hadithIds.length} أحاديث</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mt-3.5 mb-3">
                  <h2 className="font-ui font-bold text-base sm:text-lg text-surface-950 dark:text-surface-50 leading-snug">
                    {path.title}
                  </h2>
                  <p className="text-xs text-primary-700 dark:text-primary-400 font-medium mt-0.5">
                    {path.subtitle}
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-300 font-ui leading-relaxed">
                    {path.description}
                  </p>
                </div>

                {/* Enrolled Progress Status */}
                <div className="py-2 flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 font-ui">
                  <span>نسبة الضم لوِردك:</span>
                  <span className="font-bold text-surface-800 dark:text-surface-200">
                    {enrolledCount} من {path.hadithIds.length} حديث
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-primary-600 dark:bg-primary-400 transition-all duration-300"
                    style={{
                      width: `${(enrolledCount / path.hadithIds.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Collapsible Hadith IDs Preview */}
                <div className="mt-2 border-t border-surface-200/80 dark:border-surface-800/80 pt-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(path.id)}
                    className="flex items-center justify-between w-full text-xs font-ui text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 transition-colors py-1 cursor-pointer"
                    aria-expanded={isExpanded}
                  >
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>قائمة أحاديث المسار</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                      isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pt-2 pb-1 space-y-1.5">
                        {path.hadithIds.map(id => {
                          const isEnrolledInWird = Boolean(userState.cards[id]);
                          return (
                            <div
                              key={id}
                              className="flex items-center justify-between text-xs bg-surface-200/60 dark:bg-surface-800/60 p-2 rounded-lg font-ui"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-surface-400 dark:text-surface-500">حديث رقم:</span>
                                <span className="font-mono font-bold text-surface-800 dark:text-surface-200">
                                  {id}
                                </span>
                              </div>
                              {isEnrolledInWird ? (
                                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                  <Check className="w-3 h-3" />
                                  <span>في الوِرد</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-surface-400 dark:text-surface-500">
                                  غير مضموم
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-surface-200 dark:border-surface-800">
                {isEnrolledState ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled
                      className="flex-1 py-3 px-4 rounded-xl bg-surface-200/80 dark:bg-surface-800/80 text-emerald-700 dark:text-emerald-400 font-ui font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-emerald-500/20 cursor-default"
                    >
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>تم الضم</span>
                    </button>
                    <Link
                      href="/wird"
                      className="py-3 px-3.5 rounded-xl bg-primary-100 hover:bg-primary-200 dark:bg-primary-950 dark:hover:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-ui font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="مراجعة الوِرد الآن"
                    >
                      <span>الوِرد</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleEnrollPath(path)}
                    className="w-full py-3 px-4 rounded-xl bg-primary-700 hover:bg-primary-800 active:bg-primary-900 text-white font-ui font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {enrolledCount > 0
                        ? `ضم بقية المسار (${path.hadithIds.length - enrolledCount} متبقية)`
                        : 'ضم مسار الحفظ لوِردي'}
                    </span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
