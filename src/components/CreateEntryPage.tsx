
import { useState, type FormEvent, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getSubcategoryLabel } from "../lib/subcategories";
import { CATEGORIES } from "../types";
import type {
  EntryType,
  MagicItemProperties,
  WeaponProperties,
  ArmourProperties,
  PotionProperties,
  AdventuringGearProperties,
  SpellProperties,
  ScrollProperties,
  MonsterProperties,
  BackgroundProperties,
  FeatProperties,
  SubclassProperties,
  TableProperties,
} from "../types";
import {
  RARITY_OPTIONS,
  DAMAGE_TYPE_OPTIONS,
  BONUS_OPTIONS,
  ARMOUR_TYPE_OPTIONS,
  GEAR_CATEGORY_OPTIONS,
  SPELL_LEVEL_OPTIONS,
  SCHOOL_OPTIONS,
  COMPONENT_OPTIONS,
  CREATURE_SIZE_OPTIONS,
  CREATURE_TYPE_OPTIONS,
  PARENT_CLASS_OPTIONS,
  DIE_OPTIONS,
} from "../types";

interface FormState {
  type: EntryType | "";
  name: string;
  description: string;
  source: string;
  dm_only: boolean;
  tags: string;
  campaign: string;
  // magic_item
  rarity: string;
  requires_attunement: boolean;
  item_subtype: string;
  charges: string;
  // weapon
  damage_dice: string;
  damage_type: string;
  bonus: string;
  properties: string;
  cost: string;
  weight: string;
  // armour
  armour_type: string;
  stealth_disadvantage: boolean;
  // potion
  effect: string;
  duration: string;
  // adventuring gear
  gear_category: string;
  quantity: string;
  // spell
  spell_level: string;
  school: string;
  casting_time: string;
  range: string;
  components: string[];
  material: string;
  spell_duration: string;
  classes: string;
  ritual: boolean;
  concentration: boolean;
  // scroll
  spell_name: string;
  scroll_rarity: string;
  scroll_level: string;
  // monster / npc
  cr: string;
  size: string;
  creature_type: string;
  alignment: string;
  ac: string;
  hp: string;
  speed: string;
  ability_str: string;
  ability_dex: string;
  ability_con: string;
  ability_int: string;
  ability_wis: string;
  ability_cha: string;
  saving_throws: string;
  skills: string;
  damage_resistances: string;
  damage_immunities: string;
  condition_immunities: string;
  senses: string;
  languages: string;
  actions: string;
  legendary_actions: string;
  special_abilities: string;
  role: string;
  faction: string;
  // subcategory
  subcategory: string;
  // background
  skill_proficiencies: string;
  tool_proficiencies: string;
  bg_languages: string;
  feature_name: string;
  feature_description: string;
  equipment: string;
  personality_traits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  // feat
  prerequisite: string;
  benefit: string;
  // subclass
  parent_class: string;
  subclass_features: string;
  // table
  die: string;
  table_category: string;
  tableRows: { roll_range: string; result: string }[];
}

const EMPTY_FORM: FormState = {
  type: "",
  name: "",
  description: "",
  source: "",
  dm_only: false,
  tags: "",
  campaign: "",
  rarity: "",
  requires_attunement: false,
  item_subtype: "",
  charges: "",
  damage_dice: "",
  damage_type: "",
  bonus: "+0",
  properties: "",
  cost: "",
  weight: "",
  armour_type: "",
  stealth_disadvantage: false,
  effect: "",
  duration: "",
  gear_category: "",
  quantity: "",
  spell_level: "",
  school: "",
  casting_time: "",
  range: "",
  components: [],
  material: "",
  spell_duration: "",
  classes: "",
  ritual: false,
  concentration: false,
  spell_name: "",
  scroll_rarity: "",
  scroll_level: "",
  cr: "",
  size: "",
  creature_type: "",
  alignment: "",
  ac: "",
  hp: "",
  speed: "",
  ability_str: "",
  ability_dex: "",
  ability_con: "",
  ability_int: "",
  ability_wis: "",
  ability_cha: "",
  saving_throws: "",
  skills: "",
  damage_resistances: "",
  damage_immunities: "",
  condition_immunities: "",
  senses: "",
  languages: "",
  actions: "",
  legendary_actions: "",
  special_abilities: "",
  role: "",
  faction: "",
  subcategory: "",
  skill_proficiencies: "",
  tool_proficiencies: "",
  bg_languages: "",
  feature_name: "",
  feature_description: "",
  equipment: "",
  personality_traits: "",
  ideals: "",
  bonds: "",
  flaws: "",
  prerequisite: "",
  benefit: "",
  parent_class: "",
  subclass_features: "",
  die: "",
  table_category: "",
  tableRows: [],
};

