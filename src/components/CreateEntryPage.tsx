import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CATEGORIES } from "../types";
import type { EntryType } from "../types";

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

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: "magic_item", label: "Magic Item" },
  { value: "weapon", label: "Weapon" },
  { value: "armour", label: "Armour" },
  { value: "potion", label: "Potion" },
  { value: "adventuring_gear", label: "Adventuring Gear" },
  { value: "trinket", label: "Trinket" },
  { value: "spell", label: "Spell" },
  { value: "scroll", label: "Scroll" },
  { value: "monster", label: "Monster" },
  { value: "npc", label: "NPC" },
  { value: "background", label: "Background" },
  { value: "feat", label: "Feat" },
  { value: "subclass", label: "Subclass" },
  { value: "table", label: "Table" },
];

function getParentCategory(type: EntryType): string {
  for (const cat of CATEGORIES) {
    if (cat.types.includes(type)) return cat.label;
  }
  return "";
}

const TYPE_IMAGES: Record<string, string> = {
  magic_item: "/assets/wondrous_items.webp",
  weapon: "/assets/weapons.webp",
  armour: "/assets/armour.webp",
  potion: "/assets/potions.webp",
  adventuring_gear: "/assets/adventuring_gear.webp",
  trinket: "/assets/trinkets.webp",
  spell: "/assets/spells.webp",
  scroll: "/assets/scrolls.webp",
  monster: "/assets/monsters.webp",
  npc: "/assets/npcs.webp",
  background: "/assets/backgrounds.webp",
  feat: "/assets/feats.webp",
  subclass: "/assets/subclasses.webp",
  table: "/assets/tables.webp",
};

export default function CreateEntryPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 text-center">
        <Link to="/" className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; Home</Link>
        <h1 className="phb-h1 !text-3xl text-[#58180d]">Create New Entry</h1>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-3 sm:gap-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {ENTRY_TYPES.map(({ value, label }) => (
          <MotionLink
            key={value}
            to={`/create/${value}`}
            className="gilded-border relative flex items-center overflow-hidden rounded-lg text-left"
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
            transition={hoverTransition}
          >
            <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
              <img
                src={TYPE_IMAGES[value]}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center px-4 py-3">
              <span className="font-[var(--font-title)] text-[17px] font-bold leading-tight text-[#58180d]">
                {label}
              </span>
              <span className="mt-1 text-[13px] italic leading-tight text-[#766649]">
                {getParentCategory(value)}
              </span>
            </div>
          </MotionLink>
        ))}
      </motion.div>
    </div>
  );
}