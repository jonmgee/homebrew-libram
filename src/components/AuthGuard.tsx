import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PwaPrompt from "./PwaPrompt";

const LS_KEY = "libram_oath_accepted";

interface AuthGuardProps {
  children: React.ReactNode;
}

function OathModal({ onAccept }: { onAccept: () => void }) {
  const [checked, setChecked] = useState(false);
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Trap focus inside modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60">
      {/* Non-dismissible overlay — clicking does nothing */}
      <div
        className="relative mx-4 w-full max-w-lg rounded-lg border border-[var(--color-gilding-dark)] bg-[#f5eed6] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          className="phb-h1 text-center text-2xl !text-[#58180d] drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]"
          style={{ fontFamily: "var(--font-phb), BookInsanity, serif" }}
        >
          The Libram’s Oath
        </h2>

        {/* Wax-seal decorative rule */}
        <div className="mx-auto my-5 h-[2px] w-16 rounded-full bg-[#58180d]/30" />

        {/* Body */}
        <div className="phb-body space-y-3 text-sm leading-relaxed text-[#4a3728]">
          <p>
            By entering the Homebrew Libram, you swear upon your highest stat
            that any content you add is either your own creation, freely
            available, or something your DM would definitely allow.
          </p>
          <p>
            The Scribes of the Libram accept no responsibility for copyright
            infringement, rules arguments, or TPKs caused by overpowered
            homebrew. We’re just the library. What you put on the shelves is on
            you.
          </p>
          <p className="italic text-[#766649]">
            Roll for compliance. You succeed automatically.
          </p>
        </div>

        {/* Checkbox */}
        <label className="mt-6 flex cursor-pointer items-start gap-3">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#58180d]"
          />
          <span className="phb-body text-sm leading-snug text-[#4a3728]">
            I swear on my favourite d20
          </span>
        </label>

        {/* Confirm button */}
        <button
          onClick={onAccept}
          disabled={!checked}
          className="phb-btn mt-5 w-full rounded-lg bg-[#58180d] px-6 py-2.5 text-sm font-[var(--font-title)] uppercase tracking-wider text-[#EEE5CE] transition-opacity hover:bg-[#7a2212] disabled:opacity-40"
        >
          Enter the Libram
        </button>
      </div>
    </div>
  );
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showOath, setShowOath] = useState(false);
  const prevUserRef = useRef(user);

  // Detect first login: user transitions from null → non-null
  useEffect(() => {
    if (user && !prevUserRef.current && !localStorage.getItem(LS_KEY)) {
      setShowOath(true);
    }
    prevUserRef.current = user;
  }, [user]);

  const handleAccept = () => {
    localStorage.setItem(LS_KEY, "true");
    setShowOath(false);
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
        <p className="phb-description text-sm text-[#766649]">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      {showOath && <OathModal onAccept={handleAccept} />}
      {!showOath && <PwaPrompt />}
      {children}
    </>
  );
}
