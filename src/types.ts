// ──────────────── All entry types (13 categories + legacy) ────────────────

export type EntryType =
  | "armour"
  | "weapon"
  | "wondrous_item"
  | "potion"
  | "adventuring_gear"
  | "trinket"
  | "spell"
  | "scroll"
  | "monster"
  | "npc"
  | "background"
  | "feat"
  | "subclass"
  | "table"
  // legacy — mapped to treasure for backwards compatibility
  | "magic_item";

// ──────────────── Category system ────────────────

export type CategorySlug =
  | "treasure"
  | "arcana"
  | "creatures"
  | "character_options"
  | "tables";

export interface Category {
  slug: CategorySlug;
  label: string;
  types: EntryType[];
}

export const CATEGORIES: Category[] = [
  {
    slug: "treasure",
    label: "Treasure",
    types: [
      "armour",
      "weapon",
      "wondrous_item",
      "potion",
      "adventuring_gear",
      "trinket",
      "magic_item",
    ],
  },
  {
    slug: "arcana",
    label: "Arcana",
    types: ["spell", "scroll"],
  },
  {
    slug: "creatures",
    label: "Creatures",
    types: ["monster", "npc"],
  },
  {
    slug: "character_options",
    label: "Character Options",
    types: ["background", "feat", "subclass"],
  },
  {
    slug: "tables",
    label: "Tables",
    types: ["table"],
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

// ──────────────── Human-readable type labels ────────────────

const ENTRY_TYPE_LABELS: Record<string, string> = {
  armour: "Armour",
  weapon: "Weapon",
  wondrous_item: "Wondrous Item",
  potion: "Potion",
  adventuring_gear: "Adventuring Gear",
  trinket: "Trinket",
  spell: "Spell",
  scroll: "Scroll",
  monster: "Monster",
  npc: "NPC",
  background: "Background",
  feat: "Feat",
  subclass: "Subclass",
  table: "Table",
  magic_item: "Magic Item",
};

export function formatEntryType(type: string): string {
  return ENTRY_TYPE_LABELS[type] ?? type;
}

// ──────────────── Entry shapes ────────────────

export interface SharedFields {
  name: string;
  description: string;
  source: string;
  dm_only: boolean;
  tags: string[];
  campaign: string;
}

export interface MagicItemProperties {
  rarity: "common" | "uncommon" | "rare" | "very rare" | "legendary" | "artifact";
  requires_attunement: boolean;
  item_subtype: string;
  charges: number;
}

export interface WeaponProperties {
  damage_dice: string;
  damage_type: "slashing" | "piercing" | "bludgeoning";
  bonus: "+0" | "+1" | "+2" | "+3";
  properties: string;
  cost: string;
  weight: number;
}

export interface DbEntry {
  id: string;
  name: string;
  type: EntryType;
  description: string;
  source: string;
  dm_only: boolean;
  tags: string[];
  campaign: string;
  created_at: string;
  properties: Record<string, unknown>;
}

export interface MonsterProperties {
  cr: string;
  size: string;
  creature_type: string;
  alignment: string;
  ac: number;
  hp: string;
  speed: string;
  ability_str: number;
  ability_dex: number;
  ability_con: number;
  ability_int: number;
  ability_wis: number;
  ability_cha: number;
  saving_throws: string;
  skills: string;
  damage_resistances: string;
  damage_immunities: string;
  condition_immunities: string;
  senses: string;
  languages: string;
  actions: string;
  legendary_actions: string;
  special_abilities: string;
}

export interface NpcProperties extends MonsterProperties {
  role: string;
  faction: string;
}

export interface SpellProperties {
  level: string;
  school: string;
  casting_time: string;
  range: string;
  components: string[];
  material: string;
  duration: string;
  classes: string;
  ritual: boolean;
  concentration: boolean;
}

export interface ScrollProperties {
  spell_name: string;
  spell_level: string;
  rarity: string;
}

export interface ArmourProperties {
  armour_type: "light" | "medium" | "heavy" | "shield";
  bonus: "+0" | "+1" | "+2" | "+3";
  stealth_disadvantage: boolean;
  cost: string;
  weight: number;
}

export interface PotionProperties {
  effect: string;
  duration: string;
  rarity: string;
}

export interface AdventuringGearProperties {
  gear_category: string;
  quantity: number;
  properties: string;
  cost: string;
  weight: number;
}

export const RARITY_OPTIONS = [
  "common",
  "uncommon",
  "rare",
  "very rare",
  "legendary",
  "artifact",
] as const;

export const DAMAGE_TYPE_OPTIONS = [
  "slashing",
  "piercing",
  "bludgeoning",
] as const;

export const BONUS_OPTIONS = ["+0", "+1", "+2", "+3"] as const;

export const ARMOUR_TYPE_OPTIONS = [
  "light",
  "medium",
  "heavy",
  "shield",
] as const;

export const GEAR_CATEGORY_OPTIONS = [
  "tool",
  "kit",
  "container",
  "consumable",
  "focus",
  "instrument",
  "other",
] as const;

export const SPELL_LEVEL_OPTIONS = [
  "cantrip",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
] as const;

export const SCHOOL_OPTIONS = [
  "abjuration",
  "conjuration",
  "divination",
  "enchantment",
  "evocation",
  "illusion",
  "necromancy",
  "transmutation",
] as const;

export const COMPONENT_OPTIONS = ["V", "S", "M"] as const;

export const CREATURE_SIZE_OPTIONS = [
  "tiny",
  "small",
  "medium",
  "large",
  "huge",
  "gargantuan",
] as const;

export const CREATURE_TYPE_OPTIONS = [
  "aberration",
  "beast",
  "celestial",
  "construct",
  "dragon",
  "elemental",
  "fey",
  "fiend",
  "giant",
  "humanoid",
  "monstrosity",
  "ooze",
  "plant",
  "undead",
] as const;
