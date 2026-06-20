import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getCategory, formatEntryType, type DbEntry } from "../types";
import { entrySummary } from "../lib/entrySummary";
import { getTypesForSubCategory } from "../lib/subcategories";

type LoadState = "loading" | "loaded" | "error";

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

    return result;
  }, [entries, search, hideDmOnly]);

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
      <div className="mb-6 flex items-center gap-4">
        <Link
          to={backTo}
          className="phb-small-sc text-sm font-bold text-crimson underline underline-offset-4 hover:text-crimson-light"
        >
          &larr; {backLabel}
        </Link>
        <h1 className="phb-h1 !text-2xl">{heading}</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or description\u2026"
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

      {loadState === "loading" && (
        <p className="phb-description py-12 text-center">
          Loading entries\u2026
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
                          <h3 className="phb-h3 !border-none !mb-0 !pb-0 !text-base">
                            {entry.name}
                          </h3>
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
                      <div className="mt-0.5 shrink-0">
                        {deleteConfirmId === entry.id ? (
                          <div className="flex items-center gap-2">
                            <span className="phb-small-sc text-xs text-crimson">
                              Delete?
                            </span>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="rounded bg-crimson px-2 py-1 phb-small-sc text-xs font-bold text-parchment-light hover:bg-crimson-light"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="rounded bg-parchment-dark px-2 py-1 phb-small-sc text-xs font-bold text-ink hover:bg-parchment"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(entry.id)}
                            className="phb-body text-xs italic text-ink-light/40 underline underline-offset-2 hover:text-crimson"
                          >
                            Delete
                          </button>
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