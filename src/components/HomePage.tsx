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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="phb-h1 !text-3xl">
          Homebrew Libram
        </h1>
        <p className="phb-description mt-2">
          Browse your custom D&D content
        </p>
      </header>

      {/* ───── placeholder hero zone ───── */}
      <div className="gilded-border mb-12 flex items-center justify-center py-20 text-ink-light/60">
        <span className="phb-description text-sm">
          ⛰️ Henge illustration placeholder
        </span>
      </div>

      {/* ───── category grid ───── */}
      <nav className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/browse/${cat.slug}`}
            className="parchment-card gilded-border block min-h-[9rem]"
          >
            <div className="float-right -mr-[10px] -mt-[10px] ml-2 mb-2 flex h-[134px] w-[134px] shrink-0 items-center justify-center border border-parchment-dark bg-parchment-dark/20">
              <img
                src={CATEGORY_IMAGES[cat.slug]}
                alt={cat.label}
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="phb-h2 p-[10px] pb-0 !text-[1.1rem] !font-bold">
              {cat.label}
            </h2>
            <p className="phb-description px-[10px] pb-[10px] text-sm">
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
          </Link>
        ))}

        {/* ───── all entries ───── */}
        <Link
          to="/browse/all"
          className="parchment-card gilded-border block min-h-[9rem]"
        >
          <div className="float-right -mr-[10px] -mt-[10px] ml-2 mb-2 flex h-[134px] w-[134px] shrink-0 items-center justify-center border border-parchment-dark bg-parchment-dark/20">
            <img
              src={CATEGORY_IMAGES.all}
              alt="All Items"
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="phb-h2 p-[10px] pb-0 !text-[1.1rem] !font-bold">
            All Entries
          </h2>
          <p className="phb-description px-[10px] pb-[10px] text-sm">
            Browse every entry across all categories
          </p>
        </Link>
      </nav>

      {/* ───── nav footer ───── */}
      <div className="mt-12 flex items-center justify-center gap-6 border-t border-parchment-dark pt-6">
        <Link
          to="/create"
          className="font-sans-sc text-sm font-bold text-crimson underline underline-offset-4 hover:text-crimson-light"
        >
          Create New Entry
        </Link>
      </div>
    </div>
  );
}