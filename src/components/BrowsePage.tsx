import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getCategory, formatEntryType, type DbEntry } from "../types";
import { entrySummary } from "../lib/entrySummary";
import { getTypesForSubCategory } from "../lib/subcategories";
import StarRating from "./StarRating";

type LoadState = "loading" | "loaded" | "error";
type SortMode = "name" | "rating" | "newest";

/** Types where "the Libram suggests one at random" makes sense for a DM */
const RANDOM_PICK_TYPES = new Set([
  "magic_item",
  "wondrous_item",
  "weapon",
  "armour",
  "scroll",
  "potion",
  "monster",
]);

export default function BrowsePage() {
  const { category, subcategory } = useParams<{ category: string; subcategory?: string }>();
  const location = useLocation();
  const isAll = category === "all" || location.pathname === "/browse/all";

  const cat = isAll ? undefined : getCategory(category ?? "");

  // Build heading and back link
  let heading = "";
  let backTo: string;
  let backLabel: string;

  if (isAll) {
    heading = "All Entries";
    backTo = "/";
    backLabel = "Home";
  } else if (subcategory) {
    const subLabel = subcategory.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    heading = subLabel;
    backTo = `/browse/${category}`;
    backLabel = cat?.label ?? "Category";
  } else {
    heading = cat?.label ?? "Unknown Category";
    backTo = "/";
    backLabel = "Home";
  }

  const [entries, setEntries] = useState<DbEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");
  const [hideDmOnly, setHideDmOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function fetchEntries() {
      setLoadState("loading");
      setErrorMsg("");

      try {
        let query = supabase
          .from("entries")
          .select("*")
          .order("name", { ascending: true });

        if (isAll) {
          // no filter — all entries
        } else if (subcategory && cat) {
          const types = getTypesForSubCategory(cat.slug, subcategory);
          query = query.in("type", types);
        } else if (cat) {
          query = query.in("type", cat.types);
        }

        const { data, error } = await query;

        if (cancelled) return;

        if (error) {
          console.error("Supabase fetch error:", error);
          setErrorMsg(error.message);
          setLoadState("error");
          return;
        }

        setEntries((data ?? []) as DbEntry[]);
        setLoadState("loaded");
      } catch (err) {
        if (cancelled) return;
        console.error("Unexpected fetch error:", err);
        setErrorMsg("Failed to load entries");
        setLoadState("error");
      }
    }

    fetchEntries();

    return () => {
      cancelled = true;
    };
  }, [category, subcategory, isAll, cat]);

  // ───── filtered view ─────
  const filtered = useMemo(() => {
    let result = entries;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      );
    }

    if (hideDmOnly) {
      result = result.filter((e) => !e.dm_only);
    }

    if (sortMode === "rating") {
      result = [...result].sort(
        (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name),
      );
    } else if (sortMode === "newest") {
      result = [...result].sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    // "name" keeps the alphabetical order the query returned

    return result;
  }, [entries, search, hideDmOnly, sortMode]);

  const randomCandidates = useMemo(
    () => filtered.filter((e) => RANDOM_PICK_TYPES.has(e.type)),
    [filtered],
  );

  function pickRandom() {
    if (!randomCandidates.length) return;
    const pick = randomCandidates[Math.floor(Math.random() * randomCandidates.length)]!;
    navigate(`/entry/${pick.id}?from=${encodeURIComponent(location.pathname + location.search)}`);
  }

  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      setDeleteError(error.message);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirmId(null);
    setDeleteError(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 text-center">
        <Link to={backTo} className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; {backLabel}</Link>
        <h1 className="phb-h1 !text-3xl text-[#58180d]">{heading}</h1>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or description…"
          className="parchment-input min-w-0 flex-1 rounded-lg px-4 py-2 text-sm"
        />

        <label className="flex cursor-pointer items-center gap-2 phb-description text-sm text-ink-light">
          <input
            type="checkbox"
            checked={hideDmOnly}
            onChange={(e) => setHideDmOnly(e.target.checked)}
            className="size-4 rounded border-parchment-dark bg-parchment-light text-crimson accent-crimson focus:ring-1 focus:ring-gilding focus:ring-offset-0"
          />
          Hide DM-only
        </label>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex overflow-hidden rounded-lg border border-parchment-dark"
          role="group"
          aria-label="Sort entries"
        >
          {([
            ["name", "A–Z"],
            ["rating", "★ Rating"],
            ["newest", "Newest"],
          ] as [SortMode, string][]).map(([mode, lbl]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSortMode(mode)}
              aria-pressed={sortMode === mode}
              className={`phb-small-sc cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                sortMode === mode
                  ? "bg-[var(--color-header)] text-[var(--color-parchment-light)]"
                  : "bg-parchment-light text-caption hover:text-[var(--color-header)]"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        {randomCandidates.length > 0 && (
          <button type="button" onClick={pickRandom} className="phb-roll-btn !text-sm !py-1.5">
            <span aria-hidden="true">&#9860;</span>
            Pick Random
          </button>
        )}
      </div>

      {loadState === "loading" && (
        <p className="phb-description py-12 text-center">
          Loading entries…
        </p>
      )}

      {loadState === "error" && (
        <div className="rounded-lg border border-crimson bg-crimson/10 px-4 py-3 phb-body text-sm text-crimson">
          {errorMsg}
        </div>
      )}

      {deleteError && (
        <div className="mb-4 rounded-lg border border-crimson bg-crimson/10 px-4 py-3 phb-body text-sm text-crimson">
          Failed to delete: {deleteError}
          <button
            onClick={() => setDeleteError(null)}
            className="ml-2 phb-small-sc text-xs font-bold underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {loadState === "loaded" && (
        <>
          {filtered.length === 0 ? (
            <p className="phb-description py-12 text-center">
              {search.trim()
                ? "No entries match your search."
                : "No entries yet in this category."}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((entry) => {
                const detailPath = `/entry/${entry.id}?from=${encodeURIComponent(location.pathname + location.search)}`;
                return (
                  <div
                    key={entry.id}
                    className={`parchment-card px-4 py-3 ${
                      entry.dm_only ? "border-l-4 border-l-crimson" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        to={detailPath}
                        className="min-w-0 flex-1 no-underline"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {(entry.properties?.image_url as string | undefined) && (
                            <img
                              src={entry.properties.image_url as string}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded border border-parchment-dark object-cover shadow-sm"
                            />
                          )}
                          <h3 className="phb-h3 !border-none !mb-0 !pb-0 !text-base">
                            {entry.name}
                          </h3>
                          <StarRating value={entry.rating} size="sm" />
                          {entry.dm_only && (
                            <span className="dm-stamp shrink-0">DM</span>
                          )}
                          {isAll && (
                            <span className="wax-seal shrink-0">
                              {formatEntryType(entry.type)}
                            </span>
                          )}
                        </div>
                        <p className="phb-description mt-1 text-sm line-clamp-1">
                          {entrySummary(entry) || "\u2014"}
                        </p>
                      </Link>
                      <div className="mt-0.5 flex shrink-0 items-center gap-1">
                        {deleteConfirmId === entry.id ? (
                          <div className="flex items-center gap-1">
                            <span className="phb-small-sc text-xs text-crimson">
                              Delete?
                            </span>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="cursor-pointer rounded-md border border-crimson bg-crimson px-2 py-1 text-xs font-bold text-parchment-light transition-colors hover:bg-crimson-light"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="cursor-pointer rounded-md border border-parchment-dark bg-parchment-dark px-2 py-1 text-xs font-bold text-ink transition-colors hover:bg-parchment"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <Link
                              to={`/entry/${entry.id}/edit`}
                              className="quiet-action"
                              title="Edit entry"
                              aria-label={`Edit ${entry.name}`}
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                                <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => setDeleteConfirmId(entry.id)}
                              className="quiet-action danger"
                              title="Delete entry"
                              aria-label={`Delete ${entry.name}`}
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                                <path fillRule="evenodd" d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 1 0 0-2h-3.382l-.724-1.447A1 1 0 0 0 11 2H9ZM7 8a1 1 0 0 1 2 0v6a1 1 0 1 1-2 0V8Zm5-1a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="phb-description mt-4 text-center text-xs">
            {filtered.length} of {entries.length} entr{entries.length === 1 ? "y" : "ies"}
          </p>
        </>
      )}
    </div>
  );
}