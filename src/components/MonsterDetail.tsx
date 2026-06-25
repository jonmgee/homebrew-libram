import { DbEntry } from "../types";

const SH = "phb-small-sc block text-sm font-bold uppercase tracking-wider text-caption mb-1";
const s = (v: unknown): string => String(v ?? "");
const n = (v: unknown, d = 10): number => typeof v === "number" ? v : d;

function modStr(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? "+" + m : "" + m;
}

function AbBox({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center rounded border border-parchment-dark bg-parchment-dark/20 px-2 py-1.5">
      <span className="phb-small-sc text-[0.55rem] font-bold uppercase tracking-widest text-caption">{label}</span>
      <span className="phb-body text-lg font-bold leading-tight">{score}</span>
      <span className="text-[0.65rem] text-ink-light">({modStr(score)})</span>
    </div>
  );
}

function NamedItems({ label, items }: { label: string; items: unknown[] | null | undefined }) {
  if (!items || !items.length) return null;
  return (
    <div className="mt-4">
      <span className={SH}>{label}</span>
      <div className="space-y-2">
        {(items as Record<string, unknown>[]).map((item, i) => {
          const name = s(item.name);
          const desc = s(item.desc);
          if (!name && !desc) return null;
          return (
            <div key={i} className="phb-body text-sm leading-relaxed">
              {name && <span className="font-bold italic">{name}.</span>} {desc}
            </div>
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
  return (
    <div className="mt-4">
      <span className={SH}>Spellcasting</span>
      <p className="phb-body text-sm leading-relaxed mt-1">
        Spellcasting Ability: {abil}
        {(dc || atk) && <> &middot; Save DC {dc}{atk ? " &middot; Attack +" + atk : ""}</>}
      </p>
      {spells && <p className="phb-body text-sm mt-1 whitespace-pre-line">{spells}</p>}
    </div>
  );
}

function renderTag(label: string, val: string) {
  if (!val) return null;
  return <p className="phb-body text-sm"><strong>{label}</strong> {val}</p>;
}

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
  const typeLine = [size, ctype, align].filter(Boolean).join(" ");

  const snl = [senses, langs].filter(Boolean);
  const dmg = [dVuln, dRes, dImm, cImm].filter(Boolean);

  return (
    <>
      <h1 className="phb-h1 !text-2xl">{entry.name}</h1>
      {typeLine && <p className="phb-description mt-1 text-sm italic">{typeLine}</p>}

      <div className="mt-3 rounded border border-parchment-dark bg-parchment-dark/10 p-3 space-y-0.5">
        {renderTag("Challenge", cr)}
        {renderTag("Armour Class", ac)}
        {renderTag("Hit Points", hp)}
        {renderTag("Speed", speed)}
      </div>

      <div className="mt-4 grid grid-cols-6 gap-1.5">
        <AbBox label="STR" score={ability[0]!} />
        <AbBox label="DEX" score={ability[1]!} />
        <AbBox label="CON" score={ability[2]!} />
        <AbBox label="INT" score={ability[3]!} />
        <AbBox label="WIS" score={ability[4]!} />
        <AbBox label="CHA" score={ability[5]!} />
      </div>

      {(saves || skills) && (
        <div className="mt-3 space-y-1">
          {renderTag("Saving Throws", saves)}
          {renderTag("Skills", skills)}
        </div>
      )}

      {dmg.length > 0 && (
        <div className="mt-3 space-y-1">
          {renderTag("Damage Vulnerabilities", dVuln)}
          {renderTag("Damage Resistances", dRes)}
          {renderTag("Damage Immunities", dImm)}
          {renderTag("Condition Immunities", cImm)}
        </div>
      )}

      {snl.length > 0 && (
        <div className="mt-3 space-y-1">
          {renderTag("Senses", senses)}
          {renderTag("Languages", langs)}
        </div>
      )}

      {entry.description && (
        <div className="phb-body mt-4 leading-relaxed whitespace-pre-line">{entry.description}</div>
      )}

      <NamedItems label="Traits" items={traits} />
      <SpellSection sc={sc} />
      <NamedItems label="Actions" items={actions} />
      <NamedItems label="Bonus Actions" items={bonusActions} />
      <NamedItems label="Reactions" items={reactions} />
      <NamedItems label="Legendary Actions" items={(ld?.actions as unknown[]) ?? null} />
      <NamedItems label="Lair Actions" items={lair} />
    </>
  );
}
