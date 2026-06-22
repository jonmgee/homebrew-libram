import { useParams, Link } from "react-router-dom";
import { formatEntryType } from "../types";

export default function CreateEntryInputPage() {
  const { type } = useParams<{ type: string }>();
  const label = type ? formatEntryType(type) : "Unknown";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 text-center">
        <Link to="/create" className="mb-2 block text-sm text-[#766649] underline underline-offset-2 hover:text-[#58180d]">&larr; Entry Type</Link>
        <h1 className="phb-h1 !text-3xl text-[#58180d]">{label}</h1>
      </div>

      <div className="gilded-border flex flex-col items-center gap-4 px-6 py-16 text-center">
        <p className="text-lg italic text-[#766649]">
          Input screen for <strong className="not-italic text-[#58180d]">{label}</strong> coming soon…
        </p>
        <p className="text-sm text-[#766649]">
          Jon's cooking up a multi-modal intake system — screenshots, PDFs, manual entry, and more.
        </p>
      </div>
    </div>
  );
}