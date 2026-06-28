import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

/* ───── Shared card (unchanged styling) ───── */
function SignInCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gilded-border relative z-10 w-full max-w-md rounded-lg bg-[var(--color-parchment)]/60 p-8 shadow-2xl backdrop-blur-md">
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

      {/* ── Dark overlay across entire background ── */}
      <div className="absolute inset-0 z-[1] bg-black/25" />

      {/* ── Centred sign-in card ── */}
      {sent ? (
        <SignInCard>
          <p className="mb-1 text-center font-[var(--font-phb)] text-2xl uppercase tracking-[0.08em] text-[#58180d] drop-shadow-[0_1px_2px_rgba(88,24,13,0.3)]">
            Homebrew Libram
          </p>
          <p className="mb-4 text-center font-[var(--font-sans)] text-xs italic leading-relaxed text-[#766649]">
            The digital tome for all your DnD homebrew content. Import photos and screenshots or create from scratch
          </p>
          <h1 className="phb-h1 !text-xl text-center">Check your inbox</h1>
          <p className="phb-body mt-4 leading-relaxed text-[#766649]">
            We've sent a magic link to{" "}
            <span className="font-[var(--font-sans)] font-semibold text-[#58180d]">
              {email}
            </span>
          </p>
          <p className="phb-description mt-2 text-sm">
            Click the link in the email to sign in. It expires after one hour.
          </p>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="phb-btn mt-6 inline-block rounded-lg bg-[#58180d] px-6 py-2 text-sm font-[var(--font-title)] uppercase tracking-wider text-[#EEE5CE] hover:bg-[#7a2212]"
          >
            Send again
          </button>
        </SignInCard>
      ) : (
        <SignInCard>
          <p className="mb-1 text-center font-[var(--font-phb)] text-2xl uppercase tracking-[0.08em] text-[#58180d] drop-shadow-[0_1px_2px_rgba(88,24,13,0.3)]">
            Homebrew Libram
          </p>
          <p className="mb-4 text-center font-[var(--font-sans)] text-xs italic leading-relaxed text-[#766649]">
            The digital tome for all your DnD homebrew content. Import photos and screenshots or create from scratch
          </p>
          <h1 className="phb-h1 !text-xl text-center">Sign In</h1>
          <p className="phb-description mt-2 text-center text-sm">
            Enter your email and we'll send you a magic link. No password needed.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="phb-small-sc mb-1 block text-sm uppercase tracking-wider text-[#766649]"
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
                className="phb-body w-full rounded-lg border border-[var(--color-parchment-dark)] bg-white/70 px-4 py-2.5 text-[#333] placeholder:text-[#a99c87] focus:border-[var(--color-gilding-dark)] focus:outline-none"
              />
            </div>

            {error && (
              <p className="phb-description text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="phb-btn w-full rounded-lg bg-[#58180d] px-6 py-2.5 font-[var(--font-title)] uppercase tracking-wider text-[#EEE5CE] transition-opacity hover:bg-[#7a2212] disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send magic link"}
            </button>
          </form>
        </SignInCard>
      )}
    </div>
  );
}