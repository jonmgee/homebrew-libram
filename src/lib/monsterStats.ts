export const SKILL_LIST = ["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"];
export const SKILL_ABIL: Record<string,string> = {
  Acrobatics:"DEX","Animal Handling":"WIS",Arcana:"INT",Athletics:"STR",Deception:"CHA",
  History:"INT",Insight:"WIS",Intimidation:"CHA",Investigation:"INT",Medicine:"WIS",
  Nature:"INT",Perception:"WIS",Performance:"CHA",Persuasion:"CHA",Religion:"INT",
  "Sleight of Hand":"DEX",Stealth:"DEX",Survival:"WIS",
};

/** Proficiency bonus by challenge rating, 2014 and 2024 tables alike. */
const PROF_BY_CR: Record<string, number> = {
  "0":2,"1/8":2,"1/4":2,"1/2":2,"1":2,"2":2,"3":2,"4":2,
  "5":3,"6":3,"7":3,"8":3,"9":4,"10":4,"11":4,"12":4,
  "13":5,"14":5,"15":5,"16":5,"17":6,"18":6,"19":6,"20":6,
  "21":7,"22":7,"23":7,"24":7,"25":8,"26":8,"27":8,"28":8,"29":9,"30":9,
};

/** The bare rating from however the CR was written: "18", "18 (20,000 XP)",
 *  "1/2 (100 XP)", "13 (10,000 XP; PB +5)". Null when there is no number at
 *  the front ("None", "—"). */
export function crValue(cr: string): string | null {
  const m = /^\s*(\d+\/\d+|\d+)/.exec(cr ?? "");
  return m?.[1] ?? null;
}

/** Proficiency bonus for a CR string. A printed "PB +5" wins, since the 2024
 *  books write it and it settles any argument; otherwise the leading rating.
 *  Falls back to +2 for anything unreadable, which is right for CR 0–4 and
 *  the best guess for an empty field.
 *
 *  Before October 2026 this looked up the whole string, so every import
 *  that kept the XP ("10 (5,900 XP)") silently got +2. */
export function crToProf(cr: string): number {
  const pb = /\bPB\s*\+\s*(\d+)/i.exec(cr ?? "");
  if (pb) return Number(pb[1]);
  const v = crValue(cr);
  return (v ? PROF_BY_CR[v] : undefined) ?? 2;
}

/** "+5" / "-1", never "+-1". */
export function fmtBonus(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

/** "str +10, wis +4" → { STR: 10, WIS: 4 }. Keeps what the stat block printed
 *  so an imported monster's numbers survive the form; expertise and homebrew
 *  fudges would otherwise be flattened to mod + proficiency. */
export function parseSaveBonuses(s: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of s.matchAll(/\b(str|dex|con|int|wis|cha)\b\s*([+-]\s*\d+)?/gi)) {
    if (m[1] && m[2]) out[m[1].toUpperCase()] = Number(m[2].replace(/\s/g, ""));
  }
  return out;
}

/** "Perception +8, Sleight of Hand +4" → { Perception: 8, "Sleight of Hand": 4 }. */
export function parseSkillBonuses(s: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const name of Object.keys(SKILL_ABIL)) {
    const m = new RegExp(`\\b${name}\\s*([+-]\\s*\\d+)`, "i").exec(s);
    if (m?.[1]) out[name] = Number(m[1].replace(/\s/g, ""));
  }
  return out;
}
