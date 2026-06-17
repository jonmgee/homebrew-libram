import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import type {
  EntryType,
  MagicItemProperties,
  WeaponProperties,
} from "../types";
import {
  RARITY_OPTIONS,
  DAMAGE_TYPE_OPTIONS,
  BONUS_OPTIONS,
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
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

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

    // Build JSONB properties based on type
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

    // Parse tags — split on comma, trim whitespace, filter empties
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

  const sharedField = (
    label: string,
    key: keyof FormState,
    kind: "text" | "textarea" = "text",
  ) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-300">
        {label}
      </label>
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

  const toggleField = (
    label: string,
    key: "dm_only" | "requires_attunement",
  ) => (
    <label className="flex cursor-pointer items-center gap-3">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <button
        type="button"
        onClick={() => update(key, !form[key])}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          form[key] ? "bg-amber-600" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform ${
            form[key] ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );

  const selectField = (
    label: string,
    key: keyof FormState,
    options: readonly string[],
    placeholder?: string,
  ) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <select
        value={form[key] as string}
        onChange={(e) => update(key, e.target.value as never)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const numField = (label: string, key: "charges" | "weight") => (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        type="number"
        min={0}
        value={form[key]}
        onChange={(e) => update(key, e.target.value as never)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-zinc-100">
        Create New Entry
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Entry Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Entry Type
          </label>
          <div className="flex gap-3">
            {(["magic_item", "weapon"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  update("type", t);
                  setStatus("idle");
                  setErrorMsg("");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  form.type === t
                    ? "bg-amber-600 text-white"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {t === "magic_item" ? "Magic Item" : "Weapon"}
              </button>
            ))}
          </div>
        </div>

        {form.type && (
          <>
            {/* Shared Fields */}
            <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Details
              </h2>

              {sharedField("Name", "name")}
              {sharedField("Description", "description", "textarea")}
              {sharedField("Source", "source")}
              {toggleField("DM Only", "dm_only")}

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">
                  Tags
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  placeholder="e.g. common, consumable, fire"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Comma-separated
                </p>
              </div>

              {sharedField("Campaign", "campaign")}
            </div>

            {/* Type-specific Fields — Magic Item */}
            {form.type === "magic_item" && (
              <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Magic Item Properties
                </h2>

                {selectField("Rarity", "rarity", RARITY_OPTIONS, "Select rarity")}
                {toggleField("Requires Attunement", "requires_attunement")}
                {sharedField("Item Subtype", "item_subtype")}
                {numField("Charges", "charges")}
              </div>
            )}

            {/* Type-specific Fields — Weapon */}
            {form.type === "weapon" && (
              <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Weapon Properties
                </h2>

                {sharedField("Damage Dice", "damage_dice")}
                {selectField("Damage Type", "damage_type", DAMAGE_TYPE_OPTIONS, "Select damage type")}
                {selectField("Bonus", "bonus", BONUS_OPTIONS)}
                {sharedField("Properties", "properties")}
                {sharedField("Cost", "cost")}
                {numField("Weight", "weight")}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "saving"}
              className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "saving" ? "Saving…" : "Save Entry"}
            </button>
          </>
        )}

        {/* Status messages */}
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
