import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

/* ───── Shared card ───── */
function SignInCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gilded-border relative z-10 w-full max-w-sm rounded-lg bg-white/15 p-6 shadow-2xl backdrop-blur-xl">
      {children}
    </div>
  );
}

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const { error: err } = await signIn(email.trim());
    setSending(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      {/* ── Two-image background ── */}
      <div className="absolute inset-0 z-0 flex">
        <div className="relative h-full w-1/2 overflow-hidden">
          <img
            src="/assets/loginpic2.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60" />
        </div>
        <div className="relative h-full w-1/2 overflow-hidden">
          <img
            src="/assets/loginpagepic.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/60" />
        </div>
      </div>

      {/* ── Light overlay ── */}
      <div className="absolute inset-0 z-[1] bg-black/20" />

      {/* ── Centred card ── */}
      {sent ? (
        <SignInCard>
          <p className="mb-1 text-center font-[var(--font-phb)] text-2xl uppercase tracking-[0.08em] text-[#EEE5CE] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
            Homebrew Libram
          </p>
          <p className="mb-4 text-center font-[var(--font-sans)] text-xs italic leading-relaxed text-[#C9A84C] drop-shadow-sm">
            The digital tome for all your DnD homebrew content
          </p>
          <h1 className="phb-h1 text-center text-xl text-[#EEE5CE] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            Check your inbox
          </h1>
          <p className="phb-body mt-4 text-sm leading-relaxed text-[#d4c9b0]">
            We've sent a magic link to{" "}
            <span className="font-[var(--font-sans)] font-semibold text-[#EEE5CE]">
              {email}
            </span>
          </p>
          <p className="phb-description mt-2 text-xs text-[#b5a98e]">
            Click the link in the email to sign in. It expires after one hour.
          </p>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="phb-btn mt-5 inline-block w-full rounded-lg bg-[#58180d]/90 px-6 py-2 text-sm font-[var(--font-title)] uppercase tracking-wider text-[#EEE5CE] hover:bg-[#7a2212]"
          >
            Send again
          </button>
        </SignInCard>
      ) : (
        <SignInCard>
          <p className="mb-1 text-center font-[var(--font-phb)] text-2xl uppercase tracking-[0.08em] text-[#EEE5CE] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
            Homebrew Libram
          </p>
          <p className="mb-4 text-center font-[var(--font-sans)] text-xs italic leading-relaxed text-[#C9A84C] drop-shadow-sm">
            The digital tome for all your DnD homebrew content
          </p>

          <div className="mb-5 flex flex-wrap items-baseline justify-center gap-x-1.5">
            <h1 className="phb-h1 text-2xl text-[#EEE5CE] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              Sign In
            </h1>
            <span className="font-[var(--font-sans)] text-xs italic text-[#b5a98e]">
              — Enter an email, we'll send you a link to log in
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="phb-small-sc mb-1 block text-xs uppercase tracking-wider text-[#C9A84C]"
              >
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

            {error && (
              <p className="phb-description text-xs text-red-300">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="phb-btn w-full rounded-lg bg-[#58180d]/90 px-6 py-2.5 font-[var(--font-title)] text-sm uppercase tracking-wider text-[#EEE5CE] transition-opacity hover:bg-[#7a2212] disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send magic link"}
            </button>
          </form>
        </SignInCard>
      )}
    </div>
  );
}