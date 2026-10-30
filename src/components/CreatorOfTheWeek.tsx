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

/**
 * The guild's D&D Creator of the Week, on the library's front page.
 *
 * A card, not a dialog: it never stands between someone and their work.
 * Only on the front page, never over an entry being written. Closing it holds until the
 * next showing (8am Sunday, a new creator; 8am Thursday, the same one again).
 */
export default function CreatorOfTheWeek({ className = "" }: { className?: string }) {
  const [creator, close] = useCreatorOfTheWeek();
  if (!creator) return null;
  const handle = creator.tiktok ?? creator.instagram;

  return (
    <section
      aria-label="D&D Creator of the Week"
      className={`relative flex max-w-2xl flex-col gap-3 rounded-xl border-[1.5px] border-[var(--color-gilding)] bg-[var(--color-parchment-light)]/95 p-4 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2.5 border-b-2 border-[var(--color-gilding)] pb-2">
        <Medal />
        <h2 className="m-0 flex-1 font-title text-lg leading-tight text-[var(--color-header)] sm:text-xl">
          D&amp;D Creator of the Week
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Hide until the next showing"
          className="-my-3 -mr-3 flex h-11 w-11 items-center justify-center text-xl text-[var(--color-caption)] hover:text-[var(--color-header)]"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-3">
        {creator.photo && (
          <img
            src={guildFile(creator.photo)}
            alt=""
            className="h-16 w-16 flex-none rounded-lg border-2 border-[var(--color-gilding)] object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="font-title text-xl leading-tight text-[var(--color-header)]">{creator.name}</p>
          {handle && <p className="text-sm text-[var(--color-caption)]">@{handle}</p>}
          {creator.line && <p className="phb-body mt-1 text-sm italic leading-snug">{creator.line}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        {creator.tiktok && (
          <a
            href={tiktokUrl(creator.tiktok)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[var(--color-header)] whitespace-nowrap px-3 font-title text-base tracking-wide text-[var(--color-parchment)] hover:bg-[#7a2212]"
          >
            Watch on TikTok ↗
          </a>
        )}
        {creator.instagram && (
          <a
            href={instagramUrl(creator.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 flex-1 items-center justify-center rounded-lg border-[1.5px] border-[var(--color-header)] whitespace-nowrap px-3 font-title text-base tracking-wide text-[var(--color-header)] hover:bg-[var(--color-parchment)]"
          >
            Instagram ↗
          </a>
        )}
      </div>

      <p className="flex justify-between text-xs text-[var(--color-caption)]">
        <span>Picked by the Appwrights Guild</span>
        <a href={PAST_CREATORS_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-header)] underline">
          Past creators
        </a>
      </p>
    </section>
  );
}
