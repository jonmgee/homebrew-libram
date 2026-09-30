import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TERMS_URL, PRIVACY_URL } from "../lib/legal";

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

  /** The landing page's "Create a free account" links here with ?mode=signup,
   *  so that CTA opens the sign-up form rather than the sign-in one. */
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "signup" ? "signup" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  /** Ticked = happy to hear from us. Starts unticked: UK rules don't
   *  count a pre-ticked box as consent to marketing email. Changeable any
   *  time on the Libram's or PC on Parchment's account page. */
  const [wantsEmail, setWantsEmail] = useState(false);
  /** Shown after a failed sign-in: the reset link, right under the error.
   *  Auth logs showed wrong passwords matching successful sign-ins day after
   *  day while hardly anyone pressed "Forgot password?" — people kept
   *  guessing because the error pointed nowhere. */
  const [offerReset, setOfferReset] = useState(false);
  /** Seconds before another reset email can be asked for. Supabase allows
   *  one auth email per address per minute. */
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSending(true);
    setError(null);
    setConfirmMsg(null);
    setOfferReset(false);
    const { error: err, code } = await signIn(email.trim(), password);
    setSending(false);
    if (code === "invalid_credentials" || (err && /invalid login credentials/i.test(err))) {
      // Supabase answers the same for a wrong password and for an address
      // with no account, on purpose — so this can't say "wrong password".
      setError("That email and password don't match. Forgotten it? We can send a link to set a new one.");
      setOfferReset(true);
    } else if (err) {
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSending(true);
    setError(null);
    setConfirmMsg(null);
    const { error: err, user } = await signUp(email.trim(), password, !wantsEmail);
    setSending(false);
    if (err) {
      setError(err);
    } else if (user?.identities?.length === 0) {
      setConfirmMsg("An account with this email already exists. Sign in instead.");
    } else {
      setConfirmMsg("Check your email to confirm your account before signing in.");
    }
  };

  /** One send path for the Forgot password form and the button offered
   *  under a failed sign-in. Same words, same one-minute countdown. */
  const sendReset = async () => {
    if (!email.trim() || cooldown > 0) return;
    setSending(true);
    setError(null);
    setConfirmMsg(null);
    const { error: err } = await resetPassword(email.trim());
    setSending(false);
    // Supabase refuses a second email inside a minute with "you can only
    // request this after 42 seconds". Count down from its number instead
    // of showing that.
    const wait = err ? /only request this after (\d+) seconds/i.exec(err) : null;
    if (wait) {
      setCooldown(Number(wait[1]));
      setError("A reset email went to that address less than a minute ago. Give it a moment, and check your spam folder.");
    } else if (err) {
      setError(err);
    } else {
      setCooldown(60);
      setConfirmMsg(`Reset link sent to ${email.trim()}. Open it and follow the link. Nothing after a minute? Check your spam folder.`);
    }
  };

  const handleForgot = (e: FormEvent) => {
    e.preventDefault();
    void sendReset();
  };

  const handleSubmit = mode === "signin" ? handleSignIn : mode === "signup" ? handleSignUp : handleForgot;

  const title = mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password";
  // Mirrors the wording on PC on Parchment's login. Both apps run on one
  // Supabase project, so an account genuinely works on both — but only PC on
  // Parchment said so, leaving the cross-reference one-directional.
  // Named two of the three apps, having been written before Plot and Weave
  // joined the same Supabase project. The full list lives in the note below.
  const subtext = mode === "signin" ? "Use your Appwrights Guild account, or create one" : mode === "signup" ? "One account for every Appwrights Guild app" : "Enter your email to receive a reset link";
  const coolingOff = mode === "forgot" && cooldown > 0;
  const buttonLabel = sending ? "Please wait…" : coolingOff ? `Sent · try again in ${cooldown}s` : mode === "forgot" ? "Send reset link" : title;

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
          The digital tome for all your D&D homebrew content
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
                placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"}
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

          {/* Email-updates preference (sign up only) — same flag as PC on
              Parchment; one account, one preference. */}
          {mode === "signup" && (
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={wantsEmail}
                onChange={(e) => setWantsEmail(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#C9A84C]"
              />
              <span className="phb-body text-xs leading-snug text-white/80">
                Email me about new features and other Appwrights Guild apps.
                Occasional, changeable any time in your account — and we will
                never sell your details, to anyone, ever.
              </span>
            </label>
          )}

          {/* Forgot password link (sign in only) */}
          {mode === "signin" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => { setMode("forgot"); setOfferReset(false); setError(null); setConfirmMsg(null); }}
                className="text-xs italic text-[#C9A84C] underline underline-offset-2 hover:text-[#dbb85c] transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Error */}
          {/* phb-description sets a parchment-page brown that beats a plain
              colour utility and all but vanishes on this dark card — the `!`
              makes the red actually apply. */}
          {error && (
            <p className="phb-description text-xs text-red-300!">{error}</p>
          )}

          {/* Reset offer, straight under a failed sign-in. Sign In below
              stays usable for someone who remembers a moment later. */}
          {mode === "signin" && offerReset && (
            <button
              type="button"
              onClick={() => void sendReset()}
              disabled={sending || cooldown > 0 || !email.trim()}
              className="w-full rounded-lg border border-[#C9A84C]/70 px-6 py-2 font-[var(--font-title)] text-xs uppercase tracking-wider text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/10 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              {cooldown > 0 ? `Sent · try again in ${cooldown}s` : "Send me a reset link"}
            </button>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={sending || coolingOff || (mode !== "forgot" && !email.trim() && !password)}
            className="phb-btn w-full rounded-lg bg-[#58180d]/90 px-6 py-2.5 font-[var(--font-title)] text-sm uppercase tracking-wider text-[#EEE5CE] transition-opacity hover:bg-[#7a2212] disabled:opacity-50"
          >
            {buttonLabel}
          </button>

          {mode === "signup" && (
            <p className="phb-body text-center text-xs leading-snug text-white/70">
              By creating an account you agree to the{" "}
              <a href={TERMS_URL} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-[#C9A84C]">
                Terms
              </a>{" "}
              and{" "}
              <a href={PRIVACY_URL} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-[#C9A84C]">
                Privacy Policy
              </a>
              .
            </p>
          )}
        </form>

        {/* Toggle between modes */}
        <div className="mt-4 text-center">
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => { setMode("signup"); setOfferReset(false); setError(null); setConfirmMsg(null); setPassword(""); setConfirmPassword(""); }}
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

        {/* The landing page says this too, but this is where the wasted
            action happens: the three Guild apps share one Supabase project,
            so a second account here would just be a second account. */}
        <p className="mt-4 border-t border-[#C9A84C]/25 pt-4 text-center text-xs italic leading-relaxed text-[#b5a98e]">
          One login covers Homebrew Libram, PC on Parchment and Plot and Weave.
          If you have an account for any of them, sign in with it &mdash; there
          is no need to create another.
        </p>

        {/* Linked from the login screen, not just the account page: someone
            should be able to read what we store before handing over an email. */}
        <p className="mt-4 text-center text-xs italic text-[#b5a98e]">
          <a
            href={TERMS_URL}
            className="underline underline-offset-2 transition-colors hover:text-[#C9A84C]"
          >
            Terms
          </a>
          {" · "}
          <a
            href={PRIVACY_URL}
            className="underline underline-offset-2 transition-colors hover:text-[#C9A84C]"
          >
            Privacy
          </a>
        </p>
      </SignInCard>
    </div>
  );
}
