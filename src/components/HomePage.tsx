import { Link } from "react-router-dom";
import { CATEGORIES } from "../types";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
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
      <nav className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/browse/${cat.slug}`}
            className="parchment-card gilded-border flex flex-col overflow-hidden"
          >
            {/* landscape placeholder */}
            <div className="flex h-28 items-center justify-center bg-parchment-dark/20">
              <span className="phb-description text-xs">
                Category illustration placeholder
              </span>
            </div>
            <div className="flex flex-col gap-1 p-5 pt-4">
              <h2 className="phb-h2 !text-lg !font-bold">
                {cat.label}
              </h2>
              <p className="phb-description text-sm">
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
          className="parchment-card gilded-border col-span-1 flex items-center justify-center p-6 sm:col-span-2 lg:col-span-3"
        >
          <span className="phb-h2 !text-lg !font-semibold">
            All Entries
          </span>
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