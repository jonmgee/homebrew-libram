import { useParams, Link } from "react-router-dom";
import { formatEntryType } from "../types";
import type { EntryType } from "../types";
import EntryForm from "./EntryForm";

export default function CreateEntryInputPage() {
  const { type } = useParams<{ type: string }>();

  // Validate that type is a known entry type
  const knownTypes: EntryType[] = [
    "magic_item", "weapon", "armour", "potion", "adventuring_gear", "trinket",
    "spell", "scroll", "monster", "npc", "background", "feat", "subclass", "table",
  ];

  if (!type || !knownTypes.includes(type as EntryType)) {
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

  const entryType = type as EntryType;
  const label = formatEntryType(entryType);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 text-center">
        <Link to="/create" className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; Entry Type</Link>
        <h1 className="phb-h1 !text-3xl text-[#58180d]">{label}</h1>
      </div>

      <EntryForm entryType={entryType} />
    </div>
  );
}