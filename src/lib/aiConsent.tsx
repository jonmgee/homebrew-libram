import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { PRIVACY_URL } from "./legal";

/* ──────── Asking before anything goes to an AI service ────────
 * Apple's rule 5.1.2(i) wants explicit permission before personal data goes
 * to a third-party AI, and the privacy policy alone isn't permission. Asked
 * once per device, the first time someone imports (Jon, 7 Nov 2026). */

const KEY = "libram_ai_consent";

export function askAiConsent(): Promise<boolean> {
  try {
    if (localStorage.getItem(KEY)) return Promise.resolve(true);
  } catch { /* storage blocked: ask every time */ }
  return new Promise((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const done = (ok: boolean) => {
      if (ok) {
        try { localStorage.setItem(KEY, new Date().toISOString()); } catch { /* asked again next time */ }
      }
      root.unmount();
      host.remove();
      resolve(ok);
    };
    root.render(<AiConsent onDone={done} />);
  });
}

function AiConsent({ onDone }: { onDone: (ok: boolean) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onDone(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60" role="dialog" aria-modal="true" aria-label="Reading it with AI">
      <div className="relative mx-4 w-full max-w-lg rounded-lg border border-[var(--color-gilding-dark)] bg-[#f5eed6] p-8 shadow-2xl">
        <h2
          className="phb-h1 text-center text-2xl !text-[#58180d]"
          style={{ fontFamily: "var(--font-phb), BookInsanity, serif" }}
        >
          Reading it with AI
        </h2>
        <div className="mx-auto my-5 h-[2px] w-16 rounded-full bg-[#58180d]/30" />
        <div className="phb-body space-y-3 text-sm leading-relaxed text-[#4a3728]">
          <p>
            To turn your photos, PDFs or text into an entry, Homebrew Libram sends them to
            Google&rsquo;s Gemini AI, through a service called OpenRouter.
          </p>
          <p>
            It isn&rsquo;t used to train AI. It only happens when you import, and nothing goes
            until you allow it. You&rsquo;ll only be asked once on this device.
          </p>
          <p>
            <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2 text-[#766649]">
              What we store, and who else sees it
            </a>
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onDone(false)}
            className="phb-small-sc cursor-pointer rounded-md border border-[#58180d]/40 px-4 py-2 text-xs uppercase tracking-wider text-[#4a3728] transition-colors hover:border-[#58180d]"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => onDone(true)}
            className="phb-small-sc cursor-pointer rounded-md bg-[#58180d] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f5eed6] transition-colors hover:bg-[#7a2212]"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
