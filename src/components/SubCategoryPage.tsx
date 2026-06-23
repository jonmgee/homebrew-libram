import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { getCategory } from "../types";
import { getSubCategories, type SubCategoryDef } from "../lib/subcategories";

const MotionLink = motion(Link);

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
} as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

const hoverTransition = { type: "spring" as const, stiffness: 300, damping: 15, mass: 0.5 } as const;

const SUBCAT_IMAGES: Record<string, string> = {
  weapons: "/assets/weapons.webp",
  armour: "/assets/armour.webp",
  magic_items: "/assets/wondrous_items.webp",
  potions: "/assets/potions.webp",
  adventuring_gear: "/assets/adventuring_gear.webp",
  trinkets: "/assets/trinkets.webp",
  spells: "/assets/spells.webp",
  scrolls: "/assets/scrolls.webp",
  monsters: "/assets/monsters.webp",
  npcs: "/assets/npcs.webp",
  backgrounds: "/assets/backgrounds.webp",
  feats: "/assets/feats.webp",
  subclasses: "/assets/subclasses.webp",
  misc: "/assets/misc.webp",
};

export default function SubCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const cat = getCategory(category ?? "");

  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!cat) return;
    let cancelled = false;

    async function fetchCounts() {
      const types = cat!.types;

      const { data, error } = await supabase
        .from("entries")
        .select("type")
        .in("type", types);

      if (cancelled || error) return;

      const typeCounts: Record<string, number> = {};
      for (const row of data ?? []) {
        typeCounts[row.type] = (typeCounts[row.type] || 0) + 1;
      }
      setCounts(typeCounts);
    }

    fetchCounts();
    return () => { cancelled = true; };
  }, [cat]);

  if (!cat) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h1 className="phb-h1 !text-2xl">Unknown Category</h1>
        <Link to="/" className="phb-small-sc mt-4 inline-block text-sm font-bold text-crimson underline underline-offset-4 hover:text-crimson-light">
          &larr; Home
        </Link>
      </div>
    );
  }

  const subCategories = getSubCategories(cat.slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 text-center">
        <Link to="/" className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; Home</Link>
        <h1 className="phb-h1 !text-3xl text-[#58180d]">{cat.label}</h1>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {subCategories.map((sub: SubCategoryDef) => {
          const imgSrc = SUBCAT_IMAGES[sub.slug];
          const entryCount = sub.types.reduce((sum, t) => sum + (counts[t] || 0), 0);

          return (
            <MotionLink
              key={sub.slug}
              to={`/browse/${cat.slug}/${sub.slug}`}
              className="gilded-border relative block aspect-square overflow-hidden rounded-lg"
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              transition={hoverTransition}
            >
              {imgSrc ? (
                <>
                  <img
                    src={imgSrc}
                    alt={sub.label}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 to-transparent" />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-parchment-dark/30">
                  <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 to-transparent" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="font-[var(--font-title)] text-lg font-bold text-[#E0E5C1] drop-shadow-md">
                  {sub.label}
                </h2>
                <p className="mt-0.5 text-xs leading-tight text-[#C9A84C] drop-shadow">
                  {entryCount} entr{entryCount === 1 ? "y" : "ies"}
                </p>
              </div>
            </MotionLink>
          );
        })}
      </motion.div>
    </div>
  );
}