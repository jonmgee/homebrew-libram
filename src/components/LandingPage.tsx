import { Link } from "react-router-dom";

/**
 * Public landing page — the only page a signed-out visitor sees at "/".
 *
 * Before this existed, "/" bounced straight to a bare sign-in card, so
 * nobody could tell what the app did without making an account first.
 *
 * The showcase blocks below are rendered with the app's own PHB classes
 * rather than screenshots: they stay sharp on any display, add no image
 * weight, and can't drift out of date when the real pages change.
 */

const STEPS = [
  {
    n: "I",
    title: "Capture it",
    body: "Photograph a page, paste a screenshot from your feed, drop in a PDF, or just type it out. Several screenshots of the same item stitch into one entry.",
  },
  {
    n: "II",
    title: "It writes itself up",
    body: "The Libram reads the source and fills in the fields — rarity, attunement, spell level, the whole stat block — and keeps the wording as written rather than paraphrasing it.",
  },
  {
    n: "III",
    title: "Ready at the table",
    body: "Searchable, sorted, and legible on a phone. Bookmark what you need for Saturday and it's one tap from the top of the screen.",
  },
];

const SHELVES = [
  { img: "/assets/treasure.webp", label: "Treasure", sub: "Armour, weapons, magic items, potions" },
  { img: "/assets/arcana.webp", label: "Arcana", sub: "Spells of your own devising" },
  { img: "/assets/creatures.webp", label: "Creatures", sub: "Monsters and NPCs, full stat blocks" },
  { img: "/assets/character_options.webp", label: "Character Options", sub: "Backgrounds, feats, subclasses" },
  { img: "/assets/tables.webp", label: "Tables", sub: "Rollable, with real dice" },
  { img: "/assets/all_items.webp", label: "Everything", sub: "One searchable shelf" },
];

const FEATURES = [
  {
    title: "Rollable tables",
    body: "Random tables roll themselves, with 3D dice that clatter across the screen. No more hunting for a d100.",
  },
  {
    title: "DM-only entries",
    body: "Mark the twist, the cursed item, the traitor. DM-only entries are stamped, filterable, and never appear in anything you share.",
  },
  {
    title: "Share a link",
    body: "Send one entry to a player, or your whole collection to another DM. They can copy anything into their own Libram.",
  },
  {
    title: "Rate and bookmark",
    body: "Stars for how good it is. A bookmark ribbon for what you actually need this week — they're different questions.",
  },
  {
    title: "Install it",
    body: "Add it to your home screen and it opens like an app, without a browser bar eating the top of your phone.",
  },
  {
    title: "One account, two tools",
    body: "The same login works on PC on Parchment, our character sheet app, at no extra cost.",
  },
];

function Cta({ children, to, variant = "primary" }: { children: React.ReactNode; to: string; variant?: "primary" | "ghost" }) {
  const base =
    "phb-small-sc inline-block cursor-pointer rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors";
  return (
    <Link
      to={to}
      className={
        variant === "primary"
          ? base + " border-2 border-[var(--color-gilding-dark)] bg-[var(--color-header)] text-[var(--color-parchment-light)] shadow-md hover:bg-[#7a2212]"
          : base + " border-2 border-[var(--color-gilding-dark)]/60 text-[var(--color-header)] hover:border-[var(--color-gilding-dark)] hover:bg-[var(--color-parchment)]"
      }
    >
      {children}
    </Link>
  );
}

