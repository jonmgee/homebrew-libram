import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type {
  EntryType,
  MagicItemProperties,
  WeaponProperties,
  ArmourProperties,
  PotionProperties,
  AdventuringGearProperties,
} from "../types";
import {
  RARITY_OPTIONS,
  DAMAGE_TYPE_OPTIONS,
  BONUS_OPTIONS,
  ARMOUR_TYPE_OPTIONS,
  GEAR_CATEGORY_OPTIONS,
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
  base_ac: string;
  stealth_disadvantage: boolean;
  // potion
  effect: string;
  duration: string;
  // adventuring gear
  gear_category: string;
  quantity: string;
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
  base_ac: "",
  stealth_disadvantage: false,
  effect: "",
  duration: "",
  gear_category: "",
  quantity: "",
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: "magic_item", label: "Magic Item" },
  { value: "weapon", label: "Weapon" },
  { value: "armour", label: "Armour" },
  { value: "potion", label: "Potion" },
  { value: "adventuring_gear", label: "Adventuring Gear" },
  { value: "trinket", label: "Trinket" },
];

export default function CreateEntryPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
        base_ac: form.base_ac ? Number(form.base_ac) : 0,
        bonus: form.bonus as ArmourProperties["bonus"],
        stealth_disadvantage: form.stealth_disadvantage,
        cost: form.cost,
        weight: form.weight ? Number(form.weight) : 0,
      };
      properties = ap as unknown as Record<string, unknown>;
    }

    if (form.type === "potion") {
      const pp: PotionProperties = {
        effect: form.effect,
        duration: form.duration,
        rarity: form.rarity,
        charges: form.charges ? Number(form.charges) : 1,
      };
      properties = pp as unknown as Record<string, unknown>;
    }

    if (form.type === "adventuring_gear") {
      const gp: AdventuringGearProperties = {
        gear_category: form.gear_category,
        quantity: form.quantity ? Number(form.quantity) : 1,
        properties: form.properties,
        cost: form.cost,
        weight: form.weight ? Number(form.weight) : 0,
      };
      properties = gp as unknown as Record<string, unknown>;
    }

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      type: form.type,
      description: form.description,
      source: form.source,
      dm_only: form.dm_only,
      tags,
      campaign: form.campaign,
      properties,
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

  const toggleField = (label: string, key: "dm_only" | "requires_attunement" | "stealth_disadvantage") => (
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

  const numField = (label: string, key: "charges" | "weight" | "base_ac" | "quantity") => (
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
      {numField("Base AC", "base_ac")}
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
      {numField("Charges", "charges")}
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

  const propertySection = () => {
    switch (form.type) {
      case "magic_item": return magicItemSection();
      case "weapon": return weaponSection();
      case "armour": return armourSection();
      case "potion": return potionSection();
      case "adventuring_gear": return gearSection();
      case "trinket": return trinketSection();
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
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Entry Type</label>
          <div className="flex flex-wrap gap-2">
            {ENTRY_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => { update("type", value); setStatus("idle"); setErrorMsg(""); }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  form.type === value ? "bg-amber-600 text-white" : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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

        {status === "error" && (
          <div className="rounded-lg border border-red-700 bg-red-900/50 px-4 py-3 text-sm text-red-300">
            {errorMsg || "Something went wrong. Check the console."}
          </div>
        )}
      </form>
    </div>
  );
}