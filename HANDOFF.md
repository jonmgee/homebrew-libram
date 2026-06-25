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
- [x] Entry summary line per type

### Sub-category system (2026-06-18)

- [x] Sub-category landing pages at `/browse/:category` — card grid with real entry counts
- [x] Human-readable sub-category labels
- [x] "Misc" sub-category catches unclaimed types
- [x] Routing: `/browse/treasure/weapons`, `/browse/arcana/spells`, etc.

### Styling & manual entry completion (2026-06-23)

- [x] **All 14 entry types have manual entry forms** — no more "coming soon" placeholders
- [x] **Treasure forms** (magic_item, weapon, armour, potion, adventuring_gear, trinket): Name, Rarity, Attunement, Description, Tags, Image
- [x] **Simple forms** (npc, background, feat): Name, Description, Tags, Image
- [x] **NPC stat-block toggle**: full monster-style fields
- [x] **Arcana forms** (spell, scroll): Level, School, Casting Time, Range, Components, Duration, Concentration, Rarity
- [x] **Monster form**: Full stat block with auto-calc PB, ability mods, save/skill bonuses, RepeatBlock for traits/actions/lair/legendary
- [x] **Subclass form**: Name, Parent Class, Description, Level Features, Tags, Image
- [x] **Table form**: Die type, user-defined columns, auto-generated editable rows
- [x] **CustomSelect** replaces all native `<select>` elements
- [x] All controls consistently styled: parchment, gold borders, maroon, BookInsanity/ScalySans
- [x] Image upload via Supabase Storage, fallback to base64

### Homepage & sub-category image cards (2026-06-21)

- [x] Graphic style full-bleed cards with dark gradient overlays, gold text, gilded borders

### Bug fixes (2026-06-19)

- [x] "Unknown Category" heading fix, redundant type badge fix, escaped unicode fix
- [x] Table type missing from ENTRY_TYPES
- [x] Form state bleeding on type switch

### AI Import pipeline (2026-06-24 — 2026-06-25)

- [x] **`/api/parse-entry` serverless function** — calls OpenRouter `google/gemini-3.1-flash-lite`
- [x] **Import tab** — 4 input methods: Paste Text, Upload Image (vision), Upload PDF (pdf.js), Upload Document (mammoth)
- [x] **Type-aware labels** — import method labels reflect current entry type
- [x] **Transcribe button** — renamed from "Parse & Pre-fill"
- [x] **OPENROUTER_API_KEY** — set in Vercel env vars (confirmed working)

### Phase 1 fixes (2026-06-25)

- [x] **Trinket route consistency** — singular label/slug matches Armour convention
- [x] **Silent parse-failure handling** — error message when AI returns empty result
- [x] **Audit test data cleared** — 19 test/duplicate entries deleted

### Phase 2: Type-specific Transcribe (2026-06-25)

- [x] **API rewrite** — 14 type-specific extraction prompts in `/api/parse-entry.ts`
- [x] **Front-end wiring** — all 7 form components accept `parsedData` and pre-populate on Transcribe
- [x] **Table range-expansion prompt fix** — AI instructed to expand ranges into one row per roll value (was returning `"1-2"` ranges that didn't match per-row form structure)
- [x] **Table state-race fix** — dieType effect no longer wipes pre-populated cells on mount (`!parsedData` guard + early-return if correctly sized)
- [x] **Paste Text E2E testing** — Barclay confirmed all 14 types pass (8/8 including d20 and d100 table with 100 populated rows)
- [ ] **Upload methods (Image, PDF, Document)** — built but Paste Text only tested; Jon to prepare sample files, E2E testing deferred

### Phase 3: Detail-view rendering (2026-06-25)

- [x] Detail pages for Spell, Scroll, Monster, Subclass, Table render all structured metadata
- [x] All renderers in separate components (SpellDetail, MonsterDetail, SubclassDetail, TableDetail)
- [x] Barclay E2E confirmed Monster and Table 100% pass; Spell/Subclass render all available DB data

### Phase 4: Import tab redesign + save flow + create page overhaul (2026-06-25)

#### Save redirects
- [x] All 14 forms redirect to `/entry/:id?saved=1` after successful save
- [x] Detail page shows green "Entry saved successfully!" banner (auto-dismisses after 4s, clears URL param)
- [x] Fixed React hook ordering bug that blanked the page on first deploy

#### Import tab redesign
- [x] Replaced 4-card method selector with unified paste area (text + clipboard images)
- [x] Single Upload File button accepting .jpg, .jpeg, .png, .pdf, .docx
- [x] Backend auto-detects file type from mime — user doesn't pre-select
- [x] One Transcribe button for whichever input has content
- [x] Removed redundant "Entry Type (optional)" dropdown at bottom of Import tab (subtype dropdown at top determines type)

#### Clipboard paste for images
- [x] Screenshots and other clipboard images auto-populate preview thumbnail
- [x] Works via Cmd+V anywhere on the Import tab

#### Drag-and-drop file upload
- [x] Drag images, PDFs, or Word docs onto Import tab paste area
- [x] Counter-based overlay eliminates flickering from child-element enter/leave
- [x] Document-level dragover+drop preventDefault stops browser from opening files
- [x] Unsupported file types show clear error message
- [x] ImageUpload component (manual entry forms) also supports drag, paste, and click

#### Create Entry page redesign
- [x] 14 individual type cards replaced with 5 full-bleed category cards match homepage layout
- [x] Treasure, Arcana, Creatures, Character Options, Tables — each with unique image and subtitle
- [x] Clicking a category navigates to `/create/:slug` with subtype dropdown using CustomSelect
- [x] Tables goes straight to form (no dropdown)
- [x] Old direct routes like `/create/magic_item` still work for backwards compatibility

## Known

- [ ] **Entry editing** — no edit form; entries can only be created and deleted
- [ ] **Auth** — anon policies are temporary; needs Supabase Auth integration
- [ ] **Import upload methods (Image, PDF, Document)** — built, paste text & clipboard images verified; PDF/doc drag-and-drop file uploads untested
- [x] **Detail view rendering for structured types** — Spell, Monster, Subclass, Table detail pages render all metadata
- [ ] **Table rendering** — tables are browsable but don't render as interactive rollable tables
- [ ] **Mobile optimisation** — responsive but not fully polished for small screens
- [ ] **Pagination** — no pagination for large entry lists
- [ ] **Import/export** — no bulk import or export
- [ ] **Supabase Storage bucket** — `entry-images` bucket may need manual creation
- [ ] **CRUD** — no edit/delete of existing entries from browse page

## Next tasks

- Entry editing (edit/update existing entries)
- Auth integration
- Upload method E2E testing (Image, PDF, Document) — drag-and-drop paste-text content verified; file uploads untested
- Table rendering (interactive rollable tables)
- Mobile optimisation
- Pagination
- Import/export
- Supabase Storage bucket setup verification
