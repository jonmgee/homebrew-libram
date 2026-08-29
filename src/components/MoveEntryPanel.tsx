import { useState } from "react";
import { CATEGORIES, LIVE_TYPES, formatEntryType } from "../types";
import type { EntryType } from "../types";

/**
 * Which form and detail renderer each type uses.
 *
 * A move inside a family is lossless: the same form collects the same fields
 * and the same layout prints them, so a magic item that was always a weapon
 * just gains the damage line it never had. A move across a family leaves the
 * old keys sitting in `properties` where nothing reads them — harmless, and
 * moving the entry back restores it exactly, but worth saying out loud first.
 */
const FORM_FAMILY: Record<string, string> = {
  magic_item: "treasure",
  wondrous_item: "treasure",
  weapon: "treasure",
  armour: "treasure",
  potion: "treasure",
  adventuring_gear: "treasure",
  trinket: "treasure",
  spell: "arcana",
  scroll: "arcana",
  monster: "monster",
  npc: "simple",
  background: "simple",
  feat: "simple",
  subclass: "subclass",
  table: "table",
};

/** What a cross-family move stops showing, phrased for the entry you're on. */
const FAMILY_LOSES: Record<string, string> = {
  treasure: "rarity, attunement and any weapon or armour figures",
  arcana: "the spell's level, school, casting time and components",
  monster: "the whole stat block — AC, hit points, abilities and actions",
  simple: "nothing beyond the description",
  subclass: "the parent class and its feature list",
  table: "the die and every row of the table",
};

function familyOf(type: string): string {
  return FORM_FAMILY[type] ?? "simple";
}

interface Props {
  current: EntryType;
  busy?: boolean;
  error?: string | null;
  onMove: (type: EntryType) => void;
  onCancel: () => void;
}

export default function MoveEntryPanel({ current, busy, error, onMove, onCancel }: Props) {
  const [chosen, setChosen] = useState<EntryType | null>(null);

  const crossFamily = !!chosen && familyOf(chosen) !== familyOf(current);

  const chip =
    "phb-small-sc cursor-pointer rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-colors";

  if (chosen) {
    return (
      <div className="phb-note mb-4 print:hidden">
        <div className="space-y-2 px-1 py-1.5">
          <p className="!not-italic text-sm">
            Move this entry from <strong>{formatEntryType(current)}</strong> to{" "}
            <strong>{formatEntryType(chosen)}</strong>?
          </p>
          {crossFamily && (
            <p className="text-xs">
              {formatEntryType(chosen)} entries record different fields, so this one
              will stop showing {FAMILY_LOSES[familyOf(current)]}. Nothing is
              deleted — moving it back brings it all straight back.
            </p>
          )}
          {error && <p className="text-xs not-italic text-crimson">{error}</p>}
          <div className="flex flex-wrap gap-2 pt-0.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => onMove(chosen)}
              className={`${chip} border-[var(--color-gilding-dark)] bg-[var(--color-header)] text-parchment-light hover:bg-[#7a2212] disabled:opacity-60`}
            >
              {busy ? "Moving…" : `Move to ${formatEntryType(chosen)}`}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setChosen(null)}
              className={`${chip} border-parchment-dark text-caption hover:border-[var(--color-header)] hover:text-[var(--color-header)]`}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="phb-note mb-4 print:hidden">
      <div className="space-y-3 px-1 py-1.5">
        <p className="!not-italic text-xs font-bold uppercase tracking-wider">
          Move this entry to…
        </p>
        {CATEGORIES.map((cat) => {
          const types = (LIVE_TYPES[cat.slug] ?? []).filter((t) => t !== current);
          if (!types.length) return null;
          return (
            <div key={cat.slug} className="space-y-1.5">
              <p className="phb-small-sc !not-italic text-xs uppercase tracking-wider text-caption">
                {cat.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setChosen(t)}
                    className={`${chip} border-parchment-dark text-caption hover:border-[var(--color-header)] hover:text-[var(--color-header)]`}
                  >
                    {formatEntryType(t)}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {/* Ruled off, or it reads as a thirteenth destination. */}
        <div className="border-t border-parchment-dark pt-2.5">
          <button
            type="button"
            onClick={onCancel}
            className={`${chip} border-parchment-dark text-caption hover:border-crimson hover:text-crimson`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
