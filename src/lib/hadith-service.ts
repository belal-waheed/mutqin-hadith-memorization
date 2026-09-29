import type { Hadith, AppMetadata } from '@/types';
import { getLocalDateString } from './date-utils';

let cachedMetadata: AppMetadata | null = null;
let cachedStarter: Hadith[] | null = null;
const cachedBooks: Record<string, Hadith[]> = {};
const hadithLookup: Map<number, Hadith> = new Map();

/**
 * Fetches application metadata (books, chapters, total counts)
 */
export async function fetchMetadata(): Promise<AppMetadata> {
  if (cachedMetadata) return cachedMetadata;

  try {
    const res = await fetch('/data/metadata.json');
    if (!res.ok) throw new Error('Failed to load metadata');
    cachedMetadata = await res.json();
    return cachedMetadata!;
  } catch (err) {
    console.error('Error fetching metadata:', err);
    return {
      books: [],
      totalHadiths: 14736,
    };
  }
}

/**
 * Fetches starter hadiths (first 100 hadiths, quick initial load)
 */
export async function fetchStarterHadiths(): Promise<Hadith[]> {
  if (cachedStarter) return cachedStarter;

  try {
    const res = await fetch('/data/starter.json');
    if (!res.ok) throw new Error('Failed to load starter hadiths');
    const data: Hadith[] = await res.json();
    cachedStarter = data;
    for (const h of data) {
      hadithLookup.set(h.id, h);
    }
    return data;
  } catch (err) {
    console.error('Error fetching starter hadiths:', err);
    return [];
  }
}

/**
 * Fetches all hadiths for a specific book ('bukhari' or 'muslim')
 */
export async function fetchBookHadiths(bookName: 'bukhari' | 'muslim'): Promise<Hadith[]> {
  if (cachedBooks[bookName]) return cachedBooks[bookName];

  try {
    const res = await fetch(`/data/${bookName}.json`);
    if (!res.ok) throw new Error(`Failed to load ${bookName}`);
    const data: Hadith[] = await res.json();
    cachedBooks[bookName] = data;
    for (const h of data) {
      hadithLookup.set(h.id, h);
    }
    return data;
  } catch (err) {
    console.error(`Error fetching ${bookName} hadiths:`, err);
    return [];
  }
}

/**
 * Gets a specific hadith by its unique id
 */
export async function getHadithById(id: number): Promise<Hadith | null> {
  if (hadithLookup.has(id)) {
    return hadithLookup.get(id)!;
  }

  // Check starter first
  if (!cachedStarter) {
    await fetchStarterHadiths();
    if (hadithLookup.has(id)) return hadithLookup.get(id)!;
  }

  // If id is < 100000, it's Bukhari. Otherwise it's Muslim.
  const bookName = id < 100000 ? 'bukhari' : 'muslim';
  const bookHadiths = await fetchBookHadiths(bookName);
  const found = bookHadiths.find(h => h.id === id);
  if (found) {
    hadithLookup.set(id, found);
    return found;
  }

  return null;
}

/**
 * Deterministic "Hadith of the Day" using date hash
 */
export async function getHadithOfTheDay(): Promise<Hadith | null> {
  const starter = await fetchStarterHadiths();
  if (!starter || starter.length === 0) return null;

  const todayStr = getLocalDateString();
  // Simple deterministic hash from date string (e.g. 2026-09-29)
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = (hash << 5) - hash + todayStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % starter.length;
  return starter[index];
}
