import { Link } from "react-router-dom";
import { CATEGORIES } from "../types";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-zinc-100">Homebrew Libram</h1>
        <p className="mt-2 text-zinc-500">
          Browse your custom D&D content
        </p>
      </header>

      {/* ───── placeholder hero zone ───── */}
      {/*
        The henge illustration drops in here later.
        This empty div reserves the space / acts as a
        visual anchor until the image is ready.
      */}
      <div className="mb-12 flex items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 py-20 text-zinc-600">
        <span className="text-sm">⛰️ Henge illustration placeholder</span>
      </div>

      {/* ───── category grid ───── */}
      <nav className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/browse/${cat.slug}`}
            className="group rounded-xl border border-zinc-700 bg-zinc-900 p-5 transition-colors hover:border-amber-600 hover:bg-zinc-800"
          >
            <h2 className="text-lg font-semibold text-zinc-100 group-hover:text-amber-400">
              {cat.label}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
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
          className="group col-span-1 flex items-center justify-center rounded-xl border border-dashed border-zinc-600 bg-zinc-900/50 p-5 transition-colors hover:border-amber-600 hover:bg-zinc-800 sm:col-span-2 lg:col-span-3"
        >
          <span className="text-lg font-semibold text-zinc-400 group-hover:text-amber-400">
            All Entries
          </span>
        </Link>
      </nav>

      {/* ───── nav footer ───── */}
      <div className="mt-12 flex justify-center gap-6 border-t border-zinc-800 pt-6">
        <Link
          to="/create"
          className="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
        >
          Create New Entry
        </Link>
      </div>
    </div>
  );
}