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
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden px-4">
      {/* Same scene and parchment card as the sign-in page. */}
      <img src="/assets/login-wide.webp" alt="" className="absolute inset-0 z-0 h-full w-full object-cover" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(46,33,20,0.15),rgba(46,33,20,0.55))]" />

      <div className="gilded-border relative z-10 w-full max-w-sm bg-[#f3e9d2]/95 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        <p className="mb-1 text-center font-[var(--font-phb)] text-2xl uppercase tracking-[0.08em] text-[#2e2114]">
          Homebrew Libram
        </p>
        <p className="mb-4 text-center font-[var(--font-sans)] text-xs italic leading-relaxed text-[#58180d]">
          The digital tome for all your D&D homebrew content
        </p>

        {done ? (
          <>
            <h1 className="phb-h1 text-center text-xl">
              Password updated
            </h1>
            <p className="phb-body mt-4 text-center text-sm text-[#2e2114]/80">
              Redirecting to the Libram…
            </p>
          </>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-baseline justify-center gap-x-1.5">
              <h1 className="phb-h1 text-2xl">
                Reset Password
              </h1>
              <span className="font-[var(--font-sans)] text-xs italic text-[#766649]">
                — Enter a new password
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="phb-small-sc mb-1 block text-xs uppercase tracking-wider text-[#58180d]">
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
                  className="phb-body w-full rounded-lg border border-[#2e2114]/30 bg-white/60 px-4 py-2.5 text-sm text-[#2e2114] placeholder:text-[#2e2114]/40 focus:border-[#58180d] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="phb-small-sc mb-1 block text-xs uppercase tracking-wider text-[#58180d]">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                  className="phb-body w-full rounded-lg border border-[#2e2114]/30 bg-white/60 px-4 py-2.5 text-sm text-[#2e2114] placeholder:text-[#2e2114]/40 focus:border-[#58180d] focus:outline-none"
                />
              </div>

              {error && (
                <p className="phb-description text-xs text-red-800!">{error}</p>
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