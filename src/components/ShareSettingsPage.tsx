import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function CopyLinkField({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="parchment-input min-w-0 flex-1 rounded-lg px-3 py-1.5 text-xs"
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* the field is selectable as a fallback */
          }
        }}
        className="phb-small-sc cursor-pointer rounded-md border border-[var(--color-gilding-dark)] bg-[var(--color-header)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-parchment-light)] transition-colors hover:bg-[#6e2a1a]"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}

export default function ShareSettingsPage() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("libram_shares")
        .select("token")
        .eq("user_id", user.id);
      if (cancelled) return;
      if (!error) setToken((data as { token: string }[] | null)?.[0]?.token ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  async function enableSharing() {
    if (!user) return;
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from("libram_shares")
      .insert({ user_id: user.id })
      .select("token")
      .single();
    if (error) setError(error.message);
    else setToken((data as { token: string }).token);
    setBusy(false);
  }

  async function disableSharing() {
    if (!user) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("libram_shares").delete().eq("user_id", user.id);
    if (error) setError(error.message);
    else setToken(null);
    setBusy(false);
  }

  const shareUrl = token ? `${window.location.origin}/share/libram/${token}` : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 text-center">
        <Link to="/" className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; Home</Link>
        <h1 className="phb-h1 !text-3xl">Share Your Libram</h1>
      </div>

      <div className="parchment-card gilded-border p-6">
        <p className="phb-body text-sm leading-relaxed">
          Anyone with your libram link can browse a <strong>read-only</strong> copy of your
          collection — perfect for players or fellow DMs. Entries marked{" "}
          <span className="dm-stamp align-middle">DM</span> are <strong>never</strong> included.
          Visitors with their own account can copy entries into their own libram.
        </p>

        <hr className="phb-hr" />

        {loading ? (
          <p className="phb-description text-sm">Consulting the scribes…</p>
        ) : shareUrl ? (
          <div className="space-y-4">
            <p className="phb-small-sc text-xs font-bold uppercase tracking-wider text-caption">
              Sharing is on — your libram link:
            </p>
            <CopyLinkField url={shareUrl} />
            <button
              type="button"
              disabled={busy}
              onClick={disableSharing}
              className="phb-small-sc cursor-pointer rounded-md border border-crimson px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-crimson transition-colors hover:bg-crimson/5"
            >
              Stop sharing
            </button>
            <p className="phb-description text-xs">
              Stopping invalidates this link everywhere, immediately. Sharing again later
              creates a brand-new link.
            </p>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={enableSharing}
            className="phb-roll-btn"
          >
            {busy ? "Creating link…" : "Create share link"}
          </button>
        )}

        {error && (
          <p className="phb-body mt-4 text-sm text-crimson">{error}</p>
        )}
      </div>
    </div>
  );
}
