import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getCategory, formatEntryType, type DbEntry } from "../types";
import { entrySummary } from "../lib/entrySummary";

type LoadState = "loading" | "loaded" | "error";

export default function BrowsePage() {
  const { category } = useParams<{ category: string }>();
  const isAll = category === "all";

  const cat = isAll ? undefined : getCategory(category ?? "");
  const heading = isAll ? "All Entries" : cat?.label ?? "Unknown Category";

  const [entries, setEntries] = useState<DbEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // search
  const [search, setSearch] = useState("");
  // DM-only filter — default: show everything
  const [hideDmOnly, setHideDmOnly] = useState(false);

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

        if (!isAll && cat) {
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
  }, [category, isAll, cat]);

  // ───── filtered view ─────
  const filtered = useMemo(() => {
    let result = entries;

    // search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      );
    }

    // DM-only filter
    if (hideDmOnly) {
      result = result.filter((e) => !e.dm_only);
    }

    return result;
  }, [entries, search, hideDmOnly]);

  // ───── render ─────
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* back + heading */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/"
          className="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
        >
          &larr; Home
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">{heading}</h1>
      </div>

      {/* search + filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or description…"
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

      {/* results */}
      {loadState === "loading" && (
        <p className="py-12 text-center text-zinc-500">Loading entries…</p>
      )}

      {loadState === "error" && (
        <div className="rounded-lg border border-red-700 bg-red-900/50 px-4 py-3 text-sm text-red-300">
          {errorMsg}
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
                    entry.dm_only
                      ? "border-amber-800/40"
                      : "border-zinc-800"
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
                        {entrySummary(entry) || "—"}
                      </p>
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