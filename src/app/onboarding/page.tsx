'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  Brain,
  ShieldCheck,
  Check,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { useUserState } from '@/hooks/useUserState';

const GOAL_CHOICES = [
  {
    value: 1,
    title: 'حديث واحد يومياً',
    desc: 'بداية هادئة وخطوات راسخة مستمرة',
    badge: 'تدرج مريح',
  },
  {
    value: 3,
    title: '٣ أحاديث يومياً',
    desc: 'التوازن المثالي بين الحفظ الجديد والمراجعة',
    badge: 'موصى به',
    recommended: true,
  },
  {
    value: 5,
    title: '٥ أحاديث يومياً',
    desc: 'همة عالية لحفظ متون السنة النبوية',
    badge: 'همة عالية',
  },
  {
    value: 10,
    title: '١٠ أحاديث يومياً',
    desc: 'برنامج مكثف لطلبة العلم المتفرغين',
    badge: 'مكثف',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { finishOnboarding, enrollHadith } = useUserState();
  const [selectedGoal, setSelectedGoal] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartJourney = () => {
    setIsSubmitting(true);
    // Enroll the foundational Hadith #1 (Intentions) into the active memorization queue
    enrollHadith(1);
    // Complete onboarding and save daily goal
    finishOnboarding(selectedGoal);
    // Navigate to homepage
    router.replace('/');
  };

  return (
    <div className="py-6 sm:py-8 max-w-lg mx-auto space-y-6">
      {/* Header / Brand */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950 border border-primary-300 dark:border-primary-800 text-primary-800 dark:text-primary-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>منصة حفظ متون الصحيحين</span>
        </div>

        <h1 className="font-ui font-extrabold text-3xl sm:text-4xl text-surface-900 dark:text-surface-100 tracking-tight">
          مُتقِن
        </h1>

        <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 font-ui max-w-md mx-auto leading-relaxed">
          طريقك الأيسر والأرسخ لضبط متون صحيحي البخاري ومسلم في صدرك وفق خوارزمية التكرار المتباعد الحديثة.
        </p>
      </div>

      {/* Value Proposition Cards */}
      <div className="grid grid-cols-1 gap-2.5">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/80 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-400 shrink-0 mt-0.5">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-ui font-bold text-sm text-surface-900 dark:text-surface-100">
              تكرار متباعد ذكي (FSRS)
            </h3>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed mt-0.5">
              تحديد الموعد الأمثل لكل حديث قبل نسيانه، لحفظ راسخ بأقل جهد ذهني ممكن.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-ui font-bold text-sm text-surface-900 dark:text-surface-100">
              الصحيحان فقط
            </h3>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed mt-0.5">
              متون صحيحي البخاري ومسلم مقسمة على الأبواب الفقهية، لتركيز مطلق على أصح ما ثبت عن النبي ﷺ.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-ui font-bold text-sm text-surface-900 dark:text-surface-100">
              وِرد يومي مع حماية التتابع
            </h3>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed mt-0.5">
              جلسات مراجعة وتثبيت موجزة يومياً مع دروع حماية التتابع لمنع الانقطاع.
            </p>
          </div>
        </div>
      </div>

      {/* Goal Selection Section */}
      <section className="bg-surface-100 dark:bg-surface-900 rounded-3xl border border-surface-300 dark:border-surface-800 p-5 shadow-xs space-y-3">
        <div>
          <h2 className="font-ui font-bold text-base text-surface-900 dark:text-surface-100">
            حدد هدفك اليومي من الأحاديث الجديدة
          </h2>
          <p className="text-xs text-surface-600 dark:text-surface-400 mt-0.5 font-ui">
            كم حديثاً ترغب في حفظه يومياً بجانب مراجعاتك؟
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {GOAL_CHOICES.map(choice => {
            const isSelected = selectedGoal === choice.value;
            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => setSelectedGoal(choice.value)}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/70 dark:border-primary-600 shadow-xs ring-1 ring-primary-500'
                    : 'border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-850/60 hover:bg-surface-200/60 dark:hover:bg-surface-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-ui font-bold text-sm text-surface-900 dark:text-surface-100">
                    {choice.title}
                  </span>
                  <span
                    className={`text-[10px] font-ui px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-300 dark:border-surface-700'
                    }`}
                  >
                    {choice.badge}
                  </span>
                </div>
                <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed font-ui">
                  {choice.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Taste of Experience: First Hadith */}
      <section className="bg-gradient-to-br from-primary-50 via-surface-100 to-surface-100 dark:from-primary-950/40 dark:via-surface-900 dark:to-surface-900 rounded-3xl border border-primary-200 dark:border-primary-900/60 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-primary-200/70 dark:border-primary-900/60 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs text-primary-800 dark:text-primary-300 font-bold">
            <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span>حديثك الأول كنواة مباركة للانطلاق</span>
          </div>
          <span className="text-[11px] font-ui bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300 px-2 py-0.5 rounded border border-primary-300 dark:border-primary-800">
            صحيح البخاري — حديث 1
          </span>
        </div>

        <p className="font-hadith text-surface-950 dark:text-surface-50 leading-loose text-justify">
          «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ»
        </p>

        <p className="text-[11px] text-surface-600 dark:text-surface-400 font-ui leading-relaxed pt-1">
          حديث بدء الوحي والنية هو مفتاح طلب العلم والحديث، وسيكون أول بطاقة تنضم لوِردك اليومي.
        </p>
      </section>

      {/* Main Start Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleStartJourney}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-ui font-bold text-base shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
        >
          <span>{isSubmitting ? 'جاري تجهيز وِردك...' : 'ابدأ الرحلة المباركة'}</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
