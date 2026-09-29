import { ImageResponse } from 'next/og';
import fs from 'node:fs';
import path from 'node:path';
import bukhari from '@/../public/data/bukhari.json';
import muslim from '@/../public/data/muslim.json';

export const runtime = 'nodejs';

export const alt = 'مُتقِن - حديث';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Load Amiri font locally from project filesystem with in-memory cache
let cachedFontData: ArrayBuffer | null = null;
function getAmiriFont(): ArrayBuffer {
  if (cachedFontData) return cachedFontData;
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Amiri-Regular.ttf');
  const buffer = fs.readFileSync(fontPath);
  cachedFontData = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  return cachedFontData;
}

export default async function Image(props: { params: Promise<{ book: string; id: string }> }) {
  const params = await props.params;
  const { book, id } = params;

  const data = book === 'bukhari' ? bukhari : book === 'muslim' ? muslim : null;
  const hadith = data?.find((h: any) => h.id.toString() === id);

  const text = hadith ? hadith.arabic.substring(0, 300) + (hadith.arabic.length > 300 ? '...' : '') : 'حديث غير موجود';
  const subtitle = hadith ? `${hadith.bookName} - ${hadith.chapterTitle}` : '';

  const fontData = getAmiriFont();

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #fdfbf7, #f4ecd8)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          border: '16px solid #d4c4a8',
          fontFamily: '"Amiri"',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            width: '100%',
            height: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 48,
              color: '#1a1a1a',
              lineHeight: 1.6,
              display: 'flex',
              textAlign: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}
          >
            {text}
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#666',
              marginTop: '20px',
              display: 'flex',
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              fontSize: 24,
              color: '#8b7355',
              display: 'flex',
            }}
          >
            مُتقِن - mutqinn.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Amiri',
          data: fontData,
          style: 'normal',
        },
      ],
    }
  );
}
