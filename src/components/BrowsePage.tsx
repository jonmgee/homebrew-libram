import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getCategory, formatEntryType, type DbEntry } from "../types";
import { entrySummary } from "../lib/entrySummary";
import { getTypesForSubCategory } from "../lib/subcategories";

type LoadState = "loading" | "loaded" | "error";

export default function BrowsePage() {
  const { category, subcategory } = useParams<{ category: string; subcategory?: string }>();
  const isAll = category === "all";

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
          className="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
        >
          &larr; {backLabel}
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">{heading}</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or description\u2026"
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />

        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={hideDmOnly}
            onChange={(e) => setHideDmOnly(e.target.checked)}
            className="size-4 rounded border-zinc-600 bg-zinc-800 text-amber-600 accent-amber-600 focus:ring-1 focus:ring-amber-500 focus:ring-offset-0"
          />
          Hide DM-only
        </label>
      </div>

      {loadState === "loading" && (
        <p className="py-12 text-center text-zinc-500">Loading entries\u2026</p>
      )}

      {loadState === "error" && (
        <div className="rounded-lg border border-red-700 bg-red-900/50 px-4 py-3 text-sm text-red-300">
          {errorMsg}
        </div>
      )}

      {deleteError && (
        <div className="mb-4 rounded-lg border border-red-700 bg-red-900/50 px-4 py-3 text-sm text-red-300">
          Failed to delete: {deleteError}
          <button
            onClick={() => setDeleteError(null)}
            className="ml-2 underline underline-offset-2 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {loadState === "loaded" && (
        <>
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-zinc-600">
              {search.trim()
                ? "No entries match your search."
                : "No entries yet in this category."}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-lg border bg-zinc-900 px-4 py-3 ${
                    entry.dm_only ? "border-amber-800/40" : "border-zinc-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-medium text-zinc-100">
                        {entry.name}
                        {entry.dm_only && (
                          <span className="ml-2 inline-flex items-center rounded-full border border-amber-600/40 bg-amber-900/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-400">
                            DM
                          </span>
                        )}
                      </h3>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {formatEntryType(entry.type)}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400 line-clamp-1">
                        {entrySummary(entry) || "\u2014"}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {deleteConfirmId === entry.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-400">Delete?</span>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="rounded bg-red-700 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-600"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(entry.id)}
                          className="text-xs text-zinc-600 underline underline-offset-2 hover:text-red-400"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-zinc-600">
            {filtered.length} of {entries.length} entr{entries.length === 1 ? "y" : "ies"}
          </p>
        </>
      )}
    </div>
  );
}