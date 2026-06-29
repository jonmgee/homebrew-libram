import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { CATEGORIES } from "../types";

const MotionLink = motion(Link);

const CATEGORY_IMAGES: Record<string, string> = {
  treasure: "/assets/treasure.webp",
  arcana: "/assets/arcana.webp",
  creatures: "/assets/creatures.webp",
  character_options: "/assets/character_options.webp",
  tables: "/assets/tables.webp",
  all: "/assets/all_items.webp",
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
} as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
} as const;

const hoverTransition = { type: "spring" as const, stiffness: 300, damping: 15, mass: 0.5 } as const;

export default function HomePage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchCounts() {
      const { data, error } = await supabase
        .from("entries")
        .select("type");

      if (cancelled || error) return;

      const typeCounts: Record<string, number> = {};
      for (const row of data ?? []) {
        typeCounts[row.type] = (typeCounts[row.type] || 0) + 1;
      }
      setCounts(typeCounts);
      setTotal(data?.length ?? 0);
    }

    fetchCounts();
    return () => { cancelled = true; };
  }, []);

  function categoryCount(cat: typeof CATEGORIES[number]): number {
    return cat.types.reduce((sum, t) => sum + (counts[t] || 0), 0);
  }

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pt-12">
        <header className="mb-6 text-center">
          <h1 className="whitespace-nowrap text-center">
            <span className="font-[var(--font-dropcap)] inline-block text-4xl leading-[0.8] text-[#58180d] drop-shadow-[0_2px_3px_rgba(88,24,13,0.35)] align-middle sm:text-5xl md:text-8xl">
              H
            </span>
            <span className="font-[var(--font-title)] inline-block text-3xl uppercase tracking-[0.08em] text-[#58180d] drop-shadow-[0_2px_3px_rgba(88,24,13,0.35)] align-middle sm:text-4xl md:text-6xl">
              OMEBREW LIBRAM
            </span>
          </h1>
          <img
            src="/assets/phb-horizontalRule.svg"
            alt=""
            className="mx-auto mb-4 mt-4 w-72 sm:w-96"
          />
          <p className="font-[var(--font-sans)] text-base italic leading-relaxed text-[#766649]">
            The digital tome for all your DnD homebrew content. Import photos and screenshots or create from scratch
          </p>
        </header>
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <Link
          to="/create"
          className="gilded-border relative block overflow-hidden"
          aria-label="Create New Entry"
        >
          <video
            autoPlay
            muted
            playsInline
            className="block w-full"
          >
            <source src="/assets/Hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-center font-[var(--font-title)] text-lg font-bold text-[#E0E5C1] drop-shadow-md">
              Create New Entry
            </p>
            <p className="mt-1 text-center text-xs leading-tight text-[#C9A84C] drop-shadow">
              Click here to add the next legendary item to the Libram
            </p>
          </div>
        </Link>
      </div>

      <motion.nav
        className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {CATEGORIES.map((cat) => {
          const entryCount = categoryCount(cat);
          return (
            <MotionLink
              key={cat.slug}
              to={`/browse/${cat.slug}`}
              className="gilded-border relative block aspect-square overflow-hidden rounded-lg"
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              transition={hoverTransition}
            >
              <img
                src={CATEGORY_IMAGES[cat.slug]}
                alt={cat.label}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="font-[var(--font-title)] text-lg font-bold text-[#E0E5C1] drop-shadow-md">
                  {cat.label}
                </h2>
                <p className="mt-0.5 text-xs leading-tight text-[#C9A84C] drop-shadow">
                  {cat.label === "Treasure"
                    ? "Armour, weapons, magic items, potions, gear, trinkets"
                    : cat.label === "Arcana"
                      ? "Spells and scrolls"
                      : cat.label === "Creatures"
                        ? "Monsters and NPCs"
                        : cat.label === "Character Options"
                          ? "Backgrounds, feats, subclasses"
                          : "Random tables and generators"}
                </p>
                <p className="mt-0.5 text-xs leading-tight text-[#C9A84C]/70 drop-shadow">
                  {entryCount} entr{entryCount === 1 ? "y" : "ies"}
                </p>
              </div>
            </MotionLink>
          );
        })}

        <MotionLink
          to="/browse/all"
          className="gilded-border relative block aspect-square overflow-hidden rounded-lg"
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          transition={hoverTransition}
        >
          <img
            src={CATEGORY_IMAGES.all}
            alt="All Items"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="font-[var(--font-title)] text-lg font-bold text-[#E0E5C1] drop-shadow-md">
              All Entries
            </h2>
            <p className="mt-0.5 text-xs leading-tight text-[#C9A84C] drop-shadow">
              {total} entr{total === 1 ? "y" : "ies"}
            </p>
          </div>
        </MotionLink>
      </motion.nav>
    </>
  );
}