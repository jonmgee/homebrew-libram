# Homebrew Libram

**D&D homebrew content organiser** — import the chaos, get back a usable tome.

DMs accumulate brilliant homebrew content scattered across screenshots, photos, PDFs, spreadsheets, and notes — none of it consistent, searchable, or table-ready. Homebrew Libram solves that by ingesting messy inputs, structuring them into typed entries, and presenting them as a clean, searchable, PHB-styled reference library.

## Live

- **App:** https://homebrew-libram.vercel.app
- **Source:** https://github.com/jonmgee/homebrew-libram

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Supabase (Postgres + Auth + Storage)

## How to run locally

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` by default.

## Environment

Copy `.env.example` to `.env` and fill in your Supabase project credentials:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/publishable key |

## License

TBD