import { DbEntry } from "../types";

const SH = "phb-small-sc block text-sm font-bold uppercase tracking-wider text-caption mb-1";
const s = (v: unknown): string => String(v ?? "");

export default function TableDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const dt = s(p.die_type);
  const cols = (p.columns as string[]) ?? ["Roll"];
  const rows = (p.rows as string[][]) ?? [];

  return (
    <>
      <h1 className="phb-h1 !text-2xl">{entry.name}</h1>
      {dt && <p className="phb-description mt-1 text-sm">Die: {dt}</p>}
      {entry.description && <div className="phb-body mt-4 leading-relaxed whitespace-pre-line">{entry.description}</div>}
      {cols.length > 0 && rows.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <span className={SH}>Table</span>
          <div className="mt-2 w-full">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {cols.map((c, i) => (
                    <th key={i} className="border border-parchment-dark bg-parchment-dark px-3 py-1.5 text-left font-[var(--font-title)] text-xs font-bold uppercase tracking-wider text-caption">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-parchment-dark/10" : ""}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border border-parchment-dark px-3 py-1 phb-body text-sm">{ci === 0 ? cell : cell || "\u2014"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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