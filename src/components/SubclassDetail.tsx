import { DbEntry } from "../types";
import MarkdownDescription from "./MarkdownDescription";

const s = (v: unknown): string => String(v ?? "");

export default function SubclassDetail({ entry }: { entry: DbEntry }) {
  const p = entry.properties ?? {};
  const pc = s(p.parent_class);
  const feats = (p.level_features as { level: number; desc: string }[]) ?? [];

  return (
    <>
      <h1 className="phb-h1 !text-2xl">{entry.name}</h1>
      {pc && <p className="phb-description mt-0.5 text-sm capitalize">{pc} subclass</p>}
      {entry.description && (
        <div className="phb-body mt-4 leading-relaxed">
          <MarkdownDescription text={entry.description} dropCap />
        </div>
      )}
      {feats.length > 0 && (
        <div className="clear-both mt-6 space-y-4">
          {feats.map((f, i) => (
            <div key={i}>
              <h3 className="phb-h3 !text-base">
                Level {f.level}
              </h3>
              <div className="phb-body mt-1 text-sm leading-relaxed">
                <MarkdownDescription text={f.desc} />
              </div>
            </div>
          ))}
        </div>
      )}

      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {entry.tags.map(t => <span key={t} className="phb-tag">{t}</span>)}
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