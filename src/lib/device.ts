/** True when the main way in is a finger (a phone, or an iPad without a mouse), where there's no
 *  paste shortcut, no right-click and nothing to drag: instructions say "choose" instead. */
export const touchScreen =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

/** The paste shortcut to name: Cmd+V on a Mac, Ctrl+V on Windows and Linux. */
export const pasteKeys =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "Cmd+V" : "Ctrl+V";
