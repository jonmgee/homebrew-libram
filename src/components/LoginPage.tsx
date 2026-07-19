import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Mode = "signin" | "signup" | "forgot";

function SignInCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 w-full max-w-sm rounded-lg bg-white/15 p-6 shadow-2xl backdrop-blur-xl border border-white/10">
      {children}
    </div>
  );
}

export default function LoginPage() {
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSending(true);
    setError(null);
    setConfirmMsg(null);
    const { error: err } = await signIn(email.trim(), password);
    setSending(false);
    if (err) {
      setError(err);
    } else {
      navigate("/");
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSending(true);
    setError(null);
    setConfirmMsg(null);
    const { error: err, user } = await signUp(email.trim(), password);
    setSending(false);
    if (err) {
      setError(err);
    } else if (user?.identities?.length === 0) {
      setConfirmMsg("An account with this email already exists. Sign in instead.");
    } else {
      setConfirmMsg("Check your email to confirm your account before signing in.");
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    setConfirmMsg(null);
    const { error: err } = await resetPassword(email.trim());
    setSending(false);
    if (err) {
      setError(err);
    } else {
      setConfirmMsg("Check your email for a password reset link.");
    }
  };

  const handleSubmit = mode === "signin" ? handleSignIn : mode === "signup" ? handleSignUp : handleForgot;

  const title = mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password";
  // Mirrors the wording on PC on Parchment's login. Both apps run on one
  // Supabase project, so an account genuinely works on both — but only PC on
  // Parchment said so, leaving the cross-reference one-directional.
  const subtext = mode === "signin" ? "Use your PC on Parchment account, or create one" : mode === "signup" ? "One account for Homebrew Libram and PC on Parchment" : "Enter your email to receive a reset link";
  const buttonLabel = sending ? "Please wait…" : mode === "forgot" ? "Send reset link" : title;

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      {/* ── Two-image background ── */}
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

      {/* ── Light overlay ── */}
      <div className="absolute inset-0 z-[1] bg-black/20" />

      {/* ── Centred card ── */}
      <SignInCard>
        <p className="mb-1 text-center font-[var(--font-phb)] text-2xl uppercase tracking-[0.08em] text-[#EEE5CE] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
          Homebrew Libram
        </p>
        <p className="mb-1 text-center font-[var(--font-sans)] text-xs italic leading-relaxed text-[#C9A84C] drop-shadow-sm">
          The digital tome for all your DnD homebrew content
        </p>
        <p className="mb-4 text-center font-[var(--font-phb)] text-[10px] uppercase tracking-widest text-[#b5a98e]">
          An Appwright&rsquo;s Guild tool
        </p>

        <div className="mb-5 flex flex-wrap items-baseline justify-center gap-x-1.5">
          {/* phb-h1 sets PHB maroon, which is right on parchment but unreadable
              on this dark card. The utility was already here and losing the
              cascade — the `!` makes the intended cream actually apply. */}
          <h1 className="phb-h1 text-2xl text-[#EEE5CE]! drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            {title}
          </h1>
          <span className="font-[var(--font-sans)] text-xs italic text-[#b5a98e]">
            — {subtext}
          </span>
        </div>

        {confirmMsg && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-900/20 px-3 py-2 text-center text-xs text-green-300">
            {confirmMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="phb-small-sc mb-1 block text-xs uppercase tracking-wider text-[#C9A84C]">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="phb-body w-full rounded-lg border border-white/30 bg-white/30 px-4 py-2.5 text-sm text-white placeholder:text-white/60 focus:border-[#C9A84C] focus:outline-none"
            />
          </div>

          {/* Password fields (not shown in forgot mode) */}
          {mode !== "forgot" && (
            <div>
              <label htmlFor="password" className="phb-small-sc mb-1 block text-xs uppercase tracking-wider text-[#C9A84C]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 6 characters" : "Enter your password"}
                className="phb-body w-full rounded-lg border border-white/30 bg-white/30 px-4 py-2.5 text-sm text-white placeholder:text-white/60 focus:border-[#C9A84C] focus:outline-none"
              />
            </div>
          )}

          {/* Confirm password (sign up only) */}
          {mode === "signup" && (
            <div>
              <label htmlFor="confirmPassword" className="phb-small-sc mb-1 block text-xs uppercase tracking-wider text-[#C9A84C]">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="phb-body w-full rounded-lg border border-white/30 bg-white/30 px-4 py-2.5 text-sm text-white placeholder:text-white/60 focus:border-[#C9A84C] focus:outline-none"
              />
            </div>
          )}

          {/* Forgot password link (sign in only) */}
          {mode === "signin" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => { setMode("forgot"); setError(null); setConfirmMsg(null); }}
                className="text-xs italic text-[#C9A84C] underline underline-offset-2 hover:text-[#dbb85c] transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="phb-description text-xs text-red-300">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={sending || (mode !== "forgot" && !email.trim() && !password)}
            className="phb-btn w-full rounded-lg bg-[#58180d]/90 px-6 py-2.5 font-[var(--font-title)] text-sm uppercase tracking-wider text-[#EEE5CE] transition-opacity hover:bg-[#7a2212] disabled:opacity-50"
          >
            {buttonLabel}
          </button>
        </form>

        {/* Toggle between modes */}
        <div className="mt-4 text-center">
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); setConfirmMsg(null); setPassword(""); setConfirmPassword(""); }}
              className="text-xs italic text-[#b5a98e] hover:text-[#C9A84C] transition-colors"
            >
              Don't have an account? <span className="underline underline-offset-2">Create one</span>
            </button>
          ) : mode === "signup" ? (
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); setConfirmMsg(null); setPassword(""); setConfirmPassword(""); }}
              className="text-xs italic text-[#b5a98e] hover:text-[#C9A84C] transition-colors"
            >
              Already have an account? <span className="underline underline-offset-2">Sign in</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); setConfirmMsg(null); }}
              className="text-xs italic text-[#b5a98e] hover:text-[#C9A84C] transition-colors"
            >
              <span className="underline underline-offset-2">Back to sign in</span>
            </button>
          )}
        </div>
      </SignInCard>
    </div>
  );
}
