# Mutqin (مُتقِن) - Spaced Repetition Hadith Memorization App

Mutqin is an open-source spaced repetition application built with Next.js and the FSRS algorithm for Muslims to systematically memorize authentic Hadiths (Sahih Al-Bukhari and Muslim). It solves the problem of forgetting memorized texts by calculating the optimal daily review schedule for each user.

## 🛠️ Technical Specifications

| Component | Technology / Implementation |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19 |
| **Styling** | Tailwind CSS v4, Lucide Icons |
| **Algorithm** | `ts-fsrs` (Free Spaced Repetition Scheduler) |
| **Database** | Neon Serverless Postgres, Drizzle ORM |
| **Authentication** | Auth.js v5 (NextAuth) via Google OAuth |
| **Offline Support** | `@serwist/next` PWA, LocalStorage Sync Engine |
| **Data Source** | Static JSON (14k+ Sahih Hadiths) |

## ✨ Core Features
- **Offline-First Architecture**: Works seamlessly without an internet connection. Progress syncs automatically to the cloud once online.
- **Advanced Spaced Repetition (FSRS)**: Replaces outdated Leitner/Anki SM-2 algorithms with the state-of-the-art FSRS scheduling algorithm.
- **Curriculum Paths (المسارات)**: Themed learning tracks (e.g., Nawawi's 40, Book of Faith) rather than random selection.
- **Dynamic Quiz Modes**: Fights review fatigue using partial-reveal, fill-in-the-blanks, and narrator-guessing modes.
- **Arabic Web Speech TTS**: Built-in text-to-speech for correct pronunciation and dictation.

## 🧠 Frequently Asked Questions (Q&A)

**Q: How does the offline synchronization work without data loss?**
A: Mutqin utilizes a Lazy Auth, offline-first approach. Guests store their `userState` (FSRS cards, review logs, streaks) in `localStorage`. Upon authenticating with Google, a conflict resolution modal prompts the user to either push their local data to the Neon DB or pull their existing cloud data. Subsequent reviews trigger a debounced background sync (`/api/sync`).

**Q: Why are the Hadiths stored in static JSON instead of the database?**
A: To ensure a zero-cost, high-performance architecture. Storing 14,000+ read-only hadiths in Postgres would consume the free tier. By serving them as static assets, they are cached globally via Vercel's Edge CDN, leaving the Postgres DB exclusively for tiny, dynamic user progress data.

## 🚀 Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Setup `.env.local` with `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_GOOGLE_*` keys.
4. Push the schema: `npx drizzle-kit push`
5. Run the development server: `npm run dev`

---
*Built with craftsmanship to preserve the Sunnah.*
