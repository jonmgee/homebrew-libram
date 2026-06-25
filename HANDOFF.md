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
- [x] "Misc" sub-category catches unclaimed types (uses `/assets/misc.webp`)
- [x] Routing: `/browse/treasure/weapons`, `/browse/arcana/spells`, etc.

### Styling & manual entry completion (2026-06-23)

- [x] **All 14 entry types have manual entry forms** — no more "coming soon" placeholders
- [x] **Treasure forms** (magic_item, weapon, armour, potion, adventuring_gear, trinket): Name, Rarity, Attunement toggle, Description, Tags, Image
- [x] **Simple forms** (npc, background, feat): Name, Description, Tags, Image
- [x] **NPC stat-block toggle**: "Include Full Stat Block" reveals full monster-style fields (Size, CR, abilities, saves, skills, traits, actions, legendary/lair actions, spellcasting)
- [x] **Arcana forms** (spell, scroll): Spell/Scroll toggle, Level, School, Casting Time, Range, Components, Duration, Concentration, Rarity (scroll only), Tags, Image
- [x] **Monster form**: Full stat block with auto-calc PB, ability mods, save/skill bonuses, RepeatBlock for traits/actions/lair/legendary
- [x] **Subclass form**: Name, Parent Class, Description, Level Features (repeatable Level + Description), Tags, Image
- [x] **Table form**: Die type (CustomSelect), user-defined columns, auto-generated editable rows in parchment/gold table, Tags, Image
- [x] **CustomSelect** replaces all native `<select>` elements throughout
- [x] All form controls consistently styled: parchment backgrounds, gold borders, maroon labels, BookInsanity/ScalySans fonts
- [x] Image upload via Supabase Storage (entry-images bucket), fallback to base64 data URL
- [x] Shared components: ImageUpload, SaveButton, RepeatBlock, TagRow, useTags, CustomSelect

### Homepage & sub-category image cards (2026-06-21)

- [x] 6 watercolour PNGs converted to 300×300 WebP (98.4% reduction), then swapped to Graphic style
- [x] 5 graphic images lightened by 15% (Arcana untouched) via Pillow
- [x] **Homepage cards redesigned:** square (aspect-square) with full-bleed backgrounds, dark gradient overlay, gold text (Mr Eaves), gilded borders
- [x] **Sub-category cards rebuilt identically:** 13 sub-cat images + misc image, same full-bleed square layout
- [x] All sub-cat images lightened by 15% via Pillow
- [x] Original PNGs removed from git tracking, `images/` and `Images/` in `.gitignore`
- [x] Commits: 050a797 → 68937a3 (homepage), 555f4b9 (sub-category)

### Bug fixes (2026-06-19)

- [x] "Unknown Category" heading in All Entries view — fixed with `useLocation` fallback
- [x] Redundant type badge in sub-category view — gated behind `isAll` check
- [x] Escaped unicode `\u2026` → literal `…` character
- [x] Table type missing from `ENTRY_TYPES` array — button wasn't rendering
- [x] Form state bleeding on type switch — reset to EMPTY_FORM

### AI Import pipeline (2026-06-24)

- [x] **`/api/parse-entry` serverless function** — calls OpenRouter `google/gemini-3.1-flash-lite` with configurable prompt
- [x] **Import tab** — 4 input methods: Paste Text, Upload Image (vision), Upload PDF (pdf.js), Upload Document (mammoth)
- [x] **Paste Text** — sends raw text to parser, auto-populates TreasureForm fields, switches to Manual Entry tab with pre-population banner
- [x] **Upload Image** — converts to base64, sends via vision API with extraction prompt
- [x] **Upload PDF** — extracts text page-by-page via pdfjs-dist@6.0.227
- [x] **Upload Document** — extracts text via mammoth@1.12.0
- [x] **Barclay E2E test (paste text)** — confirmed pipeline works: Staff of Storms → Name/Description/Tags populated correctly
- [x] **Type-aware labels** — import method labels now reflect current entry type (e.g. "weapon description", "spell description") instead of hardcoded "magic item"
- [x] **Transcribe button** — renamed from "Parse & Pre-fill" to "Transcribe"; loading text "Transcribing…"
- [x] **OPENROUTER_API_KEY** — set in Vercel env vars (confirmed; live app works). Not needed locally — serverless function reads it at runtime.

## Known

- [ ] **Entry editing** — no edit form; entries can only be created and deleted
- [ ] **Auth** — anon policies are temporary; needs Supabase Auth integration
- [ ] **Table rendering** — tables are browsable but don't render as interactive rollable tables
- [ ] **Mobile optimisation** — responsive but not fully polished for small screens
- [ ] **Pagination** — no pagination for large entry lists
- [ ] **Import/export** — no bulk import or export of entries
- [ ] **Supabase Storage bucket** — `entry-images` bucket may need manual creation in dashboard
- [ ] **CRUD** — no edit/delete of existing entries from browse page

### 2026-06-25 — Three Phase 1 fixes

- [x] **Trinket route consistency** — subcategory label changed from "Trinkets" to "Trinket" (singular), slug from `trinkets` to `trinket`.
  - `/create/trinket` and `/browse/treasure/trinket` now use the same singular form
  - Asset renamed `trinkets.webp` → `trinket.webp`; all image references updated in CreateEntryPage, SubCategoryPage
  - Trinket is now consistent with Armour (singular route/slug)
- [x] **Silent parse-failure error handling** — when Transcribe returns no usable data (empty name + description), the import tab now shows: *"Couldn't extract anything from that content — try again, or switch to Manual Entry."* instead of sitting blank
- [x] **Audit test data cleared** — 19 entries deleted (all "Test *" entries, "Humanoid", "Test Monster Debug", and duplicate Barclay/audit runs across all 14 types). 17 genuine entries remain.

## Next tasks

- Entry editing (edit/update existing entries)
- Auth integration
- Table rendering (interactive rollable tables)
- Entry detail view polish
- Mobile optimisation
- Pagination
- Import/export