# Handoff: Homebrew Libram

## Project

D&D homebrew content organiser — a web app for DMs to create, browse, and manage custom D&D content.

- **Live:** https://homebrew-libram.vercel.app
- **GitHub:** https://github.com/jonmgee/homebrew-libram
- **Stack:** React 19, TypeScript, Tailwind CSS v4, Vite 8, Supabase
- **Deploy:** Push to `main` → Vercel auto-deploy

## Completed tasks

### Infrastructure (2026-06-16)

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
- [x] `npm install` clean, `npm run build` clean, `npm run dev` runs at localhost:5173
- [x] Scaffold committed and pushed — Vercel auto-deploy confirmed live

### Database (2026-06-16)

- [x] `entries` table created with shared fields (id, name, type, description, source, dm_only, tags, campaign, created_at) + JSONB `properties`
- [x] Indexes: full-text search (name+description), GIN on tags, GIN on properties, B-tree on type, campaign, dm_only, created_at
- [x] RLS: anon = SELECT + DELETE, authenticated = full CRUD
- [x] Migration files tracked in `supabase/`:
  - `migration-001-entries-table.sql` — table + indexes + RLS
  - `migration-002-anon-delete-policy.sql` — anon DELETE grant + policy

### Entry creation form (2026-06-17 — 2026-06-19)

- [x] **All 14 entry types implemented** with dynamic form fields:
  - `magic_item` — rarity, attunement, subtype, charges
  - `weapon` — damage dice, damage type, bonus, properties, cost, weight
  - `armour` — armour type, bonus, stealth disadvantage, cost, weight
  - `potion` — effect, duration, rarity
  - `adventuring_gear` — gear category, quantity, properties, cost, weight
  - `trinket` — description only (no type-specific fields)
  - `spell` — level, school, casting time, range, components, material, duration, classes, ritual, concentration
  - `scroll` — spell name, spell level, rarity
  - `monster` — CR, size, type, alignment, AC, HP, speed, all 6 abilities, saves, skills, resistances, immunities, senses, languages, actions, legendary actions, special abilities
  - `npc` — all monster fields + role + faction
  - `background` — skill/tool proficiencies, languages, feature, equipment, personality traits, ideals, bonds, flaws
  - `feat` — prerequisite, benefit
  - `subclass` — parent class, subclass features
  - `table` — die dropdown (d4–d100), table category, dynamic row builder (add/remove roll_range + result pairs)
- [x] Type selector buttons switch form fields dynamically
- [x] Shared fields: name, description, source, dm_only toggle, tags (comma-separated), campaign
- [x] Subcategory field auto-populated (disabled dropdown with human labels)
- [x] Duplicate detection (name + type match) with "Save anyway" override
- [x] Validation on required fields per type
- [x] Success feedback with "Create another" reset
- [x] Form state resets cleanly on type switch

### Browse & search (2026-06-17 — 2026-06-19)

- [x] Browse page at `/browse/:category/:subcategory` — filtered entry list
- [x] "All Entries" at `/browse/all` — unfiltered list
- [x] Real-time search by name or description
- [x] "Hide DM-only" checkbox filter
- [x] Delete with confirmation (Yes/No prompt per entry)
- [x] Entry count display ("X of Y entries")
- [x] Entry summary line per type (damage dice for weapons, rarity for magic items, CR for monsters, etc.)

### Sub-category system (2026-06-18)

- [x] Sub-category landing pages at `/browse/:category` — card grid with real entry counts from Supabase
- [x] Human-readable sub-category labels (e.g. "Wondrous Items" not "wondrous_items")
- [x] "Misc" sub-category catches unclaimed types
- [x] Routing: `/browse/treasure/weapons`, `/browse/arcana/spells`, etc.

### Styling (2026-06-19)

- [x] PHB-inspired fantasy theme:
  - Parchment background (#EDE0C8), dark ink text (#1a1a1a)
  - Near-black book-cover page background (#1a0a00)
  - Google Fonts: Cinzel (headings), IM Fell English (body)
  - Gilded multi-layer gold borders on category/sub-category cards
  - Wax-seal type badges (crimson)
  - DM ink-stamp badges on browse entries
- [x] Responsive — cards stack on small screens
- [x] Hover effects on cards (gilded glow, border transitions)

### Homepage images (2026-06-21)

- [x] 6 watercolour PNGs converted to 300×300 WebP (98.4% reduction), then swapped to Graphic style
- [x] 5 graphic images lightened by 15% (Arcana untouched) via Pillow
- [x] Card layout redesigned: square cards (aspect-square) with full-bleed background images
- [x] Dark gradient overlay at bottom, text in gold (Mr Eaves heading + description)
- [x] Gilded borders preserved around each square card
- [x] Original PNGs removed from git tracking, `images/` and `Images/` in `.gitignore`
- [x] Commits: 050a797 → 68937a3

### Bug fixes (2026-06-19)

- [x] "Unknown Category" heading in All Entries view — fixed with `useLocation` fallback
- [x] Redundant type badge in sub-category view — gated behind `isAll` check
- [x] Escaped unicode `\u2026` → literal `…` character
- [x] Table type missing from `ENTRY_TYPES` array — button wasn't rendering
- [x] Form state bleeding on type switch — reset to EMPTY_FORM

## Known gaps

- [ ] **Entry editing** — no edit form; entries can only be created and deleted
- [ ] **Auth** — anon policies are temporary; needs Supabase Auth integration
- [ ] **Table rendering** — tables are browsable but don't render as interactive rollable tables
- [ ] **Henge illustration** — placeholder on home page, replace with image in `public/assets/` as webp when ready
- [ ] **Mobile optimisation** — responsive but not fully polished for small screens
- [ ] **Pagination** — no pagination for large entry lists
- [ ] **Import/export** — no bulk import or export of entries

## Next tasks

Awaiting brief — options include:
- Entry detail/view page
- Entry editing
- Auth integration
- Table rendering (interactive rollable tables)
- Henge illustration
- Mobile polish
- Pagination
- Import/export