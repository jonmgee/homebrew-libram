import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CATEGORIES } from "../types";

const MotionLink = motion(Link);

const CARD_IMAGES: Record<string, string> = {
  treasure: "/assets/treasure-create.png",
  arcana: "/assets/arcana-create.png",
  creatures: "/assets/creatures-create.png",
  character_options: "/assets/character_options-create.png",
  tables: "/assets/tables-create.png",
};

const CARD_SUBTITLES: Record<string, string> = {
  treasure: "Weapons, armour, magic items, potions, gear, trinkets",
  arcana: "Spells and scrolls",
  creatures: "Monsters and NPCs",
  character_options: "Backgrounds, feats, subclasses",
  tables: "Random tables and generators",
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

export default function CreateEntryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 text-center">
        <Link to="/" className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; Home</Link>
        <h1 className="phb-h1 !text-3xl text-[#58180d]">Create New Entry</h1>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {CATEGORIES.map((cat) => {
          const img = CARD_IMAGES[cat.slug];
          const subtitle = CARD_SUBTITLES[cat.slug];
          return (
            <MotionLink
              key={cat.slug}
              to={`/create/${cat.slug}`}
              className="gilded-border relative block aspect-square overflow-hidden rounded-lg"
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              transition={hoverTransition}
            >
              <img
                src={img}
                alt={cat.label}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="font-[var(--font-title)] text-lg font-bold text-[#E0E5C1] drop-shadow-md">
                  {cat.label}
                </h2>
                <p className="mt-0.5 text-xs leading-tight text-[#C9A84C] drop-shadow">
                  {subtitle}
                </p>
              </div>
            </MotionLink>
          );
        })}
      </motion.div>
    </div>
  );
}