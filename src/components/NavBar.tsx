import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-parchment-dark)] bg-[var(--color-parchment)]/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
        <Link
          to="/"
          className="font-[var(--font-title)] text-lg uppercase tracking-wider text-[#58180d] hover:text-[#7a2212]"
        >
          Homebrew Libram
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-[#766649] sm:inline">
            {user.email}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="phb-description rounded-lg border border-[var(--color-parchment-dark)] px-3 py-1 text-xs uppercase tracking-wider text-[#766649] transition-colors hover:border-[#58180d] hover:text-[#58180d]"
          >
            Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}
