import { DbEntry } from "../types";

const s = (v: unknown) => String(v ?? "");
const b = (v: unknown) => v as boolean | undefined;

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
  const rarity = s(p.rarity);
  const isScroll = entry.type === "scroll";

  const ll = lvl && /^\d+$/.test(lvl)
    ? (lvl === "0" ? "Cantrip" : lvl + ["st", "nd", "rd", "th"][Math.min(parseInt(lvl) - 1, 3)])
    : lvl;

  return (
    <>
      <h1 className="phb-h1 !text-2xl">{entry.name}</h1>
      <p className="phb-description mt-1 text-sm">
        {isScroll && rarity && <>{rarity} scroll &middot; </>}
        {ll}{ll && school && " "}{school && <span className="italic">{school}</span>}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        {ct && <><span className="phb-small-sc font-bold uppercase tracking-wider text-caption">Casting Time</span><span className="phb-body">{ct}</span></>}
        {rng && <><span className="phb-small-sc font-bold uppercase tracking-wider text-caption">Range</span><span className="phb-body">{rng}</span></>}
        {comps.length > 0 && (
          <><span className="phb-small-sc font-bold uppercase tracking-wider text-caption">Components</span>
            <span className="phb-body">{comps.join(", ")}{mat && <span className="text-ink-light"> ({mat})</span>}</span>
          </>
        )}
        {dur && <><span className="phb-small-sc font-bold uppercase tracking-wider text-caption">Duration</span><span className="phb-body">{dur}{conc && <span className="ml-1 text-caption">(concentration)</span>}</span></>}
      </div>

      {entry.description && <div className="phb-body mt-4 leading-relaxed whitespace-pre-line">{entry.description}</div>}

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
