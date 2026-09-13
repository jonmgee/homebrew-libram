import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useWhatsNew } from "../lib/useWhatsNew";
import { useOathOpen } from "../lib/oathGate";

function prettyDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * What's changed since this reader last looked, on arriving at the library
 * home. Ported from PC on Parchment, where it sits on the roster: a dialog
 * rather than a banner, because a banner people can ignore is one they do.
 * Home is the page you pass through, so it never interrupts an entry mid-edit.
 *
 * Waits while the Libram's Oath is on screen, and renders
 * nothing at all until there is genuinely something unread.
 */
export default function WhatsNew() {
  const { entries, dismiss } = useWhatsNew();
  const oathOpen = useOathOpen();
  const open = entries.length > 0 && !oathOpen;

  // Escape closes it, and the page behind doesn't scroll under the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="What the Libram scribes have been doing"
      onClick={dismiss}
    >
      <div
        className="parchment-card gilded-border flex max-h-full w-full max-w-md flex-col p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="phb-h1 text-center !text-xl">What Have The Libram Scribes Been Doing?</p>
        <p className="phb-description mt-1 text-center text-xs italic">
          {entries.length === 1 ? "One thing" : `${entries.length} things`} since you were last here
        </p>

        {/* The list scrolls, not the dialog: heading and button stay put. */}
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <article key={entry.id} className="border-t border-parchment-dark py-3 first:border-t-0 first:pt-0">
              <h3 className="phb-h3 !text-base">{entry.title}</h3>
              <p className="phb-description mt-0.5 text-[11px] italic">{prettyDate(entry.date)}</p>
              <p className="phb-body mt-1.5 text-sm">{entry.body}</p>
              {entry.bullets && (
                <ul className="phb-body mt-1.5 list-disc space-y-1 pl-5 text-sm">
                  {entry.bullets.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        <button
          type="button"
          autoFocus
          onClick={dismiss}
          className="mt-5 w-full shrink-0 rounded-lg border border-[var(--color-gilding-dark)] bg-[#58180d] px-4 py-2.5 font-[var(--font-title)] text-sm font-bold uppercase tracking-wider text-[#eee5ce] transition-colors hover:bg-[#6e2a1a]"
        >
          To the Libram
        </button>
      </div>
    </div>,
    document.body,
  );
}
