import type { DbEntry } from "../types";
import MarkdownDescription from "./MarkdownDescription";
import { readSizes, readSpeed, readTraits } from "../lib/characterOptions";

export default function SpeciesDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const creatureType = typeof p.creature_type === "string" ? p.creature_type : "";
  const sizes = readSizes(p.sizes);
  const speed = readSpeed(p.speed);
  const traits = readTraits(p.traits).filter((t) => t.name || t.desc);

  return (
    <>
      <h1 className="phb-h1 !text-2xl">
        {entry.name}
        {entry.dm_only && <span className="dm-stamp ml-3 align-middle">DM</span>}
      </h1>
      <p className="phb-description mt-0.5 text-sm">Species</p>

      {entry.description && (
        <div className="phb-body mt-4 leading-relaxed">
          <MarkdownDescription text={entry.description} dropCap />
        </div>
      )}

      <div className="phb-body mt-4 space-y-1 text-sm">
        {creatureType && <p><strong>Creature Type:</strong> {creatureType}</p>}
        {sizes.length > 0 && <p><strong>Size:</strong> {sizes.join(" or ")}</p>}
        {speed && <p><strong>Speed:</strong> {speed} feet</p>}
      </div>

      {traits.length > 0 && (
        <div className="clear-both mt-6">
          <h3 className="phb-h3 !text-base">{entry.name} Traits</h3>
          <div className="phb-body mt-2 space-y-3 text-sm leading-relaxed">
            {traits.map((t, i) => (
              <div key={i}>
                {t.name && <p className="mb-0.5 font-bold italic">{t.name}.</p>}
                <MarkdownDescription text={t.desc} />
              </div>
            ))}
          </div>
        </div>
      )}

      {(entry.source || entry.campaign) && (
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1 border-t border-parchment-dark pt-4">
          {entry.source && <span className="phb-description text-sm">Source: {entry.source}</span>}
          {entry.campaign && <span className="phb-description text-sm">Campaign: {entry.campaign}</span>}
        </div>
      )}
    </>
  );
}
