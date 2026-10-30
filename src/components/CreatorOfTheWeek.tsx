import {
  guildFile,
  instagramUrl,
  PAST_CREATORS_URL,
  tiktokUrl,
  useCreatorOfTheWeek,
} from "../lib/creatorOfTheWeek";

/** A small gilt medal: marks the card as the guild's pick at a glance. */
function Medal() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" className="flex-none">
      <defs>
        <linearGradient id="cotw-gilt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7e6a6" />
          <stop offset="0.5" stopColor="#c69a3e" />
          <stop offset="1" stopColor="#9c7120" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#cotw-gilt)" />
      <circle cx="16" cy="16" r="12" fill="none" stroke="#5a3d0c" strokeOpacity="0.45" />
      <path d="M16 8.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="var(--color-header)" />
    </svg>
  );
}

/** "Opens elsewhere", drawn rather than typed: iPhones and iPads swap the
 *  ↗ character for a blue emoji. */
function OutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-none"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

/**
 * The guild's D&D Creator of the Week, on the library's front page.
 *
 * A card, not a dialog: it never stands between someone and their work.
 * Only on the front page, never over an entry. Closing it holds until the
 * next showing (8am Sunday, a new creator; 8am Thursday, the same one again).
 *
 * Kept unlike the library's tiles on purpose: a dark band with the medal, and a
 * frosted body the backdrop shows through. On a phone it stacks; from tablet
 * width up it runs in a row, buttons to the right.
 */
export default function CreatorOfTheWeek({ className = "" }: { className?: string }) {
  const [creator, close] = useCreatorOfTheWeek();
  if (!creator) return null;
  const handle = creator.tiktok ?? creator.instagram;
  const button =
    "flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 font-title text-base md:flex-none md:gap-1.5 md:px-4 md:tracking-wide";

  return (
    <section
      aria-label="D&D Creator of the Week"
      className={`overflow-hidden rounded-xl border border-[var(--color-gilding)] bg-[var(--color-parchment-light)]/60 shadow-lg backdrop-blur-md ${className}`}
    >
      <div className="flex items-center gap-2.5 bg-[var(--color-header)] py-1 pl-3 pr-1">
        <Medal />
        <h2 className="m-0 flex-1 font-title text-lg leading-tight text-[var(--color-gilding-light)] sm:text-xl">
          D&amp;D Creator of the Week
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Hide until the next showing"
          className="flex h-11 w-11 items-center justify-center text-xl text-[var(--color-parchment)]/75 hover:text-[var(--color-parchment)]"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
          {creator.photo && (
            <img
              src={guildFile(creator.photo)}
              alt=""
              className="h-16 w-16 flex-none rounded-lg border-2 border-[var(--color-gilding)] object-cover md:h-20 md:w-20"
            />
          )}
          <div className="min-w-0">
            <p className="font-title text-xl leading-tight text-[var(--color-header)] md:text-2xl">{creator.name}</p>
            {handle && <p className="text-sm text-[var(--color-ink-light)]">@{handle}</p>}
            {creator.line && <p className="phb-body mt-1 text-sm italic leading-snug md:text-base">{creator.line}</p>}
          </div>
        </div>

        <div className="flex gap-2 md:w-52 md:flex-none md:flex-col">
          {creator.tiktok && (
            <a
              href={tiktokUrl(creator.tiktok)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${button} bg-[var(--color-header)] text-[var(--color-parchment)] hover:bg-[#7a2212]`}
            >
              Watch on TikTok <OutIcon />
            </a>
          )}
          {creator.instagram && (
            <a
              href={instagramUrl(creator.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${button} border-[1.5px] border-[var(--color-header)] text-[var(--color-header)] hover:bg-[var(--color-parchment)]`}
            >
              Instagram <OutIcon />
            </a>
          )}
        </div>
      </div>

      <p className="m-0 flex justify-between border-t border-[var(--color-gilding)]/40 px-4 py-2 text-xs text-[var(--color-ink-light)]">
        <span>Picked by the Appwrights Guild</span>
        <a href={PAST_CREATORS_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-header)] underline">
          Past creators
        </a>
      </p>
    </section>
  );
}
