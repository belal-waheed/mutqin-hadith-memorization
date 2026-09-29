import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { HadithCard } from '@/components/hadith-card';
import bukhari from '@/../public/data/bukhari.json';
import muslim from '@/../public/data/muslim.json';

interface Params {
  book: string;
  id: string;
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const params = await props.params;
  const { book, id } = params;
  
  const data = book === 'bukhari' ? bukhari : book === 'muslim' ? muslim : null;
  if (!data) return { title: 'مُتقِن - حديث غير موجود' };
  
  const hadith = data.find((h: any) => h.id.toString() === id);
  if (!hadith) return { title: 'مُتقِن - حديث غير موجود' };

  const titleText = `حديث رقم ${hadith.idInBook} - ${hadith.bookName}`;
  const descText = hadith.arabic.substring(0, 150) + '...';

  return {
    title: `مُتقِن | ${titleText}`,
    description: descText,
    openGraph: {
      title: `مُتقِن | ${titleText}`,
      description: descText,
    },
    twitter: {
      card: 'summary_large_image',
      title: `مُتقِن | ${titleText}`,
      description: descText,
    },
  };
}

export default async function HadithPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  const { book, id } = params;
  
  const data = book === 'bukhari' ? bukhari : book === 'muslim' ? muslim : null;
  if (!data) notFound();
  
  const hadith = data.find((h: any) => h.id.toString() === id);
  if (!hadith) notFound();

  return (
    <div className="container max-w-4xl py-12 px-4 mx-auto min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full">
        <HadithCard hadith={hadith} showActions={true} />
      </div>
    </div>
  );
}
