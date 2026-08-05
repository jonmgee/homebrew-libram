function Ribbon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        d="M6.5 3h11a1 1 0 0 1 1 1v17l-6.5-4.1L5.5 21V4a1 1 0 0 1 1-1z"
        fill={filled ? "var(--color-crimson)" : "none"}
        stroke={filled ? "var(--color-crimson)" : "var(--color-parchment-dark)"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Crimson bookmark ribbon marking an entry as "saved for the table".
 * Interactive when `onChange` is given, read-only otherwise — mirrors
 * StarRating, which sits beside it.
 */
export default function BookmarkToggle({
  value,
  onChange,
  size = "md",
  name,
  className,
}: {
  value: boolean | null | undefined;
  onChange?: (bookmarked: boolean) => void;
  size?: "sm" | "md";
  name?: string;
  /** Replaces the button's own sizing — pass "quiet-action" in list rows so
   *  the hit area matches the edit/delete icons beside it. */
  className?: string;
}) {
  const on = !!value;
  const dim = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  if (!onChange) {
    if (!on) return null;
    return (
      <span
        className={`${dim} inline-block shrink-0 align-middle`}
        role="img"
        aria-label="Saved for the table"
        title="Saved for the table"
      >
        <Ribbon filled />
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={
        on
          ? `Remove ${name ?? "this entry"} from the table list`
          : `Save ${name ?? "this entry"} for the table`
      }
      title={on ? "Saved for the table — click to remove" : "Save for the table"}
      className={
        className ??
        `${dim} cursor-pointer transition-transform hover:scale-115 focus-visible:outline-2 focus-visible:outline-[var(--color-crimson)]`
      }
      onClick={() => onChange(!on)}
    >
      <span className={`${dim} block`}>
        <Ribbon filled={on} />
      </span>
    </button>
  );
}
