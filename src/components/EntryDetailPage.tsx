import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { formatEntryType, type DbEntry } from "../types";
import MarkdownDescription from "./MarkdownDescription";
import StarRating from "./StarRating";
import { CopyLinkField } from "./ShareSettingsPage";
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
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} dropCap /></div>
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
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} dropCap /></div>
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
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} dropCap /></div>
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
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} dropCap /></div>
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
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} dropCap /></div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function TrinketDetail({ entry }: { entry: DbEntry }) {
  return (
    <><h1 className="phb-h1 !text-2xl">{entry.name}{renderDmBadge(entry.dm_only)}</h1>
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} dropCap /></div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function SimpleDetail({ entry }: { entry: DbEntry }) {
  return (
    <><h1 className="phb-h1 !text-2xl">{entry.name}{renderDmBadge(entry.dm_only)}</h1>
      <p className="phb-description mt-1 text-sm">{formatEntryType(entry.type)}</p>
      <div className="phb-body mt-4 leading-relaxed"><MarkdownDescription text={entry.description} dropCap /></div>
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

/* ─── Type lookup ─── */

export const RENDERERS: Record<string, React.FC<{ entry: DbEntry }>> = {
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

export function EntryImage({ entry }: { entry: DbEntry }) {
  const imageUrl = (entry.properties?.image_url as string | undefined);
  if (!imageUrl) return null;
  return (
    <img
      src={imageUrl}
      alt={entry.name}
      className="mx-auto mb-4 block max-h-[300px] w-auto max-w-full rounded-lg border border-parchment-dark object-contain shadow-sm sm:float-right sm:ml-6 sm:mx-0 sm:max-w-[220px]"
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

  const [sharePanel, setSharePanel] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);

  async function handleShareToggle() {
    if (!entry) return;
    if (entry.share_token) { setSharePanel((v) => !v); return; }
    // First share: mint a token
    setShareBusy(true);
    const token = crypto.randomUUID();
    const { error } = await supabase.from("entries").update({ share_token: token }).eq("id", entry.id);
    if (!error) {
      setEntry({ ...entry, share_token: token });
      setSharePanel(true);
    }
    setShareBusy(false);
  }

  async function handleStopSharing() {
    if (!entry) return;
    setShareBusy(true);
    const { error } = await supabase.from("entries").update({ share_token: null }).eq("id", entry.id);
    if (!error) {
      setEntry({ ...entry, share_token: null });
      setSharePanel(false);
    }
    setShareBusy(false);
  }

  async function handleRate(rating: number | null) {
    if (!entry) return;
    const previous = entry.rating ?? null;
    setEntry({ ...entry, rating }); // optimistic
    const { error } = await supabase.from("entries").update({ rating }).eq("id", entry.id);
    if (error) {
      console.error("Failed to save rating:", error);
      setEntry((e) => (e ? { ...e, rating: previous } : e));
    }
  }

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
      {(showSaved || showUpdated) && (
        <div className="phb-note mt-4 text-center">
          <p className="!not-italic py-1">
            ✦ {showUpdated ? "The entry has been amended in the Libram." : "The entry has been inscribed in the Libram."} ✦
          </p>
        </div>
      )}
      <div className="parchment-card gilded-border page-enter mt-4 p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-1.5">
          <StarRating
            value={entry.rating}
            onChange={handleRate}
            label={`Rate ${entry.name}`}
          />
          <div className="flex items-center gap-1.5">
          <button
            onClick={handleShareToggle}
            disabled={shareBusy}
            className={`phb-small-sc cursor-pointer rounded-md border px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
              entry.share_token
                ? "border-[var(--color-gilding-dark)] bg-[var(--color-gilding)]/20 text-[var(--color-gilding-dark)] hover:border-[var(--color-gilding)]"
                : "border-parchment-dark text-caption hover:border-[var(--color-header)] hover:text-[var(--color-header)]"
            }`}
          >
            {entry.share_token ? "Shared ✓" : shareBusy ? "Sharing…" : "Share"}
          </button>
          <Link
            to={`/entry/${id}/edit`}
            className="phb-small-sc rounded-md border border-parchment-dark px-3 py-1 text-xs font-bold uppercase tracking-wider text-caption transition-colors hover:border-[var(--color-header)] hover:text-[var(--color-header)]"
          >
            Edit
          </Link>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="phb-small-sc cursor-pointer rounded-md border border-parchment-dark px-3 py-1 text-xs font-bold uppercase tracking-wider text-caption transition-colors hover:border-crimson hover:bg-crimson/5 hover:text-crimson"
          >
            Delete
          </button>
          </div>
        </div>
        {sharePanel && entry.share_token && (
          <div className="phb-note mb-4">
            <div className="space-y-2 px-1 py-1.5">
              <p className="text-xs font-bold uppercase tracking-wider">
                Anyone with this link can view this entry (read-only):
              </p>
              <CopyLinkField url={`${window.location.origin}/share/${entry.share_token}`} />
              {entry.dm_only && (
                <p className="text-xs italic">
                  Heads up: this is a DM-only entry — sharing the link reveals it to whoever holds it.
                </p>
              )}
              <button
                type="button"
                disabled={shareBusy}
                onClick={handleStopSharing}
                className="phb-small-sc cursor-pointer rounded-md border border-crimson px-3 py-1 text-xs font-bold uppercase tracking-wider text-crimson transition-colors hover:bg-crimson/5"
              >
                Stop sharing
              </button>
            </div>
          </div>
        )}
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
