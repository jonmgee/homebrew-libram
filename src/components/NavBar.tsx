import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const onHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--color-gilding-dark)] bg-[var(--color-cover)] shadow-[0_2px_8px_rgba(26,10,0,0.45)]">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <Link
          to="/"
          className="whitespace-nowrap font-[var(--font-title)] text-sm uppercase tracking-[0.06em] text-[var(--color-gilding)] transition-colors hover:text-[var(--color-gilding-light)] sm:text-lg sm:tracking-[0.12em]"
        >
          Homebrew Libram
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/share-libram"
            className="phb-small-sc whitespace-nowrap rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-footnotes)]/80 transition-colors hover:text-[var(--color-gilding-light)]"
          >
            Share
          </Link>
          {!onHome && (
            <Link
              to="/create"
              className="phb-small-sc whitespace-nowrap rounded-md border border-[var(--color-gilding-dark)] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-gilding)] transition-colors hover:border-[var(--color-gilding)] hover:text-[var(--color-gilding-light)]"
            >
              <span className="sm:hidden">+ New</span>
              <span className="hidden sm:inline">+ New Entry</span>
            </Link>
          )}
          <span className="hidden text-xs text-[var(--color-footnotes)]/70 sm:inline">
            {user.email}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="phb-small-sc cursor-pointer rounded-md px-3 py-1 text-xs uppercase tracking-wider text-[var(--color-footnotes)]/80 transition-colors hover:text-[var(--color-gilding-light)]"
          >
            Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}
