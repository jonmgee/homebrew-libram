import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { formatEntryType, type DbEntry } from "../types";

type LoadState = "loading" | "loaded" | "error" | "not_found";

function renderDescription(text: string) {
  if (!text) return null;
  return (
    <div className="font-fell mt-4 text-base leading-relaxed text-ink whitespace-pre-line">
      {text}
    </div>
  );
}

function renderTags(tags: string[]) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded bg-parchment-dark/40 px-2 py-0.5 font-fell text-xs italic text-ink-light"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function renderMeta(entry: DbEntry) {
  const parts: React.ReactNode[] = [];
  if (entry.source) {
    parts.push(
      <span key="source" className="font-fell text-sm italic text-ink-light">
        Source: {entry.source}
      </span>,
    );
  }
  if (entry.campaign) {
    parts.push(
      <span key="campaign" className="font-fell text-sm italic text-ink-light">
        Campaign: {entry.campaign}
      </span>,
    );
  }
  if (parts.length === 0) return null;
  return (
    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-t border-parchment-dark pt-4">
      {parts}
    </div>
  );
}

function renderDmBadge(dmOnly: boolean) {
  if (!dmOnly) return null;
  return (
    <span className="dm-stamp ml-3 align-middle">DM</span>
  );
}

// ──────────── Type-specific renderers ────────────

function MagicItemDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const rarity = (p.rarity as string) ?? "";
  const subtype = (p.item_subtype as string) ?? "";
  const attunement = p.requires_attunement as boolean | undefined;
  const charges = p.charges as number | undefined;

  return (
    <>
      <h1 className="font-cinzel text-2xl font-bold text-ink">
        {entry.name}
        {renderDmBadge(entry.dm_only)}
      </h1>
      <p className="font-fell mt-1 text-base italic text-ink-light">
        {[rarity, subtype].filter(Boolean).join(", ")}
        {attunement && (
          <span className="ml-1 not-italic">(requires attunement)</span>
        )}
      </p>
      {charges !== undefined && charges > 0 && (
        <p className="font-fell mt-1 text-sm text-ink-light">
          Charges: {charges}
        </p>
      )}
      {renderDescription(entry.description)}
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
  const weight = (p.weight as number | undefined);

  return (
    <>
      <h1 className="font-cinzel text-2xl font-bold text-ink">
        {entry.name}
        {renderDmBadge(entry.dm_only)}
      </h1>
      <p className="font-fell mt-1 text-base text-ink">
        <span className="font-semibold">{dd}</span>
        {dt && <span className="text-ink-light"> {dt}</span>}
        {bonus !== "+0" && <span className="text-ink-light"> ({bonus})</span>}
      </p>
      {props && (
        <p className="font-fell mt-1 text-sm italic text-ink-light">
          {props}
        </p>
      )}
      {(cost || weight !== undefined) && (
        <div className="font-fell mt-2 flex gap-4 text-sm text-ink-light">
          {cost && <span>Cost: {cost}</span>}
          {weight !== undefined && <span>Weight: {weight} lb</span>}
        </div>
      )}
      {renderDescription(entry.description)}
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function ArmourDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const armourType = (p.armour_type as string) ?? "";
  const bonus = (p.bonus as string) ?? "+0";
  const stealth = p.stealth_disadvantage as boolean | undefined;
  const cost = (p.cost as string) ?? "";
  const weight = (p.weight as number | undefined);

  return (
    <>
      <h1 className="font-cinzel text-2xl font-bold text-ink">
        {entry.name}
        {renderDmBadge(entry.dm_only)}
      </h1>
      <p className="font-fell mt-1 text-base text-ink">
        <span className="font-semibold capitalize">{armourType}</span>
        {bonus !== "+0" && <span className="text-ink-light"> ({bonus})</span>}
        {stealth && (
          <span className="ml-2 text-sm italic text-ink-light">
            — Disadvantage on Stealth
          </span>
        )}
      </p>
      {(cost || weight !== undefined) && (
        <div className="font-fell mt-2 flex gap-4 text-sm text-ink-light">
          {cost && <span>Cost: {cost}</span>}
          {weight !== undefined && <span>Weight: {weight} lb</span>}
        </div>
      )}
      {renderDescription(entry.description)}
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function PotionDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const rarity = (p.rarity as string) ?? "";
  const effect = (p.effect as string) ?? "";
  const duration = (p.duration as string) ?? "";

  return (
    <>
      <h1 className="font-cinzel text-2xl font-bold text-ink">
        {entry.name}
        {renderDmBadge(entry.dm_only)}
      </h1>
      {rarity && (
        <p className="font-fell mt-1 text-base italic text-ink-light">
          {rarity}
        </p>
      )}
      {effect && (
        <div className="font-fell mt-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-ink-light">
            Effect
          </span>
          <p className="mt-1 text-base leading-relaxed text-ink">{effect}</p>
        </div>
      )}
      {duration && (
        <p className="font-fell mt-2 text-sm text-ink-light">
          Duration: {duration}
        </p>
      )}
      {renderDescription(entry.description)}
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function AdventuringGearDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const gearCategory = (p.gear_category as string) ?? "";
  const quantity = (p.quantity as number | undefined) ?? 1;
  const cost = (p.cost as string) ?? "";
  const weight = (p.weight as number | undefined);
  const props = (p.properties as string) ?? "";

  return (
    <>
      <h1 className="font-cinzel text-2xl font-bold text-ink">
        {entry.name}
        {renderDmBadge(entry.dm_only)}
      </h1>
      {gearCategory && (
        <p className="font-fell mt-1 text-base italic text-ink-light capitalize">
          {gearCategory}
        </p>
      )}
      {(cost || weight !== undefined || quantity > 1) && (
        <div className="font-fell mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-light">
          {cost && <span>Cost: {cost}</span>}
          {weight !== undefined && <span>Weight: {weight} lb</span>}
          {quantity > 1 && <span>Quantity: {quantity}</span>}
        </div>
      )}
      {props && (
        <p className="font-fell mt-2 text-sm italic text-ink-light">
          {props}
        </p>
      )}
      {renderDescription(entry.description)}
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

function TrinketDetail({ entry }: { entry: DbEntry }) {
  return (
    <>
      <h1 className="font-cinzel text-2xl font-bold text-ink">
        {entry.name}
        {renderDmBadge(entry.dm_only)}
      </h1>
      {renderDescription(entry.description)}
      {renderTags(entry.tags)}
      {renderMeta(entry)}
    </>
  );
}

// ──────────── Main component ────────────

export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") ?? `/browse/all`;

  const [entry, setEntry] = useState<DbEntry | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) {
      setLoadState("not_found");
      return;
    }

    let cancelled = false;

    async function fetchEntry() {
      setLoadState("loading");
      setErrorMsg("");

      try {
        const { data, error } = await supabase
          .from("entries")
          .select("*")
          .eq("id", id)
          .single();

        if (cancelled) return;

        if (error) {
          if (error.code === "PGRST116") {
            setLoadState("not_found");
          } else {
            console.error("Supabase fetch error:", error);
            setErrorMsg(error.message);
            setLoadState("error");
          }
          return;
        }

        setEntry(data as DbEntry);
        setLoadState("loaded");
      } catch (err) {
        if (cancelled) return;
        console.error("Unexpected fetch error:", err);
        setErrorMsg("Failed to load entry");
        setLoadState("error");
      }
    }

    fetchEntry();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ───── Loading state ─────
  if (loadState === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="font-fell text-center italic text-ink-light/60">
          Loading entry…
        </p>
      </div>
    );
  }

  // ───── Error state ─────
  if (loadState === "error") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link
          to={from}
          className="font-cinzel text-sm font-semibold text-crimson underline underline-offset-4 hover:text-crimson-light"
        >
          &larr; Back
        </Link>
        <div className="mt-6 rounded-lg border border-crimson bg-crimson/10 px-4 py-3 font-fell text-sm text-crimson">
          {errorMsg}
        </div>
      </div>
    );
  }

  // ───── Not found ─────
  if (loadState === "not_found" || !entry) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link
          to={from}
          className="font-cinzel text-sm font-semibold text-crimson underline underline-offset-4 hover:text-crimson-light"
        >
          &larr; Back
        </Link>
        <div className="mt-6 text-center">
          <h1 className="font-cinzel text-2xl font-bold text-ink">Entry Not Found</h1>
          <p className="font-fell mt-2 italic text-ink-light">
            This entry may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  // ───── Render by type ─────
  const treasureTypes = new Set([
    "magic_item",
    "weapon",
    "armour",
    "potion",
    "adventuring_gear",
    "trinket",
  ]);

  const typeLabel = formatEntryType(entry.type);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        to={from}
        className="font-cinzel text-sm font-semibold text-crimson underline underline-offset-4 hover:text-crimson-light"
      >
        &larr; Back
      </Link>

      <div className="parchment-card gilded-border mt-4 p-6 sm:p-8">
        {!treasureTypes.has(entry.type) ? (
          <>
            <h1 className="font-cinzel text-2xl font-bold text-ink">
              {entry.name}
              {renderDmBadge(entry.dm_only)}
            </h1>
            <p className="font-fell mt-1 text-sm italic text-ink-light">
              {typeLabel}
            </p>
            {renderDescription(entry.description)}
            {renderTags(entry.tags)}
            {renderMeta(entry)}
          </>
        ) : entry.type === "magic_item" ? (
          <MagicItemDetail entry={entry} />
        ) : entry.type === "weapon" ? (
          <WeaponDetail entry={entry} />
        ) : entry.type === "armour" ? (
          <ArmourDetail entry={entry} />
        ) : entry.type === "potion" ? (
          <PotionDetail entry={entry} />
        ) : entry.type === "adventuring_gear" ? (
          <AdventuringGearDetail entry={entry} />
        ) : entry.type === "trinket" ? (
          <TrinketDetail entry={entry} />
        ) : (
          <>
            <h1 className="font-cinzel text-2xl font-bold text-ink">
              {entry.name}
              {renderDmBadge(entry.dm_only)}
            </h1>
            <p className="font-fell mt-1 text-sm italic text-ink-light">
              {typeLabel}
            </p>
            {renderDescription(entry.description)}
            {renderTags(entry.tags)}
            {renderMeta(entry)}
          </>
        )}
      </div>
    </div>
  );
}