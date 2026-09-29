'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Compass, Award, Settings } from 'lucide-react';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'الرئيسية',
    icon: Home,
  },
  {
    href: '/wird',
    label: 'الوِرد',
    icon: BookOpen,
  },
  {
    href: '/browse',
    label: 'التصفح',
    icon: Compass,
  },
  {
    href: '/progress',
    label: 'التقدم',
    icon: Award,
  },
  {
    href: '/settings',
    label: 'الإعدادات',
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav inside active review session or onboarding to minimize distractions
  if (pathname === '/wird' || pathname === '/onboarding') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-100/90 dark:bg-surface-900/90 backdrop-blur-md border-t border-surface-200 dark:border-surface-800 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2 sm:px-4">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive
                  ? 'text-primary-700 dark:text-primary-400 font-semibold'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] sm:text-xs font-ui tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
