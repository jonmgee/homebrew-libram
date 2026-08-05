import { Link } from "react-router-dom";
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

  if (!user) return null;

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
          {/* Shown on every page, home included. It used to be hidden on home
              as a duplicate of the hero link, but a control that appears and
              disappears as you navigate is worse than a redundant one. */}
          <Link to="/create" className={primary}>
            <span className="sm:hidden">+ New</span>
            <span className="hidden sm:inline">+ New Entry</span>
          </Link>
          {/* Bookmarks sit here because they're reached constantly at the
              table. Sharing the whole libram — a rare, one-off action —
              moved to the Account page to make room. */}
          <Link
            to="/browse/bookmarks"
            className={`${secondary} inline-flex items-center gap-1.5 !px-2.5`}
            title="Bookmarks"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M6.5 3h11a1 1 0 0 1 1 1v17l-6.5-4.1L5.5 21V4a1 1 0 0 1 1-1z"
                fill="var(--color-crimson)"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden md:inline">Bookmarks</span>
            <span className="sr-only md:hidden">Bookmarks</span>
          </Link>
          {/* Both secondary controls stay icon-only below md. At 375px the
              full labels overflowed the bar and scrolled the whole page
              sideways; at 640px they fit with zero pixels to spare, which
              one font-metric difference would break. */}
          <Link
            to="/account"
            className={`${secondary} inline-flex items-center gap-1.5 !px-2.5`}
            title="Account"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5zm0 1.9c-4 0-7.25 2.4-7.25 5.35 0 .58.47 1.05 1.05 1.05h12.4c.58 0 1.05-.47 1.05-1.05 0-2.95-3.25-5.35-7.25-5.35z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden md:inline">Account</span>
            <span className="sr-only md:hidden">Account</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
