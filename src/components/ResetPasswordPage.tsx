import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setSending(true);
    setError(null);
    const { error: err } = await updatePassword(password);
    setSending(false);
    if (err) {
      setError(err);
    } else {
      setDone(true);
      setTimeout(() => navigate("/"), 2500);
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 flex">
        <div className="relative h-full w-1/2 overflow-hidden">
          <img src="/assets/loginpic2.png" alt="" className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60" />
        </div>
        <div className="relative h-full w-1/2 overflow-hidden">
          <img src="/assets/loginpagepic.png" alt="" className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/60" />
        </div>
      </div>
      <div className="absolute inset-0 z-[1] bg-black/20" />

      <div className="relative z-10 w-full max-w-sm rounded-lg bg-white/15 p-6 shadow-2xl backdrop-blur-xl border border-white/10">
        <p className="mb-1 text-center font-[var(--font-phb)] text-2xl uppercase tracking-[0.08em] text-[#EEE5CE] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
          Homebrew Libram
        </p>
        <p className="mb-4 text-center font-[var(--font-sans)] text-xs italic leading-relaxed text-[#C9A84C] drop-shadow-sm">
          The digital tome for all your DnD homebrew content
        </p>

        {done ? (
          <>
            <h1 className="phb-h1 text-center text-xl text-[#EEE5CE] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              Password updated
            </h1>
            <p className="phb-body mt-4 text-center text-sm text-[#d4c9b0]">
              Redirecting to the Libram…
            </p>
          </>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-baseline justify-center gap-x-1.5">
              <h1 className="phb-h1 text-2xl text-[#EEE5CE] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                Reset Password
              </h1>
              <span className="font-[var(--font-sans)] text-xs italic text-[#b5a98e]">
                — Enter a new password
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="phb-small-sc mb-1 block text-xs uppercase tracking-wider text-[#C9A84C]">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="phb-body w-full rounded-lg border border-white/30 bg-white/30 px-4 py-2.5 text-sm text-white placeholder:text-white/60 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="phb-small-sc mb-1 block text-xs uppercase tracking-wider text-[#C9A84C]">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                  className="phb-body w-full rounded-lg border border-white/30 bg-white/30 px-4 py-2.5 text-sm text-white placeholder:text-white/60 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              {error && (
                <p className="phb-description text-xs text-red-300">{error}</p>
              )}

              <button
                type="submit"
                disabled={sending || !password || !confirm}
                className="phb-btn w-full rounded-lg bg-[#58180d]/90 px-6 py-2.5 font-[var(--font-title)] text-sm uppercase tracking-wider text-[#EEE5CE] transition-opacity hover:bg-[#7a2212] disabled:opacity-50"
              >
                {sending ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}