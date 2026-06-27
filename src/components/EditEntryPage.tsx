import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import EntryForm from "./EntryForm";
import type { DbEntry } from "../types";

type LoadState = "loading" | "loaded" | "error" | "not_found";

export default function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
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

  if (loadState === "loading") return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="phb-description text-center">Loading entry\u2026</p>
    </div>
  );

  if (loadState === "error") return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to={`/entry/${id}`} className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; Back to Entry</Link>
      <div className="mt-6 rounded-lg border border-crimson bg-crimson/10 px-4 py-3 text-sm text-crimson">{errMsg}</div>
    </div>
  );

  if (loadState === "not_found" || !entry) return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/browse/all" className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; Browse</Link>
      <div className="mt-6 text-center">
        <h1 className="phb-h1 !text-3xl">Entry Not Found</h1>
        <p className="phb-description mt-2">This entry may have been deleted.</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 text-center">
        <Link to={`/entry/${id}`} className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; Back to Entry</Link>
        <h1 className="phb-h1 !text-3xl text-[#58180d]">Edit Entry</h1>
      </div>
      <EntryForm entryType={entry.type} initialData={entry} />
    </div>
  );
}