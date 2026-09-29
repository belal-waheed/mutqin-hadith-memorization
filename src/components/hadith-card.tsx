'use client';

import { useState, useMemo } from 'react';
import type { Hadith, QuizMode } from '@/types';
import { Bookmark, BookmarkCheck, Copy, Check, BookOpen } from 'lucide-react';
import { useUserState } from '@/hooks/useUserState';

interface HadithCardProps {
  hadith: Hadith;
  isPartialReveal?: boolean;
  quizMode?: QuizMode;
  isRevealed?: boolean;
  onReveal?: () => void;
  showActions?: boolean;
  className?: string;
}

// Strip Arabic diacritics (tashkeel)
function stripTashkeel(word: string): string {
  return word.replace(/[\u064B-\u065F\u0670]/g, '');
}

// Clean Arabic word for stop-word checks and length
function cleanArabicWord(word: string): string {
  return stripTashkeel(word)
    .replace(/[«»"،.؛:؟!)(]/g, '')
    .trim();
}

// Common Arabic stop words and narrator fillers to avoid blanking
const ARABIC_STOP_WORDS = new Set([
  'قال', 'قالوا', 'قالت', 'يقول', 'فقال', 'فقالت', 'فقالوا',
  'عن', 'عنه', 'عنها', 'عنهم', 'عنهما',
  'في', 'من', 'إلى', 'على', 'ما', 'أن', 'إن', 'لا', 'ثم', 'أو',
  'قد', 'هو', 'هي', 'هم', 'هن', 'مع', 'ذا', 'ذو', 'ذي', 'كم',
  'بل', 'حتى', 'لو', 'كي', 'إذ', 'إذا', 'هذا', 'هذه', 'ذلك', 'تلك',
  'الذي', 'التي', 'الذين', 'اللاتي', 'اللواتي',
  'رسول', 'الله', 'صلى', 'وسلم', 'النبي', 'حدثنا', 'أخبرنا', 'سمعت'
]);

// Deterministic pseudo-random number generator for stable blanks per hadith
function getSeededRandom(seed: number) {
  let s = Math.abs(seed) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function HadithCard({
  hadith,
  isPartialReveal = false,
  quizMode,
  isRevealed = true,
  onReveal,
  showActions = true,
  className = '',
}: HadithCardProps) {
  const { userState, toggleBookmark } = useUserState();
  const [copied, setCopied] = useState(false);

  // Determine effective mode: prioritize quizMode prop, fallback to partial if isPartialReveal
  const effectiveMode: QuizMode | null = quizMode ?? (isPartialReveal ? 'partial' : null);

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

  // Words array
  const words = useMemo(() => hadith.arabic.trim().split(/\s+/), [hadith.arabic]);

  // Mode 1: Partial Reveal (first 45% of words)
  const partialSplitIndex = useMemo(() => {
    return Math.max(3, Math.floor(words.length * 0.45));
  }, [words.length]);

  // Mode 2: Blanks Calculation (2-4 non-stop words with length > 3)
  const blankIndices = useMemo(() => {
    if (effectiveMode !== 'blanks') return new Set<number>();

    const rng = getSeededRandom(hadith.id * 37 + 13);

    // Find eligible words
    let candidates: number[] = [];
    words.forEach((w, idx) => {
      const clean = cleanArabicWord(w);
      if (clean.length > 3 && !ARABIC_STOP_WORDS.has(clean)) {
        candidates.push(idx);
      }
    });

    // Fallback if not enough candidates
    if (candidates.length < 2) {
      candidates = [];
      words.forEach((w, idx) => {
        const clean = cleanArabicWord(w);
        if (clean.length >= 3) {
          candidates.push(idx);
        }
      });
    }

    if (candidates.length < 2) {
      candidates = words.map((_, idx) => idx).slice(1);
    }

    // Pick 2 to 4 indices
    const targetCount = Math.min(candidates.length, Math.floor(rng() * 3) + 2); // 2, 3, or 4
    const shuffled = [...candidates].sort(() => rng() - 0.5);
    return new Set(shuffled.slice(0, targetCount));
  }, [hadith.id, words, effectiveMode]);

  // Mode 3: Narrator Calculation (hide first 3-5 words)
  const narratorWordCount = useMemo(() => {
    if (effectiveMode !== 'narrator') return 0;

    // Check if narrator chain ends with a saying keyword in the first 6 words
    let cut = -1;
    for (let i = 0; i < Math.min(words.length - 2, 6); i++) {
      const clean = cleanArabicWord(words[i]);
      if (clean === 'قال' || clean === 'قالت' || clean === 'يقول' || clean === 'فقال') {
        cut = i + 1;
        break;
      }
    }

    if (cut >= 3 && cut <= 5) {
      return cut;
    }

    // Default to 3-5 words based on hadith id and length
    const defaultCount = Math.min(words.length - 2, (Math.abs(hadith.id) % 3) + 3); // 3, 4, or 5
    return Math.max(2, defaultCount);
  }, [hadith.id, words, effectiveMode]);

  // Reveal button text based on mode
  const getRevealButtonText = () => {
    switch (effectiveMode) {
      case 'blanks':
        return 'انقر لإظهار الكلمات الناقصة والتحقق من حفظك';
      case 'narrator':
        return 'انقر لإظهار راوي الحديث والتحقق من إجابتك';
      case 'partial':
      default:
        return 'انقر لإظهار بقية متن الحديث والتحقق من حفظك';
    }
  };

  // Render Hadith Content
  const renderContent = () => {
    // If not in a quiz mode, or already revealed
    if (!effectiveMode || isRevealed) {
      // If revealed after blanks mode, highlight the missing blanks so the user can verify
      if (isRevealed && effectiveMode === 'blanks' && blankIndices.size > 0) {
        return (
          <p className="font-hadith text-surface-950 dark:text-surface-50 leading-loose text-justify selection:bg-primary-200 dark:selection:bg-primary-900">
            {words.map((w, idx) => {
              const isBlank = blankIndices.has(idx);
              return (
                <span key={idx}>
                  {isBlank ? (
                    <span className="font-bold text-primary-800 dark:text-primary-200 bg-primary-100/90 dark:bg-primary-950/90 px-1.5 py-0.5 rounded-md border border-primary-300 dark:border-primary-700 underline decoration-primary-400">
                      {w}
                    </span>
                  ) : (
                    w
                  )}{' '}
                </span>
              );
            })}
          </p>
        );
      }

      // If revealed after narrator mode, highlight the narrator chain
      if (isRevealed && effectiveMode === 'narrator' && narratorWordCount > 0) {
        const narratorText = words.slice(0, narratorWordCount).join(' ');
        const restText = words.slice(narratorWordCount).join(' ');
        return (
          <p className="font-hadith text-surface-950 dark:text-surface-50 leading-loose text-justify selection:bg-primary-200 dark:selection:bg-primary-900">
            <span className="font-bold text-primary-800 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/70 px-1.5 py-0.5 rounded border-b-2 border-primary-500">
              {narratorText}
            </span>{' '}
            {restText}
          </p>
        );
      }

      // Standard revealed full text
      return (
        <p className="font-hadith text-surface-950 dark:text-surface-50 leading-loose text-justify selection:bg-primary-200 dark:selection:bg-primary-900">
          {hadith.arabic}
        </p>
      );
    }

    // Mode is active and NOT revealed:
    switch (effectiveMode) {
      case 'blanks': {
        return (
          <div className="space-y-4">
            <p className="font-hadith text-surface-900 dark:text-surface-100 leading-loose text-justify">
              {words.map((w, idx) => {
                const isBlank = blankIndices.has(idx);
                return (
                  <span key={idx}>
                    {isBlank ? (
                      <span className="inline-block px-2.5 py-0.5 mx-1 font-mono font-bold text-primary-800 dark:text-primary-300 bg-primary-100 dark:bg-primary-950/80 rounded-md border border-dashed border-primary-400 dark:border-primary-600 select-none shadow-2xs">
                        [ ـــــ ]
                      </span>
                    ) : (
                      w
                    )}{' '}
                  </span>
                );
              })}
            </p>
            <button
              type="button"
              onClick={onReveal}
              className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/40 hover:bg-primary-100/60 dark:hover:bg-primary-900/40 text-primary-800 dark:text-primary-300 font-ui font-medium text-sm flex items-center justify-center transition-colors cursor-pointer"
            >
              {getRevealButtonText()}
            </button>
          </div>
        );
      }

      case 'narrator': {
        const restText = words.slice(narratorWordCount).join(' ');
        return (
          <div className="space-y-4">
            <p className="font-hadith text-surface-900 dark:text-surface-100 leading-loose text-justify">
              <span className="inline-block px-3 py-1 mx-1 font-ui font-bold text-xs text-primary-800 dark:text-primary-300 bg-primary-100 dark:bg-primary-950 rounded-lg border border-primary-300 dark:border-primary-700 select-none shadow-2xs">
                [ الراوي ]
              </span>
              {' '}... {restText}
            </p>
            <button
              type="button"
              onClick={onReveal}
              className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/40 hover:bg-primary-100/60 dark:hover:bg-primary-900/40 text-primary-800 dark:text-primary-300 font-ui font-medium text-sm flex items-center justify-center transition-colors cursor-pointer"
            >
              {getRevealButtonText()}
            </button>
          </div>
        );
      }

      case 'partial':
      default: {
        const promptPart = words.slice(0, partialSplitIndex).join(' ');
        return (
          <div className="space-y-4">
            <p className="font-hadith text-surface-900 dark:text-surface-100 leading-loose text-justify">
              {promptPart}...
            </p>
            <button
              type="button"
              onClick={onReveal}
              className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/40 hover:bg-primary-100/60 dark:hover:bg-primary-900/40 text-primary-800 dark:text-primary-300 font-ui font-medium text-sm flex items-center justify-center transition-colors cursor-pointer"
            >
              {getRevealButtonText()}
            </button>
          </div>
        );
      }
    }
  };

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
      <div className="my-2">{renderContent()}</div>

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
