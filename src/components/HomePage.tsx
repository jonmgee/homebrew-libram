import { Link } from "react-router-dom";
import { CATEGORIES } from "../types";

const CATEGORY_IMAGES: Record<string, string> = {
  treasure: "/assets/treasure.webp",
  arcana: "/assets/arcana.webp",
  creatures: "/assets/creatures.webp",
  character_options: "/assets/character_options.webp",
  tables: "/assets/tables.webp",
  all: "/assets/all_items.webp",
};

export default function HomePage() {
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pt-12">
        <header className="mb-6 text-center">
          <h1
            className="font-[var(--font-title)] text-4xl uppercase tracking-[0.15em] text-[#58180d] drop-shadow-[0_2px_3px_rgba(88,24,13,0.35)] sm:text-5xl"
          >
            Homebrew Libram
          </h1>
          {/* decorative rule below title — scaled to match title width */}
          <img
            src="/assets/phb-horizontalRule.svg"
            alt=""
            className="mx-auto mb-4 mt-4 w-72 sm:w-96"
          />
          <p className="font-[var(--font-sans)] text-sm italic leading-relaxed text-[#766649]">
            Browse your custom D&D content
          </p>
        </header>
      </div>

      {/* ───── hero banner — same width as grid, gilded border ───── */}
      <div className="mx-auto max-w-5xl px-4">
        <Link
          to="/create"
          className="gilded-border relative block overflow-hidden"
          aria-label="Create New Entry"
        >
          <video
            autoPlay
            muted
            playsInline
            className="block w-full"
          >
            <source src="/assets/Hero.mp4" type="video/mp4" />
          </video>
          {/* gradient overlay + CTA text */}
          <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-center font-[var(--font-title)] text-lg font-bold text-[#E0E5C1] drop-shadow-md">
              Create New Entry
            </p>
            <p className="mt-1 text-center text-xs leading-tight text-[#C9A84C] drop-shadow">
              Click here to add the next legendary item to the Libram
            </p>
          </div>
        </Link>
      </div>

      {/* ───── category grid ───── */}
      <nav className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/browse/${cat.slug}`}
            className="gilded-border relative block aspect-square overflow-hidden rounded-lg"
          >
            <img
              src={CATEGORY_IMAGES[cat.slug]}
              alt={cat.label}
              className="h-full w-full object-cover"
            />
            {/* gradient overlay at the bottom */}
            <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="font-[var(--font-title)] text-lg font-bold text-[#E0E5C1] drop-shadow-md">
                {cat.label}
              </h2>
              <p className="mt-0.5 text-xs leading-tight text-[#C9A84C] drop-shadow">
                {cat.label === "Treasure"
                  ? "Armour, weapons, wondrous items, potions, gear, trinkets"
                  : cat.label === "Arcana"
                    ? "Spells and scrolls"
                    : cat.label === "Creatures"
                      ? "Monsters and NPCs"
                      : cat.label === "Character Options"
                        ? "Backgrounds, feats, subclasses"
                        : "Random tables and generators"}
              </p>
            </div>
          </Link>
        ))}

        {/* ───── all entries ───── */}
        <Link
          to="/browse/all"
          className="gilded-border relative block aspect-square overflow-hidden rounded-lg"
        >
          <img
            src={CATEGORY_IMAGES.all}
            alt="All Items"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="font-[var(--font-title)] text-lg font-bold text-[#E0E5C1] drop-shadow-md">
              All Entries
            </h2>
            <p className="mt-0.5 text-xs leading-tight text-[#C9A84C] drop-shadow">
              Browse every entry across all categories
            </p>
          </div>
        </Link>
      </nav>
    </>
  );
}