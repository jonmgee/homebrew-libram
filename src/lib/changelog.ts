/**
 * What's changed, in the reader's words.
 *
 * Hand-written on purpose, as in PC on Parchment: commit subjects are written
 * for whoever maintains the code, and a reader wants to know what they can now
 * do. Newest first.
 *
 * Ids are permanent. What a reader has seen is recorded as the id of the
 * newest entry they were shown, so renaming a title is fine but reusing or
 * renumbering an id would quietly re-show or hide a release.
 *
 * One entry per shipping session, not per change. A dozen lines nobody reads
 * is worse than three they do.
 *
 * What doesn't go in — Jon's rule: our own bugs. A fix for something that
 * should never have shipped isn't news, it's housekeeping. The test is whether
 * someone can DO something they couldn't do before.
 */

export interface ChangelogEntry {
  /** Permanent. Never reuse, never renumber. */
  id: string;
  /** ISO yyyy-mm-dd. Also decides what a new account has "missed": nobody is
   *  shown news from before they signed up. */
  date: string;
  title: string;
  body: string;
  /** Short skimmable lines under the body, for a release that did several things. */
  bullets?: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "2026-09-13-classes-species",
    date: "2026-09-13",
    title: "An extension to the Character Options wing - Classes and Species",
    body:
      "Character Options has two new shelves. Write up a class or species of your own, or scan one in with Import.",
    bullets: [
      "Classes get the full 2024 layout: core traits, a level 1–20 table, and every feature written out.",
      "Add limited-use trackers like Rage or Channel Divinity, with a number for each level.",
      "Species record size, speed, creature type and their traits.",
    ],
  },
  {
    id: "2026-09-01-tidy-shelves",
    date: "2026-09-01",
    title: "Tidier shelves",
    body: "A few ways to keep your Libram in order.",
    bullets: [
      "Filed something in the wrong place? Move it from its page, with nothing lost.",
      "Copying in a friend's shared Libram now flags the entries you already have, so you can skip them.",
      "Weapons record their damage, and armour its type, alongside rarity and attunement.",
    ],
  },
  {
    id: "2026-08-18-bookmarks-print",
    date: "2026-08-18",
    title: "Bookmarks and compact printing",
    body:
      "Bookmark the entries you'll need at the table and find them all under Bookmarks in the header. Printing now has a compact option that fits more on a page.",
  },
];
