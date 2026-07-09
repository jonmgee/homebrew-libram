import { DbEntry } from "../types";
import MarkdownDescription from "./MarkdownDescription";

const s = (v: unknown) => String(v ?? "");
const b = (v: unknown) => v as boolean | undefined;

function SpellStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="phb-body text-sm leading-snug">
      <span className="font-bold">{label}:</span> {children}
    </p>
  );
}

export default function SpellDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const lvl = s(p.level);
  const school = s(p.school);
  const ct = s(p.casting_time);
  const rng = s(p.range);
  const comps = (p.components as string[]) ?? [];
  const mat = s(p.material);
  const dur = s(p.duration);
  const conc = b(p.concentration);
  const ritual = b(p.ritual);
  const classes = s(p.classes);
  const rarity = s(p.rarity);
  const isScroll = entry.type === "scroll";

  // "5" → "5th-level", "cantrip"/"0" → school-first cantrip line
  const isCantrip = lvl === "0" || /cantrip/i.test(lvl);
  const ordinal =
    lvl && /^\d+$/.test(lvl) && !isCantrip
      ? lvl + (["st", "nd", "rd"][parseInt(lvl) - 1] ?? "th")
      : "";
  const schoolCap = school ? school.charAt(0).toUpperCase() + school.slice(1) : "";
  let levelLine = "";
  if (isCantrip && school) levelLine = `${schoolCap} cantrip`;
  else if (ordinal && school) levelLine = `${ordinal}-level ${school}`;
  else levelLine = [lvl, school].filter(Boolean).join(" ");
  if (ritual) levelLine += " (ritual)";

  return (
    <>
      <h1 className="phb-h1 !text-2xl">{entry.name}</h1>
      <p className="phb-description mt-0.5 text-sm !italic">
        {isScroll && rarity && <span className="capitalize">{rarity} spell scroll &middot; </span>}
        {levelLine}
      </p>

      <div className="mt-3 space-y-0.5">
        {ct && <SpellStat label="Casting Time">{ct}</SpellStat>}
        {rng && <SpellStat label="Range">{rng}</SpellStat>}
        {comps.length > 0 && (
          <SpellStat label="Components">
            {comps.join(", ")}
            {mat && <span className="text-ink-light"> ({mat})</span>}
          </SpellStat>
        )}
        {dur && (
          <SpellStat label="Duration">
            {conc ? `Concentration, up to ${dur.replace(/^concentration,?\s*(up to\s*)?/i, "")}` : dur}
          </SpellStat>
        )}
      </div>

      <hr className="phb-taper-rule !my-3" />

      {entry.description && (
        <div className="phb-body mt-3 leading-relaxed">
          <MarkdownDescription text={entry.description} />
        </div>
      )}

      {classes && (
        <p className="phb-description mt-4 text-sm">
          <span className="font-semibold not-italic">Classes:</span> {classes}
        </p>
      )}

      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {entry.tags.map(t => <span key={t} className="phb-tag">{t}</span>)}
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
