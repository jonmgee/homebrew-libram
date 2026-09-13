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
  | "class"
  | "subclass"
  | "species"
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
    types: ["background", "feat", "class", "subclass", "species"],
  },
  {
    slug: "tables",
    label: "Tables",
    types: ["table"],
  },
];

/**
 * The entry types actually on offer today, by category.
 *
 * `CATEGORIES[].types` is deliberately wider: it still lists the retired types
 * (wondrous_item, trinket, scroll) so that any old row carrying one keeps
 * turning up in Browse. But nothing should be *created* as one, or *moved*
 * into one, so the create dropdown and the move picker both read this list.
 * Keeping it in one place is what stops the two drifting apart.
 */
export const LIVE_TYPES: Record<CategorySlug, EntryType[]> = {
  treasure: ["magic_item", "weapon", "armour", "potion", "adventuring_gear"],
  arcana: ["spell"],
  creatures: ["monster", "npc"],
  character_options: ["background", "feat", "class", "subclass", "species"],
  tables: ["table"],
};

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

// ──────────────── Human-readable type labels ────────────────

const ENTRY_TYPE_LABELS: Record<string, string> = {
  armour: "Armour",
  weapon: "Weapon",
  wondrous_item: "Magic Item",
  potion: "Potion",
  adventuring_gear: "Misc",
  trinket: "Trinket",
  spell: "Spell",
  scroll: "Scroll",
  monster: "Monster",
  npc: "NPC",
  background: "Background",
  feat: "Feat",
  class: "Class",
  subclass: "Subclass",
  species: "Species",
  table: "Table",
  magic_item: "Magic Item",
};

/**
 * Does this NPC carry a stat block? The NPC form makes one optional, so most
 * don't, and the answer decides both which layout renders the entry and
 * whether the edit form opens the stat-block section.
 */
export function npcHasStatBlock(entry: { properties?: Record<string, unknown> | null }): boolean {
  const p = entry.properties ?? {};
  return ["ac", "hp", "cr", "speed", "ability_str", "actions", "traits"].some((k) => k in p);
}

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
  /**
   * Withdrawn as a feature: no form collects tags, nothing renders them and
   * nothing searches them. Categories say what an entry is, stars say whether
   * it's any good and bookmarks say whether it's needed on Saturday, which
   * left tags answering nothing — and 19% of the ones the importer invented
   * only restated the type. The column and its existing strings are kept so
   * the decision stays reversible; copyEntry still carries them across, and
   * an edit deliberately doesn't write the column.
   */
  tags: string[];
  campaign: string;
  created_at: string;
  properties: Record<string, unknown>;
  /** Personal star rating, 1–5; null/undefined = unrated */
  rating?: number | null;
  /** Saved to the "at the table" list for an upcoming session */
  bookmarked?: boolean | null;
  /** Public share link token; null/undefined = not shared */
  share_token?: string | null;
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

// ──────────────── Background ────────────────

export interface BackgroundProperties {
  skill_proficiencies: string;
  tool_proficiencies: string;
  languages: string;
  feature_name: string;
  feature_description: string;
  equipment: string;
  personality_traits: string;
  ideals: string;
  bonds: string;
  flaws: string;
}

// ──────────────── Feat ────────────────

export interface FeatProperties {
  prerequisite: string;
  benefit: string;
}

// ──────────────── Subclass ────────────────

export interface SubclassProperties {
  parent_class: string;
  subclass_features: string;
}

export const PARENT_CLASS_OPTIONS = [
  "barbarian",
  "bard",
  "cleric",
  "druid",
  "fighter",
  "monk",
  "paladin",
  "ranger",
  "rogue",
  "sorcerer",
  "warlock",
  "wizard",
  "artificer",
] as const;

// ──────────────── Table ────────────────

export interface TableRow {
  roll_range: string;
  result: string;
}

export interface TableProperties {
  die: string;
  table_category: string;
  rows: TableRow[];
}

export const DIE_OPTIONS = [
  "d4",
  "d6",
  "d8",
  "d10",
  "d12",
  "d20",
  "d100",
] as const;

