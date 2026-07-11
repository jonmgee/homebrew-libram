import { useState } from "react";

function Star({ filled, half }: { filled: boolean; half?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.35 6.2 20.4l1.1-6.47L2.6 9.35l6.5-.95L12 2.5z"
        fill={filled ? "var(--color-gilding)" : half ? "url(#half)" : "none"}
        stroke={filled ? "var(--color-gilding-dark)" : "var(--color-parchment-dark)"}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * PHB-gold star rating. Interactive when `onChange` is given (click a star
 * to rate; click the current rating again to clear it). Read-only otherwise.
 */
export default function StarRating({
  value,
  onChange,
  size = "md",
  label = "rating",
}: {
  value: number | null | undefined;
  onChange?: (rating: number | null) => void;
  size?: "sm" | "md";
  label?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-6 w-6";

  if (!onChange) {
    if (!value) return null;
    return (
      <span
        className="inline-flex items-center gap-px align-middle"
        role="img"
        aria-label={`Rated ${value} of 5`}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={dim}>
            <Star filled={i <= value} />
          </span>
        ))}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHover(null)}
      role="radiogroup"
      aria-label={label}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          title={value === i ? "Clear rating" : `Rate ${i} of 5`}
          className={`${dim} cursor-pointer transition-transform hover:scale-115 focus-visible:outline-2 focus-visible:outline-[var(--color-gilding)]`}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(value === i ? null : i)}
        >
          <Star filled={i <= shown} />
        </button>
      ))}
    </span>
  );
}
