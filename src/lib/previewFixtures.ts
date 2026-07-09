import type { DbEntry } from "../types";

/**
 * Sample entries for preview mode (VITE_PREVIEW_MODE=1).
 * One or more per entry type so every page and renderer can be
 * exercised without touching the real database.
 */

let seq = 0;
const id = () => `preview-${String(++seq).padStart(3, "0")}`;
const at = (d: string) => new Date(d).toISOString();

export const PREVIEW_USER = {
  id: "preview-user-0000",
  email: "preview@homebrewlibram.com",
};

export const PREVIEW_ENTRIES: DbEntry[] = [
  // ── Treasure ──────────────────────────────────────────────
  {
    id: id(),
    name: "Duskfang, Blade of the Weeping Moon",
    type: "weapon",
    description:
      "Forged from a shard of a fallen moon, this longsword's edge glimmers with pale silver light. On nights of the new moon the blade weeps droplets of cold starlight that hiss when they touch the ground.\n\nWhile attuned, you can see normally in darkness, both magical and nonmagical, to a distance of 60 feet.",
    source: "Forge of Legends, p.12",
    dm_only: false,
    tags: ["longsword", "attunement", "moon"],
    campaign: "Shadows of Eltheria",
    created_at: at("2026-06-01"),
    properties: {
      damage_dice: "1d8",
      damage_type: "slashing",
      bonus: "+2",
      properties: "Versatile (1d10), finesse",
      cost: "—",
      weight: 3,
      image_url: "/assets/weapons.webp",
    },
  },
  {
    id: id(),
    name: "Bulwark of the Shattered Legion",
    type: "armour",
    description:
      "This dented tower shield bears the crest of a legion annihilated at the Battle of Greyspire. The souls of its shield-bearers linger within, bracing against every blow.\n\nWhen you are hit by a critical strike, you can use your reaction to convert it into a normal hit. Once used, this property recharges at dawn.",
    source: "Relics of Greyspire",
    dm_only: false,
    tags: ["shield", "legion", "reaction"],
    campaign: "Shadows of Eltheria",
    created_at: at("2026-06-02"),
    properties: {
      armour_type: "shield",
      bonus: "+1",
      stealth_disadvantage: true,
      cost: "1,500 gp",
      weight: 12,
      image_url: "/assets/armour.webp",
    },
  },
  {
    id: id(),
    name: "Cartographer's Ever-Inked Quill",
    type: "wondrous_item",
    description:
      "This raven-feather quill never runs dry. When commanded, it sketches a map of every corridor, chamber and stair its bearer has walked in the last hour — including secret doors the bearer passed within 10 feet of, which appear as faint, hesitant lines.",
    source: "The Guild Ledger",
    dm_only: false,
    tags: ["exploration", "utility", "maps"],
    campaign: "",
    created_at: at("2026-06-03"),
    properties: {
      rarity: "rare",
      requires_attunement: false,
      item_subtype: "wondrous item",
      charges: 3,
      image_url: "/assets/wondrous_items.webp",
    },
  },
  {
    id: id(),
    name: "Elixir of the Ember Heart",
    type: "potion",
    description:
      "The liquid inside this vial glows like a banked coal and is warm to the touch. It tastes of cinnamon and woodsmoke, and those who drink it exhale a wisp of smoke for the next hour.",
    source: "Mirelda's Recipe Book",
    dm_only: false,
    tags: ["fire", "resistance", "consumable"],
    campaign: "Shadows of Eltheria",
    created_at: at("2026-06-04"),
    properties: {
      rarity: "uncommon",
      effect:
        "For 1 hour you have resistance to cold damage, and any creature that hits you with a melee attack while within 5 feet of you takes 1d4 fire damage.",
      duration: "1 hour",
      image_url: "/assets/potions.webp",
    },
  },
  {
    id: id(),
    name: "Dungeoneer's Folding Ladder",
    type: "adventuring_gear",
    description:
      "A marvel of gnomish hinge-work: a 10-foot ladder that folds down to the size of a hand crossbow. Unfolding or collapsing it takes an action and produces a series of alarming clacks audible within 60 feet.",
    source: "Tinker's Almanac",
    dm_only: false,
    tags: ["gnomish", "utility"],
    campaign: "",
    created_at: at("2026-06-05"),
    properties: {
      gear_category: "tool",
      quantity: 1,
      properties: "Supports up to 400 lb; counts as a climbing kit for checks made on it.",
      cost: "25 gp",
      weight: 4,
    },
  },
  {
    id: id(),
    name: "A Compass That Points to Regret",
    type: "trinket",
    description:
      "A tarnished brass compass whose needle ignores north entirely. Instead it swings gently toward the nearest place where its holder made a decision they still think about at night. The needle trembles when they lie about it.",
    source: "",
    dm_only: false,
    tags: ["trinket", "roleplay"],
    campaign: "",
    created_at: at("2026-06-06"),
    properties: {
      image_url: "/assets/trinket.webp",
    },
  },
  {
    id: id(),
    name: "Crown of the Hollow King",
    type: "magic_item",
    description:
      "A circlet of black iron said to have been hammered from the bars of a cell that once held a god. The wearer hears the whispered counsel of every previous wearer — most of whom came to unfortunate ends.\n\n**Curse.** Once you don the crown, you are unwilling to part with it. While cursed, you have disadvantage on Wisdom saving throws made to resist being charmed or frightened by undead.",
    source: "Relics of Greyspire",
    dm_only: true,
    tags: ["cursed", "crown", "undead"],
    campaign: "Shadows of Eltheria",
    created_at: at("2026-06-07"),
    properties: {
      rarity: "legendary",
      requires_attunement: true,
      item_subtype: "wondrous item",
      charges: 0,
    },
  },

  // ── Arcana ────────────────────────────────────────────────
  {
    id: id(),
    name: "Starfall Cascade",
    type: "spell",
    description:
      "You tear a seam in the night sky and drag it earthward. Shards of falling starlight rain down in a 40-foot-radius, 100-foot-high cylinder centred on a point you can see.\n\nEach creature in the area must make a Dexterity saving throw. A creature takes 6d8 radiant damage on a failed save, or half as much on a successful one. The area is filled with dim silver light until the start of your next turn, and invisible creatures within it are outlined in faint stardust, gaining no benefit from being invisible.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th.",
    source: "Codex of the Umbral Court",
    dm_only: false,
    tags: ["evocation", "radiant", "aoe"],
    campaign: "",
    created_at: at("2026-06-08"),
    properties: {
      level: "5",
      school: "evocation",
      casting_time: "1 action",
      range: "150 feet",
      components: ["V", "S", "M"],
      material: "a shard of meteoric glass worth at least 100 gp",
      duration: "Instantaneous",
      classes: "Sorcerer, Wizard",
      ritual: false,
      concentration: false,
      image_url: "/assets/spells.webp",
    },
  },
  {
    id: id(),
    name: "Whisperwind Step",
    type: "spell",
    description:
      "You dissolve into a breath of wind and reappear in an unoccupied space you can see within range. A soft sigh, like wind through autumn leaves, is the only sound you make. If you appear within 5 feet of a creature, you have advantage on the next Charisma (Intimidation) check you make against it before the end of your turn.",
    source: "Codex of the Umbral Court",
    dm_only: false,
    tags: ["conjuration", "teleport", "bonus action"],
    campaign: "Shadows of Eltheria",
    created_at: at("2026-06-09"),
    properties: {
      level: "2",
      school: "conjuration",
      casting_time: "1 bonus action",
      range: "30 feet",
      components: ["V"],
      material: "",
      duration: "Instantaneous",
      classes: "Bard, Ranger, Warlock",
      ritual: false,
      concentration: false,
    },
  },
  {
    id: id(),
    name: "Scroll of Starfall Cascade",
    type: "scroll",
    description:
      "The parchment of this scroll is deep indigo, and the runes upon it are not written but pricked through, so that when held to a light source the incantation reads as a constellation.",
    source: "Codex of the Umbral Court",
    dm_only: false,
    tags: ["scroll", "evocation"],
    campaign: "",
    created_at: at("2026-06-10"),
    properties: {
      spell_name: "Starfall Cascade",
      spell_level: "5",
      level: "5",
      school: "evocation",
      casting_time: "1 action",
      range: "150 feet",
      components: ["V", "S"],
      material: "",
      duration: "Instantaneous",
      rarity: "rare",
      image_url: "/assets/scrolls.webp",
    },
  },

  // ── Creatures ─────────────────────────────────────────────
  {
    id: id(),
    name: "Grave Warden Colossus",
    type: "monster",
    description:
      "Built by a forgotten order to guard the tombs of kings, the colossus is a shambling monument of grave-soil, coffin wood and funerary bronze. Lantern-light burns in its hollow chest — one flame for every tomb it has sworn to keep.",
    source: "Bestiary of the Barrowlands",
    dm_only: true,
    tags: ["construct", "guardian", "barrow"],
    campaign: "Shadows of Eltheria",
    created_at: at("2026-06-11"),
    properties: {
      cr: "11 (7,200 XP)",
      size: "Huge",
      creature_type: "construct",
      alignment: "lawful neutral",
      ac: 17,
      hp: "168 (16d12 + 64)",
      speed: "30 ft.",
      ability_str: 24,
      ability_dex: 8,
      ability_con: 18,
      ability_int: 6,
      ability_wis: 16,
      ability_cha: 4,
      saving_throws: "Con +8, Wis +7",
      skills: "Perception +7",
      damage_resistances: "cold, necrotic",
      damage_immunities: "poison, psychic; bludgeoning, piercing, and slashing from nonmagical attacks",
      condition_immunities: "charmed, exhaustion, frightened, paralyzed, petrified, poisoned",
      senses: "darkvision 120 ft., passive Perception 17",
      languages: "understands the languages of its creator but can't speak",
      traits: [
        {
          name: "Tomb-Bound",
          desc: "The colossus knows the direction and distance to every tomb it has sworn to guard, and it cannot be compelled by magic to move more than 1 mile from the nearest of them.",
        },
        {
          name: "Funerary Light",
          desc: "The lanterns in the colossus's chest shed dim light in a 30-foot radius. Undead in this light have disadvantage on saving throws against being turned.",
        },
      ],
      actions: [
        {
          name: "Multiattack",
          desc: "The colossus makes two Bronze Fist attacks.",
        },
        {
          name: "Bronze Fist",
          desc: "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 25 (4d8 + 7) bludgeoning damage, and the target is knocked prone if it is Large or smaller.",
        },
        {
          name: "Toll the Lantern (Recharge 5–6)",
          desc: "The colossus rings its chest-lanterns. Each creature of the colossus's choice within 30 feet must succeed on a DC 16 Constitution saving throw or take 22 (4d10) thunder damage and be deafened until the end of its next turn.",
        },
      ],
      legendary_actions: {
        actions: [
          {
            name: "Step of the Sentinel",
            desc: "The colossus moves up to half its speed without provoking opportunity attacks.",
          },
          {
            name: "Snuff the Flame (Costs 2 Actions)",
            desc: "One light source within 60 feet is extinguished, magical light included if it was created by a spell of 3rd level or lower.",
          },
        ],
      },
      image_url: "/assets/monsters.webp",
    },
  },
  {
    id: id(),
    name: "Mirelda Thistlewhip, Potion Smuggler",
    type: "npc",
    description:
      "A halfling apothecary with a ferret named Consequence and a coat lined with forty-two concealed vial pockets. Mirelda sells legitimate remedies by day; by night she runs contraband elixirs past the excise wards of three cities. She never lies — she simply answers a slightly different question than the one asked.",
    source: "",
    dm_only: false,
    tags: ["halfling", "merchant", "contact"],
    campaign: "Shadows of Eltheria",
    created_at: at("2026-06-12"),
    properties: {
      role: "Smuggler / information broker",
      faction: "The Amber Chain",
      image_url: "/assets/npcs.webp",
    },
  },

  // ── Character Options ─────────────────────────────────────
  {
    id: id(),
    name: "Guild Cartographer",
    type: "background",
    description:
      "You spent years charting coastlines, cave systems and contested borders for a mapmakers' guild. Your work hangs in captains' cabins and generals' tents — and more than one of your maps contains a deliberate, profitable error known only to you.\n\n**Feature: Lay of the Land.** You can always recall the general layout of terrain, settlements and other features around you, and you can find food, water and shelter for yourself and up to five others each day in territory you have previously mapped.",
    source: "The Guild Ledger",
    dm_only: false,
    tags: ["background", "exploration"],
    campaign: "",
    created_at: at("2026-06-13"),
    properties: {
      skill_proficiencies: "Investigation, Survival",
      tool_proficiencies: "Cartographer's tools, navigator's tools",
      languages: "One of your choice",
      feature_name: "Lay of the Land",
      feature_description:
        "You can always recall the general layout of terrain, settlements and other features around you.",
      equipment:
        "Cartographer's tools, a map case with three maps of your own making, a signal whistle, traveller's clothes, and a pouch containing 15 gp",
      image_url: "/assets/backgrounds.webp",
    },
  },
  {
    id: id(),
    name: "Shieldbreaker",
    type: "feat",
    description:
      "You have trained to dismantle a foe's defences with brutal precision. You gain the following benefits:\n\n- Increase your Strength score by 1, to a maximum of 20.\n- When you hit a creature wielding a shield with a melee attack, you can force it to make a Strength saving throw (DC 8 + your proficiency bonus + your Strength modifier). On a failure, its shield is knocked 10 feet away.\n- You have advantage on attack rolls against creatures whose shields you have removed until the end of your turn.",
    source: "Forge of Legends, p.44",
    dm_only: false,
    tags: ["feat", "martial"],
    campaign: "",
    created_at: at("2026-06-14"),
    properties: {
      prerequisite: "Strength 13 or higher",
      benefit: "Knock shields from enemies' grips and punish the opening.",
      image_url: "/assets/feats.webp",
    },
  },
  {
    id: id(),
    name: "College of the Dirge",
    type: "subclass",
    description:
      "Bards of the College of the Dirge learn their art in funeral processions and on battlefields after the fighting is done. Their songs honour the dead — and remind the living exactly how easily they could join them.",
    source: "Codex of the Umbral Court",
    dm_only: false,
    tags: ["bard", "necrotic", "subclass"],
    campaign: "",
    created_at: at("2026-06-15"),
    properties: {
      parent_class: "Bard",
      level_features: [
        {
          level: 3,
          desc: "Dirgesinger. You learn the Toll the Dead cantrip, which doesn't count against your cantrips known. When you cast it, you can spend one use of Bardic Inspiration to add the Inspiration die to its damage.",
        },
        {
          level: 6,
          desc: "Chorus of Endings. As an action, you sing a phrase of the First Dirge. Each enemy of your choice within 30 feet that can hear you must succeed on a Wisdom saving throw against your spell save DC or be frightened of you until the end of your next turn.",
        },
        {
          level: 14,
          desc: "The Song Remembers. When a creature you can see within 60 feet drops to 0 hit points, you can use your reaction to capture a stanza of its ending. You regain one expended use of Bardic Inspiration, and your next Bardic Inspiration die granted before the end of your next turn is a d12 regardless of your level.",
        },
      ],
      image_url: "/assets/subclasses.webp",
    },
  },

  // ── Tables ────────────────────────────────────────────────
  {
    id: id(),
    name: "Strange Tavern Patrons",
    type: "table",
    description:
      "Roll on this table when the party enters a tavern and you need an interesting face in the crowd.",
    source: "",
    dm_only: false,
    tags: ["tavern", "npc", "roleplay"],
    campaign: "",
    created_at: at("2026-06-16"),
    properties: {
      die_type: "d12",
      columns: ["d12", "Patron"],
      rows: [
        ["1", "A retired adventurer who claims every scar has a different, contradictory story"],
        ["2", "Twin gnomes playing chess with pieces that occasionally move themselves"],
        ["3", "A hooded figure paying for drinks with coins from an empire that fell 300 years ago"],
        ["4", "A bard tuning a lute strung with what looks suspiciously like unicorn hair"],
        ["5", "An off-duty city guard drinking away the memory of something she saw in the sewers"],
        ["6", "A halfling merchant auctioning a 'genuine' dragon egg that is clearly painted stone"],
        ["7", "A wizard's apprentice frantically searching for a familiar that is asleep on his own hat"],
        ["8", "Two rival tax collectors pretending not to recognise each other"],
        ["9", "A dwarf funeral party toasting a 'departed' friend who is very much present and enjoying it"],
        ["10", "A silent monk who communicates only by rearranging spilled salt"],
        ["11", "A noble in commoner's clothes doing a terrible job of seeming common"],
        ["12", "The tavern cat, which sits at a table, has its own tankard, and is served without comment"],
      ],
      image_url: "/assets/tables.webp",
    },
  },
];
