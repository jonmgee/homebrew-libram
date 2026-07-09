import { useRef, useState } from "react";
import { DbEntry } from "../types";
import MarkdownDescription from "./MarkdownDescription";

const s = (v: unknown): string => String(v ?? "");

/** Parse a roll cell like "3", "2-5" or "96–00" into a numeric range. */
function parseRange(cell: string): [number, number] | null {
  const t = cell.trim().replace(/–/g, "-");
  const m = t.match(/^(\d+)\s*-\s*(\d+)$/);
  if (m) {
    let lo = parseInt(m[1]!, 10);
    let hi = parseInt(m[2]!, 10);
    if (hi === 0) hi = 100; // d100 tables often write "00"
    return [lo, hi];
  }
  const single = t.match(/^(\d+)$/);
  if (single) {
    let v = parseInt(single[1]!, 10);
    if (v === 0) v = 100;
    return [v, v];
  }
  return null;
}

export default function TableDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const dt = s(p.die_type);
  const cols = (p.columns as string[]) ?? ["Roll"];
  const rows = (p.rows as string[][]) ?? [];

  const dieSize = parseInt(dt.replace(/^d/i, ""), 10) || null;
  const [rolledRow, setRolledRow] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const rollingRef = useRef(false); // instant re-click guard (state updates lag a frame)

  function landOn(result: number) {
    setLastRoll(result);
    const idx = rows.findIndex((r) => {
      const range = parseRange(r[0] ?? "");
      return range !== null && result >= range[0] && result <= range[1];
    });
    setRolledRow(idx >= 0 ? idx : null);
    setRolling(false);
    rollingRef.current = false;
    if (idx >= 0) {
      rowRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // 2D fallback if the 3D dice can't load (old browser, offline, no WebGL)
  function rollFallback(sides: number) {
    let ticks = 0;
    const interval = setInterval(() => {
      setLastRoll(1 + Math.floor(Math.random() * sides));
      ticks++;
      if (ticks >= 8) {
        clearInterval(interval);
        landOn(1 + Math.floor(Math.random() * sides));
      }
    }, 70);
  }

  async function rollDie() {
    if (!dieSize || !rows.length || rollingRef.current) return;
    rollingRef.current = true;
    setRolling(true);
    setRolledRow(null);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      landOn(1 + Math.floor(Math.random() * dieSize));
      return;
    }
    try {
      const { rollDie3d } = await import("../lib/diceRoller");
      landOn(await rollDie3d(dieSize));
    } catch (err) {
      console.warn("3D dice unavailable, using fallback:", err);
      rollFallback(dieSize); // clears the guard itself when it lands
    }
  }

  return (
    <>
      <h1 className="phb-h1 !text-2xl">{entry.name}</h1>
      {dt && <p className="phb-description mt-1 text-sm">Roll a {dt}</p>}
      {entry.description && (
        <div className="phb-body mt-4 leading-relaxed">
          <MarkdownDescription text={entry.description} />
        </div>
      )}

      {cols.length > 0 && rows.length > 0 && (
        <div className="clear-both mt-6">
          {dieSize && (
            <div className="mb-3 flex items-center gap-3">
              <button
                type="button"
                onClick={rollDie}
                className={`phb-roll-btn ${rolling ? "rolling" : ""}`}
                aria-label={`Roll a ${dt}`}
              >
                <span className="die" aria-hidden="true">&#9856;</span>
                Roll {dt}
              </button>
              {lastRoll !== null && (
                <span className="phb-h2 !text-xl" aria-live="polite">
                  {lastRoll}
                </span>
              )}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="phb-table">
              <thead>
                <tr>
                  {cols.map((c, i) => (
                    <th key={i} className={i === 0 ? "w-16 whitespace-nowrap" : ""}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr
                    key={ri}
                    ref={(el) => { rowRefs.current[ri] = el; }}
                    className={rolledRow === ri ? "rolled" : ""}
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} className={ci === 0 ? "whitespace-nowrap font-bold" : ""}>
                        {ci === 0 ? cell : cell || "—"}
                      </td>
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
