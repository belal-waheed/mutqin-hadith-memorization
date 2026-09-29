import type { Metadata, Viewport } from 'next';
import { Amiri, IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { BottomNav } from '@/components/bottom-nav';
import { ThemeProvider } from '@/components/theme-provider';
import { SyncProvider } from '@/components/sync-provider';

const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-amiri',
  display: 'swap',
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-ibm-plex-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'مُتقِن — حفظ وضبط أحاديث الصحيحين',
  description: 'تطبيق لحفظ متون صحيحي البخاري ومسلم وفق خوارزمية التكرار المتباعد (FSRS)',
  appleWebApp: {
    capable: true,
    title: 'مُتقِن',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon',
  },
};

export const viewport: Viewport = {
  themeColor: '#b8860b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${amiri.variable} ${ibmPlexArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('mutqin_font_size')||'md';document.documentElement.setAttribute('data-font-size',s);}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-100 font-ui antialiased min-h-screen flex flex-col selection:bg-primary-200 selection:text-primary-950 dark:selection:bg-primary-900 dark:selection:text-primary-100 transition-colors duration-200">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SyncProvider>
              <main className="flex-1 pb-20 max-w-lg w-full mx-auto px-4 sm:px-6">
                {children}
              </main>
              <BottomNav />
            </SyncProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
