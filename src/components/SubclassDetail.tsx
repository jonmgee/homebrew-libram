import { DbEntry } from "../types";

const SH = "phb-small-sc block text-sm font-bold uppercase tracking-wider text-caption mb-1";
const s = (v: unknown): string => String(v ?? "");

export default function SubclassDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const pc = s(p.parent_class);
  const feats = (p.level_features as { level: number; desc: string }[]) ?? [];

  return (
    <>
      <h1 className="phb-h1 !text-2xl">{entry.name}</h1>
      {pc && <p className="phb-description mt-1 text-sm"><span className="font-semibold">Parent Class:</span> {pc}</p>}
      {entry.description && <div className="phb-body mt-4 leading-relaxed whitespace-pre-line">{entry.description}</div>}
      {feats.length > 0 && (
        <div className="mt-6">
          <span className={SH}>Level Features</span>
          <div className="mt-2 space-y-3">
            {feats.map((f, i) => (
              <div key={i} className="rounded border border-parchment-dark bg-parchment-dark/10 p-3">
                <span className="phb-small-sc text-xs font-bold uppercase tracking-wider text-caption">Level {f.level}</span>
                <p className="phb-body mt-1 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
