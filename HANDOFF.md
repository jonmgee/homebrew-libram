# Handoff: Homebrew Libram

## Project

D&D homebrew content organiser — a web app for DMs to create, browse, and manage custom D&D content.

**Status: ✨ Completed.** 30-day cooling period through 2026-07-28 — open for amendments.

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
- [x] **Upload methods (Image, PDF, Document)** — built and tested; PDF confirmed working with pdfjs-dist@3.11.174 on cdnjs

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

- [ ] **Table rendering** — tables are browsable but don't render as interactive rollable tables
- [ ] **Mobile optimisation** — responsive but not fully polished for small screens
- [ ] **Pagination** — no pagination for large entry lists
- [ ] **Import/export** — no bulk import or export

### 2026-06-29 round — AI extraction fixes, Oath modal, PWA prompt, homepage counts, footer

- [x] **AI extraction preserves full description** (9d71e2a, e8b9a19) — verbatim-preservation instruction in all 14 prompts; fixed truncated file
- [x] **Markdown rendering on detail pages** (3c6eefc) — react-markdown for `description` field across all 7 detail renderers
- [x] **Libram's Oath modal** (98f0562) — one-time disclaimer on first login, localStorage `libram_oath_accepted`, non-dismissible outside checkbox+confirm
- [x] **PWA install prompt** (fa42e64) — `PwaPrompt` component, Android/Chrome `beforeinstallprompt` + native install, iOS share-icon instruction, dismisses to `pwa_prompt_dismissed`
- [x] **Homepage entry counts** (6a7cd2f, 3764a6b) — per-category counts on each card, All Entries shows grand total, subcategory descriptions preserved
- [x] **Footer** (6e2bb38) — `Footer` component on all pages (including `/login`), italic muted text with `mailto:hello@appwrightsguild.com`

## Completed (kept for reference)

### Auth (2026-06-28)
- [x] **Supabase Auth with magic link** — private-only, no passwords
- [x] **AuthContext** — `onAuthStateChange` session tracking, `signIn` (magic link), `signOut`
- [x] **LoginPage** at `/login` — email input, magic link send, confirmation screen
- [x] **AuthGuard** — redirects unauthenticated users to `/login`
- [x] **NavBar** — shows user email + sign out button when logged in
- [x] **RLS migration** (`001_add_auth_user_id.sql`) — user_id column, 4 auth-scoped policies
- [x] **`uploadImage.ts` updated** — injects `user_id` on entry creation
- [x] **Existing entries (17) have `user_id = NULL`** — first user to login should run SQL to claim them

### Login page redesign (2026-06-28)
- [x] Full-viewport two-image layout with centre blend gradients + dark overlay
- [x] Frosted glass card (`bg-white/15` + `backdrop-blur-xl`)
- [x] "Homebrew Libram" title (BookInsanity) and subheading

### Duplicate name warning (2026-06-28)
- [x] `useDuplicateNameCheck` hook — debounced 500ms query via `ilike`, scoped to user
- [x] `DuplicateNameWarning` component — amber italic tooltip below name input
- [x] Integrated into all 6 form components (non-blocking warning only)

