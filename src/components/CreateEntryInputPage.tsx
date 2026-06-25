import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getCategory, formatEntryType } from "../types";
import type { EntryType } from "../types";
import { CustomSelect } from "./MonsterForm";
import EntryForm from "./EntryForm";

const CATEGORY_ORDER: Record<string, EntryType[]> = {
  treasure: ["magic_item", "weapon", "armour", "potion", "adventuring_gear", "trinket"],
  arcana: ["spell", "scroll"],
  creatures: ["monster", "npc"],
  character_options: ["background", "feat", "subclass"],
};

export default function CreateEntryInputPage() {
  const { type } = useParams<{ type: string }>();
  const [selectedType, setSelectedType] = useState<EntryType | null>(null);

  // Determine if the param is a category slug or an individual entry type
  const categorySlug = useMemo(() => {
    if (!type) return null;
    const param = type as string;

    // Known category slugs
    const slugs = ["treasure", "arcana", "creatures", "character_options", "tables"];
    if (slugs.includes(param)) return param;

    return null;
  }, [type]);

  const directType = useMemo(() => {
    if (!type) return null;
    const knownTypes: EntryType[] = [
      "magic_item", "weapon", "armour", "potion", "adventuring_gear", "trinket",
      "spell", "scroll", "monster", "npc", "background", "feat", "subclass", "table",
    ];
    if (knownTypes.includes(type as EntryType)) return type as EntryType;
    return null;
  }, [type]);

  // If it's a category slug, get the types for the dropdown
  const catTypes = useMemo(() => {
    if (!categorySlug) return [];
    // Tables: no dropdown, go straight to table form
    if (categorySlug === "tables") return ["table" as EntryType];
    return CATEGORY_ORDER[categorySlug] ?? [];
  }, [categorySlug]);

  const isTablesDirect = categorySlug === "tables";

  // The entry type to render: either direct, or dropdown-selected, or table
  const entryType = directType ?? (isTablesDirect ? "table" as EntryType : selectedType);

  // Only show heading/dropdown when it's a category with subtypes
  const showSubtypePicker = !!categorySlug && !isTablesDirect;

  // Heading text
  let heading: string;
  if (directType) {
    heading = formatEntryType(directType);
  } else if (isTablesDirect) {
    heading = "Table";
  } else if (categorySlug) {
    const cat = getCategory(categorySlug);
    heading = `New ${cat?.label ?? categorySlug}`;
  } else {
    heading = "Unknown Entry Type";
  }

  // Validation: if neither category nor direct type, show error
  if (!type || (!categorySlug && !directType)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 text-center">
          <Link to="/create" className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; Entry Type</Link>
          <h1 className="phb-h1 !text-3xl text-[#58180d]">Unknown Entry Type</h1>
        </div>
        <div className="gilded-border flex flex-col items-center gap-4 px-6 py-16 text-center">
          <p className="text-sm text-[#766649]">That entry type doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 text-center">
        <Link to="/create" className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; Entry Type</Link>
        <h1 className="phb-h1 !text-3xl text-[#58180d]">{heading}</h1>

        {showSubtypePicker && (
          <div className="mt-4 mx-auto max-w-xs">
            <CustomSelect
              value={selectedType ?? ""}
              onChange={(v) => setSelectedType(v ? (v as EntryType) : null)}
              options={catTypes}
              getLabel={formatEntryType}
              placeholder="Select subtype…"
            />
          </div>
        )}
      </div>

      {entryType ? (
        <EntryForm key={entryType} entryType={entryType} />
      ) : (
        <div className="gilded-border flex flex-col items-center gap-4 px-6 py-16 text-center">
          <p className="text-sm text-[#766649]">Select a subtype above to get started.</p>
        </div>
      )}
    </div>
  );
}