import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Shared header layout with PC on Parchment: site name on the left, then a
 * right-hand cluster of [primary action] [secondary] [Account]. Primary is
 * filled, everything else is outlined and the same size, so the hierarchy
 * reads at a glance. Colours stay Libram's own.
 *
 * Previously these controls had four different treatments — plain text,
 * outlined, an underlined email standing in for a button, and plain text again.
 *
 * Signing out lives on the Account page rather than as its own pill — it's a
 * rare action, and dropping it keeps this ribbon uncluttered on mobile.
 */
export default function NavBar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const onHome = location.pathname === "/";

  // Same footprint for every non-primary control.
  const secondary =
    "phb-small-sc cursor-pointer whitespace-nowrap rounded-md border border-[var(--color-gilding-dark)]/60 px-3 py-1 text-xs uppercase tracking-wider text-[var(--color-footnotes)]/85 transition-colors hover:border-[var(--color-gilding)] hover:text-[var(--color-gilding-light)]";

  const primary =
    "phb-small-sc cursor-pointer whitespace-nowrap rounded-md border border-[var(--color-gilding-dark)] bg-[var(--color-header)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-parchment-light)] transition-colors hover:bg-[#7a2212]";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--color-gilding-dark)] bg-[var(--color-cover)] shadow-[0_2px_8px_rgba(26,10,0,0.45)]">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
        <Link
          to="/"
          className="whitespace-nowrap font-[var(--font-title)] text-sm uppercase tracking-[0.06em] text-[var(--color-gilding)] transition-colors hover:text-[var(--color-gilding-light)] sm:text-lg sm:tracking-[0.12em]"
        >
          Homebrew Libram
        </Link>

        <div className="flex items-center gap-2">
          {!onHome && (
            <Link to="/create" className={primary}>
              <span className="sm:hidden">+ New</span>
              <span className="hidden sm:inline">+ New Entry</span>
            </Link>
          )}
          <Link to="/share-libram" className={secondary}>
            Share
          </Link>
          <Link to="/account" className={secondary}>
            Account
          </Link>
        </div>
      </nav>
    </header>
  );
}
