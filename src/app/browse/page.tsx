'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen, Bookmark, Check, Plus, ChevronDown } from 'lucide-react';
import { fetchMetadata, fetchStarterHadiths, fetchBookHadiths } from '@/lib/hadith-service';
import { HadithCard } from '@/components/hadith-card';
import { useUserState } from '@/hooks/useUserState';
import type { Hadith, AppMetadata } from '@/types';

type BookFilter = 'all' | 'bukhari' | 'muslim' | 'bookmarked';

export default function BrowsePage() {
  const { userState, enrollHadith } = useUserState();
  const [metadata, setMetadata] = useState<AppMetadata | null>(null);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookFilter>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(20);

  // Load initial metadata and starter hadiths
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [meta, starter] = await Promise.all([
          fetchMetadata(),
          fetchStarterHadiths(),
        ]);
        setMetadata(meta);
        setHadiths(starter);
      } catch (err) {
        console.error('Failed to load initial data in browse page:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // When user switches to Bukhari or Muslim specifically, fetch the full book
  const handleBookChange = async (book: BookFilter) => {
    setSelectedBook(book);
    setSelectedChapterId('all');
    setDisplayCount(20);

    if (book === 'bukhari') {
      setIsLoading(true);
      const data = await fetchBookHadiths('bukhari');
      setHadiths(data);
      setIsLoading(false);
    } else if (book === 'muslim') {
      setIsLoading(true);
      const data = await fetchBookHadiths('muslim');
      setHadiths(data);
      setIsLoading(false);
    } else if (book === 'all') {
      setIsLoading(true);
      const [bukhari, muslim] = await Promise.all([
        fetchBookHadiths('bukhari'),
        fetchBookHadiths('muslim'),
      ]);
      setHadiths([...bukhari, ...muslim]);
      setIsLoading(false);
    }
  };

  // Available chapters for dropdown based on selected book
  const availableChapters = useMemo(() => {
    if (!metadata) return [];
    if (selectedBook === 'bukhari') {
      return metadata.books.find(b => b.id === 1)?.chapters || [];
    }
    if (selectedBook === 'muslim') {
      return metadata.books.find(b => b.id === 2)?.chapters || [];
    }
    return metadata.books.flatMap(b => b.chapters);
  }, [metadata, selectedBook]);

  // Filtered hadiths based on search query, chapter, and bookmark
  const filteredHadiths = useMemo(() => {
    return hadiths.filter(h => {
      // Bookmark filter
      if (selectedBook === 'bookmarked') {
        if (!userState.bookmarkedHadithIds.includes(h.id)) {
          return false;
        }
      }

      // Chapter filter
      if (selectedChapterId !== 'all') {
        if (h.chapterId !== selectedChapterId) {
          return false;
        }
      }

      // Search query filter (search in Arabic text or chapter title)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const inArabic = h.arabic.toLowerCase().includes(query);
        const inChapter = h.chapterTitle.toLowerCase().includes(query);
        const inId = String(h.idInBook).includes(query);
        return inArabic || inChapter || inId;
      }

      return true;
    });
  }, [hadiths, selectedBook, selectedChapterId, searchQuery, userState.bookmarkedHadithIds]);

  const visibleHadiths = filteredHadiths.slice(0, displayCount);

  return (
    <div className="py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-ui font-extrabold text-2xl text-surface-950 dark:text-surface-100">
          تصفح أحاديث الصحيحين
        </h1>
        <p className="text-xs text-surface-600 dark:text-surface-400 font-ui mt-0.5">
          البحث في متون البخاري ومسلم وإضافتها إلى وِرد الحفظ
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-surface-400 dark:text-surface-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setDisplayCount(20);
          }}
          placeholder="ابحث بكلمة من متن الحديث أو اسم الباب..."
          className="w-full pr-11 pl-4 py-3 bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-surface-400 dark:placeholder:text-surface-500 text-surface-900 dark:text-surface-100"
        />
      </div>

      {/* Book Tabs Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-ui text-xs scrollbar-none">
        <button
          type="button"
          onClick={() => handleBookChange('all')}
          className={`px-3.5 py-2 rounded-xl border whitespace-nowrap transition-colors cursor-pointer ${
            selectedBook === 'all'
              ? 'bg-primary-600 text-white border-primary-600 font-semibold'
              : 'bg-surface-100 dark:bg-surface-900 text-surface-700 dark:text-surface-300 border-surface-300 dark:border-surface-800 hover:bg-surface-200 dark:hover:bg-surface-800'
          }`}
        >
          كل الأحاديث
        </button>

        <button
          type="button"
          onClick={() => handleBookChange('bukhari')}
          className={`px-3.5 py-2 rounded-xl border whitespace-nowrap transition-colors cursor-pointer ${
            selectedBook === 'bukhari'
              ? 'bg-primary-600 text-white border-primary-600 font-semibold'
              : 'bg-surface-100 dark:bg-surface-900 text-surface-700 dark:text-surface-300 border-surface-300 dark:border-surface-800 hover:bg-surface-200 dark:hover:bg-surface-800'
          }`}
        >
          صحيح البخاري (7,277)
        </button>

        <button
          type="button"
          onClick={() => handleBookChange('muslim')}
          className={`px-3.5 py-2 rounded-xl border whitespace-nowrap transition-colors cursor-pointer ${
            selectedBook === 'muslim'
              ? 'bg-primary-600 text-white border-primary-600 font-semibold'
              : 'bg-surface-100 dark:bg-surface-900 text-surface-700 dark:text-surface-300 border-surface-300 dark:border-surface-800 hover:bg-surface-200 dark:hover:bg-surface-800'
          }`}
        >
          صحيح مسلم (7,459)
        </button>

        <button
          type="button"
          onClick={() => handleBookChange('bookmarked')}
          className={`px-3.5 py-2 rounded-xl border whitespace-nowrap transition-colors cursor-pointer ${
            selectedBook === 'bookmarked'
              ? 'bg-primary-600 text-white border-primary-600 font-semibold'
              : 'bg-surface-100 dark:bg-surface-900 text-surface-700 dark:text-surface-300 border-surface-300 dark:border-surface-800 hover:bg-surface-200 dark:hover:bg-surface-800'
          }`}
        >
          المحفوظات ({userState.bookmarkedHadithIds.length})
        </button>
      </div>

      {/* Chapter Dropdown Filter */}
      {availableChapters.length > 0 && selectedBook !== 'bookmarked' && (
        <div className="relative">
          <select
            value={selectedChapterId}
            onChange={e => {
              setSelectedChapterId(e.target.value === 'all' ? 'all' : Number(e.target.value));
              setDisplayCount(20);
            }}
            className="w-full appearance-none pr-3 pl-8 py-2.5 bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-300 dark:border-surface-800 font-ui text-xs text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
          >
            <option value="all">جميع الأبواب والكتب ({availableChapters.length} باباً)</option>
            {availableChapters.map(c => (
              <option key={`${c.bookId}_${c.id}`} value={c.id}>
                {c.arabic}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-surface-500 dark:text-surface-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      )}

      {/* Results Count & Actions */}
      <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 font-ui px-1">
        <span>عرض {visibleHadiths.length} من {filteredHadiths.length} حديث</span>
        {filteredHadiths.length > 0 && (
          <span>تم التحقق من نسبة السند في الصحيحين</span>
        )}
      </div>

      {/* Hadith List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-surface-200/60 dark:bg-surface-800/60 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : visibleHadiths.length === 0 ? (
        <div className="bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-300 dark:border-surface-800 p-8 text-center space-y-3 font-ui">
          <BookOpen className="w-10 h-10 text-surface-400 dark:text-surface-500 mx-auto" />
          <h3 className="font-bold text-base text-surface-800 dark:text-surface-200">لا توجد نتائج مطابقة</h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 max-w-xs mx-auto">
            جرب البحث بكلمة أخرى أو قم بإلغاء التصفية لاستعراض أحاديث أخرى.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleHadiths.map(hadith => {
            const isEnrolled = !!userState.cards[hadith.id];
            return (
              <div key={hadith.id} className="relative group">
                <HadithCard hadith={hadith} showActions={true} />

                {/* Enrollment Button */}
                <div className="absolute top-4 left-4">
                  {isEnrolled ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-ui bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300 px-2 py-1 rounded-lg border border-primary-200 dark:border-primary-800">
                      <Check className="w-3 h-3" />
                      <span>في الوِرد</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => enrollHadith(hadith.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-ui font-semibold bg-surface-200 dark:bg-surface-800 hover:bg-primary-100 dark:hover:bg-primary-950/80 hover:text-primary-900 dark:hover:text-primary-300 text-surface-800 dark:text-surface-200 px-2.5 py-1 rounded-lg border border-surface-300 dark:border-surface-700 transition-colors cursor-pointer"
                      title="إضافة الحديث إلى قائمة التكرار المتباعد"
                    >
                      <Plus className="w-3 h-3" />
                      <span>ضم للوِرد</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Load More Button */}
          {displayCount < filteredHadiths.length && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setDisplayCount(prev => prev + 20)}
                className="py-3 px-8 rounded-xl bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-800 dark:text-surface-200 font-ui font-semibold text-xs border border-surface-300 dark:border-surface-700 transition-colors cursor-pointer"
              >
                تحميل المزيد من الأحاديث
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
