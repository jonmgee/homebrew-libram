/**
 * 3D physics dice via @3d-dice/dice-box, themed to the Libram's
 * crimson/gold. The library (~400KB + assets) loads only on the first
 * roll, so browsing pays nothing. Dice tumble across a full-screen
 * pointer-transparent overlay, then clear themselves after a beat.
 */

type DiceResult = { value: number };
type DiceBoxInstance = {
  init: () => Promise<unknown>;
  roll: (notation: string) => Promise<DiceResult[]>;
  clear: () => void;
};

const OVERLAY_ID = "dice-overlay";

let boxPromise: Promise<DiceBoxInstance> | null = null;
let clearTimer: ReturnType<typeof setTimeout> | null = null;

function ensureOverlay(): HTMLElement {
  let el = document.getElementById(OVERLAY_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = OVERLAY_ID;
    el.style.cssText =
      "position:fixed;inset:0;z-index:9999;pointer-events:none;display:none;";
    document.body.appendChild(el);
  }
  return el;
}

async function init(): Promise<DiceBoxInstance> {
  ensureOverlay();
  const { default: DiceBox } = await import("@3d-dice/dice-box");
  const box = new DiceBox({
    container: `#${OVERLAY_ID}`,
    assetPath: "/assets/dice-box/",
    theme: "default",
    themeColor: "#9c2b1b",
    scale: 7,
    gravity: 1.3,
    throwForce: 6,
    spinForce: 5,
    settleTimeout: 4500,
    lightIntensity: 0.9,
  }) as DiceBoxInstance;
  await box.init();
  return box;
}

/** Roll a single die with the given number of sides; resolves with the result. */
export async function rollDie3d(sides: number): Promise<number> {
  boxPromise ||= init().catch((err) => {
    boxPromise = null; // allow a retry next time
    throw err;
  });
  const box = await boxPromise;

  if (clearTimer) { clearTimeout(clearTimer); clearTimer = null; }
  box.clear();
  const overlay = ensureOverlay();
  overlay.style.display = "block";

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("dice roll timed out")), 10000),
  );
  try {
    const results = await Promise.race([box.roll(`1d${sides}`), timeout]);
    const value = results?.[0]?.value;
    if (typeof value !== "number" || value < 1) throw new Error("no die result");
    // leave the die on the table a moment, then tidy up
    clearTimer = setTimeout(() => {
      box.clear();
      overlay.style.display = "none";
      clearTimer = null;
    }, 2400);
    return value;
  } catch (err) {
    box.clear();
    overlay.style.display = "none";
    throw err;
  }
}