/** A real stat block, rendered with the app's own classes. */
function StatBlockSample() {
  return (
    <div className="phb-statblock">
      <h3 className="phb-statblock-name">Grave Warden Colossus</h3>
      <p className="phb-statblock-type">Gargantuan construct, lawful neutral</p>
      <div className="phb-hr" />
      <p className="phb-stat-line"><strong>Armour Class</strong> 17 (natural armour)</p>
      <p className="phb-stat-line"><strong>Hit Points</strong> 168 (16d12 + 64)</p>
      <p className="phb-stat-line"><strong>Speed</strong> 40 ft.</p>
      <div className="phb-hr" />
      <div className="phb-ability-grid">
        {[["STR", "24 (+7)"], ["DEX", "8 (−1)"], ["CON", "18 (+4)"], ["INT", "3 (−4)"], ["WIS", "11 (+0)"], ["CHA", "1 (−5)"]].map(([l, s]) => (
          <div key={l}>
            <div className="ab-label">{l}</div>
            <div className="ab-score">{s}</div>
          </div>
        ))}
      </div>
      <div className="phb-hr" />
      <p className="phb-stat-line"><strong>Damage Immunities</strong> poison, psychic</p>
      <p className="phb-stat-line"><strong>Senses</strong> truesight 120 ft., passive Perception 10</p>
      <p className="phb-stat-line"><strong>Challenge</strong> 11 (7,200 XP)</p>
      <h4 className="phb-action-header">Actions</h4>
      <p className="phb-entry">
        <em>Slam.</em> Melee Weapon Attack: +11 to hit, reach 10 ft., one target.
        Hit: 25 (4d8 + 7) bludgeoning damage.
      </p>
      <p className="phb-entry">
        <em>Toll the Lantern (Recharge 5–6).</em> The colossus rings the lantern
        chained to its chest. Each creature within 30 feet must succeed on a DC 16
        Constitution saving throw or be paralysed until the end of its next turn.
      </p>
    </div>
  );
}

