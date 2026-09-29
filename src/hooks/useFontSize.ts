'use client';

import { useState, useEffect, useCallback } from 'react';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

export const FONT_SIZES: { id: FontSize; labelAr: string; scaleLabel: string }[] = [
  { id: 'sm', labelAr: 'صغير', scaleLabel: '18px' },
  { id: 'md', labelAr: 'متوسط', scaleLabel: '22px' },
  { id: 'lg', labelAr: 'كبير', scaleLabel: '26px' },
  { id: 'xl', labelAr: 'كبير جداً', scaleLabel: '30px' },
];

const FONT_SIZE_KEY = 'mutqin_font_size';
export const FONT_SIZE_CHANGE_EVENT = 'mutqin_font_size_change';

export function useFontSize() {
  const [fontSize, setFontSizeState] = useState<FontSize>('md');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FONT_SIZE_KEY) as FontSize | null;
      if (stored && ['sm', 'md', 'lg', 'xl'].includes(stored)) {
        setFontSizeState(stored);
        document.documentElement.setAttribute('data-font-size', stored);
      } else {
        document.documentElement.setAttribute('data-font-size', 'md');
      }
    } catch {
      // Fallback
    } finally {
      setIsLoaded(true);
    }

    const handleChange = () => {
      try {
        const stored = (localStorage.getItem(FONT_SIZE_KEY) as FontSize) || 'md';
        setFontSizeState(stored);
      } catch {}
    };

    window.addEventListener(FONT_SIZE_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(FONT_SIZE_CHANGE_EVENT, handleChange);
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    try {
      localStorage.setItem(FONT_SIZE_KEY, size);
      document.documentElement.setAttribute('data-font-size', size);
      setFontSizeState(size);
      window.dispatchEvent(new Event(FONT_SIZE_CHANGE_EVENT));
    } catch (e) {
      console.error('Failed to save font size:', e);
    }
  }, []);

  return { fontSize, setFontSize, isLoaded };
}
