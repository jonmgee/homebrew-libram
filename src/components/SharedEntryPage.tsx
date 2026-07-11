import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { copyEntryToMyLibram } from "../lib/copyEntry";
import { useAuth } from "../context/AuthContext";
import type { DbEntry } from "../types";
import { RENDERERS, EntryImage } from "./EntryDetailPage";
import SharedHeader from "./SharedHeader";

type LoadState = "loading" | "loaded" | "not_found" | "error";

export function CopyToLibramButton({ entry }: { entry: DbEntry }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="phb-description text-sm">
        Keep a libram of your own?{" "}
        <Link to="/login" className="font-semibold text-[var(--color-header)] underline underline-offset-2">
          Sign in
        </Link>{" "}
        to copy this entry into it.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={copying}
        onClick={async () => {
          setCopying(true);
          setError(null);
          try {
            const newId = await copyEntryToMyLibram(entry);
            navigate(`/entry/${newId}?saved=1`);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Copy failed");
            setCopying(false);
          }
        }}
        className="phb-roll-btn !text-sm !py-1.5"
      >
        {copying ? "Copying…" : "Copy to my Libram"}
      </button>
      {error && <span className="phb-body text-sm text-crimson">{error}</span>}
    </div>
  );
}

export default function SharedEntryPage() {
  const { token } = useParams<{ token: string }>();
  const [entry, setEntry] = useState<DbEntry | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    if (!token) { setLoadState("not_found"); return; }
    let cancelled = false;
    (async () => {
      setLoadState("loading");
      const { data, error } = await supabase.rpc("get_shared_entry", { p_token: token });
      if (cancelled) return;
      if (error) { setLoadState("error"); return; }
      const row = (data as DbEntry[] | null)?.[0];
      if (!row) { setLoadState("not_found"); return; }
      setEntry(row);
      setLoadState("loaded");
    })();
    return () => { cancelled = true; };
  }, [token]);

  const C = entry ? RENDERERS[entry.type] ?? null : null;

  return (
    <>
      <SharedHeader subtitle="A page shared from someone's homebrew collection" />
      <div className="mx-auto max-w-4xl px-4 py-8">
        {loadState === "loading" && (
          <p className="phb-description py-16 text-center">Unrolling the scroll…</p>
        )}
        {loadState === "error" && (
          <p className="phb-description py-16 text-center">
            The Libram could not be reached. Try again in a moment.
          </p>
        )}
        {loadState === "not_found" && (
          <div className="py-16 text-center">
            <h1 className="phb-h1 !text-2xl">This page has been reclaimed</h1>
            <p className="phb-description mt-2">
              The share link is invalid, or its owner has stopped sharing it.
            </p>
          </div>
        )}
        {loadState === "loaded" && entry && (
          <>
            <div className="parchment-card gilded-border page-enter p-6 sm:p-8">
              <div className="overflow-hidden">
                <EntryImage entry={entry} />
                {C && <C entry={entry} />}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <CopyToLibramButton entry={entry} />
              <p className="phb-description text-xs">
                Shared read-only from the owner's Homebrew Libram.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
