'use client';

import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Threshold to prevent micro-movements from triggering the hide/show
      if (Math.abs(scrollY - lastScrollY) < 10) {
        ticking = false;
        return;
      }

      // If scrolled down and past the very top (e.g., 50px)
      if (scrollY > lastScrollY && scrollY > 50) {
        setScrollDirection('down');
      } else if (scrollY < lastScrollY) {
        setScrollDirection('up');
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrollDirection;
}
