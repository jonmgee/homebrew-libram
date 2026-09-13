import { ABILITY_NAMES, type DbEntry } from "../types";
import MarkdownDescription from "./MarkdownDescription";
import {
  proficiencyBonus,
  readAbilities,
  readAbility,
  readArmor,
  readFeatures,
  readHitDie,
  readResources,
  readSkills,
  skillLabel,
} from "../lib/characterOptions";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Laid out after the 2024 class pages: a core traits table, then the level table, then the features. */
export default function ClassDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const hitDie = readHitDie(p.hit_die);
  const saves = readAbilities(p.saves).map((k) => ABILITY_NAMES[k]);
  const skillOptions = readSkills(p.skill_options).map(skillLabel);
  const skillChoose = Number(p.skill_choose) || 0;
  const armor = readArmor(p.armor_training);
  const spellAbility = readAbility(p.spell_ability);
  const subclassLevel = Number(p.subclass_level) || 0;
  const features = readFeatures(p.features).filter((f) => f.name || f.desc);
  const resources = readResources(p.resources).filter((r) => r.name);

  const armorKinds = [armor.light && "Light", armor.medium && "Medium", armor.heavy && "Heavy"].filter(Boolean) as string[];
  const armorLine = [
    armorKinds.length ? `${listJoin(armorKinds)} armor` : "",
    armor.shields ? "Shields" : "",
  ].filter(Boolean).join(" and ");

  const skillLine = skillChoose
    ? skillOptions.length
      ? `Choose ${skillChoose}: ${skillOptions.join(", ")}`
      : `Choose any ${skillChoose} skill${skillChoose === 1 ? "" : "s"}`
    : "";

  const traits: [string, string][] = [
    ["Primary Ability", str(p.primary_ability)],
    ["Hit Point Die", hitDie ? `D${hitDie} per ${entry.name} level` : ""],
    ["Saving Throw Proficiencies", listJoin(saves)],
    ["Skill Proficiencies", skillLine],
    ["Weapon Proficiencies", str(p.weapon_profs)],
    ["Tool Proficiencies", str(p.tool_profs)],
    ["Armor Training", armorLine || "None"],
    ["Spellcasting Ability", spellAbility ? ABILITY_NAMES[spellAbility] : ""],
    ["Subclass", subclassLevel ? `Chosen at level ${subclassLevel}` : ""],
    ["Starting Equipment", str(p.starting_equipment)],
  ].filter(([, v]) => v) as [string, string][];

  const hasLevelTable = features.length > 0 || resources.length > 0;

  return (
    <>
      <h1 className="phb-h1 !text-2xl">
        {entry.name}
        {entry.dm_only && <span className="dm-stamp ml-3 align-middle">DM</span>}
      </h1>
      <p className="phb-description mt-0.5 text-sm">Class</p>

      {entry.description && (
        <div className="phb-body mt-4 leading-relaxed">
          <MarkdownDescription text={entry.description} dropCap />
        </div>
      )}

      {traits.length > 0 && (
        <div className="clear-both mt-6">
          <h3 className="phb-h3 !text-base">Core {entry.name} Traits</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="phb-table">
              <tbody>
                {traits.map(([label, value]) => (
                  <tr key={label}>
                    <td className="w-[38%] align-top font-bold">{label}</td>
                    <td className="whitespace-pre-line align-top">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasLevelTable && (
        <div className="clear-both mt-6">
          <h3 className="phb-h3 !text-base">{entry.name} Features</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="phb-table">
              <thead>
                <tr>
                  <th className="w-14 !text-center">Level</th>
                  <th className="w-24 !text-center">Prof. Bonus</th>
                  <th>Class Features</th>
                  {resources.map((r) => <th key={r.name} className="!text-center">{r.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) => (
                  <tr key={lvl}>
                    <td className="text-center">{lvl}</td>
                    <td className="text-center">+{proficiencyBonus(lvl)}</td>
                    <td>{features.filter((f) => f.level === lvl).map((f) => f.name || "Feature").join(", ") || "—"}</td>
                    {resources.map((r) => (
                      <td key={r.name} className="text-center">{r.by_level[lvl - 1] || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {features.length > 0 && (
        <div className="mt-6 space-y-4">
          {features.map((f, i) => (
            <div key={i}>
              <h4 className="phb-h3 !text-sm">Level {f.level}: {f.name || "Feature"}</h4>
              {f.desc && (
                <div className="phb-body mt-1 text-sm leading-relaxed">
                  <MarkdownDescription text={f.desc} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(entry.source || entry.campaign) && (
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1 border-t border-parchment-dark pt-4">
          {entry.source && <span className="phb-description text-sm">Source: {entry.source}</span>}
          {entry.campaign && <span className="phb-description text-sm">Campaign: {entry.campaign}</span>}
        </div>
      )}
    </>
  );
}
