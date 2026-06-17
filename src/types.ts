export type EntryType = "magic_item" | "weapon";

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
