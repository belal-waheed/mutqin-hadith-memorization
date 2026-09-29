import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function processBook(name, url, bookId) {
  console.log(`Downloading ${name}...`);
  const res = await fetch(url);
  const data = await res.json();
  
  const bookMeta = {
    id: bookId,
    name: data.metadata.arabic.title,
    author: data.metadata.arabic.author,
    totalHadiths: data.hadiths.length,
    chapters: data.chapters.map(c => ({
      id: c.id,
      bookId: c.bookId,
      arabic: c.arabic,
    }))
  };

  const chapterMap = new Map();
  for (const c of bookMeta.chapters) {
    chapterMap.set(c.id, c.arabic);
  }

  // Clean hadiths (Arabic only as specified: "Hadith text in Arabic (ignore English translations for now)")
  const hadiths = data.hadiths.map(h => ({
    id: bookId === 1 ? h.idInBook : 100000 + h.idInBook,
    globalId: `${name}_${h.idInBook}`,
    bookId,
    bookName: bookMeta.name,
    chapterId: h.chapterId,
    chapterTitle: chapterMap.get(h.chapterId) || '',
    idInBook: h.idInBook,
    arabic: h.arabic.trim(),
  }));

  const outBookPath = path.join(OUT_DIR, `${name}.json`);
  fs.writeFileSync(outBookPath, JSON.stringify(hadiths));
  console.log(`Saved ${name}.json: ${hadiths.length} hadiths (${(fs.statSync(outBookPath).size / 1024 / 1024).toFixed(2)} MB)`);

  return { bookMeta, hadiths };
}

async function main() {
  const bukhari = await processBook(
    'bukhari',
    'https://raw.githubusercontent.com/AhmedBaset/hadith-json/v1.2.0/db/by_book/the_9_books/bukhari.json',
    1
  );

  const muslim = await processBook(
    'muslim',
    'https://raw.githubusercontent.com/AhmedBaset/hadith-json/v1.2.0/db/by_book/the_9_books/muslim.json',
    2
  );

  // Save metadata
  const meta = {
    books: [bukhari.bookMeta, muslim.bookMeta],
    totalHadiths: bukhari.hadiths.length + muslim.hadiths.length,
  };
  fs.writeFileSync(path.join(OUT_DIR, 'metadata.json'), JSON.stringify(meta, null, 2));

  // Also save a small sample/starter dataset for quick instant initial load or offline fallback
  const starter = [
    ...bukhari.hadiths.slice(0, 50),
    ...muslim.hadiths.slice(0, 50)
  ];
  fs.writeFileSync(path.join(OUT_DIR, 'starter.json'), JSON.stringify(starter));

  console.log('Finished processing data successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