// ──────────────── Species ────────────────
//
// Species and Class are the two types PC on Parchment reads to fill in a
// character sheet, the same way it fills one from an SRD species or class.
// Their property keys are therefore a contract with another app, written up
// in docs/class-species-contract.md: rename one here and the sheet silently
// stops seeing it. Both are 2024 (5.5e) shapes only.

export interface SpeciesTrait {
  name: string;
  desc: string;
}

export interface SpeciesProperties {
  /** "Humanoid" for every SRD species; kept for the odd homebrew that isn't. */
  creature_type: string;
  /** More than one = the player chooses, as with the SRD Human ("Medium or Small"). */
  sizes: string[];
  /** Walking speed in feet. */
  speed: number;
  traits: SpeciesTrait[];
}

export const SPECIES_SIZE_OPTIONS = ["Tiny", "Small", "Medium", "Large"] as const;

// ──────────────── Class ────────────────

/** Lower-case ability keys, exactly as PC on Parchment stores them. */
export const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

export const ABILITY_NAMES: Record<AbilityKey, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

/** Skill ids match PC on Parchment's, so a class's list lands on its sheet as-is. */
export const CLASS_SKILLS: { id: string; label: string }[] = [
  { id: "acrobatics", label: "Acrobatics" },
  { id: "animal-handling", label: "Animal Handling" },
  { id: "arcana", label: "Arcana" },
  { id: "athletics", label: "Athletics" },
  { id: "deception", label: "Deception" },
  { id: "history", label: "History" },
  { id: "insight", label: "Insight" },
  { id: "intimidation", label: "Intimidation" },
  { id: "investigation", label: "Investigation" },
  { id: "medicine", label: "Medicine" },
  { id: "nature", label: "Nature" },
  { id: "perception", label: "Perception" },
  { id: "performance", label: "Performance" },
  { id: "persuasion", label: "Persuasion" },
  { id: "religion", label: "Religion" },
  { id: "sleight-of-hand", label: "Sleight of Hand" },
  { id: "stealth", label: "Stealth" },
  { id: "survival", label: "Survival" },
];

export const HIT_DIE_OPTIONS = [6, 8, 10, 12] as const;

export interface ArmorTraining {
  light: boolean;
  medium: boolean;
  heavy: boolean;
  shields: boolean;
}

export interface ClassFeature {
  level: number;
  name: string;
  desc: string;
}

export interface ClassResource {
  /** What the tracker is called on the sheet, e.g. "Rage". */
  name: string;
  /** Uses at each class level: always 20 numbers, index 0 = level 1, 0 until gained. */
  by_level: number[];
  /** A pool of points rather than a count of uses, like Lay on Hands. */
  pool?: boolean;
}

export interface ClassProperties {
  hit_die: number;
  /** Display only — the 2024 class tables print it, the sheet doesn't use it. */
  primary_ability: string;
  saves: AbilityKey[];
  /** Absent for a class that doesn't cast. */
  spell_ability?: AbilityKey;
  armor_training: ArmorTraining;
  weapon_profs: string;
  tool_profs: string;
  skill_choose: number;
  /** Empty = choose from any skill, as the Bard does. */
  skill_options: string[];
  starting_equipment: string;
  /** The level the class picks its subclass; 3 for every 2024 class. */
  subclass_level: number;
  features: ClassFeature[];
  resources: ClassResource[];
}

/**
 * Names PC on Parchment already recognises. A homebrew entry with one of these
 * names would be shadowed by the SRD version on the sheet, so the forms suggest
 * a suffix instead. Copied from PC on Parchment's src/lib/srd.ts (SRD 5.2.1).
 */
export const SRD_CLASS_NAMES = [
  "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk",
  "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard",
];
export const SRD_SPECIES_NAMES = [
  "Dragonborn", "Dwarf", "Elf", "Gnome", "Goliath", "Halfling", "Human", "Orc", "Tiefling",
];

export function srdNameClash(name: string, srdNames: string[]): string | null {
  const key = name.trim().toLowerCase();
  return srdNames.find((n) => n.toLowerCase() === key) ?? null;
}
