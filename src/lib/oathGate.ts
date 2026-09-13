import { useSyncExternalStore } from "react";

/**
 * Whether the Libram's Oath is on screen right now, so the What's New dialog
 * can wait its turn instead of stacking on top of it.
 *
 * Deliberately "is it open", not "has it ever been accepted": the oath only
 * appears when a session starts on a device that hasn't sworn, so a reader
 * already signed in on an unsworn device never sees it — and a gate on the
 * accepted flag would hide their news for good.
 */
let open = false;
const listeners = new Set<() => void>();

export function setOathOpen(value: boolean) {
  if (open === value) return;
  open = value;
  listeners.forEach((l) => l());
}

export function useOathOpen(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => open,
  );
}
