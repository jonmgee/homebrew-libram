import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { supabase } from "../lib/supabase";
import { formatEntryType, type DbEntry } from "../types";
import SpellDetail from "./SpellDetail";
import MonsterDetail from "./MonsterDetail";
import SubclassDetail from "./SubclassDetail";
import TableDetail from "./TableDetail";

type LoadState = "loading" | "loaded" | "error" | "not_found";

const SH = "phb-small-sc block text-sm font-bold uppercase tracking-wider text-caption mb-1";

function MarkdownDescription({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function renderTags(tags: string[]) {
  if (!tags || !tags.length) return null;
  return <div className="mt-4 flex flex-wrap gap-1.5">{tags.map(t => <span key={t} className="phb-tag">{t}</span>)}</div>;
}

function renderMeta(entry: DbEntry) {
  const p: React.ReactNode[] = [];
  if (entry.source) p.push(<span key="s" className="phb-description text-sm">Source: {entry.source}</span>);
  if (entry.campaign) p.push(<span key="c" className="phb-description text-sm">Campaign: {entry.campaign}</span>);
  if (!p.length) return null;
  return <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1 border-t border-parchment-dark pt-4">{p}</div>;
}

function renderDmBadge(dmOnly: boolean) {
  return dmOnly ? <span className="dm-stamp ml-3 align-middle">DM</span> : null;
}

/* ─── Treasure renderers (inline, unchanged from original) ─── */

function MagicItemDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const r = (p.rarity as string) ?? "";
  const sub = (p.item_subtype as string) ?? "";
  const att = p.requires_attunement as boolean | undefined;
  const ch = p.charges as number | undefined;
  return (
    <><h1 className="phb-h1 !text-2xl">{entry.name}{renderDmBadge(entry.dm_only)}</h1>
      <p className="phb-description mt-1 text-base">{[r, sub].filter(Boolean).join(", ")}{att && <span className="ml-1 not-italic">(requires attunement)</span>}</p>
      {ch !== undefined && ch > 0 && <p className="phb-description mt-1 text-sm">Charges: {ch}</p>}
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} /></div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function WeaponDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const dd = (p.damage_dice as string) ?? "";
  const dt = (p.damage_type as string) ?? "";
  const bonus = (p.bonus as string) ?? "+0";
  const props = (p.properties as string) ?? "";
  const cost = (p.cost as string) ?? "";
  const w = p.weight as number | undefined;
  return (
    <><h1 className="phb-h1 !text-2xl">{entry.name}{renderDmBadge(entry.dm_only)}</h1>
      <p className="phb-body mt-1 text-base"><span className="font-semibold">{dd}</span>{dt && <span className="text-ink-light"> {dt}</span>}{bonus !== "+0" && <span className="text-ink-light"> ({bonus})</span>}</p>
      {props && <p className="phb-description mt-1 text-sm">{props}</p>}
      {(cost || w !== undefined) && <div className="phb-description mt-2 flex gap-4 text-sm">{cost && <span>Cost: {cost}</span>}{w !== undefined && <span>Weight: {w} lb</span>}</div>}
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} /></div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function ArmourDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const at = (p.armour_type as string) ?? "";
  const bonus = (p.bonus as string) ?? "+0";
  const stealth = p.stealth_disadvantage as boolean | undefined;
  const cost = (p.cost as string) ?? "";
  const w = p.weight as number | undefined;
  return (
    <><h1 className="phb-h1 !text-2xl">{entry.name}{renderDmBadge(entry.dm_only)}</h1>
      <p className="phb-body mt-1 text-base"><span className="font-semibold capitalize">{at}</span>{bonus !== "+0" && <span className="text-ink-light"> ({bonus})</span>}{stealth && <span className="ml-2 phb-description text-sm">&mdash; Disadvantage on Stealth</span>}</p>
      {(cost || w !== undefined) && <div className="phb-description mt-2 flex gap-4 text-sm">{cost && <span>Cost: {cost}</span>}{w !== undefined && <span>Weight: {w} lb</span>}</div>}
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} /></div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function PotionDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const r = (p.rarity as string) ?? "";
  const eff = (p.effect as string) ?? "";
  const dur = (p.duration as string) ?? "";
  return (
    <><h1 className="phb-h1 !text-2xl">{entry.name}{renderDmBadge(entry.dm_only)}</h1>
      {r && <p className="phb-description mt-1 text-base">{r}</p>}
      {eff && <div className="phb-body mt-4"><span className={SH}>Effect</span><p className="mt-1 text-base leading-relaxed">{eff}</p></div>}
      {dur && <p className="phb-description mt-2 text-sm">Duration: {dur}</p>}
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} /></div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function AdventuringGearDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const gc = (p.gear_category as string) ?? "";
  const qty = (p.quantity as number | undefined) ?? 1;
  const cost = (p.cost as string) ?? "";
  const w = p.weight as number | undefined;
  const props = (p.properties as string) ?? "";
  return (
    <><h1 className="phb-h1 !text-2xl">{entry.name}{renderDmBadge(entry.dm_only)}</h1>
      {gc && <p className="phb-description mt-1 text-base capitalize">{gc}</p>}
      {(cost || w !== undefined || qty > 1) && <div className="phb-description mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">{cost && <span>Cost: {cost}</span>}{w !== undefined && <span>Weight: {w} lb</span>}{qty > 1 && <span>Quantity: {qty}</span>}</div>}
      {props && <p className="phb-description mt-2 text-sm">{props}</p>}
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} /></div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function TrinketDetail({ entry }: { entry: DbEntry }) {
  return (
    <><h1 className="phb-h1 !text-2xl">{entry.name}{renderDmBadge(entry.dm_only)}</h1>
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} /></div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function SimpleDetail({ entry }: { entry: DbEntry }) {
  return (
    <><h1 className="phb-h1 !text-2xl">{entry.name}{renderDmBadge(entry.dm_only)}</h1>
      <p className="phb-description mt-1 text-sm">{formatEntryType(entry.type)}</p>
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} /></div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

/* ─── Type lookup ─── */

const RENDERERS: Record<string, React.FC<{ entry: DbEntry }>> = {
  magic_item: MagicItemDetail,
  weapon: WeaponDetail,
  armour: ArmourDetail,
  potion: PotionDetail,
  adventuring_gear: AdventuringGearDetail,
  trinket: TrinketDetail,
  npc: SimpleDetail,
  background: SimpleDetail,
  feat: SimpleDetail,
  spell: SpellDetail,
  scroll: SpellDetail,
  monster: MonsterDetail,
  subclass: SubclassDetail,
  table: TableDetail,
};

function EntryImage({ entry }: { entry: DbEntry }) {
  const imageUrl = (entry.properties?.image_url as string | undefined);
  if (!imageUrl) {
    return (
      <div className="float-right ml-6 mb-4 flex h-[250px] w-[200px] shrink-0 items-center justify-center border border-parchment-dark bg-parchment-dark/20">
        <span className="phb-description px-2 text-center text-[0.6rem] leading-tight">Entry illustration placeholder</span>
      </div>
    );
  }
  return (
    <img
      src={imageUrl}
      alt={entry.name}
      className="float-right ml-6 mb-4 max-h-[300px] w-auto max-w-[220px] shrink-0 rounded-lg border border-parchment-dark shadow-sm object-contain"
    />
  );
}

/* ─── Main component ─── */

export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sp] = useSearchParams();
  const from = sp.get("from") ?? "/browse/all";
  const [entry, setEntry] = useState<DbEntry | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!id) { setLoadState("not_found"); return; }
    let cancelled = false;
    (async () => {
      setLoadState("loading"); setErrMsg("");
      try {
        const { data, error } = await supabase.from("entries").select("*").eq("id", id).single();
        if (cancelled) return;
        if (error) {
          if (error.code === "PGRST116") setLoadState("not_found");
          else { setErrMsg(error.message); setLoadState("error"); }
          return;
        }
        setEntry(data as DbEntry); setLoadState("loaded");
      } catch (e) {
        if (cancelled) return;
        setErrMsg("Failed to load entry"); setLoadState("error");
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleDelete() {
    if (!id) return;
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) {
      setDeleteError(error.message);
      return;
    }
    navigate(from, { replace: true });
  }

  const showSaved = sp.get("saved") === "1";
  const showUpdated = sp.get("updated") === "1";

  // Auto-dismiss saved/updated indicator after 4 seconds
  useEffect(() => {
    if (showSaved || showUpdated) {
      const param = showUpdated ? "updated" : "saved";
      const t = setTimeout(() => {
        const u = new URL(window.location.href);
        u.searchParams.delete(param);
        window.history.replaceState({}, "", u.toString());
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [showSaved, showUpdated]);

  if (loadState === "loading") return <div className="mx-auto max-w-4xl px-4 py-12"><p className="phb-description text-center">Loading entry\u2026</p></div>;

  if (loadState === "error") return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link to={from} className="phb-small-sc text-sm font-bold text-crimson underline underline-offset-4 hover:text-crimson-light">&larr; Back</Link>
      <div className="mt-6 rounded-lg border border-crimson bg-crimson/10 px-4 py-3 phb-body text-sm text-crimson">{errMsg}</div>
    </div>
  );

  if (loadState === "not_found" || !entry) return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link to={from} className="phb-small-sc text-sm font-bold text-crimson underline underline-offset-4 hover:text-crimson-light">&larr; Back</Link>
      <div className="mt-6 text-center"><h1 className="phb-h1 !text-2xl">Entry Not Found</h1><p className="phb-description mt-2">This entry may have been deleted.</p></div>
    </div>
  );

  const C = RENDERERS[entry.type] ?? SimpleDetail;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link to={from} className="phb-small-sc text-sm font-bold text-crimson underline underline-offset-4 hover:text-crimson-light">&larr; Back</Link>
      {showSaved && (
        <div className="mt-4 rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-sm text-green-800 text-center">
          Entry saved successfully!
        </div>
      )}
      {showUpdated && (
        <div className="mt-4 rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-sm text-green-800 text-center">
          Entry updated successfully!
        </div>
      )}
      <div className="parchment-card gilded-border mt-4 p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-end gap-2">
          <Link
            to={`/entry/${id}/edit`}
            className="rounded-lg border border-[var(--color-gilding-dark)] bg-[#58180d] px-4 py-1.5 text-xs font-bold text-[#eee5ce] transition-colors hover:bg-[#6e2a1a]"
          >
            Edit Entry
          </Link>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="rounded-lg border border-crimson bg-crimson px-4 py-1.5 text-xs font-bold text-parchment-light transition-colors hover:bg-crimson-light"
          >
            Delete
          </button>
        </div>
        {deleteConfirm && (
          <div className="mb-4 rounded-lg border border-crimson bg-crimson/10 px-4 py-3 text-sm">
            <p className="phb-body text-crimson">Are you sure? This cannot be undone.</p>
            {deleteError && <p className="mt-1 text-xs text-crimson">{deleteError}</p>}
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleDelete}
                className="rounded-lg border border-crimson bg-crimson px-3 py-1 text-xs font-bold text-parchment-light transition-colors hover:bg-crimson-light"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteError(null); }}
                className="rounded-lg border border-[var(--color-gilding-dark)] bg-parchment-dark px-3 py-1 text-xs font-bold text-ink transition-colors hover:bg-parchment"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="overflow-hidden">
          <EntryImage entry={entry} />
          <C entry={entry} />
        </div>
      </div>
    </div>
  );
}
