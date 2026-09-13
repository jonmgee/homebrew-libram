import {
  ABILITY_KEYS,
  ABILITY_NAMES,
  CLASS_SKILLS,
  HIT_DIE_OPTIONS,
  SPECIES_SIZE_OPTIONS,
  type AbilityKey,
  type ArmorTraining,
  type ClassFeature,
  type ClassResource,
  type SpeciesTrait,
} from "../types";

/*
 * Readers for species and class properties.
 *
 * Every one of these accepts whatever shape the value turned up in — the AI
 * importer's loose JSON, an edit form's state, a row saved by an older build —
 * and returns the one shape the contract promises PC on Parchment. The forms,
 * the detail pages and the save all go through them, so nothing downstream
 * has to guess.
 */

const str = (v: unknown) => (typeof v === "string" ? v : "");

// ── Species ──

export function readSizes(v: unknown): string[] {
  const raw = Array.isArray(v) ? v : typeof v === "string" ? v.split(/,|\bor\b|\//i) : [];
  const wanted = raw.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  return SPECIES_SIZE_OPTIONS.filter((s) => wanted.includes(s.toLowerCase()));
}

/** 30, "30" and "30 feet" all mean 30. */
export function readSpeed(v: unknown): number | null {
  const n = typeof v === "number" ? v : parseInt(str(v), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function readTraits(v: unknown): SpeciesTrait[] {
  if (!Array.isArray(v)) return [];
  return v.map((t) => ({ name: str(t?.name), desc: str(t?.desc) }));
}

// ── Class ──

/** "str", "Strength" and "STR" all mean str. */
export function readAbility(v: unknown): AbilityKey | undefined {
  const s = str(v).trim().toLowerCase();
  if (!s) return undefined;
  return ABILITY_KEYS.find((k) => k === s.slice(0, 3) || ABILITY_NAMES[k].toLowerCase() === s);
}

export function readAbilities(v: unknown): AbilityKey[] {
  const raw = Array.isArray(v) ? v : str(v).split(/,|\band\b/i);
  const found = new Set(raw.map(readAbility).filter((k): k is AbilityKey => !!k));
  return ABILITY_KEYS.filter((k) => found.has(k));
}

/** 10, "10" and "d10" all mean 10; anything off the d6–d12 ladder is dropped. */
export function readHitDie(v: unknown): number | null {
  const n = typeof v === "number" ? v : parseInt(str(v).replace(/^\s*d/i, ""), 10);
  return (HIT_DIE_OPTIONS as readonly number[]).includes(n) ? n : null;
}

/** Skill ids from ids or labels, in the sheet's own order. */
export function readSkills(v: unknown): string[] {
  const raw = Array.isArray(v) ? v : str(v).split(/,|\band\b/i);
  const wanted = raw.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  return CLASS_SKILLS.filter((s) => wanted.includes(s.id) || wanted.includes(s.label.toLowerCase())).map((s) => s.id);
}

export function readArmor(v: unknown): ArmorTraining {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    return { light: !!o.light, medium: !!o.medium, heavy: !!o.heavy, shields: !!o.shields };
  }
  const s = (Array.isArray(v) ? v.join(" ") : str(v)).toLowerCase();
  return { light: /light/.test(s), medium: /medium/.test(s), heavy: /heavy/.test(s), shields: /shield/.test(s) };
}

export function readFeatures(v: unknown): ClassFeature[] {
  if (!Array.isArray(v)) return [];
  return v.map((f) => {
    const level = typeof f?.level === "number" ? f.level : parseInt(str(f?.level), 10);
    return {
      level: Number.isFinite(level) ? Math.min(20, Math.max(1, level)) : 1,
      name: str(f?.name),
      desc: str(f?.desc),
    };
  });
}

/** Always exactly 20 whole numbers, padded by carrying the last value forward. */
export function readByLevel(v: unknown): number[] {
  const raw = Array.isArray(v) ? v : [];
  const out: number[] = [];
  for (let i = 0; i < 20; i++) {
    const n = i < raw.length ? Number(raw[i]) : (out[i - 1] ?? 0);
    out.push(Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);
  }
  return out;
}

export function readResources(v: unknown): ClassResource[] {
  if (!Array.isArray(v)) return [];
  return v.map((r) => ({
    name: str(r?.name),
    by_level: readByLevel(r?.by_level),
    ...(r?.pool ? { pool: true } : {}),
  }));
}

export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((level - 1) / 4);
}

export function skillLabel(id: string): string {
  return CLASS_SKILLS.find((s) => s.id === id)?.label ?? id;
}