/** A magic item entry, rendered the way the real detail page renders one. */
function ItemSample() {
  return (
    <div className="parchment-card gilded-border p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="phb-h3 !mb-0 !border-none !pb-0 !text-lg">Duskfang, Blade of the Weeping Moon</h3>
        <span className="wax-seal shrink-0">Rare</span>
      </div>
      <p className="phb-body text-sm italic text-[var(--color-caption)]">
        Weapon (longsword), requires attunement
      </p>
      <div className="phb-hr" />
      <p className="phb-body text-sm">
        Forged from a shard of a fallen moon, this longsword&rsquo;s edge glimmers
        with pale silver light. On nights of the new moon the blade weeps droplets
        of cold starlight that hiss when they touch the ground.
      </p>
      <p className="phb-body mt-3 text-sm">
        While attuned, you can see normally in darkness, both magical and
        nonmagical, to a distance of 60 feet.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["longsword", "attunement", "moon"].map((t) => (
          <span key={t} className="phb-tag">{t}</span>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-4">
      {/* ── Minimal header: the app NavBar only renders for signed-in users ── */}
      <header className="flex items-center justify-between gap-3 py-4">
        <span className="font-[var(--font-title)] text-sm uppercase tracking-[0.08em] text-[var(--color-header)] sm:text-base">
          Homebrew Libram
        </span>
        <Link
          to="/login"
          className="phb-small-sc whitespace-nowrap rounded-md border border-[var(--color-gilding-dark)]/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-header)] transition-colors hover:border-[var(--color-gilding-dark)] hover:bg-[var(--color-parchment)]"
        >
          Sign in
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="pt-6 text-center">
        <h1 className="whitespace-nowrap">
          <span className="font-[var(--font-dropcap)] inline-block align-middle text-4xl leading-[0.8] text-[#58180d] drop-shadow-[0_2px_3px_rgba(88,24,13,0.35)] sm:text-5xl md:text-8xl">
            H
          </span>
          <span className="font-[var(--font-title)] inline-block align-middle text-3xl uppercase tracking-[0.08em] text-[#58180d] drop-shadow-[0_2px_3px_rgba(88,24,13,0.35)] sm:text-4xl md:text-6xl">
            OMEBREW LIBRAM
          </span>
        </h1>
        <img src="/assets/phb-horizontalRule.svg" alt="" className="mx-auto mb-5 mt-4 w-72 sm:w-96" />
        <p className="phb-body mx-auto max-w-2xl text-base leading-relaxed sm:text-lg">
          A digital tome for the homebrew you&rsquo;ve collected, scribbled down and
          saved from your feed — written up like a proper rulebook and ready at
          the table.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Cta to="/login?mode=signup">Create a free account</Cta>
          <Cta to="/login" variant="ghost">Sign in</Cta>
        </div>
        <p className="phb-description mt-4 text-xs italic">
          Free, and no advertising.
        </p>

        <div className="gilded-border relative mt-9 overflow-hidden rounded-lg">
          <video autoPlay muted playsInline loop className="block w-full">
            <source src="/assets/Hero.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="pt-14">
        <h2 className="phb-h1 !text-2xl text-center">From a photo to a proper entry</h2>
        <img src="/assets/phb-horizontalRule.svg" alt="" className="mx-auto mb-8 mt-3 w-60" />
        <div className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="parchment-card gilded-border p-5">
              <span className="font-[var(--font-dropcap)] text-3xl leading-none text-[var(--color-crimson)]">
                {s.n}
              </span>
              <h3 className="phb-h3 !mt-2 !mb-1 !border-none !pb-0 !text-base">{s.title}</h3>
              <p className="phb-body text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What it looks like ── */}
      <section className="pt-14">
        <h2 className="phb-h1 !text-2xl text-center">Laid out like the book</h2>
        <img src="/assets/phb-horizontalRule.svg" alt="" className="mx-auto mb-3 mt-3 w-60" />
        <p className="phb-description mx-auto mb-8 max-w-xl text-center text-sm">
          Not a wall of form fields. Stat blocks, spell entries and magic items are
          typeset the way you already know how to read them.
        </p>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <StatBlockSample />
          <div className="space-y-6">
            <ItemSample />
            <div className="phb-note">
              <p className="!not-italic text-sm">
                Every entry keeps its source and campaign, takes an illustration,
                and can be edited by hand at any point — the automatic write-up is
                a starting draft, not a cage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shelves ── */}
      <section className="pt-14">
        <h2 className="phb-h1 !text-2xl text-center">Shelves for all of it</h2>
        <img src="/assets/phb-horizontalRule.svg" alt="" className="mx-auto mb-8 mt-3 w-60" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SHELVES.map((s) => (
            <div key={s.label} className="gilded-border relative aspect-square overflow-hidden rounded-lg">
              <img src={s.img} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/85 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-[var(--font-title)] text-sm font-bold text-[#E0E5C1] drop-shadow-md sm:text-base">
                  {s.label}
                </h3>
                <p className="mt-0.5 text-[0.7rem] leading-tight text-[#C9A84C] drop-shadow">
                  {s.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="pt-14">
        <h2 className="phb-h1 !text-2xl text-center">Built for actually running the game</h2>
        <img src="/assets/phb-horizontalRule.svg" alt="" className="mx-auto mb-8 mt-3 w-60" />
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="parchment-card p-5">
              <h3 className="phb-h3 !mb-1 !border-none !pb-0 !text-base">{f.title}</h3>
              <p className="phb-body text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="pb-4 pt-14 text-center">
        <div className="parchment-card gilded-border px-6 py-10">
          <h2 className="phb-h1 !text-2xl">Start your own Libram</h2>
          <p className="phb-body mx-auto mt-3 max-w-xl text-sm leading-relaxed">
            Bring the folder of screenshots you&rsquo;ve been meaning to sort out.
            It takes a few seconds an entry.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Cta to="/login?mode=signup">Create a free account</Cta>
            <Cta to="/login" variant="ghost">I already have one</Cta>
          </div>
          <p className="phb-description mt-5 text-xs italic">
            An Appwright&rsquo;s Guild tool.{" "}
            <a href="/privacy.html" className="underline underline-offset-2">
              What we store, and who else sees it
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
