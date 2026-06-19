import { Link } from "react-router-dom";
import { CATEGORIES } from "../types";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="font-cinzel text-3xl font-bold text-ink">
          Homebrew Libram
        </h1>
        <p className="font-fell mt-2 text-ink-light italic">
          Browse your custom D&D content
        </p>
      </header>

      {/* ───── placeholder hero zone ───── */}
      {/*
        The henge illustration drops in here later.
        This empty div reserves the space / acts as a
        visual anchor until the image is ready.
      */}
      <div className="gilded-border mb-12 flex items-center justify-center py-20 text-ink-light/60">
        <span className="font-fell text-sm italic">
          ⛰️ Henge illustration placeholder
        </span>
      </div>

      {/* ───── category grid ───── */}
      <nav className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/browse/${cat.slug}`}
            className="parchment-card gilded-border p-5"
          >
            <h2 className="font-cinzel text-lg font-bold text-ink">
              {cat.label}
            </h2>
            <p className="font-fell mt-1 text-sm text-ink-light italic">
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
          className="parchment-card gilded-border col-span-1 flex items-center justify-center p-5 sm:col-span-2 lg:col-span-3"
        >
          <span className="font-cinzel text-lg font-semibold text-ink">
            All Entries
          </span>
        </Link>
      </nav>

      {/* ───── nav footer ───── */}
      <div className="mt-12 flex items-center justify-center gap-6 border-t border-parchment-dark pt-6">
        <Link
          to="/create"
          className="font-cinzel text-sm font-semibold text-crimson underline underline-offset-4 hover:text-crimson-light"
        >
          Create New Entry
        </Link>
      </div>
    </div>
  );
}