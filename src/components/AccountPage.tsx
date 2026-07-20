import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

/**
 * Account settings — password change and account deletion.
 *
 * Both actions span BOTH apps, because Homebrew Libram and PC on Parchment
 * share one Supabase project and therefore one account. That is genuinely
 * surprising, so it is stated on screen rather than left to be discovered.
 */
export default function AccountPage() {
  const { user, updatePassword, signOut } = useAuth();
  const navigate = useNavigate();

  // ── Password change ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // ── Deletion ──
  const [confirmText, setConfirmText] = useState("");
  const [delError, setDelError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwDone(false);

    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("The new passwords don't match.");
      return;
    }
    if (!user?.email) {
      setPwError("Could not read your account. Try signing in again.");
      return;
    }

    setPwSaving(true);

    // Supabase lets a signed-in session change the password without proving
    // the old one, so anyone with a few seconds at an unlocked screen could
    // lock the owner out. Re-authenticate first.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (reauthError) {
      setPwSaving(false);
      setPwError("That current password isn't right.");
      return;
    }

    const { error } = await updatePassword(newPassword);
    setPwSaving(false);

    if (error) {
      setPwError(error);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwDone(true);
  }

  async function handleDelete() {
    setDelError(null);
    setDeleting(true);

    // delete_own_account() takes no arguments and can only ever delete
    // auth.uid(), so no admin key is needed anywhere in the app.
    const { error } = await supabase.rpc("delete_own_account");

    if (error) {
      setDeleting(false);
      setDelError(
        "Could not delete the account. Nothing has been removed — please try again.",
      );
      return;
    }

    await signOut();
    navigate("/login", { replace: true });
  }

  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="phb-h1 !text-3xl">Your Account</h1>
        <Link to="/" className="phb-small-sc text-xs uppercase tracking-wider underline">
          ← Back
        </Link>
      </div>

      {/* ── Email ── */}
      <div className="parchment-card gilded-border mb-6 p-6">
        <h2 className="phb-h1 !text-xl">Signed in as</h2>
        <p className="phb-body mt-2 text-sm">{user?.email}</p>
        <p className="phb-body mt-3 text-xs italic text-[var(--color-caption)]">
          One account covers both Homebrew Libram and PC on Parchment.
        </p>
      </div>

      {/* ── Change password ── */}
      <div className="parchment-card gilded-border mb-6 p-6">
        <h2 className="phb-h1 !text-xl">Change password</h2>
        <p className="phb-body mt-2 text-xs italic text-[var(--color-caption)]">
          This changes your password for both sites.
        </p>

        <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
          <div>
            <label htmlFor="current" className="phb-small-sc mb-1 block text-xs uppercase tracking-wider">
              Current password
            </label>
            <input
              id="current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="parchment-input w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="new" className="phb-small-sc mb-1 block text-xs uppercase tracking-wider">
              New password
            </label>
            <input
              id="new"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="parchment-input w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="phb-small-sc mb-1 block text-xs uppercase tracking-wider">
              Confirm new password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="parchment-input w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {pwError && <p className="phb-body text-xs text-[var(--color-crimson)]">{pwError}</p>}
          {pwDone && <p className="phb-body text-xs text-green-800">Password updated.</p>}

          <button
            type="submit"
            disabled={pwSaving || !currentPassword || !newPassword}
            className="phb-small-sc cursor-pointer rounded-md border border-[var(--color-gilding-dark)] bg-[var(--color-header)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-parchment-light)] transition-colors hover:bg-[#6e2a1a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pwSaving ? "Saving…" : "Change password"}
          </button>
        </form>
      </div>

      {/* ── Delete account ── */}
      <div className="parchment-card mb-6 border-2 border-[var(--color-crimson)] p-6">
        <h2 className="phb-h1 !text-xl !text-[var(--color-crimson)]">Delete account</h2>

        <p className="phb-body mt-3 text-sm">
          This removes <strong>everything, on both sites</strong> — your homebrew on Homebrew
          Libram and your characters on PC on Parchment. One account covers both, so it cannot
          be undone or done for just one of them.
        </p>
        <p className="phb-body mt-3 text-sm">
          Any share links you've handed out will stop working immediately. Entries other people
          have already copied into their own librams stay with them — those are their copies now,
          and they carry nothing identifying you.
        </p>
        <p className="phb-body mt-3 text-sm font-bold">
          There is no undo and no grace period. Deletion happens the moment you confirm.
        </p>

        {!showDelete ? (
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="phb-small-sc mt-4 cursor-pointer rounded-md border border-[var(--color-crimson)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-crimson)] transition-colors hover:bg-[var(--color-crimson)] hover:text-[var(--color-parchment-light)]"
          >
            Delete my account
          </button>
        ) : (
          <div className="mt-4 space-y-3">
            <label htmlFor="confirmDelete" className="phb-small-sc block text-xs uppercase tracking-wider">
              Type DELETE to confirm
            </label>
            <input
              id="confirmDelete"
              type="text"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="parchment-input w-full rounded-lg px-3 py-2 text-sm"
            />

            {delError && <p className="phb-body text-xs text-[var(--color-crimson)]">{delError}</p>}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!canDelete || deleting}
                onClick={handleDelete}
                className="phb-small-sc cursor-pointer rounded-md bg-[var(--color-crimson)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-parchment-light)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? "Deleting…" : "Permanently delete everything"}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setShowDelete(false);
                  setConfirmText("");
                  setDelError(null);
                }}
                className="phb-small-sc cursor-pointer rounded-md border border-[var(--color-gilding-dark)] px-4 py-2 text-xs uppercase tracking-wider transition-colors hover:bg-black/5"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
