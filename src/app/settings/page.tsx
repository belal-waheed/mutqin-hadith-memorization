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
  Bell,
  BellRing,
  Cloud,
  CloudOff,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  RefreshCw,
} from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';
import { useUserState } from '@/hooks/useUserState';
import { saveUserState } from '@/lib/user-storage';
import { useFontSize, FONT_SIZES, type FontSize } from '@/hooks/useFontSize';
import { useNotifications } from '@/hooks/useNotifications';

const FONT_OPTIONS = [
  { id: 'font-hadith', label: 'أميري', fontClass: 'font-hadith', desc: 'أصيل ومضبوط' },
  { id: 'font-naskh', label: 'نسخ', fontClass: 'font-naskh', desc: 'واضح ومريح' },
  { id: 'font-cairo', label: 'كيرو', fontClass: 'font-cairo', desc: 'عصري وسلس' },
];

const GOAL_OPTIONS = [
  { value: 1, label: 'حديث واحد', desc: 'تدرج مريح وخطوات ثابتة' },
  { value: 3, label: '٣ أحاديث', desc: 'الخيار الموصى به (توازن مثالي)' },
  { value: 5, label: '٥ أحاديث', desc: 'همة عالية ومثابرة' },
  { value: 10, label: '١٠ أحاديث', desc: 'حفظ مكثف لطلاب العلم' },
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    userState,
    updateState,
    resetProgress,
    isLoaded,
    session,
    authStatus,
    syncStatus,
    isOnline,
    syncNow,
  } = useUserState();
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const {
    isSupported: notificationsSupported,
    permission: notificationPermission,
    isEnabled: reminderEnabled,
    toggleReminder,
    sendTestNotification,
  } = useNotifications();
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

      {/* Section: Account & Cloud Sync */}
      <section className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 shadow-xs space-y-4 font-ui">
        <div className="flex items-center gap-2 text-surface-900 dark:text-surface-100 font-bold text-base">
          <Cloud className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2>الحساب والمزامنة السحابية</h2>
        </div>

        {authStatus === 'loading' ? (
          <div className="h-20 bg-surface-200/50 dark:bg-surface-800/50 animate-pulse rounded-xl" />
        ) : authStatus === 'authenticated' && session?.user ? (
          <div className="space-y-4">
            {/* User Profile Card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-3">
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'المستخدم'}
                    className="w-11 h-11 rounded-full border border-surface-300 dark:border-surface-700 object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-950/60 border border-primary-300 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-base">
                    {session.user.name ? session.user.name.charAt(0) : <User className="w-5 h-5" />}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
                    {session.user.name || 'طالب العلم'}
                  </h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => signOut()}
                className="py-1.5 px-3 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-950/40 dark:hover:text-red-300 dark:hover:border-red-900/50 text-surface-700 dark:text-surface-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>

            {/* Sync Status Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-2.5">
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="w-4 h-4 text-primary-600 dark:text-primary-400 animate-spin shrink-0" />
                ) : syncStatus === 'synced' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : syncStatus === 'offline' ? (
                  <CloudOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : syncStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                ) : (
                  <Cloud className="w-4 h-4 text-surface-500 shrink-0" />
                )}
                <div>
                  <span className="block text-xs font-bold text-surface-900 dark:text-surface-100">
                    {syncStatus === 'syncing'
                      ? 'جاري المزامنة السحابية...'
                      : syncStatus === 'synced'
                      ? 'مزامنة مكتملة ومحدّثة'
                      : syncStatus === 'offline'
                      ? 'وضع عدم الاتصال'
                      : syncStatus === 'error'
                      ? 'تعذرت المزامنة'
                      : 'المزامنة متوقفة'}
                  </span>
                  <span className="block text-[11px] text-surface-500 dark:text-surface-400">
                    {syncStatus === 'syncing'
                      ? 'يتم تحديث التقدم والبطاقات في السحابة'
                      : syncStatus === 'synced'
                      ? 'جميع محفوظاتك ومراجعاتك مؤمنة في السحابة'
                      : syncStatus === 'offline'
                      ? 'ستتم المزامنة تلقائياً عند عودة اتصال الإنترنت'
                      : syncStatus === 'error'
                      ? 'حدث خطأ في الاتصال، يمكنك إعادة المحاولة'
                      : 'جاهز للمزامنة'}
                  </span>
                </div>
              </div>

              {syncNow && (
                <button
                  type="button"
                  onClick={() => syncNow()}
                  disabled={syncStatus === 'syncing' || !isOnline}
                  className="py-1.5 px-3 rounded-lg bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-800 dark:text-surface-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>مزامنة الآن</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              سجّل الدخول باستخدام حساب Google لحفظ تتابعك اليومي، وبطاقات التكرار المتباعد، ومزامنة تقدمك تلقائياً عبر هاتفك وحاسوبك.
            </p>

            <button
              type="button"
              onClick={() => signIn('google')}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-750 text-surface-900 dark:text-surface-100 font-bold text-xs shadow-xs transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>تسجيل الدخول بواسطة Google</span>
            </button>
          </div>
        )}
      </section>

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

        {/* Font Family Selector */}
        <div className="pt-3 border-t border-surface-200 dark:border-surface-800 mt-4">
          <p className="text-xs text-surface-600 dark:text-surface-400 font-ui mb-2">نوع الخط:</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'font-hadith', label: 'أميري' },
              { id: 'font-naskh', label: 'نسخ' },
              { id: 'font-cairo', label: 'كايرو' }
            ].map(font => {
              const isSelected = userState.fontFamily === font.id || (!userState.fontFamily && font.id === 'font-hadith');
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => updateState(prev => ({ ...prev, fontFamily: font.id }))}
                  className={`py-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60 dark:border-primary-600 text-primary-800 dark:text-primary-300 font-bold shadow-xs'
                      : 'border-surface-300 dark:border-surface-800 bg-surface-50 dark:bg-surface-850/60 hover:bg-surface-200/60 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                  }`}
                >
                  <span className={`block text-sm ${font.id}`}>{font.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tashkeel Toggle */}
        <div className="pt-3 border-t border-surface-200 dark:border-surface-800 mt-2 flex items-center justify-between">
          <div>
            <p className="font-ui font-bold text-sm text-surface-900 dark:text-surface-100">إظهار التشكيل</p>
            <p className="text-[10px] text-surface-500 dark:text-surface-400 mt-0.5">تفعيل أو إيقاف الحركات على الحروف</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={userState.showTashkeel !== false}
            onClick={() => updateState(prev => ({ ...prev, showTashkeel: prev.showTashkeel === false ? true : false }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900 ${
              userState.showTashkeel !== false ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                userState.showTashkeel !== false ? '-translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="mt-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 space-y-1">
          <span className="text-[11px] font-ui text-surface-500 dark:text-surface-400 block mb-1">
            معاينة حية للنص:
          </span>
          <p className={`${userState.fontFamily || 'font-hadith'} text-surface-950 dark:text-surface-100 leading-relaxed text-justify`}>
            {userState.showTashkeel === false 
              ? '«إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى»'
              : '«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»'}
          </p>
          <span className="text-[11px] font-ui text-primary-700 dark:text-primary-400 block pt-1">
            [صحيح البخاري — كتاب بدء الوحي]
          </span>
        </div>
      </section>

      {/* Section 4: Daily Wird Reminder (Notifications) */}
      <section className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 shadow-xs space-y-4 font-ui">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-400 shrink-0">
              {reminderEnabled ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-base text-surface-900 dark:text-surface-100">
                التذكير اليومي للوِرد
              </h2>
              <p className="text-xs text-surface-600 dark:text-surface-400">
                تنبيهات المتصفح لتذكيرك بوِرد المراجعة وحماية تتابعك اليومي
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={reminderEnabled}
            onClick={toggleReminder}
            disabled={!notificationsSupported}
            title={!notificationsSupported ? 'المتصفح لا يدعم الإشعارات' : reminderEnabled ? 'تعطيل التذكير' : 'تفعيل التذكير'}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900 ${
              reminderEnabled ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-700'
            } ${!notificationsSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                reminderEnabled ? '-translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Warning if denied in browser permissions */}
        {notificationPermission === 'denied' && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
            تنبيه: تم حظر الإشعارات في إعدادات المتصفح. لتفعيل التذكير، يرجى النقر على أيقونة الإعدادات أو القفل في شريط العنوان بالأعلى والسماح بالإشعارات لموقع مُتقِن.
          </div>
        )}

        {/* Info when enabled */}
        {reminderEnabled && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-surface-200 dark:border-surface-800 text-xs">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>التذكير اليومي مفعل</span>
            </span>

            <button
              type="button"
              onClick={sendTestNotification}
              className="self-start sm:self-auto py-1.5 px-3 rounded-lg bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-800 dark:text-surface-200 font-medium transition-colors cursor-pointer"
            >
              إرسال إشعار تجريبي الآن
            </button>
          </div>
        )}
      </section>

      {/* Section 5: Onboarding Tour Shortcut */}
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

      {/* Section 6: Danger Zone - Reset Progress */}
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
