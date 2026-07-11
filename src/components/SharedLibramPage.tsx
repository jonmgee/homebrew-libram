import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { formatEntryType, type DbEntry } from "../types";
import { entrySummary } from "../lib/entrySummary";
import { RENDERERS, EntryImage } from "./EntryDetailPage";
import { CopyToLibramButton } from "./SharedEntryPage";
import SharedHeader from "./SharedHeader";

type LoadState = "loading" | "loaded" | "not_found" | "error";

export default function SharedLibramPage() {
  const { token } = useParams<{ token: string }>();
  const [sp, setSp] = useSearchParams();
  const selectedId = sp.get("entry");

  const [entries, setEntries] = useState<DbEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) { setLoadState("not_found"); return; }
    let cancelled = false;
    (async () => {
      setLoadState("loading");
      const { data, error } = await supabase.rpc("get_shared_libram", { p_token: token });
      if (cancelled) return;
      if (error) { setLoadState("error"); return; }
      const rows = (data as DbEntry[] | null) ?? [];
      if (!rows.length) { setLoadState("not_found"); return; }
      setEntries(rows);
      setLoadState("loaded");
    })();
    return () => { cancelled = true; };
  }, [token]);

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.trim().toLowerCase();
    return entries.filter(
      (e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q),
    );
  }, [entries, search]);

  const selected = selectedId ? entries.find((e) => e.id === selectedId) : null;
  const C = selected ? RENDERERS[selected.type] ?? null : null;

  return (
    <>
      <SharedHeader subtitle="A homebrew collection, shared read-only" />
      <div className="mx-auto max-w-4xl px-4 py-8">
        {loadState === "loading" && (
          <p className="phb-description py-16 text-center">Opening the libram…</p>
        )}
        {loadState === "error" && (
          <p className="phb-description py-16 text-center">
            The Libram could not be reached. Try again in a moment.
          </p>
        )}
        {loadState === "not_found" && (
          <div className="py-16 text-center">
            <h1 className="phb-h1 !text-2xl">This libram is closed</h1>
            <p className="phb-description mt-2">
              The share link is invalid, or its owner has stopped sharing.
            </p>
          </div>
        )}

        {loadState === "loaded" && selected && (
          <>
            <button
              type="button"
              onClick={() => { sp.delete("entry"); setSp(sp); }}
              className="phb-small-sc cursor-pointer text-sm font-bold text-crimson underline underline-offset-4 hover:text-crimson-light"
            >
              &larr; Back to the shared libram
            </button>
            <div className="parchment-card gilded-border page-enter mt-4 p-6 sm:p-8">
              <div className="overflow-hidden">
                <EntryImage entry={selected} />
                {C && <C entry={selected} />}
              </div>
            </div>
            <div className="mt-5">
              <CopyToLibramButton entry={selected} />
            </div>
          </>
        )}

        {loadState === "loaded" && !selected && (
          <>
            <div className="mb-6 text-center">
              <h1 className="phb-h1 !text-3xl">A Shared Libram</h1>
              <p className="phb-description mt-1">
                {entries.length} entr{entries.length === 1 ? "y" : "ies"}, shared read-only
              </p>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search this libram…"
              className="parchment-input mb-6 w-full rounded-lg px-4 py-2 text-sm"
            />
            <div className="space-y-2">
              {filtered.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => { sp.set("entry", entry.id); setSp(sp); }}
                  className="parchment-card block w-full cursor-pointer px-4 py-3 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {(entry.properties?.image_url as string | undefined) && (
                      <img
                        src={entry.properties.image_url as string}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded border border-parchment-dark object-cover shadow-sm"
                      />
                    )}
                    <h3 className="phb-h3 !mb-0 !border-none !pb-0 !text-base">{entry.name}</h3>
                    <span className="wax-seal shrink-0">{formatEntryType(entry.type)}</span>
                  </div>
                  <p className="phb-description mt-1 line-clamp-1 text-sm">
                    {entrySummary(entry) || "—"}
                  </p>
                </button>
              ))}
              {!filtered.length && (
                <p className="phb-description py-8 text-center">No entries match your search.</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
