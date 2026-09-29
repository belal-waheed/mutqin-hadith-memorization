'use client';

import { useState } from 'react';
import type { Hadith } from '@/types';
import { Bookmark, BookmarkCheck, Copy, Check, BookOpen } from 'lucide-react';
import { useUserState } from '@/hooks/useUserState';

interface HadithCardProps {
  hadith: Hadith;
  isPartialReveal?: boolean;
  isRevealed?: boolean;
  onReveal?: () => void;
  showActions?: boolean;
  className?: string;
}

export function HadithCard({
  hadith,
  isPartialReveal = false,
  isRevealed = true,
  onReveal,
  showActions = true,
  className = '',
}: HadithCardProps) {
  const { userState, toggleBookmark } = useUserState();
  const [copied, setCopied] = useState(false);

  const isBookmarked = userState.bookmarkedHadithIds.includes(hadith.id);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${hadith.arabic}\n\n[${hadith.bookName} - ${hadith.chapterTitle} - حديث رقم ${hadith.idInBook}]`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy hadith:', err);
    }
  };

  // Splitting text for partial reveal during memorization testing
  const words = hadith.arabic.split(' ');
  const splitIndex = Math.max(3, Math.floor(words.length * 0.45));
  const promptPart = words.slice(0, splitIndex).join(' ');

  return (
    <article
      className={`bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-5 md:p-6 shadow-xs transition-all ${className}`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-200 dark:border-surface-800 text-xs text-surface-600 dark:text-surface-400 font-ui">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          <span className="font-semibold text-primary-800 dark:text-primary-300">{hadith.bookName}</span>
          <span className="text-surface-400 dark:text-surface-600">·</span>
          <span className="truncate max-w-[170px] sm:max-w-[240px]">{hadith.chapterTitle}</span>
        </div>
        <span className="bg-surface-200/80 dark:bg-surface-800 px-2 py-0.5 rounded text-surface-700 dark:text-surface-300 font-medium">
          حديث {hadith.idInBook}
        </span>
      </div>

      {/* Hadith Text Body */}
      <div className="my-2">
        {isPartialReveal && !isRevealed ? (
          <div className="space-y-4">
            <p className="font-hadith text-surface-900 dark:text-surface-100 leading-loose text-justify">
              {promptPart}...
            </p>
            <button
              type="button"
              onClick={onReveal}
              className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/40 hover:bg-primary-100/60 dark:hover:bg-primary-900/40 text-primary-800 dark:text-primary-300 font-ui font-medium text-sm flex items-center justify-center transition-colors cursor-pointer"
            >
              انقر لإظهار بقية متن الحديث والتحقق من حفظك
            </button>
          </div>
        ) : (
          <p className="font-hadith text-surface-950 dark:text-surface-50 leading-loose text-justify selection:bg-primary-200 dark:selection:bg-primary-900">
            {hadith.arabic}
          </p>
        )}
      </div>

      {/* Footer Action Icons */}
      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-surface-200 dark:border-surface-800">
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? 'تم النسخ' : 'نسخ الحديث'}
            className="p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-accent" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleBookmark(hadith.id)}
            title={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ في المفضلة'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-800'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-primary-600 dark:fill-primary-400" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </article>
  );
}
