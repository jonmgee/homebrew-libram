import { DbEntry } from "../types";
import MarkdownDescription from "./MarkdownDescription";

const s = (v: unknown): string => String(v ?? "");
const n = (v: unknown, d = 10): number => (typeof v === "number" ? v : d);

function modStr(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? "+" + m : "" + m;
}

function StatLine({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p className="phb-stat-line">
      <strong>{label}</strong> {value}
    </p>
  );
}

function NamedItems({ label, items }: { label: string; items: unknown[] | null | undefined }) {
  if (!items || !items.length) return null;
  return (
    <div>
      {label && <h3 className="phb-action-header">{label}</h3>}
      <div>
        {(items as Record<string, unknown>[]).map((item, i) => {
          const name = s(item.name);
          const desc = s(item.desc);
          if (!name && !desc) return null;
          return (
            <p key={i} className="phb-entry">
              {name && <span className="font-bold italic">{name}.</span>} {desc}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function SpellSection({ sc }: { sc: Record<string, unknown> | undefined }) {
  if (!sc) return null;
  const abil = s(sc.ability);
  const dc = s(sc.save_dc);
  const atk = s(sc.attack_bonus);
  const spells = s(sc.spells);
  if (!abil && !dc && !atk && !spells) return null;
  return (
    <div>
      <h3 className="phb-action-header">Spellcasting</h3>
      <p className="phb-entry">
        <span className="font-bold italic">Spellcasting.</span> Ability: {abil}
        {(dc || atk) && (
          <>
            {dc && <> &middot; Save DC {dc}</>}
            {atk && <> &middot; Attack +{atk}</>}
          </>
        )}
      </p>
      {spells && <p className="phb-entry whitespace-pre-line">{spells}</p>}
    </div>
  );
}

const ABILITY_LABELS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;

export default function MonsterDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const cr = s(p.cr);
  const size = s(p.size);
  const ctype = s(p.creature_type);
  const align = s(p.alignment);
  const ac = s(p.ac);
  const hp = s(p.hp);
  const speed = s(p.speed);
  const ability: number[] = [
    n(p.ability_str), n(p.ability_dex), n(p.ability_con),
    n(p.ability_int), n(p.ability_wis), n(p.ability_cha),
  ];
  const saves = s(p.saving_throws);
  const skills = s(p.skills);
  const dVuln = s(p.damage_vulnerabilities);
  const dRes = s(p.damage_resistances);
  const dImm = s(p.damage_immunities);
  const cImm = s(p.condition_immunities);
  const senses = s(p.senses);
  const langs = s(p.languages);
  const traits = (p.traits as unknown[]) ?? null;
  const sc = p.spellcasting as Record<string, unknown> | undefined;
  const actions = (p.actions as unknown[]) ?? null;
  const bonusActions = (p.bonus_actions as unknown[]) ?? null;
  const reactions = (p.reactions as unknown[]) ?? null;
  const ld = p.legendary_actions as Record<string, unknown> | undefined;
  const lair = (p.lair_actions as unknown[]) ?? null;
  const typeLine = [
    [size, ctype].filter(Boolean).join(" "),
    align,
  ].filter(Boolean).join(", ");

  const midLines = [saves, skills, dVuln, dRes, dImm, cImm, senses, langs, cr].some(Boolean);

  return (
    <>
      {/* Flavour text above the stat block, PHB style */}
      {entry.description && (
        <div className="phb-body mb-5 leading-relaxed">
          <MarkdownDescription text={entry.description} dropCap />
        </div>
      )}

      <div className="phb-statblock clear-both">
        <h1 className="phb-statblock-name">{entry.name}</h1>
        {typeLine && <p className="phb-statblock-type">{typeLine}</p>}

        <hr className="phb-taper-rule" />

        <StatLine label="Armour Class" value={ac} />
        <StatLine label="Hit Points" value={hp} />
        <StatLine label="Speed" value={speed} />

        <hr className="phb-taper-rule" />

        <div className="phb-ability-grid py-1">
          {ABILITY_LABELS.map((label, i) => (
            <div key={label}>
              <div className="ab-label">{label}</div>
              <div className="ab-score">
                {ability[i]} ({modStr(ability[i]!)})
              </div>
            </div>
          ))}
        </div>

        <hr className="phb-taper-rule" />

        {midLines && (
          <>
            <StatLine label="Saving Throws" value={saves} />
            <StatLine label="Skills" value={skills} />
            <StatLine label="Damage Vulnerabilities" value={dVuln} />
            <StatLine label="Damage Resistances" value={dRes} />
            <StatLine label="Damage Immunities" value={dImm} />
            <StatLine label="Condition Immunities" value={cImm} />
            <StatLine label="Senses" value={senses} />
            <StatLine label="Languages" value={langs} />
            <StatLine label="Challenge" value={cr} />
            <hr className="phb-taper-rule" />
          </>
        )}

        {traits && traits.length > 0 && (
          <div className="pt-1">
            <NamedItems label="" items={traits} />
          </div>
        )}
        <SpellSection sc={sc} />
        <NamedItems label="Actions" items={actions} />
        <NamedItems label="Bonus Actions" items={bonusActions} />
        <NamedItems label="Reactions" items={reactions} />
        <NamedItems label="Legendary Actions" items={(ld?.actions as unknown[]) ?? null} />
        <NamedItems label="Lair Actions" items={lair} />
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {entry.tags.map((t) => (
            <span key={t} className="phb-tag">{t}</span>
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
