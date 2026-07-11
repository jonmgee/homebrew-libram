import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Header for public /share pages. Visitors may not be signed in
 * (the normal NavBar hides itself without a session), so shared
 * pages carry their own wordmark strip.
 */
export default function SharedHeader({ subtitle }: { subtitle: string }) {
  const { user } = useAuth();
  if (user) return null; // signed-in visitors already have the NavBar

  return (
    <header className="border-b-2 border-[var(--color-gilding-dark)] bg-[var(--color-cover)] shadow-[0_2px_8px_rgba(26,10,0,0.45)]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5">
        <Link
          to="/login"
          className="whitespace-nowrap font-[var(--font-title)] text-base uppercase tracking-[0.1em] text-[var(--color-gilding)] transition-colors hover:text-[var(--color-gilding-light)]"
        >
          Homebrew Libram
        </Link>
        <span className="text-xs italic text-[var(--color-footnotes)]/80">{subtitle}</span>
      </div>
    </header>
  );
}