type SaveStatus = "idle" | "saving" | "saved" | "error" | "duplicate";

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
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const allowDuplicate = useRef(false);


  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setStatus("idle");
    setErrorMsg("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.type) return;

    setStatus("saving");
    setErrorMsg("");

    let properties: Record<string, unknown> = {};

    if (form.type === "magic_item") {
      if (!form.rarity) {
        setErrorMsg("Rarity is required for magic items.");
        setStatus("idle");
        return;
      }
      const mp: MagicItemProperties = {
        rarity: form.rarity as MagicItemProperties["rarity"],
        requires_attunement: form.requires_attunement,
        item_subtype: form.item_subtype,
        charges: form.charges ? Number(form.charges) : 0,
      };
      properties = mp as unknown as Record<string, unknown>;
    }

    if (form.type === "weapon") {
      if (!form.damage_dice || !form.damage_type) {
        setErrorMsg("Damage dice and damage type are required for weapons.");
        setStatus("idle");
        return;
      }
      const wp: WeaponProperties = {
        damage_dice: form.damage_dice,
        damage_type: form.damage_type as WeaponProperties["damage_type"],
        bonus: form.bonus as WeaponProperties["bonus"],
        properties: form.properties,
        cost: form.cost,
        weight: form.weight ? Number(form.weight) : 0,
      };
      properties = wp as unknown as Record<string, unknown>;
    }

    if (form.type === "armour") {
      if (!form.armour_type) {
        setErrorMsg("Armour type is required.");
        setStatus("idle");
        return;
      }
      const ap: ArmourProperties = {
        armour_type: form.armour_type as ArmourProperties["armour_type"],

        bonus: form.bonus as ArmourProperties["bonus"],
        stealth_disadvantage: form.stealth_disadvantage,
        cost: form.cost,
        weight: form.weight ? Number(form.weight) : 0,
      };
      properties = ap as unknown as Record<string, unknown>;
    }

    if (form.type === "potion") {
      if (!form.effect) {
        setErrorMsg("Effect is required for potions.");
        setStatus("idle");
        return;
      }
      const pp: PotionProperties = {
        effect: form.effect,
        duration: form.duration,
        rarity: form.rarity,
      };
      properties = pp as unknown as Record<string, unknown>;
    }

    if (form.type === "spell") {
      if (!form.spell_level) {
        setErrorMsg("Level is required for spells.");
        setStatus("idle");
        return;
      }
      if (!form.school) {
        setErrorMsg("School is required for spells.");
        setStatus("idle");
        return;
      }
      if (!form.casting_time) {
        setErrorMsg("Casting time is required for spells.");
        setStatus("idle");
        return;
      }
      if (!form.range) {
        setErrorMsg("Range is required for spells.");
        setStatus("idle");
        return;
      }
      if (!form.spell_duration) {
        setErrorMsg("Duration is required for spells.");
        setStatus("idle");
        return;
      }
      const sp: SpellProperties = {
        level: form.spell_level,
        school: form.school,
        casting_time: form.casting_time,
        range: form.range,
        components: form.components,
        material: form.material,
        duration: form.spell_duration,
        classes: form.classes,
        ritual: form.ritual,
        concentration: form.concentration,
      };
      properties = sp as unknown as Record<string, unknown>;
    }

    if (form.type === "scroll") {
      if (!form.spell_name) {
        setErrorMsg("Spell name is required for scrolls.");
        setStatus("idle");
        return;
      }
      if (!form.scroll_level) {
        setErrorMsg("Spell level is required for scrolls.");
        setStatus("idle");
        return;
      }
      const sp: ScrollProperties = {
        spell_name: form.spell_name,
        spell_level: form.scroll_level,
        rarity: form.scroll_rarity,
      };
      properties = sp as unknown as Record<string, unknown>;
    }

    if (form.type === "adventuring_gear") {
      if (!form.gear_category) {
        setErrorMsg("Gear category is required for adventuring gear.");
        setStatus("idle");
        return;
      }
      const gp: AdventuringGearProperties = {
        gear_category: form.gear_category,
        quantity: form.quantity ? Number(form.quantity) : 1,
        properties: form.properties,
        cost: form.cost,
        weight: form.weight ? Number(form.weight) : 0,
      };
      properties = gp as unknown as Record<string, unknown>;
    }

    if (form.type === "monster" || form.type === "npc") {
      if (!form.cr) {
        setErrorMsg("CR is required for monsters and NPCs.");
        setStatus("idle");
        return;
      }
      if (!form.size) {
        setErrorMsg("Size is required for monsters and NPCs.");
        setStatus("idle");
        return;
      }
      if (!form.creature_type) {
        setErrorMsg("Creature type is required for monsters and NPCs.");
        setStatus("idle");
        return;
      }
      if (!form.ac) {
        setErrorMsg("AC is required for monsters and NPCs.");
        setStatus("idle");
        return;
      }
      const mp: MonsterProperties = {
        cr: form.cr,
        size: form.size,
        creature_type: form.creature_type,
        alignment: form.alignment,
        ac: form.ac ? Number(form.ac) : 0,
        hp: form.hp,
        speed: form.speed,
        ability_str: form.ability_str ? Number(form.ability_str) : 10,
        ability_dex: form.ability_dex ? Number(form.ability_dex) : 10,
        ability_con: form.ability_con ? Number(form.ability_con) : 10,
        ability_int: form.ability_int ? Number(form.ability_int) : 10,
        ability_wis: form.ability_wis ? Number(form.ability_wis) : 10,
        ability_cha: form.ability_cha ? Number(form.ability_cha) : 10,
        saving_throws: form.saving_throws,
        skills: form.skills,
        damage_resistances: form.damage_resistances,
        damage_immunities: form.damage_immunities,
        condition_immunities: form.condition_immunities,
        senses: form.senses,
        languages: form.languages,
        actions: form.actions,
        legendary_actions: form.legendary_actions,
        special_abilities: form.special_abilities,
      };
      properties = mp as unknown as Record<string, unknown>;

      if (form.type === "npc") {
        (properties as Record<string, unknown>).role = form.role;
        (properties as Record<string, unknown>).faction = form.faction;
      }
    }

    if (form.type === "background") {
      if (!form.feature_name) {
        setErrorMsg("Feature name is required for backgrounds.");
        setStatus("idle");
        return;
      }
      const bp: BackgroundProperties = {
        skill_proficiencies: form.skill_proficiencies,
        tool_proficiencies: form.tool_proficiencies,
        languages: form.bg_languages,
        feature_name: form.feature_name,
        feature_description: form.feature_description,
        equipment: form.equipment,
        personality_traits: form.personality_traits,
        ideals: form.ideals,
        bonds: form.bonds,
        flaws: form.flaws,
      };
      properties = bp as unknown as Record<string, unknown>;
    }

    if (form.type === "feat") {
      if (!form.benefit) {
        setErrorMsg("Benefit is required for feats.");
        setStatus("idle");
        return;
      }
      const fp: FeatProperties = {
        prerequisite: form.prerequisite,
        benefit: form.benefit,
      };
      properties = fp as unknown as Record<string, unknown>;
    }

    if (form.type === "subclass") {
      if (!form.parent_class) {
        setErrorMsg("Parent class is required for subclasses.");
        setStatus("idle");
        return;
      }
      const sp: SubclassProperties = {
        parent_class: form.parent_class,
        subclass_features: form.subclass_features,
      };
      properties = sp as unknown as Record<string, unknown>;
    }

    if (form.type === "table") {
      if (!form.die) {
        setErrorMsg("Die is required for tables.");
        setStatus("idle");
        return;
      }
      if (!form.tableRows.length || !form.tableRows.some((r) => r.result.trim())) {
        setErrorMsg("At least one row with a result is required.");
        setStatus("idle");
        return;
      }
      const tp: TableProperties = {
        die: form.die,
        table_category: form.table_category,
        rows: form.tableRows.map((r) => ({
          roll_range: r.roll_range,
          result: r.result,
        })),
      };
      properties = tp as unknown as Record<string, unknown>;
    }

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Check for duplicate
    if (status !== "duplicate") {
      const { data: existing } = await supabase
        .from("entries")
        .select("id")
        .eq("name", form.name.trim())
        .eq("type", form.type)
        .maybeSingle();

      if (existing) {
        setStatus("duplicate");
        return;
      }
    }

    const payload = {
      name: form.name,
      type: form.type,
      description: form.description,
      source: form.source,
      dm_only: form.dm_only,
      tags,
      campaign: form.campaign,
      properties: {
        ...properties,
        subcategory: form.subcategory,
      },
    };

    const { error } = await supabase.from("entries").insert(payload);

    if (error) {
      console.error("Insert error:", error);
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }

    setStatus("saved");
  }

  // ───── field builder helpers ─────

  const sharedField = (label: string, key: keyof FormState, kind: "text" | "textarea" = "text") => (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-300">{label}</label>
      {kind === "textarea" ? (
        <textarea
          value={form[key] as string}
          onChange={(e) => update(key, e.target.value as never)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={form[key] as string}
          onChange={(e) => update(key, e.target.value as never)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      )}
    </div>
  );

  const toggleField = (label: string, key: "dm_only" | "requires_attunement" | "stealth_disadvantage" | "ritual" | "concentration") => (
    <label className="flex cursor-pointer items-center gap-3">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <button
        type="button"
        onClick={() => update(key, !form[key])}
        className={`relative h-6 w-11 rounded-full transition-colors ${form[key] ? "bg-amber-600" : "bg-zinc-700"}`}
      >
        <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform ${form[key] ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </label>
  );

  const selectField = (label: string, key: keyof FormState, options: readonly string[], placeholder?: string) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-300">{label}</label>
      <select
        value={form[key] as string}
        onChange={(e) => update(key, e.target.value as never)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
    </div>
  );

  const numField = (label: string, key: "charges" | "weight" | "quantity" | "ac") => (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-300">{label}</label>
      <input
        type="number"
        min={0}
        value={form[key]}
        onChange={(e) => update(key, e.target.value as never)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
    </div>
  );

  // ───── property section components ─────

  const sharedDetailsSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Details</h2>
      {sharedField("Name", "name")}
      {sharedField("Description", "description", "textarea")}
      {sharedField("Source", "source")}
      {toggleField("DM Only", "dm_only")}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Tags</label>
        <input type="text" value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="e.g. common, consumable, fire" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
        <p className="mt-1 text-xs text-zinc-500">Comma-separated</p>
      </div>
      {sharedField("Campaign", "campaign")}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Subcategory</label>
        <select
          value={form.subcategory}
          onChange={(e) => update("subcategory", e.target.value as never)}
          disabled
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-500 opacity-60 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:cursor-not-allowed"
        >
          <option value={form.subcategory}>{form.subcategory}</option>
        </select>
      </div>
    </div>
  );

  const magicItemSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Magic Item Properties</h2>
      {selectField("Rarity", "rarity", RARITY_OPTIONS, "Select rarity")}
      {toggleField("Requires Attunement", "requires_attunement")}
      {sharedField("Item Subtype", "item_subtype")}
      {numField("Charges", "charges")}
    </div>
  );

  const weaponSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Weapon Properties</h2>
      {sharedField("Damage Dice", "damage_dice")}
      {selectField("Damage Type", "damage_type", DAMAGE_TYPE_OPTIONS, "Select damage type")}
      {selectField("Bonus", "bonus", BONUS_OPTIONS)}
      {sharedField("Properties", "properties")}
      {sharedField("Cost", "cost")}
      {numField("Weight", "weight")}
    </div>
  );

  const armourSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Armour Properties</h2>
      {selectField("Armour Type", "armour_type", ARMOUR_TYPE_OPTIONS, "Select armour type")}
      {selectField("Bonus", "bonus", BONUS_OPTIONS)}
      {toggleField("Stealth Disadvantage", "stealth_disadvantage")}
      {sharedField("Cost", "cost")}
      {numField("Weight", "weight")}
    </div>
  );

  const potionSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Potion Properties</h2>
      {sharedField("Effect", "effect")}
      {sharedField("Duration", "duration")}
      {selectField("Rarity", "rarity", RARITY_OPTIONS, "Select rarity")}
    </div>
  );

  const spellSection = () => {
    const toggleComponent = (comp: string) => {
      const current = form.components;
      const next = current.includes(comp)
        ? current.filter((c) => c !== comp)
        : [...current, comp];
      update("components", next);
    };

    return (
      <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Spell Properties</h2>
        {selectField("Level", "spell_level", SPELL_LEVEL_OPTIONS, "Select level")}
        {selectField("School", "school", SCHOOL_OPTIONS, "Select school")}
        {sharedField("Casting Time", "casting_time")}
        {sharedField("Range", "range")}

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Components</label>
          <div className="flex gap-4">
            {COMPONENT_OPTIONS.map((comp) => (
              <label key={comp} className="flex cursor-pointer items-center gap-1.5 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.components.includes(comp)}
                  onChange={() => toggleComponent(comp)}
                  className="size-4 rounded border-zinc-600 bg-zinc-800 text-amber-600 accent-amber-600"
                />
                {comp}
              </label>
            ))}
          </div>
        </div>

        {form.components.includes("M") && sharedField("Material", "material")}

        {sharedField("Duration", "spell_duration")}
        {sharedField("Classes", "classes")}
        {toggleField("Ritual", "ritual")}
        {toggleField("Concentration", "concentration")}
      </div>
    );
  };

  const scrollSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Scroll Properties</h2>
      {sharedField("Spell Name", "spell_name")}
      {selectField("Spell Level", "scroll_level", SPELL_LEVEL_OPTIONS, "Select level")}
      {selectField("Rarity", "scroll_rarity", RARITY_OPTIONS, "Select rarity")}
    </div>
  );

  const gearSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Adventuring Gear Properties</h2>
      {selectField("Gear Category", "gear_category", GEAR_CATEGORY_OPTIONS, "Select category")}
      {numField("Quantity", "quantity")}
      {sharedField("Properties", "properties")}
      {sharedField("Cost", "cost")}
      {numField("Weight", "weight")}
    </div>
  );

  const trinketSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Trinket Properties</h2>
      <p className="text-sm text-zinc-500 italic">Trinkets have no extra properties — name and description are enough.</p>
    </div>
  );

  const abilityRow = (label: string, key: "ability_str" | "ability_dex" | "ability_con" | "ability_int" | "ability_wis" | "ability_cha") => (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-bold text-zinc-500 uppercase">{label}</span>
      <input
        type="number"
        min={1}
        max={30}
        value={form[key]}
        onChange={(e) => update(key, e.target.value as never)}
        className="w-16 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-center text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
    </div>
  );

  const monsterSection = (isNpc: boolean) => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">{isNpc ? "NPC" : "Monster"} Properties</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {sharedField("CR", "cr")}
        {selectField("Size", "size", CREATURE_SIZE_OPTIONS, "Select size")}
        {selectField("Type", "creature_type", CREATURE_TYPE_OPTIONS, "Select type")}
      </div>

      {sharedField("Alignment", "alignment")}

      <div className="grid grid-cols-3 gap-4">
        {numField("AC", "ac")}
        {sharedField("HP", "hp")}
        {sharedField("Speed", "speed")}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">Ability Scores</label>
        <div className="flex flex-wrap gap-4">
          {abilityRow("STR", "ability_str")}
          {abilityRow("DEX", "ability_dex")}
          {abilityRow("CON", "ability_con")}
          {abilityRow("INT", "ability_int")}
          {abilityRow("WIS", "ability_wis")}
          {abilityRow("CHA", "ability_cha")}
        </div>
      </div>

      {sharedField("Saving Throws", "saving_throws")}
      {sharedField("Skills", "skills")}
      {sharedField("Damage Resistances", "damage_resistances")}
      {sharedField("Damage Immunities", "damage_immunities")}
      {sharedField("Condition Immunities", "condition_immunities")}
      {sharedField("Senses", "senses")}
      {sharedField("Languages", "languages")}
      {sharedField("Actions", "actions", "textarea")}
      {sharedField("Legendary Actions", "legendary_actions", "textarea")}
      {sharedField("Special Abilities", "special_abilities", "textarea")}

      {isNpc && (
        <>
          {sharedField("Role", "role")}
          {sharedField("Faction", "faction")}
        </>
      )}
    </div>
  );

  const backgroundSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Background Properties</h2>

      {sharedField("Skill Proficiencies", "skill_proficiencies")}
      {sharedField("Tool Proficiencies", "tool_proficiencies")}
      {sharedField("Languages", "bg_languages")}
      {sharedField("Feature Name", "feature_name")}
      <span className="text-xs text-zinc-500">Required</span>
      {sharedField("Feature Description", "feature_description", "textarea")}
      {sharedField("Equipment", "equipment")}
      {sharedField("Personality Traits", "personality_traits", "textarea")}
      {sharedField("Ideals", "ideals", "textarea")}
      {sharedField("Bonds", "bonds", "textarea")}
      {sharedField("Flaws", "flaws", "textarea")}
    </div>
  );

  const featSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Feat Properties</h2>

      {sharedField("Prerequisite", "prerequisite")}
      {sharedField("Benefit", "benefit", "textarea")}
      <span className="text-xs text-zinc-500">Required</span>
    </div>
  );

  const subclassSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Subclass Properties</h2>

      {selectField("Parent Class", "parent_class", PARENT_CLASS_OPTIONS, "Select a class")}
      <span className="text-xs text-zinc-500">Required</span>
      {sharedField("Subclass Features", "subclass_features", "textarea")}
    </div>
  );

  const addRow = () => {
    setForm((prev) => ({
      ...prev,
      tableRows: [...prev.tableRows, { roll_range: "", result: "" }],
    }));
  };

  const removeRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tableRows: prev.tableRows.filter((_, i) => i !== index),
    }));
  };

  const updateRow = (index: number, field: "roll_range" | "result", value: string) => {
    setForm((prev) => {
      const rows = [...prev.tableRows];
      const existing = rows[index];
      if (!existing) return prev;
      rows[index] = {
        roll_range: field === "roll_range" ? value : existing.roll_range,
        result: field === "result" ? value : existing.result,
      };
      return { ...prev, tableRows: rows };
    });
  };

  const tableSection = () => (
    <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Table Properties</h2>

      {selectField("Die", "die", DIE_OPTIONS, "Select die")}
      <span className="text-xs text-zinc-500">Required</span>
      {sharedField("Table Category", "table_category")}

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">Rows</label>
        <span className="text-xs text-zinc-500">At least one row with a result is required</span>

        {form.tableRows.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500 italic">No rows yet. Add one below.</p>
        )}

        {form.tableRows.map((row, i) => (
          <div key={i} className="mt-2 flex items-start gap-2">
            <div className="w-1/3 shrink-0">
              <input
                type="text"
                value={row.roll_range}
                onChange={(e) => updateRow(i, "roll_range", e.target.value)}
                placeholder="e.g. 1-5"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={row.result}
                onChange={(e) => updateRow(i, "result", e.target.value)}
                placeholder="Result description"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="mt-0.5 size-8 shrink-0 rounded-md bg-red-900/50 text-sm text-red-400 hover:bg-red-800/50 hover:text-red-300"
              title="Remove row"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700"
        >
          + Add Row
        </button>
      </div>
    </div>
  );

  const propertySection = () => {
    switch (form.type) {
      case "magic_item": return magicItemSection();
      case "weapon": return weaponSection();
      case "armour": return armourSection();
      case "potion": return potionSection();
      case "adventuring_gear": return gearSection();
      case "trinket": return trinketSection();
      case "spell": return spellSection();
      case "scroll": return scrollSection();
      case "monster": return monsterSection(false);
      case "npc": return monsterSection(true);
      case "background": return backgroundSection();
      case "feat": return featSection();
      case "subclass": return subclassSection();
      case "table": return tableSection();
      default: return null;
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/" className="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-300">&larr; Home</Link>
        <h1 className="text-2xl font-bold text-zinc-100">Create New Entry</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ───── entry type card grid ───── */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {ENTRY_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                const sub = getSubcategoryLabel(value);
                setForm({ ...EMPTY_FORM, type: value, subcategory: sub });
                setStatus("idle");
                setErrorMsg("");
              }}
              className={`gilded-border relative flex items-center overflow-hidden rounded-lg text-left ${
                form.type === value
                  ? "ring-2 ring-[var(--color-gilding-light)]"
                  : ""
              }`}
            >
              {/* thumbnail on the right */}
              <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
                <img
                  src={TYPE_IMAGES[value]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              {/* text on the left */}
              <div className="flex flex-1 flex-col justify-center px-4 py-3">
                <span className="font-[var(--font-title)] text-[21px] font-bold leading-tight text-[#58180d]">
                  {label}
                </span>
                <span className="mt-1 text-[15px] italic leading-tight text-[#766649]">
                  {getParentCategory(value)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {form.type && (
          <>
            {sharedDetailsSection()}
            {propertySection()}

            <button
              type="submit"
              disabled={status === "saving"}
              className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "saving" ? "Saving\u2026" : "Save Entry"}
            </button>
          </>
        )}

        {status === "saved" && (
          <div className="rounded-lg border border-emerald-700 bg-emerald-900/50 px-4 py-3 text-sm text-emerald-300">
            Entry saved successfully!{" "}
            <button
              type="button"
              onClick={resetForm}
              className="ml-2 underline underline-offset-2 hover:text-emerald-200"
            >
              Create another
            </button>
          </div>
        )}

        {status === "duplicate" && (
          <div className="rounded-lg border border-amber-700 bg-amber-900/50 px-4 py-3 text-sm text-amber-300">
            An entry with this name and type already exists.
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  allowDuplicate.current = false;
                }}
                className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
              >
                Go back
              </button>
              <button
                type="submit"
                onClick={() => { allowDuplicate.current = true; }}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
              >
                Save anyway
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-lg border border-red-700 bg-red-900/50 px-4 py-3 text-sm text-red-300">
            {errorMsg || "Something went wrong. Check the console."}
          </div>
        )}
      </form>
    </div>
  );
}