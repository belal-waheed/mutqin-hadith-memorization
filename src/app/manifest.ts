import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'مُتقِن - لحفظ الأحاديث النبوية',
    short_name: 'مُتقِن',
    description: 'تطبيق ذكي لحفظ ومراجعة الأحاديث النبوية باستخدام التكرار المتباعد',
    start_url: '/',
    display: 'standalone',
    background_color: '#fefce8',
    theme_color: '#854d0e',
    dir: 'rtl',
    lang: 'ar',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
