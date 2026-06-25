import type { EntryType } from "../types";
import { getCategory } from "../types";

/**
 * Defines the human-friendly sub-category for each entry type,
 * and which sub-category cards appear under each category.
 */

// ──────────── Entry type → sub-category mapping ────────────

const SUBCATEGORY_MAP: Record<string, string> = {
  weapon: "Weapons",
  armour: "Armour",
  wondrous_item: "Magic Items",
  magic_item: "Magic Items",
  potion: "Potions",
  adventuring_gear: "Adventuring Gear",
  trinket: "Trinkets",
  spell: "Spells",
  scroll: "Scrolls",
  monster: "Monsters",
  npc: "NPCs",
  background: "Backgrounds",
  feat: "Feats",
  subclass: "Subclasses",
  table: "Misc",
};

export function getSubcategoryLabel(entryType: string): string {
  return SUBCATEGORY_MAP[entryType] ?? "Misc";
}

// ──────────── Category → sub-category card list ────────────

export interface SubCategoryDef {
  slug: string;      // URL-safe: "weapons", "misc"
  label: string;     // Display: "Weapons"
  types: EntryType[]; // Which entry types fall here
}

export function getSubCategories(categorySlug: string): SubCategoryDef[] {
  const cat = getCategory(categorySlug);
  if (!cat) return [];

  // Build all sub-category slugs that appear for this category's types
  const subMap = new Map<string, SubCategoryDef>();

  for (const entryType of cat.types) {
    const label = getSubcategoryLabel(entryType);
    const slug = label.toLowerCase().replace(/\s+/g, "_");
    if (!subMap.has(slug)) {
      subMap.set(slug, { slug, label, types: [] });
    }
    subMap.get(slug)!.types.push(entryType);
  }

  // Ensure a "Misc" exists even if no type maps to it
  const miscSlug = "misc";
  if (!subMap.has(miscSlug)) {
    subMap.set(miscSlug, { slug: miscSlug, label: "Misc", types: [] });
  }

  return Array.from(subMap.values());
}

/**
 * Given a category slug and sub-category slug, return which entry types
 * to show. If the sub-category is "misc", return all types in the category
 * that DON'T match any other sub-category (handles legacy entries with
 * no subcategory set).
 */
export function getTypesForSubCategory(
  categorySlug: string,
  subSlug: string,
): EntryType[] {
  const cat = getCategory(categorySlug);
  if (!cat) return [];

  const subs = getSubCategories(categorySlug);
  const sub = subs.find((s) => s.slug === subSlug);
  if (!sub) return [];

  // Misc: includes all category types not claimed by other sub-categories
  if (subSlug === "misc") {
    const claimed = new Set(subs.filter((s) => s.slug !== "misc").flatMap((s) => s.types));
    return cat.types.filter((t) => !claimed.has(t));
  }

  return sub.types;
}

// ──────────── Sub-category badge for create form ────────────

export function getSubcategorySlug(entryType: string): string {
  const label = getSubcategoryLabel(entryType);
  return label.toLowerCase().replace(/\s+/g, "_");
}