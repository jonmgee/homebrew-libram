import { Link } from "react-router-dom";

/**
 * Public landing page — the only page a signed-out visitor sees at "/".
 *
 * Screenshot-led on purpose: the app is the pitch, so each panel is a real
 * capture of it rather than a paragraph describing it. Captures live in
 * public/assets/shots and are cropped to their content.
 *
 * The item panel is the exception. It renders live with the app's own PHB
 * classes and an item written for this project, because the obvious capture
 * to use showed another creator's homebrew — not ours to put on a public page.
 */

type Panel = {
  eyebrow: string;
  title: string;
  body: string;
  shot?: { src: string; alt: string };
  flip?: boolean;
};

const PANELS: Panel[] = [
  {
    eyebrow: "Chapter I",
    title: "Photograph it, and it writes itself up",
    body:
      "Point your camera at a page, paste a screenshot straight from your feed, drop in a PDF, or type it out. Several screenshots of the same item stitch into a single entry, and the wording comes across as written rather than paraphrased.",
    shot: { src: "/assets/shots/shot-import.webp", alt: "The import screen, ready to transcribe a pasted stat block" },
  },
  {
    eyebrow: "Chapter III",
    title: "Tables that roll themselves",
    body:
      "Random tables come out as real tables, and roll with 3D dice that clatter across the screen and land on the row they picked. No hunting for a d100 at eleven at night.",
    shot: { src: "/assets/shots/shot-table.webp", alt: "A d20 encounter table with the die mid-roll, landing on 16" },
    flip: true,
  },
  {
    eyebrow: "Chapter IV",
    title: "Five wings of the library",
    body:
      "Treasure, arcana, creatures, character options and tables. Pick a wing, pick a type, and you're on the form — nothing gets lost in a folder somewhere.",
    shot: { src: "/assets/shots/shot-create.webp", alt: "The create screen, showing the five categories" },
  },
];

const FEATURES: [string, string][] = [
  ["Share a link", "One entry to a player, or the whole tome to another DM. No account needed to read it."],
  ["DM-only entries", "Stamp the twist and the cursed item. They never appear in anything you share."],
  ["Print it", "Every entry prints properly, in full or compact, for a folder at the table."],
  ["Onto a character sheet", "Pull your own items straight into PC on Parchment. Same login, no extra cost."],
  ["Rate and bookmark", "Stars for how good it is, a ribbon for what you need this Saturday."],
  ["Install it", "Add it to your home screen and it opens like an app, no browser bar."],
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

function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="gilded-border overflow-hidden rounded-lg shadow-[0_8px_20px_rgba(26,10,0,0.22)]">
      <img src={src} alt={alt} loading="lazy" className="block w-full" />
    </div>
  );
}

