import { useCallback, useEffect, useRef, useState } from "react";

const LS_KEY = "pwa_prompt_dismissed";

/**
 * Detect if the app is already running as a standalone PWA.
 */
function isStandalone(): boolean {
  if ((window.navigator as unknown as { standalone: boolean }).standalone) return true;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return false;
}

/**
 * Detect iOS by user agent (not standalone).
 */
function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export default function PwaPrompt() {
  const [visible, setVisible] = useState(false);
  const deferredPrompt = useRef<Event | null>(null);

  useEffect(() => {
    // 1. Already dismissed or Oath not yet accepted
    if (localStorage.getItem(LS_KEY)) return;
    if (!localStorage.getItem("libram_oath_accepted")) return;

    // 2. Already installed
    if (isStandalone()) return;

    // 3. iOS — show immediately
    if (isIOS()) {
      setVisible(true);
      return;
    }

    // 4. Android/Chrome — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(LS_KEY, "true");
    setVisible(false);
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = deferredPrompt.current as
      | { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
      | null;
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    deferredPrompt.current = null;
    dismiss();
  }, [dismiss]);

  if (!visible) return null;

  const isOnIOS = isIOS();

  return (
    <div className="fixed inset-x-0 bottom-0 z-[998] animate-slide-up">
      <div className="mx-auto max-w-lg border-t border-[var(--color-gilding-dark)] bg-[#f5eed6] px-5 py-4 shadow-2xl">
        {/* Top bar — X close */}
        <div className="mb-2 flex items-start justify-between">
          <span className="phb-small-sc text-xs uppercase tracking-wider text-[#58180d]">
            Install App
          </span>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="-mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded text-[#766649] transition-colors hover:bg-[#58180d]/10 hover:text-[#58180d]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        </div>

        {isOnIOS ? (
          <>
            <p className="phb-body text-sm leading-relaxed text-[#4a3728]">
              Tap the share button{" "}
              <span className="inline-flex items-center align-middle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="inline h-4 w-4 text-[#58180d]"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" x2="12" y1="2" y2="15" />
                </svg>
              </span>{" "}
              then <strong>Add to Home Screen</strong> to install.
            </p>
            <button
              onClick={dismiss}
              className="phb-btn mt-3 w-full rounded-lg bg-[#58180d] px-5 py-2 text-xs font-[var(--font-title)] uppercase tracking-wider text-[#EEE5CE] transition-opacity hover:bg-[#7a2212]"
            >
              Got it
            </button>
          </>
        ) : (
          <>
            <p className="phb-body text-sm leading-relaxed text-[#4a3728]">
              Add Homebrew Libram to your home screen for quick access during
              sessions.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={dismiss}
                className="phb-btn flex-1 rounded-lg border border-[var(--color-gilding-dark)] bg-parchment-dark px-4 py-2 text-xs font-[var(--font-title)] uppercase tracking-wider text-[#4a3728] transition-colors hover:bg-parchment"
              >
                Not Now
              </button>
              <button
                onClick={handleInstall}
                className="phb-btn flex-1 rounded-lg bg-[#58180d] px-4 py-2 text-xs font-[var(--font-title)] uppercase tracking-wider text-[#EEE5CE] transition-opacity hover:bg-[#7a2212]"
              >
                Add to Home Screen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}