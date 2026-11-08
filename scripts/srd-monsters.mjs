// Builds src/data/srdMonsters.json: every monster in the 5e System Reference
// Document (5.1, the 2014 rules, and 5.2.1, the 2024 rules), reshaped into
// the exact property set MonsterForm saves, so a template can be dropped
// straight into the form and edited.
//
// Source: the 5e-bits/5e-database project (MIT), which transcribes the SRD.
// The SRD text itself is © Wizards of the Coast and licensed under
// CC BY 4.0 — attribution is shown next to the picker in the app.
//
// Run by hand when the upstream data changes:   node scripts/srd-monsters.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = "https://raw.githubusercontent.com/5e-bits/5e-database/main/src";
const SOURCES = [
  { edition: "2014", url: `${BASE}/2014/en/5e-SRD-Monsters.json` },
  { edition: "2024", url: `${BASE}/2024/en/5e-SRD-Monsters.json` },
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function crString(cr) {
  if (cr === 0.125) return "1/8";
  if (cr === 0.25) return "1/4";
  if (cr === 0.5) return "1/2";
  return String(cr);
}

function acString(list) {
  if (!list?.length) return "";
  const first = list[0];
  let note = "";
  if (first.type === "natural") note = "natural armor";
  else if (first.type === "armor" || first.armor) note = (first.armor ?? []).map((a) => a.name.toLowerCase()).join(", ");
  else if (first.type === "spell") note = first.spell?.name ? `with ${first.spell.name.toLowerCase()}` : "";
  return note ? `${first.value} (${note})` : String(first.value);
}

function speedString(speed) {
  const parts = [];
  if (speed.walk) parts.push(speed.walk);
  for (const k of ["burrow", "climb", "fly", "swim"]) {
    if (speed[k]) parts.push(`${k} ${speed[k]}${k === "fly" && speed.hover ? " (hover)" : ""}`);
  }
  return parts.join(", ");
}

function sensesString(senses) {
  const parts = [];
  for (const k of ["blindsight", "darkvision", "tremorsense", "truesight"]) {
    if (senses[k]) parts.push(`${k} ${senses[k]}`);
  }
  if (senses.passive_perception != null) parts.push(`passive Perception ${senses.passive_perception}`);
  return parts.join(", ");
}

function savesAndSkills(profs) {
  const saves = [], skills = [];
  for (const p of profs ?? []) {
    const name = p.proficiency.name;
    const bonus = p.value >= 0 ? `+${p.value}` : `${p.value}`;
    if (name.startsWith("Saving Throw: ")) saves.push(`${name.slice(14)} ${bonus}`);
    else if (name.startsWith("Skill: ")) skills.push(`${name.slice(7)} ${bonus}`);
  }
  return { saving_throws: saves.join(", "), skills: skills.join(", ") };
}

function usageSuffix(u) {
  if (!u) return "";
  if (u.type === "per day") return ` (${u.times}/Day${u.times_in_lair ? `, or ${u.times_in_lair}/Day in Lair` : ""})`;
  if (u.type === "recharge on roll") return ` (Recharge ${u.min_value}–6)`;
  if (u.type === "recharge after rest") return ` (Recharge after a ${(u.rest_types ?? []).map(cap).join(" or ")} Rest)`;
  return "";
}

const block = (items) => (items ?? []).map((a) => ({ name: `${a.name}${usageSuffix(a.usage)}`, desc: a.desc }));

function convert(m, edition) {
  const type = cap(m.type) + (m.subtype ? ` (${m.subtype})` : "");
  const legendary = block(m.legendary_actions);
  const out = {
    edition,
    name: m.name,
    size: m.size,
    creature_type: type,
    alignment: m.alignment,
    cr: crString(m.challenge_rating),
    ac: acString(m.armor_class),
    hp: m.hit_dice ? `${m.hit_points} (${m.hit_dice})` : String(m.hit_points),
    speed: speedString(m.speed ?? {}),
    ability_str: m.strength, ability_dex: m.dexterity, ability_con: m.constitution,
    ability_int: m.intelligence, ability_wis: m.wisdom, ability_cha: m.charisma,
    ...savesAndSkills(m.proficiencies),
    damage_vulnerabilities: (m.damage_vulnerabilities ?? []).join(", "),
    damage_resistances: (m.damage_resistances ?? []).join(", "),
    damage_immunities: (m.damage_immunities ?? []).join(", "),
    condition_immunities: (m.condition_immunities ?? []).map((c) => c.name.toLowerCase()).join(", "),
    senses: sensesString(m.senses ?? {}),
    languages: m.languages ?? "",
    traits: block(m.special_abilities),
    actions: block(m.actions),
    bonus_actions: block(m.bonus_actions),
    reactions: block(m.reactions),
    legendary_actions: legendary.length ? { per_round: 3, actions: legendary } : null,
    description: m.desc ?? "",
  };
  // Drop empties so the file stays small; the form treats a missing key as blank.
  for (const k of Object.keys(out)) {
    const v = out[k];
    if (v === "" || v === null || (Array.isArray(v) && v.length === 0)) delete out[k];
  }
  return out;
}

const all = [];
for (const { edition, url } of SOURCES) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const list = await res.json();
  for (const m of list) all.push(convert(m, edition));
  console.log(`${edition}: ${list.length} monsters`);
}
all.sort((a, b) => a.name.localeCompare(b.name) || a.edition.localeCompare(b.edition));

const here = dirname(fileURLToPath(import.meta.url));
const dest = join(here, "..", "src", "data", "srdMonsters.json");
writeFileSync(dest, JSON.stringify(all));
console.log(`Wrote ${all.length} monsters to ${dest}`);