/** Chapter II's showcase — the real entry layout, with an item of our own. */
function ItemPanel() {
  return (
    <div className="gilded-border overflow-hidden rounded-lg shadow-[0_8px_20px_rgba(26,10,0,0.22)]">
      <div className="flex items-center gap-2 bg-[var(--color-cover)] px-4 py-2.5">
        <span className="font-[var(--font-title)] text-xs uppercase tracking-[0.08em] text-[var(--color-gilding)]">
          Homebrew Libram
        </span>
      </div>
      <div className="bg-[var(--color-parchment-light)] p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <svg key={i} viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.35 6.2 20.4l1.1-6.47L2.6 9.35l6.5-.95L12 2.5z"
                  fill="var(--color-gilding)"
                  stroke="var(--color-gilding-dark)"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            ))}
            <svg viewBox="0 0 24 24" className="ml-1.5 h-4 w-4">
              <path
                d="M6.5 3h11a1 1 0 0 1 1 1v17l-6.5-4.1L5.5 21V4a1 1 0 0 1 1-1z"
                fill="var(--color-crimson)"
                stroke="var(--color-crimson)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="flex gap-1.5" aria-hidden="true">
            {["Share", "Print", "Edit"].map((b) => (
              <span
                key={b}
                className="phb-small-sc rounded-md border border-parchment-dark px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-caption"
              >
                {b}
              </span>
            ))}
          </span>
        </div>

        <div className="flex flex-wrap items-start gap-4 sm:flex-nowrap">
          <div className="min-w-0 flex-1">
            <h3 className="phb-h3 !mb-1 !border-none !pb-0 !text-lg">
              Duskfang, Blade of the Weeping Moon
            </h3>
            <p className="phb-body text-xs italic text-[var(--color-caption)]">
              Weapon (longsword), rare — requires attunement
            </p>
            <p className="phb-body mt-2.5 text-sm leading-relaxed">
              Forged from a shard of a fallen moon, this longsword&rsquo;s edge
              glimmers with pale silver light. On nights of the new moon the blade
              weeps droplets of cold starlight that hiss when they touch the ground.
            </p>
            <p className="phb-body mt-2 text-sm leading-relaxed">
              <strong>Moonlit Edge.</strong> While attuned, you can see normally in
              darkness, both magical and nonmagical, to a distance of 60 feet.
            </p>
          </div>
          <img
            src="/assets/weapons.webp"
            alt=""
            loading="lazy"
            className="h-40 w-32 shrink-0 rounded border border-parchment-dark object-cover shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-4">
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
      <section className="pt-4 text-center">
        <h1 className="whitespace-nowrap">
          <span className="font-[var(--font-dropcap)] inline-block align-middle text-4xl leading-[0.8] text-[#58180d] drop-shadow-[0_2px_3px_rgba(88,24,13,0.35)] sm:text-5xl md:text-8xl">
            H
          </span>
          <span className="font-[var(--font-title)] inline-block align-middle text-3xl uppercase tracking-[0.08em] text-[#58180d] drop-shadow-[0_2px_3px_rgba(88,24,13,0.35)] sm:text-4xl md:text-6xl">
            OMEBREW LIBRAM
          </span>
        </h1>
        <img src="/assets/phb-horizontalRule.svg" alt="" className="mx-auto mb-5 mt-3 w-72 sm:w-96" />
        <p className="phb-body mx-auto max-w-2xl text-base leading-relaxed sm:text-lg">
          Your homebrew, organised like a proper tome — and ready at the table.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Cta to="/login?mode=signup">Create a free account</Cta>
          <Cta to="/login" variant="ghost">Sign in</Cta>
        </div>
        <p className="phb-description mt-3 text-xs italic">
          Free, no ads, no limit on what you store.
        </p>

        <div className="mt-8">
          <Shot src="/assets/shots/shot-shelves.webp" alt="The Homebrew Libram home page, showing shelves for treasure, arcana, creatures, character options and tables" />
        </div>
      </section>

      {/* ── Chapters ── */}
      {PANELS.slice(0, 1).map((p) => (
        <ChapterPanel key={p.title} panel={p} />
      ))}

      {/* Chapter II — the live-rendered entry */}
      <section className="pt-16">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="lg:order-2">
            <p className="phb-small-sc text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-crimson)]">
              Chapter II
            </p>
            <h2 className="phb-h1 !mt-1 !text-2xl">A proper entry, every time</h2>
            <p className="phb-body mt-3 text-sm leading-relaxed sm:text-base">
              Stat blocks, spell entries and magic items are typeset the way you
              already know how to read them. Add your own illustration, keep the
              source and campaign, and edit any of it by hand — the automatic
              write-up is a first draft, not a cage.
            </p>
          </div>
          <div className="lg:order-1">
            <ItemPanel />
          </div>
        </div>
      </section>

      {PANELS.slice(1).map((p) => (
        <ChapterPanel key={p.title} panel={p} />
      ))}

      {/* ── Feature strip ── */}
      <section className="pt-16">
        <h2 className="phb-h1 !text-2xl text-center">And the rest of it</h2>
        <img src="/assets/phb-horizontalRule.svg" alt="" className="mx-auto mb-8 mt-3 w-60" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([title, body]) => (
            <div key={title} className="parchment-card p-4">
              <h3 className="phb-h3 !mb-1 !border-none !pb-0 !text-sm">{title}</h3>
              <p className="phb-body text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="pb-4 pt-16 text-center">
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

function ChapterPanel({ panel }: { panel: Panel }) {
  return (
    <section className="pt-16">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className={panel.flip ? "lg:order-2" : ""}>
          <p className="phb-small-sc text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-crimson)]">
            {panel.eyebrow}
          </p>
          <h2 className="phb-h1 !mt-1 !text-2xl">{panel.title}</h2>
          <p className="phb-body mt-3 text-sm leading-relaxed sm:text-base">{panel.body}</p>
        </div>
        <div className={panel.flip ? "lg:order-1" : ""}>
          {panel.shot && <Shot src={panel.shot.src} alt={panel.shot.alt} />}
        </div>
      </div>
    </section>
  );
}
