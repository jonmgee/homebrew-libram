import { useMemo, useRef, useState } from "react";

/** One SRD stat block, already in the shape MonsterForm saves (see
 *  scripts/srd-monsters.mjs). Only the keys the picker reads are typed. */
export type SrdMonster = Record<string, unknown> & {
  name: string;
  edition: "2014" | "2024";
  cr?: string;
  size?: string;
  creature_type?: string;
};

// ~900 KB of JSON, so it stays out of the main bundle and loads the first
// time someone clicks into the search box.
let cache: Promise<SrdMonster[]> | null = null;
function loadMonsters(): Promise<SrdMonster[]> {
  if (!cache) cache = import("../data/srdMonsters.json").then(m => m.default as SrdMonster[]);
  return cache;
}

const inputCls = "w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] placeholder:text-[#766649] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600";

export function MonsterTemplatePicker({ onPick }: { onPick: (m: SrdMonster) => void }) {
  const [query, setQuery] = useState("");
  const [list, setList] = useState<SrdMonster[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const ensureLoaded = () => {
    if (list || loading) return;
    setLoading(true);
    loadMonsters().then(m => { setList(m); setLoading(false); });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!list || !q) return [];
    return list
      .filter(m => m.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts || a.name.localeCompare(b.name) || a.edition.localeCompare(b.edition);
      })
      .slice(0, 12);
  }, [list, query]);

  const pick = (m: SrdMonster) => {
    onPick(m);
    setQuery("");
    setOpen(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const m = results[active]; if (m) pick(m); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(e.relatedTarget)) setOpen(false);
  };

  const showList = open && query.trim().length > 0;

  return (
    <div ref={ref} onBlur={handleBlur} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true); }}
        onFocus={() => { ensureLoaded(); setOpen(true); }}
        onKeyDown={handleKey}
        placeholder="Search the bestiary… e.g. Goblin, Owlbear, Adult Red Dragon"
        autoComplete="off"
        aria-label="Start from a stock monster"
        className={inputCls}
      />
      {showList && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] shadow-lg">
          {!list ? (
            <p className="px-3 py-2 text-sm italic text-[#766649]">Opening the bestiary…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-sm italic text-[#766649]">Nothing in the SRD by that name. Try a plainer one, or build it from scratch below.</p>
          ) : results.map((m, i) => (
            <button
              key={`${m.edition}-${m.name}`}
              type="button"
              onMouseDown={e => { e.preventDefault(); pick(m); }}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left transition-colors ${i === active ? "bg-[var(--color-parchment-dark)]" : ""}`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-[var(--font-phb)] text-[var(--color-ink)]">{m.name}</span>
                <span className="block truncate text-xs text-[#766649]">
                  {m.cr ? `CR ${m.cr}` : ""}{m.cr && (m.size || m.creature_type) ? " · " : ""}{[m.size, m.creature_type].filter(Boolean).join(" ")}
                </span>
              </span>
              <span className="shrink-0 rounded border border-[var(--color-gilding-dark)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#58180d]">{m.edition}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
