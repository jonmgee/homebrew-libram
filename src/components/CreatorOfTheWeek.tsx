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
      width="12"
      height="12"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
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
 * frosted body the backdrop shows through. The links are small chips, not
 * buttons: the creator is the point, not the click.
 */
export default function CreatorOfTheWeek({ className = "" }: { className?: string }) {
  const [creator, close] = useCreatorOfTheWeek();
  if (!creator) return null;
  const handle = creator.tiktok ?? creator.instagram;
  // A 36px chip with an invisible 4px margin of tap all round: 44px to a thumb.
  const chip =
    "relative inline-flex min-h-9 items-center gap-1 rounded-full border border-[var(--color-header)]/50 px-3 font-title text-sm text-[var(--color-header)] after:absolute after:-inset-1 after:content-[''] hover:bg-[var(--color-header)] hover:text-[var(--color-parchment)]";

  const links = (
    <>
      {creator.tiktok && (
        <a href={tiktokUrl(creator.tiktok)} target="_blank" rel="noopener noreferrer" className={chip}>
          TikTok <OutIcon />
        </a>
      )}
      {creator.instagram && (
        <a href={instagramUrl(creator.instagram)} target="_blank" rel="noopener noreferrer" className={chip}>
          Instagram <OutIcon />
        </a>
      )}
    </>
  );

  return (
    <section
      aria-label="D&D Creator of the Week"
      className={`overflow-hidden rounded-xl border border-[var(--color-gilding)] bg-[var(--color-parchment-light)]/60 shadow-lg backdrop-blur-md ${className}`}
    >
      <div className="flex items-center gap-2.5 bg-[var(--color-header)]/80 py-1.5 pl-3 pr-1">
        <Medal />
        <div className="min-w-0 flex-1">
          <h2 className="m-0 font-title text-lg leading-tight text-[var(--color-gilding-light)] sm:text-xl">
            D&amp;D Creator of the Week
          </h2>
          <p className="m-0 text-xs italic leading-snug text-[var(--color-parchment)]/80 sm:text-sm">
            Highlighting the best creators in our community. Share the love!
          </p>
        </div>
        <a
          href={PAST_CREATORS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden whitespace-nowrap py-2 pl-2 text-sm text-[var(--color-parchment)]/80 underline hover:text-[var(--color-parchment)] sm:inline"
        >
          Past creators
        </a>
        <button
          type="button"
          onClick={close}
          aria-label="Hide until the next showing"
          className="flex h-11 w-11 flex-none items-center justify-center text-xl text-[var(--color-parchment)]/75 hover:text-[var(--color-parchment)]"
        >
          ✕
        </button>
      </div>

      {/* Name, handle and links on one line, the line about them beneath. On a
          phone the links get their own full-width row, with Past creators. */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 md:gap-4">
          {creator.photo && (
            <img
              src={guildFile(creator.photo)}
              alt=""
              className="h-14 w-14 flex-none rounded-lg border-2 border-[var(--color-gilding)] object-cover md:h-16 md:w-16"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-title text-xl leading-tight text-[var(--color-header)] md:text-2xl">{creator.name}</p>
            {handle && <p className="text-sm text-[var(--color-ink-light)]">@{handle}</p>}
            <div className="ml-auto hidden items-center gap-2 sm:flex">{links}</div>
            {creator.line && <p className="phb-body basis-full text-sm italic leading-snug md:text-base">{creator.line}</p>}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 sm:hidden">
          <a
            href={PAST_CREATORS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mr-auto py-2 text-xs text-[var(--color-ink-light)] underline hover:text-[var(--color-header)]"
          >
            Past creators
          </a>
          {links}
        </div>
      </div>
    </section>
  );
}