### PDF upload fix (2026-06-28)
- [x] Downgraded pdfjs-dist from v6.0.227 → v3.11.174
- [x] Root cause: v6 uses dynamic `import()` for WASM modules inside the worker; v3 is self-contained
- [x] Worker URL: `cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
- [x] Removed orphaned .wasm files from `public/`

### ScrollToTop (2026-06-28)
- [x] Scrolls to top on route change

### Edit functionality (2026-06-27)
- [x] Edit button on detail page → `/entry/:id/edit` → prepopulated form → UPDATE
- [x] All 6 form components accept `initialData` prop
- [x] "Entry updated successfully" banner on redirect

### Detail view rendering (2026-06-25)
- [x] Spell, Monster, Subclass, Table detail pages render all structured metadata

### Image upload pipeline (2026-06-25)
- [x] Images upload to `entry-images` bucket with traceable filenames
- [x] Write back to `properties.image_url`, renders on detail + browse thumbnail

### 2026-07-09 round — PHB polish pass (branch: phb-polish)

- [x] **Authentic PHB monster stat block** — monsterBorderFancy frame, tapered crimson rules, red stat lines, classic six-ability row, Actions/Legendary headers with maroon underline
- [x] **PHB spell layout** — "5th-level evocation" line, bold inline stat labels, ritual/concentration handling, Classes line
- [x] **Rollable tables** — PHB olive-striped table, full width, animated "Roll dX" button that highlights and scrolls to the rolled row (expands ranges like 96–00)
- [x] **Markdown everywhere** — shared `MarkdownDescription` component in all renderers (fixes literal `**asterisks**` on spell/monster/subclass/table pages), PHB drop caps on descriptions
- [x] **Preview mode** — `VITE_PREVIEW_MODE=1` swaps the Supabase client for an in-memory mock (`src/lib/mockSupabase.ts` + `previewFixtures.ts`, 16 rich sample entries, all 14 types). Dev/testing only; never active in production
- [x] **NavBar** — dark leather cover bar, gold lettering, + New Entry shortcut on non-home pages
- [x] **Browse rows** — quiet pencil/trash icon actions replace heavy red buttons; larger thumbnails
- [x] **Detail page** — subtle Edit/Delete, parchment "inscribed in the Libram" save banner, no more empty image placeholder box, image no longer floats on mobile (fixes squeezed text)
- [x] **Footer** — PHB gold flourish accent; hero video loops
- [x] **AI import prompts** (`api/parse-entry.ts`) — markdown-formatted descriptions, monster stat hardening ("24 (+7)" → 24, keep AC/HP notes, recharge in block names), spell cantrip/concentration/material rules, d100 table completeness ("00" = 100, no gaps, never stop early), max_tokens 16384 (d100 tables truncated at 4096), JSON response_format
- [x] `motion()` → `motion.create()` (framer-motion deprecation)

### 2026-07-09 evening — 3D physics dice (merged to main)

- [x] **@3d-dice/dice-box integration** — Roll buttons throw a real 3D die (BabylonJS + Ammo physics), Libram crimson theme, settles on the physics result, matching row flashes + scrolls into view
- [x] **Lazy loading** — engine (~74KB gzip) + assets load only on first roll; assets vendored at `public/assets/dice-box/`
- [x] **Resilience** — 2D fallback on WebGL failure/timeout; reduced-motion lands instantly; ref-based re-click guard
- [x] Type declarations at `src/lib/dice-box.d.ts` (package ships no types)

### 2026-07-10 — Star ratings + random pick (merged to main)

- [x] **Star ratings (1–5)** — `rating smallint` column (`supabase/migration-005-entry-rating.sql`, applied to prod), clickable gold stars on every detail page (click current rating to clear), optimistic save, mini read-only stars on browse rows
- [x] **Sort control on browse lists** — A–Z / ★ Rating (nulls last, alpha within tier) / Newest
- [x] **Pick Random** — crimson button on browse lists; picks a random entry from the current filtered list among magic items, weapons, armour, scrolls, potions and monsters, then opens it
- [x] Edit forms leave `rating` untouched (update payload is field-scoped)

### 2026-07-10 — Multi-file import + artwork auto-crop (merged to main)

- [x] **Multi-file import** — Import tab accepts multiple files (drag/picker/paste), numbered thumbnail strip with remove; all parts sent to Gemini in order with stitch + seam-dedupe instructions (d100 chart across 2 screenshots → one table)
- [x] **Artwork auto-crop** — model returns `artwork: {image_index, box}` (0-1000 normalized) for the first image containing an illustration; client crops it via canvas and uses it as the entry image (falls back to first full image)
- [x] API accepts `images[]` (legacy `image` still works); box validated server-side; crop rejects regions under 60px

### 2026-07-10 — Sharing (merged to main)

- [x] **Item share links** — Share button on detail pages mints a `share_token` (migration-006); public read-only page at `/share/:token` via SECURITY DEFINER `get_shared_entry()` (RLS untouched — shared rows never leak into other users' queries); Stop Sharing revokes
- [x] **Whole-libram share** — `libram_shares` table + `get_shared_libram()` (migration-007); owner controls at `/share-libram` (NavBar → Share); public browse at `/share/libram/:token`, **DM-only entries always excluded**; revoke = delete row, re-share mints new token
- [x] **Copy to my Libram** — signed-in visitors clone shared entries (rating/share state don't copy); anonymous visitors get a sign-in prompt
- [x] Public pages carry their own header when the visitor is signed out; mock layer supports `rpc()` + `libram_shares` for preview testing

## Remaining tasks

- Table rendering (interactive rollable tables)
- Mobile optimisation
- Pagination
- Import/export
