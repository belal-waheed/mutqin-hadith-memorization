'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Type,
  Target,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Check,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';
import { useUserState } from '@/hooks/useUserState';
import { useFontSize, FONT_SIZES, type FontSize } from '@/hooks/useFontSize';

const GOAL_OPTIONS = [
  { value: 1, label: 'حديث واحد', desc: 'تدرج مريح وخطوات ثابتة' },
  { value: 3, label: '٣ أحاديث', desc: 'الخيار الموصى به (توازن مثالي)' },
  { value: 5, label: '٥ أحاديث', desc: 'همة عالية ومثابرة' },
  { value: 10, label: '١٠ أحاديث', desc: 'حفظ مكثف لطلاب العلم' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { userState, updateState, resetProgress, isLoaded } = useUserState();
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const [mounted, setMounted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoalChange = (newGoal: number) => {
    updateState(prev => ({
      ...prev,
      dailyGoal: newGoal,
    }));
  };

  const handleResetConfirm = () => {
    resetProgress();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => {
      router.push('/onboarding');
    }, 1200);
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h1 className="font-ui font-extrabold text-2xl text-surface-900 dark:text-surface-100 tracking-tight">
              الإعدادات
            </h1>
          </div>
          <p className="text-xs text-surface-600 dark:text-surface-400 font-ui mt-0.5">
            تخصيص تجربة الحفظ والمظهر وأهدافك اليومية
          </p>
        </div>
      </header>

      {/* Section 1: Daily Goal */}
      <section className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-surface-900 dark:text-surface-100 font-ui font-bold text-base">
          <Target className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <h2>الهدف اليومي من الأحاديث الجديدة</h2>
        </div>
        <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed font-ui">
          عدد الأحاديث الجديدة المقترحة للحفظ في وِرد كل يوم، بالإضافة إلى مراجعاتك المستحقة:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {GOAL_OPTIONS.map(opt => {
            const isSelected = isLoaded && userState.dailyGoal === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleGoalChange(opt.value)}
                className={`flex items-start justify-between p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60 dark:border-primary-600 text-surface-900 dark:text-surface-100 shadow-xs'
                    : 'border-surface-300 dark:border-surface-800 bg-surface-50 dark:bg-surface-850/60 hover:bg-surface-200/60 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                }`}
              >
                <div>
                  <span className="block font-ui font-bold text-sm text-surface-900 dark:text-surface-100">
                    {opt.label}
                  </span>
                  <span className="block text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                    {opt.desc}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 2: Theme Settings */}
      <section className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-surface-900 dark:text-surface-100 font-ui font-bold text-base">
          <Sun className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <h2>مظهر التطبيق</h2>
        </div>
        <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed font-ui">
          اختر النمط المناسب لراحتك أثناء القراءة والحفظ:
        </p>

        {mounted ? (
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60 dark:border-primary-600 text-primary-900 dark:text-primary-100 font-bold shadow-xs'
                  : 'border-surface-300 dark:border-surface-800 bg-surface-50 dark:bg-surface-850/60 hover:bg-surface-200/60 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
              }`}
            >
              <Sun className="w-5 h-5 mb-1.5 text-amber-600" />
              <span className="text-xs font-ui">فاتح</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60 dark:border-primary-600 text-primary-900 dark:text-primary-100 font-bold shadow-xs'
                  : 'border-surface-300 dark:border-surface-800 bg-surface-50 dark:bg-surface-850/60 hover:bg-surface-200/60 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
              }`}
            >
              <Moon className="w-5 h-5 mb-1.5 text-primary-400" />
              <span className="text-xs font-ui">داكن (دافئ)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                theme === 'system'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60 dark:border-primary-600 text-primary-900 dark:text-primary-100 font-bold shadow-xs'
                  : 'border-surface-300 dark:border-surface-800 bg-surface-50 dark:bg-surface-850/60 hover:bg-surface-200/60 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
              }`}
            >
              <Laptop className="w-5 h-5 mb-1.5 text-surface-500" />
              <span className="text-xs font-ui">تلقائي النظام</span>
            </button>
          </div>
        ) : (
          <div className="h-16 bg-surface-200/50 dark:bg-surface-800/50 animate-pulse rounded-xl" />
        )}
      </section>

      {/* Section 3: Font Size */}
      <section className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-surface-900 dark:text-surface-100 font-ui font-bold text-base">
          <Type className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <h2>حجم خط متون الأحاديث</h2>
        </div>
        <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed font-ui">
          تحكم في حجم خط المتن النبوي لتيسير القراءة وضبط الشكل:
        </p>

        <div className="grid grid-cols-4 gap-2 pt-1">
          {FONT_SIZES.map(item => {
            const isSelected = fontSize === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFontSize(item.id as FontSize)}
                className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60 dark:border-primary-600 text-primary-800 dark:text-primary-300 font-bold shadow-xs'
                    : 'border-surface-300 dark:border-surface-800 bg-surface-50 dark:bg-surface-850/60 hover:bg-surface-200/60 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                }`}
              >
                <span className="block text-xs font-ui">{item.labelAr}</span>
                <span className="block text-[10px] text-surface-500 dark:text-surface-400 mt-0.5 font-mono">
                  {item.scaleLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Preview Box */}
        <div className="mt-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 space-y-1">
          <span className="text-[11px] font-ui text-surface-500 dark:text-surface-400 block mb-1">
            معاينة حية للنص:
          </span>
          <p className="font-hadith text-surface-950 dark:text-surface-100 leading-relaxed text-justify">
            «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»
          </p>
          <span className="text-[11px] font-ui text-primary-700 dark:text-primary-400 block pt-1">
            [صحيح البخاري — كتاب بدء الوحي]
          </span>
        </div>
      </section>

      {/* Section 4: Onboarding Tour Shortcut */}
      <section className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-ui font-bold text-sm text-surface-900 dark:text-surface-100">
              جولة التعريف بالتطبيق
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 font-ui">
              إعادة استعراض مميزات مُتقِن وفكرة التكرار المتباعد
            </p>
          </div>
        </div>

        <Link
          href="/onboarding"
          className="p-2 rounded-xl bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-800 dark:text-surface-200 transition-colors"
          title="بدء الجولة"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </section>

      {/* Section 5: Danger Zone - Reset Progress */}
      <section className="bg-red-50/60 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-red-900 dark:text-red-300 font-ui font-bold text-base">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h2>إعادة ضبط المحفوظات والتقدم</h2>
        </div>
        <p className="text-xs text-red-800/80 dark:text-red-300/80 leading-relaxed font-ui">
          مسح جميع سجلات المراجعات، والأيام المتتابعة، وبطاقات الحفظ، والبدء من الصفر تماماً. لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
        </p>

        {resetSuccess && (
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-ui font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>تمت إعادة ضبط البيانات بنجاح. جاري نقلك لجولة البداية...</span>
          </div>
        )}

        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-ui font-bold text-xs shadow-xs transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة ضبط كل التقدم</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-white dark:bg-surface-900 border border-red-300 dark:border-red-800 space-y-3">
            <p className="text-xs font-ui font-bold text-red-950 dark:text-red-200 leading-relaxed">
              تحذير: هل أنت متأكد تماماً؟ ستفقد {Object.keys(userState.cards).length} حديثاً مسجلاً وتتابع {userState.currentStreak} يوماً وسيعود التطبيق للحالة الأولية.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetConfirm}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-ui font-bold text-xs transition-all cursor-pointer"
              >
                نعم، امسح وابدأ من جديد
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="py-2 px-4 rounded-xl bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-800 dark:text-surface-200 font-ui font-medium text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </section>

      {/* About Footer */}
      <footer className="text-center font-ui py-2 space-y-1 text-surface-500 dark:text-surface-500 text-xs">
        <p className="font-semibold text-surface-700 dark:text-surface-400">
          مُتقِن — الإصدار 0.1.0
        </p>
        <p>تطبيق حفظ وضبط متون صحيحي البخاري ومسلم بالتكرار المتباعد</p>
      </footer>
    </div>
  );
}
