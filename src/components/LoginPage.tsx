import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
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

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
        <div className="gilded-border w-full rounded-lg bg-[var(--color-parchment)] p-8 text-center">
          <h1 className="phb-h1 !text-2xl">Check your inbox</h1>
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
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
      <div className="gilded-border w-full rounded-lg bg-[var(--color-parchment)] p-8">
        <h1 className="phb-h1 !text-2xl text-center">Sign In</h1>
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
      </div>
    </div>
  );
}