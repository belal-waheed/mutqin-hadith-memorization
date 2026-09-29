'use client';

import React from 'react';
import type { UserState } from '@/types';
import { AlertTriangle, HardDrive, Cloud, CloudDownload, CloudUpload, Loader2 } from 'lucide-react';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  localState: UserState | null;
  cloudState: UserState | null;
  onResolve: (choice: 'keep-local' | 'download-cloud') => Promise<void>;
  isResolving: boolean;
}

export function ConflictResolutionModal({
  isOpen,
  localState,
  cloudState,
  onResolve,
  isResolving,
}: ConflictResolutionModalProps) {
  if (!isOpen || !localState || !cloudState) {
    return null;
  }

  const localCardsCount = Object.keys(localState.cards || {}).length;
  const cloudCardsCount = Object.keys(cloudState.cards || {}).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-ui animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="conflict-dialog-title"
        className="w-full max-w-lg bg-surface-50 dark:bg-surface-900 rounded-3xl border border-surface-300 dark:border-surface-800 p-6 shadow-2xl space-y-6 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2
              id="conflict-dialog-title"
              className="text-lg font-bold text-surface-900 dark:text-surface-100 tracking-tight"
            >
              تعارض في البيانات السحابية والمحلية
            </h2>
            <p className="text-xs text-surface-600 dark:text-surface-400 mt-1 leading-relaxed">
              تم العثور على سجلات محفوظة محلياً على هذا المتصفح وسجلات أخرى مختلفة في حسابك السحابي. يرجى اختيار النسخة التي تريد اعتمادها:
            </p>
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Local Device Data */}
          <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-850 border border-surface-300 dark:border-surface-800 space-y-2">
            <div className="flex items-center gap-2 text-surface-900 dark:text-surface-100 font-bold text-xs">
              <HardDrive className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>البيانات المحلية (هذا الجهاز)</span>
            </div>
            <ul className="text-xs space-y-1.5 text-surface-600 dark:text-surface-400 pt-1">
              <li className="flex justify-between">
                <span>الأحاديث قيد الحفظ:</span>
                <span className="font-bold text-surface-900 dark:text-surface-100">{localCardsCount}</span>
              </li>
              <li className="flex justify-between">
                <span>التتابع المستمر:</span>
                <span className="font-bold text-surface-900 dark:text-surface-100">{localState.currentStreak} يوم</span>
              </li>
              <li className="flex justify-between">
                <span>إجمالي المراجعات:</span>
                <span className="font-bold text-surface-900 dark:text-surface-100">{localState.totalReviews}</span>
              </li>
              <li className="flex justify-between">
                <span>الدرع الوقائي:</span>
                <span className="font-bold text-surface-900 dark:text-surface-100">{localState.streakShields}</span>
              </li>
            </ul>
          </div>

          {/* Cloud Account Data */}
          <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-850 border border-surface-300 dark:border-surface-800 space-y-2">
            <div className="flex items-center gap-2 text-surface-900 dark:text-surface-100 font-bold text-xs">
              <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>البيانات السحابية (الحساب)</span>
            </div>
            <ul className="text-xs space-y-1.5 text-surface-600 dark:text-surface-400 pt-1">
              <li className="flex justify-between">
                <span>الأحاديث قيد الحفظ:</span>
                <span className="font-bold text-surface-900 dark:text-surface-100">{cloudCardsCount}</span>
              </li>
              <li className="flex justify-between">
                <span>التتابع المستمر:</span>
                <span className="font-bold text-surface-900 dark:text-surface-100">{cloudState.currentStreak} يوم</span>
              </li>
              <li className="flex justify-between">
                <span>إجمالي المراجعات:</span>
                <span className="font-bold text-surface-900 dark:text-surface-100">{cloudState.totalReviews}</span>
              </li>
              <li className="flex justify-between">
                <span>الدرع الوقائي:</span>
                <span className="font-bold text-surface-900 dark:text-surface-100">{cloudState.streakShields}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Option A: Keep Local */}
          <button
            type="button"
            disabled={isResolving}
            onClick={() => onResolve('keep-local')}
            className="w-full p-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2.5 text-right">
              {isResolving ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <CloudUpload className="w-4 h-4 shrink-0" />
              )}
              <div>
                <span className="block font-bold">الاحتفاظ بالبيانات المحلية (الكتابة فوق السحابة)</span>
                <span className="block text-[11px] font-normal text-primary-100">
                  رفع بيانات هذا الجهاز الحالية واعتمادها في السحابة
                </span>
              </div>
            </div>
          </button>

          {/* Option B: Download Cloud */}
          <button
            type="button"
            disabled={isResolving}
            onClick={() => onResolve('download-cloud')}
            className="w-full p-3.5 rounded-2xl bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-750 text-surface-900 dark:text-surface-100 font-bold text-xs transition-all border border-surface-300 dark:border-surface-700 flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2.5 text-right">
              {isResolving ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <CloudDownload className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              <div>
                <span className="block font-bold">تنزيل البيانات السحابية (استبدال المحلية)</span>
                <span className="block text-[11px] font-normal text-surface-600 dark:text-surface-400">
                  تنزيل بيانات السحابة واستبدال بيانات هذا الجهاز بها
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
