import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { formatEntryType, type DbEntry } from "../types";
import SpellDetail from "./SpellDetail";
import MonsterDetail from "./MonsterDetail";
import SubclassDetail from "./SubclassDetail";
import TableDetail from "./TableDetail";

type LoadState = "loading" | "loaded" | "error" | "not_found";

const SH = "phb-small-sc block text-sm font-bold uppercase tracking-wider text-caption mb-1";

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
      <div className="phb-body mt-4 leading-relaxed whitespace-pre-line">{entry.description}</div>
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
      <div className="phb-body mt-4 leading-relaxed whitespace-pre-line">{entry.description}</div>
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
      <div className="phb-body mt-4 leading-relaxed whitespace-pre-line">{entry.description}</div>
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
      <div className="phb-body mt-4 leading-relaxed whitespace-pre-line">{entry.description}</div>
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
      <div className="phb-body mt-4 leading-relaxed whitespace-pre-line">{entry.description}</div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function TrinketDetail({ entry }: { entry: DbEntry }) {
  return (
    <><h1 className="phb-h1 !text-2xl">{entry.name}{renderDmBadge(entry.dm_only)}</h1>
      <div className="phb-body mt-4 leading-relaxed whitespace-pre-line">{entry.description}</div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function SimpleDetail({ entry }: { entry: DbEntry }) {
  return (
    <><h1 className="phb-h1 !text-2xl">{entry.name}{renderDmBadge(entry.dm_only)}</h1>
      <p className="phb-description mt-1 text-sm">{formatEntryType(entry.type)}</p>
      <div className="phb-body mt-4 leading-relaxed whitespace-pre-line">{entry.description}</div>
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

function PortraitPlaceholder() {
  return (
    <div className="float-right ml-6 mb-4 flex h-[250px] w-[200px] shrink-0 items-center justify-center border border-parchment-dark bg-parchment-dark/20">
      <span className="phb-description px-2 text-center text-[0.6rem] leading-tight">Entry illustration placeholder</span>
    </div>
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
      <div className="parchment-card gilded-border mt-4 p-6 sm:p-8">
        <div className="overflow-hidden">
          <PortraitPlaceholder />
          <C entry={entry} />
        </div>
      </div>
    </div>
  );
}
