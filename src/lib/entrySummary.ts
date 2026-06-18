import type { DbEntry } from "../types";

/**
 * Returns a one-line summary for an entry based on its type.
 * Prioritises type-specific properties, falls back to description first line.
 */
export function entrySummary(entry: DbEntry): string {
  const props = entry.properties ?? {};

  switch (entry.type) {
    case "armour": {
      const ac = props.armour_class;
      const type_ = props.armour_type;
      return ac
        ? `AC ${ac}${type_ ? ` — ${type_}` : ""}`
        : firstLine(entry.description);
    }
    case "weapon": {
      const dd = props.damage_dice as string | undefined;
      const dt = props.damage_type as string | undefined;
      return dd
        ? `${dd}${dt ? ` ${dt}` : ""}${props.bonus && props.bonus !== "+0" ? ` (${props.bonus})` : ""}`
        : firstLine(entry.description);
    }
    case "wondrous_item":
    case "magic_item": {
      const rarity = (props.rarity as string | undefined) ?? "";
      const sub = (props.item_subtype as string | undefined) ?? "";
      const parts = [rarity, sub].filter(Boolean);
      return parts.length > 0
        ? parts.join(" — ")
        : firstLine(entry.description);
    }
    case "potion": {
      const rarity = (props.rarity as string | undefined) ?? "";
      return rarity || firstLine(entry.description);
    }
    case "adventuring_gear": {
      const cost = (props.cost as string | undefined) ?? "";
      const weight = (props.weight as number | undefined);
      const parts = [cost, weight ? `${weight} lb` : ""].filter(Boolean);
      return parts.length > 0 ? parts.join(" — ") : firstLine(entry.description);
    }
    case "trinket":
      return firstLine(entry.description);
    case "spell": {
      const lvl = props.level as number | undefined;
      const school = (props.school as string | undefined) ?? "";
      const parts = [lvl !== undefined ? `Level ${lvl}` : "", school].filter(Boolean);
      return parts.length > 0
        ? parts.join(" — ")
        : firstLine(entry.description);
    }
    case "scroll": {
      const lvl = (props.spell_level as number | undefined) ?? (props.level as number | undefined);
      const school = (props.school as string | undefined) ?? "";
      const parts = [lvl !== undefined ? `Level ${lvl}` : "", school].filter(Boolean);
      return parts.length > 0
        ? parts.join(" — ")
        : firstLine(entry.description);
    }
    case "monster": {
      const cr = (props.challenge_rating as string | undefined) ?? "";
      const type_ = (props.creature_type as string | undefined) ?? "";
      const parts = [cr ? `CR ${cr}` : "", type_].filter(Boolean);
      return parts.length > 0
        ? parts.join(" — ")
        : firstLine(entry.description);
    }
    case "npc": {
      const role = (props.role as string | undefined) ?? "";
      return role || firstLine(entry.description);
    }
    case "background":
    case "feat":
    case "subclass":
      return firstLine(entry.description);
    case "table": {
      const dice = (props.dice as string | undefined) ?? "";
      return dice ? `d${dice}` : firstLine(entry.description);
    }
    default:
      return firstLine(entry.description);
  }
}

function firstLine(text: string): string {
  if (!text) return "";
  const trimmed = text.split("\n")[0]?.trim() ?? "";
  return trimmed.length > 120 ? trimmed.slice(0, 117) + "…" : trimmed;
}