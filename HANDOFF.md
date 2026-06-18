# Handoff: Homebrew Libram

## Completed tasks

- [x] **Feature: Manual entry creation form** — DM can create `magic_item` and `weapon` entries.
  - Type selector (magic_item / weapon) switches form fields dynamically.
  - Shared fields: name, description, source, dm_only toggle, tags (comma-separated), campaign.
  - Magic item fields: rarity (6-tier dropdown), requires_attunement toggle, item_subtype, charges.
  - Weapon fields: damage_dice, damage_type dropdown (slashing/piercing/bludgeoning), bonus dropdown (+0 to +3), properties, cost, weight.
  - Type-specific fields stored in JSONB `properties` column.
  - RLS: anon INSERT policy added so the app can write entries without auth.
  - Green confirmation on success; "Create another" to reset form.
  - Committed and pushed; Vercel auto-deployed.
  - Confirmed working: entry landed in Supabase dashboard.

- [x] Project folder created at `~/homebrew-libram/`
- [x] README.md, .gitignore, memory/, HANDOFF.md
- [x] Git repo initialised + initial commit
- [x] Public GitHub repo created: https://github.com/jonmgee/homebrew-libram
- [x] Local repo pushed to GitHub (main branch)
- [x] Supabase project created (lebticyakvkencowjxmb.supabase.co) — connection confirmed
- [x] Supabase credentials stored in local `.env` and Vercel environment variables (all three scopes)
- [x] Vercel project created — placeholder deployed and live at https://homebrew-libram.vercel.app
- [x] Vercel Git integration connected — every push to main auto-deploys
- [x] React + TypeScript + Vite + Tailwind CSS v4 + Supabase scaffold created
- [x] Supabase client wired from `.env` credentials
- [x] Placeholder home screen (app name + one-line description) styled with Tailwind
- [x] `npm install` clean, `npm run build` clean, `npm run dev` runs at localhost:5173
- [x] Scaffold committed and pushed — Vercel auto-deploy confirmed live
- [x] **Database schema:** `entries` table created with shared fields + JSONB `properties`
- [x] **Indexes:** full-text search (name+description), GIN on tags, GIN on properties, B-tree on type, campaign, dm_only, created_at
- [x] **RLS:** public read, authenticated write — grants and policies set

## Next task

Awaiting brief — options include: extending to remaining 11 entry types, browsing/searching entries, editing entries, or deleting entries.