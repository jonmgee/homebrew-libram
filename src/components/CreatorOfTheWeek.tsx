import {
  guildFile,
  instagramUrl,
  PAST_CREATORS_URL,
  tiktokUrl,
  useCreatorOfTheWeek,
  weekLabel,
} from "../lib/creatorOfTheWeek";

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
      <div className="flex items-center gap-2">
        <span className="flex-1 font-title text-sm uppercase tracking-wider text-[var(--color-header)]">
          D&amp;D Creator of the Week
        </span>
        <span className="text-xs text-[var(--color-caption)]">{weekLabel(creator.start)}</span>
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
