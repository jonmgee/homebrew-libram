import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboard,
  faImage,
  faFilePdf,
  faFileAlt,
  faSave,
  faTimes,
  faUpload,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { formatEntryType, CATEGORIES, SPELL_LEVEL_OPTIONS, SCHOOL_OPTIONS, COMPONENT_OPTIONS } from "../types";
import type { EntryType } from "../types";
import { supabase } from "../lib/supabase";
import MonsterForm, { abilMod, modStr, crToProf, CR_LIST, SIZE_LIST, ABILITIES, SKILL_LIST, SKILL_ABIL, useTags as useMonsterTags, TagRow, RepeatBlock } from "./MonsterForm";

/* ──────────── Props ──────────── */
interface EntryFormProps {
  entryType: EntryType;
}

/* ──────────── Tab config ──────────── */
type TabId = "manual" | "import";
const TABS: { id: TabId; label: string }[] = [
  { id: "manual", label: "Manual Entry" },
  { id: "import", label: "Import" },
];

/* ──────────── Import card config ──────────── */
const IMPORT_METHODS = [
  { label: "Paste Text", icon: faClipboard },
  { label: "Upload Image", icon: faImage },
  { label: "Upload PDF", icon: faFilePdf },
  { label: "Upload Document", icon: faFileAlt },
];

/* ──────────── All entry types for the dropdown ──────────── */
const ALL_TYPES: EntryType[] = [
  "magic_item", "weapon", "armour", "potion", "adventuring_gear", "trinket",
  "spell", "scroll", "monster", "npc", "background", "feat", "subclass", "table",
];

/* ──────────── Component ──────────── */
export default function EntryForm({ entryType }: EntryFormProps) {
  const [activeTab, setActiveTab] = useState<TabId>("manual");
  const [importType, setImportType] = useState<EntryType>(entryType);

  return (
    <div>
      {/* ───── tabs ───── */}
      <div className="flex gap-0 pl-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative z-10 rounded-t-lg px-5 py-2 text-sm font-bold
                font-[var(--font-title)] transition-colors
                ${isActive
                  ? "border-t border-x border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] text-[#58180d]"
                  : "border border-transparent bg-[var(--color-parchment-dark)]/40 text-[#766649] hover:bg-[var(--color-parchment-dark)]/60"
                }
              `}
              style={
                isActive
                  ? { borderBottomColor: "var(--color-parchment-light)", marginBottom: "-1px" }
                  : undefined
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ───── form panel ───── */}
      <div className="gilded-border rounded-lg rounded-tl-none bg-[var(--color-parchment-light)] p-5 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {activeTab === "manual" ? (
              <ManualEntryTab entryType={entryType} />
            ) : (
              <ImportTab importType={importType} setImportType={setImportType} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ──────── Simple tag input hook ──────── */
function useTagInput(initial: string[] = []) {
  const [tags, setTags] = useState<string[]>(initial);
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]!);
    }
  };

  const resetTags = () => setTags([]);
  return { tags, input, setInput, addTag, removeTag, handleKeyDown, resetTags };
}

/* ──────── Generic custom dropdown ──────── */
function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  getLabel,
  placeholder,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  getLabel: (v: T) => string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(e.relatedTarget)) {
      setOpen(false);
    }
  };

  const selectedLabel = value ? getLabel(value) : (placeholder ?? "Select…");

  return (
    <div ref={ref} tabIndex={0} onBlur={handleBlur} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] transition-colors focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
      >
        <span>{selectedLabel}</span>
        <svg
          className={`size-4 text-[#766649] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-sm font-[var(--font-phb)] transition-colors hover:bg-[var(--color-parchment-dark)] ${
                opt === value
                  ? "bg-[var(--color-parchment-dark)] font-bold text-[#58180d]"
                  : "text-[var(--color-ink)]"
              }`}
            >
              {getLabel(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────── Rarity values (with None) ──────── */
const RARITY_WITH_NONE = ["", "common", "uncommon", "rare", "very rare", "legendary", "artifact"] as const;

const RARITY_LABELS: Record<string, string> = {
  "": "None",
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  "very rare": "Very Rare",
  legendary: "Legendary",
  artifact: "Artifact",
};

/* ──────── Rarity dropdown (uses CustomSelect) ──────── */
function RarityDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={RARITY_WITH_NONE}
      getLabel={(v) => RARITY_LABELS[v] ?? "None"}
    />
  );
}

/* ──────── Which entry types get the treasure form ──────── */
const TREASURE_TYPES: EntryType[] = [
  "magic_item", "wondrous_item", "weapon", "armour", "potion", "adventuring_gear", "trinket",
];

/* ──────── Simple types (NPC, Background, Feat) ──────── */
const SIMPLE_TYPES: EntryType[] = ["npc", "background", "feat"];

/* ──────── Arcana types (Spell, Scroll) ──────── */
const ARCANA_TYPES: EntryType[] = ["spell", "scroll"];

const MONSTER_TYPES: EntryType[] = ["monster"];

/* ──────── Subclass types ──────── */
const SUBCLASS_TYPES: EntryType[] = ["subclass"];
const TABLE_TYPES: EntryType[] = ["table"];

/* ──────── Manual Entry tab ──────── */
function ManualEntryTab({ entryType }: { entryType: EntryType }) {
  if (TREASURE_TYPES.includes(entryType)) return <TreasureForm entryType={entryType} />;
  if (SIMPLE_TYPES.includes(entryType)) return <SimpleForm entryType={entryType} />;
  if (ARCANA_TYPES.includes(entryType)) return <SpellScrollForm entryType={entryType} />;
  if (MONSTER_TYPES.includes(entryType)) return <MonsterForm />;
  if (SUBCLASS_TYPES.includes(entryType)) return <SubclassForm />;
  if (TABLE_TYPES.includes(entryType)) return <TableForm />;

  return (
    <div className="min-h-[120px]">
      <h2 className="font-[var(--font-title)] text-lg font-bold text-[#58180d]">
        {formatEntryType(entryType)}
      </h2>
      <p className="mt-2 text-sm italic text-[#766649]">
        Form fields for this entry type coming soon
      </p>
    </div>
  );
}

/* ──────── Subclass form ──────── */
function SubclassForm() {
  const [name, setName] = useState("");
  const [parentClass, setParentClass] = useState("");
  const [description, setDescription] = useState("");
  const tags = useTagInput();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Level Features ──
  const [features, setFeatures] = useState<{ level: number; desc: string }[]>([]);
  const addFeature = () => setFeatures((p) => [...p, { level: 1, desc: "" }]);
  const updFeature = (i: number, f: "level" | "desc", v: number | string) =>
    setFeatures((p) => p.map((ft, j) => (j === i ? { ...ft, [f]: v } : ft)));
  const remFeature = (i: number) => setFeatures((p) => p.filter((_, j) => j !== i));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const properties: Record<string, unknown> = {};
    if (parentClass.trim()) properties.parent_class = parentClass.trim();
    const filteredFeatures = features.filter((f) => f.desc.trim());
    if (filteredFeatures.length) properties.level_features = filteredFeatures;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop() ?? "png";
      const filename = `${crypto.randomUUID()}.${ext}`;
      const { data: uploadData } = await supabase.storage.from("entry-images").upload(filename, imageFile);
      if (uploadData) {
        const { data: pub } = supabase.storage.from("entry-images").getPublicUrl(filename);
        properties.image_url = pub.publicUrl;
      } else {
        properties.image_data = imagePreview;
      }
    }

    try {
      const { error: insertError } = await supabase.from("entries").insert({
        name: name.trim(),
        type: "subclass",
        description: description.trim(),
        tags: tags.tags,
        properties,
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setName("");
      setParentClass("");
      setDescription("");
      tags.resetTags();
      setFeatures([]);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  const numberSmCls =
    "w-20 rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-center text-sm font-[var(--font-phb)] text-[var(--color-ink)] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <div className="rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-sm text-green-800">Entry saved successfully!</div>}
      {error && <div className="rounded-lg border border-red-700/30 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>}

      <div>
        <label className={labelCls}>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. School of Evocation" className={inputCls} required />
      </div>

      <div>
        <label className={labelCls}>Parent Class</label>
        <input type="text" value={parentClass} onChange={(e) => setParentClass(e.target.value)} placeholder="e.g. Wizard, Fighter, Rogue" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this subclass…" className={textareaCls} />
      </div>

      {/* ── Level Features ── */}
      <div>
        <label className={labelCls}>Level Features</label>
        <div className="space-y-3">
          {features.map((ft, i) => (
            <div key={i} className="relative rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] p-3">
              <button type="button" onClick={() => remFeature(i)} className="absolute right-2 top-2 text-red-600 hover:text-red-800">
                <FontAwesomeIcon icon={faTimes} className="size-3.5" />
              </button>
              <div className="mb-2 flex items-center gap-3">
                <label className="text-xs font-bold font-[var(--font-title)] text-[#58180d]">Level</label>
                <input type="number" value={ft.level} onChange={(e) => updFeature(i, "level", parseInt(e.target.value) || 1)} min={1} max={20} className={numberSmCls} />
              </div>
              <textarea value={ft.desc} onChange={(e) => updFeature(i, "desc", e.target.value)} placeholder="Feature description…" className={textareaCls} />
            </div>
          ))}
          <button type="button" onClick={addFeature} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-3 py-2 text-sm font-[var(--font-title)] font-bold text-[#766649] transition-colors hover:border-amber-600 hover:text-[#58180d]">
            <FontAwesomeIcon icon={faPlus} className="size-3.5" /> Add Feature
          </button>
        </div>
      </div>

      <div>
        <label className={labelCls}>Tags</label>
        <div className="flex flex-wrap gap-1.5">
          {tags.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-md border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-2 py-0.5 text-xs font-[var(--font-phb)] text-[#58180d]">
              {tag}
              <button type="button" onClick={() => tags.removeTag(tag)} className="ml-0.5 text-[#766649] hover:text-[#58180d]">
                <FontAwesomeIcon icon={faTimes} className="size-2.5" />
              </button>
            </span>
          ))}
        </div>
        <input type="text" value={tags.input} onChange={(e) => tags.setInput(e.target.value)} onKeyDown={tags.handleKeyDown} onBlur={() => { if (tags.input.trim()) tags.addTag(tags.input); }} placeholder="Type a tag and press Enter or comma…" className={`mt-1.5 ${inputCls}`} />
      </div>

      <ImageUpload fileRef={fileRef} imageFile={imageFile} imagePreview={imagePreview} setImageFile={setImageFile} setImagePreview={setImagePreview} handleImage={handleImage} />

      <SaveButton saving={saving} disabled={!name.trim()} />
    </form>
  );
}

/* ──────── Die type options ──────── */
const DIE_OPTIONS = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"] as const;

function dieRowCount(die: string): number {
  if (die === "d100") return 100;
  return parseInt(die.slice(1)) || 20;
}

/* ──────── Table form ──────── */
function TableForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dieType, setDieType] = useState("");
  const [columns, setColumns] = useState<string[]>([""]);
  const tags = useTagInput();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const rowCount = dieType ? dieRowCount(dieType) : 0;

  // cells[rowIdx][colIdx]
  const [cells, setCells] = useState<string[][]>([]);

  // Keep cells sized as 1 + columns.length (index 0 = Roll read-only, rest = user cols)
  useEffect(() => {
    if (!dieType) {
      setCells([]);
      return;
    }
    const n = dieRowCount(dieType);
    const colCount = 1 + columns.length;
    setCells((prev) => {
      const next: string[][] = [];
      for (let r = 0; r < n; r++) {
        const row: string[] = [];
        for (let c = 0; c < colCount; c++) {
          row.push(prev[r]?.[c] ?? "");
        }
        next.push(row);
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dieType, columns.length]);

  const addColumn = () => setColumns((p) => [...p, ""]);
  const updColumn = (i: number, v: string) =>
    setColumns((p) => p.map((c, j) => (j === i ? v : c)));
  const remColumn = (i: number) =>
    setColumns((p) => p.filter((_, j) => j !== i));

  const updCell = (r: number, c: number, v: string) =>
    setCells((prev) =>
      prev.map((row, ri) =>
        ri === r ? row.map((cell, ci) => (ci === c ? v : cell)) : row
      )
    );

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const properties: Record<string, unknown> = {};
    if (dieType) properties.die_type = dieType;
    const colHeaders = ["Roll", ...columns.filter((c) => c.trim())];
    properties.columns = colHeaders;
    const dataRows = cells.map((row, ri) => [String(ri + 1), ...row.slice(1)]);
    properties.rows = dataRows;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop() ?? "png";
      const filename = `${crypto.randomUUID()}.${ext}`;
      const { data: uploadData } = await supabase.storage.from("entry-images").upload(filename, imageFile);
      if (uploadData) {
        const { data: pub } = supabase.storage.from("entry-images").getPublicUrl(filename);
        properties.image_url = pub.publicUrl;
      } else {
        properties.image_data = imagePreview;
      }
    }

    try {
      const { error: insertError } = await supabase.from("entries").insert({
        name: name.trim(),
        type: "table",
        description: description.trim(),
        tags: tags.tags,
        properties,
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setName("");
      setDescription("");
      tags.resetTags();
      setDieType("");
      setColumns([""]);
      setCells([]);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  const thCls =
    "border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-dark)] px-2 py-1.5 text-xs font-bold font-[var(--font-title)] text-[#58180d]";
  const tdCls =
    "border border-[var(--color-gilding-dark)] p-0";
  const cellInputCls =
    "w-full border-0 bg-transparent px-2 py-1 text-xs font-[var(--font-phb)] text-[var(--color-ink)] focus:bg-[var(--color-parchment-light)] focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <div className="rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-sm text-green-800">Entry saved successfully!</div>}
      {error && <div className="rounded-lg border border-red-700/30 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>}

      <div>
        <label className={labelCls}>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Random Encounters" className={inputCls} required />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this table…" className={textareaCls} />
      </div>

      <div>
        <label className={labelCls}>Die Type</label>
        <CustomSelect value={dieType} onChange={(v) => { setDieType(v); }} options={DIE_OPTIONS} getLabel={(s) => s} placeholder="Select a die…" />
      </div>

      {/* ── Columns ── */}
      <div>
        <label className={labelCls}>Columns</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-dark)] px-3 py-2 text-sm font-bold font-[var(--font-title)] text-[#58180d]">Roll</span>
            <span className="text-xs italic text-[#766649]">(always present)</span>
          </div>
          {columns.map((col, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={col} onChange={(e) => updColumn(i, e.target.value)} placeholder={`Column ${i + 2} name…`} className={`flex-1 ${inputCls}`} />
              <button type="button" onClick={() => remColumn(i)} className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100">
                <FontAwesomeIcon icon={faTimes} className="size-3" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addColumn} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-3 py-2 text-sm font-[var(--font-title)] font-bold text-[#766649] transition-colors hover:border-amber-600 hover:text-[#58180d]">
            <FontAwesomeIcon icon={faPlus} className="size-3.5" /> Add Column
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      {dieType && columns.length > 0 && (
        <div>
          <label className={labelCls}>Table Rows ({rowCount} rows)</label>
          <div className="overflow-x-auto rounded-lg border border-[var(--color-gilding-dark)]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thCls}>Roll</th>
                  {columns.map((col, i) => (
                    <th key={i} className={thCls}>{col.trim() || `Column ${i + 2}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cells.map((row, ri) => (
                  <tr key={ri} className="even:bg-[var(--color-parchment)] odd:bg-[var(--color-parchment-light)]">
                    {row.map((cell, ci) => (
                      <td key={ci} className={tdCls}>
                        {ci === 0 ? (
                          <div className="px-2 py-1 text-xs font-bold font-[var(--font-phb)] text-[#58180d]">{ri + 1}</div>
                        ) : (
                          <input type="text" value={cell} onChange={(e) => updCell(ri, ci, e.target.value)} placeholder={columns[ci - 1]?.trim() || `Column ${ci + 1}`} className={cellInputCls} />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <label className={labelCls}>Tags</label>
        <div className="flex flex-wrap gap-1.5">
          {tags.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-md border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-2 py-0.5 text-xs font-[var(--font-phb)] text-[#58180d]">
              {tag}
              <button type="button" onClick={() => tags.removeTag(tag)} className="ml-0.5 text-[#766649] hover:text-[#58180d]">
                <FontAwesomeIcon icon={faTimes} className="size-2.5" />
              </button>
            </span>
          ))}
        </div>
        <input type="text" value={tags.input} onChange={(e) => tags.setInput(e.target.value)} onKeyDown={tags.handleKeyDown} onBlur={() => { if (tags.input.trim()) tags.addTag(tags.input); }} placeholder="Type a tag and press Enter or comma…" className={`mt-1.5 ${inputCls}`} />
      </div>

      <ImageUpload fileRef={fileRef} imageFile={imageFile} imagePreview={imagePreview} setImageFile={setImageFile} setImagePreview={setImagePreview} handleImage={handleImage} />

      <SaveButton saving={saving} disabled={!name.trim() || !dieType} />
    </form>
  );
}

/* ──────── Shared form for Magic Item / Weapon / Armour / Potion / Adventuring Gear / Trinket ──────── */
function TreasureForm({ entryType }: { entryType: EntryType }) {
  const [name, setName] = useState("");
  const [rarity, setRarity] = useState("");
  const [attunement, setAttunement] = useState(false);
  const [attunementBy, setAttunementBy] = useState("");
  const [description, setDescription] = useState("");
  const tags = useTagInput();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Build properties object
      const properties: Record<string, unknown> = {};
      if (rarity) properties.rarity = rarity;
      properties.requires_attunement = attunement;
      if (attunement && attunementBy.trim()) {
        properties.attunement_by = attunementBy.trim();
      }

      // Image: try to upload to Supabase Storage
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() ?? "png";
        const filename = `${crypto.randomUUID()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("entry-images")
          .upload(filename, imageFile);
        if (!uploadError && uploadData) {
          const { data: publicUrl } = supabase.storage
            .from("entry-images")
            .getPublicUrl(filename);
          imageUrl = publicUrl.publicUrl;
          properties.image_url = imageUrl;
        } else {
          // Fallback: store as data URL in properties
          properties.image_data = imagePreview;
        }
      }

      const { error: insertError } = await supabase.from("entries").insert({
        name: name.trim(),
        type: entryType,
        description: description.trim(),
        tags: tags.tags,
        properties,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      // Reset form
      setName("");
      setRarity("");
      setAttunement(false);
      setAttunementBy("");
      setDescription("");
      tags.resetTags();
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  /* ────────── Shared label style ────────── */
  const labelCls = "mb-1 block font-[var(--font-title)] text-sm font-bold text-[#58180d]";
  const inputCls = "w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] placeholder:text-[#766649] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600";
  const textareaCls = "w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] placeholder:text-[#766649] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 min-h-[100px] resize-y";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ───── Success banner ───── */}
      {success && (
        <div className="rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-sm text-green-800">
          Entry saved successfully!
        </div>
      )}

      {/* ───── Error banner ───── */}
      {error && (
        <div className="rounded-lg border border-red-700/30 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* ───── Name ───── */}
      <div>
        <label className={labelCls}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Flame Tongue Longsword"
          className={inputCls}
          required
        />
      </div>

      {/* ───── Rarity ───── */}
      <div>
        <label className={labelCls}>Rarity</label>
        <RarityDropdown value={rarity} onChange={setRarity} />
      </div>

      {/* ───── Attunement ───── */}
      <div>
        <label className={labelCls}>Attunement</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAttunement(false)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-[var(--font-phb)] transition-colors ${
              !attunement
                ? "border-[var(--color-gilding-dark)] bg-[#58180d] font-bold text-[#eee5ce]"
                : "border-[var(--color-parchment-dark)] bg-[var(--color-parchment)] text-[#766649] hover:border-[var(--color-gilding-dark)]"
            }`}
          >
            No
          </button>
          <button
            type="button"
            onClick={() => setAttunement(true)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-[var(--font-phb)] transition-colors ${
              attunement
                ? "border-[var(--color-gilding-dark)] bg-[#58180d] font-bold text-[#eee5ce]"
                : "border-[var(--color-parchment-dark)] bg-[var(--color-parchment)] text-[#766649] hover:border-[var(--color-gilding-dark)]"
            }`}
          >
            Yes
          </button>
        </div>
        {attunement && (
          <input
            type="text"
            value={attunementBy}
            onChange={(e) => setAttunementBy(e.target.value)}
            placeholder="Attunement by whom (optional)"
            className={`mt-2 ${inputCls}`}
          />
        )}
      </div>

      {/* ───── Description ───── */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the item, its history, and any special properties…"
          className={textareaCls}
        />
      </div>

      {/* ───── Tags ───── */}
      <div>
        <label className={labelCls}>Tags</label>
        <div className="flex flex-wrap gap-1.5">
          {tags.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-md border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-2 py-0.5 text-xs font-[var(--font-phb)] text-[#58180d]"
            >
              {tag}
              <button
                type="button"
                onClick={() => tags.removeTag(tag)}
                className="ml-0.5 text-[#766649] hover:text-[#58180d]"
              >
                <FontAwesomeIcon icon={faTimes} className="size-2.5" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tags.input}
          onChange={(e) => tags.setInput(e.target.value)}
          onKeyDown={tags.handleKeyDown}
          onBlur={() => { if (tags.input.trim()) tags.addTag(tags.input); }}
          placeholder="Type a tag and press Enter or comma…"
          className={`mt-1.5 ${inputCls}`}
        />
      </div>

      {/* ───── Image upload ───── */}
      <div>
        <label className={labelCls}>Image</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-4 py-6 text-center transition-colors hover:border-amber-600 hover:bg-[var(--color-parchment-light)]"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-h-40 rounded object-contain" />
          ) : (
            <>
              <FontAwesomeIcon icon={faUpload} className="text-2xl text-[#766649]" />
              <span className="font-[var(--font-phb)] text-sm text-[#766649]">
                Click to upload an image
              </span>
            </>
          )}
          {imageFile && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImageFile(null);
                setImagePreview(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImage}
          className="hidden"
        />
      </div>

      {/* ───── Save button ───── */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-gilding-dark)] bg-[#58180d] px-4 py-2.5 text-sm font-bold text-[#eee5ce] transition-colors hover:bg-[#6e2a1a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faSave} />
          {saving ? "Saving…" : "Save Entry"}
        </button>
      </div>
    </form>
  );
}

/* ──────── Import tab ──────── */
function ImportTab({
  importType,
  setImportType,
}: {
  importType: EntryType;
  setImportType: (v: EntryType) => void;
}) {
  return (
    <div>
      <h2 className="font-[var(--font-title)] text-base font-bold text-[#58180d]">
        Import Content
      </h2>
      <p className="mb-4 mt-1 text-xs italic text-[#766649]">
        Choose how you'd like to add your content
      </p>

      {/* ───── method cards ───── */}
      <div className="grid grid-cols-2 gap-3">
        {IMPORT_METHODS.map((method) => (
          <button
            key={method.label}
            type="button"
            className="gilded-border flex flex-col items-center gap-2 px-4 py-5 text-center transition-colors hover:bg-[var(--color-parchment)]"
          >
            <FontAwesomeIcon icon={method.icon} className="text-3xl text-[#58180d]" />
            <span className="font-[var(--font-title)] text-sm font-bold text-[#58180d]">
              {method.label}
            </span>
          </button>
        ))}
      </div>

      {/* ───── entry type dropdown ───── */}
      <div className="mt-5">
        <label className="mb-1 block text-xs font-medium text-[#766649]">
          Entry Type <span className="italic">(optional)</span>
        </label>
        <CustomSelect
          value={importType}
          onChange={setImportType}
          options={ALL_TYPES}
          getLabel={(t) => `${formatEntryType(t)} — ${getParentCategory(t)}`}
          placeholder="Auto-detect"
        />
      </div>
    </div>
  );
}

/* ────────── Shared field styles (module-level) ────────── */
const labelCls = "mb-1 block font-[var(--font-title)] text-sm font-bold text-[#58180d]";
const inputCls = "w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] placeholder:text-[#766649] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600";
const textareaCls = "w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] placeholder:text-[#766649] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 min-h-[100px] resize-y";

/* ──────── Simple form (NPC, Background, Feat) ──────── */
function SimpleForm({ entryType }: { entryType: EntryType }) {
  const isNpc = entryType === "npc";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const tags = useTagInput();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Stat block state (NPC only) ──
  const [showStatBlock, setShowStatBlock] = useState(false);
  const [size, setSize] = useState("");
  const [creatureType, setCreatureType] = useState("");
  const [alignment, setAlignment] = useState("");
  const [cr, setCr] = useState("");
  const profBonus = crToProf(cr);
  const [ac, setAc] = useState("");
  const [hp, setHp] = useState("");
  const [speed, setSpeed] = useState("");
  const [str, setStr] = useState(10);
  const [dex, setDex] = useState(10);
  const [con, setCon] = useState(10);
  const [intel, setIntel] = useState(10);
  const [wis, setWis] = useState(10);
  const [cha, setCha] = useState(10);
  const abilScores: Record<string,number> = { STR:str, DEX:dex, CON:con, INT:intel, WIS:wis, CHA:cha };
  const [saveProfs, setSaveProfs] = useState<Record<string,boolean>>({ STR:false, DEX:false, CON:false, INT:false, WIS:false, CHA:false });
  const [skillProfs, setSkillProfs] = useState<string[]>([]);
  const vuln = useMonsterTags(); const resist = useMonsterTags(); const immune = useMonsterTags(); const condImm = useMonsterTags();
  const [senses, setSenses] = useState(""); const [languages, setLanguages] = useState("");
  const [traits, setTraits] = useState<{name:string;desc:string}[]>([]);
  const addTr = () => setTraits(p => [...p,{name:"",desc:""}]);
  const updTr = (i:number,f:"name"|"desc",v:string) => setTraits(p => p.map((t,j) => j===i ? {...t,[f]:v} : t));
  const remTr = (i:number) => setTraits(p => p.filter((_,j) => j!==i));
  const [hasSpell, setHasSpell] = useState(false);
  const [spellAbil, setSpellAbil] = useState("INT"); const [spellSave, setSpellSave] = useState(10);
  const [spellAtk, setSpellAtk] = useState(0); const [spellList, setSpellList] = useState("");
  const [actions, setActions] = useState<{name:string;desc:string}[]>([]);
  const addAct = () => setActions(p => [...p,{name:"",desc:""}]);
  const updAct = (i:number,f:"name"|"desc",v:string) => setActions(p => p.map((a,j) => j===i ? {...a,[f]:v} : a));
  const remAct = (i:number) => setActions(p => p.filter((_,j) => j!==i));
  const [bonusActions, setBonusActions] = useState<{name:string;desc:string}[]>([]);
  const addBonus = () => setBonusActions(p => [...p,{name:"",desc:""}]);
  const updBonus = (i:number,f:"name"|"desc",v:string) => setBonusActions(p => p.map((a,j) => j===i ? {...a,[f]:v} : a));
  const remBonus = (i:number) => setBonusActions(p => p.filter((_,j) => j!==i));
  const [reactions, setReactions] = useState<{name:string;desc:string}[]>([]);
  const addReact = () => setReactions(p => [...p,{name:"",desc:""}]);
  const updReact = (i:number,f:"name"|"desc",v:string) => setReactions(p => p.map((a,j) => j===i ? {...a,[f]:v} : a));
  const remReact = (i:number) => setReactions(p => p.filter((_,j) => j!==i));
  const [hasLeg, setHasLeg] = useState(false);
  const [legPer, setLegPer] = useState(3);
  const [legActs, setLegActs] = useState<{name:string;desc:string}[]>([]);
  const addLeg = () => setLegActs(p => [...p,{name:"",desc:""}]);
  const updLeg = (i:number,f:"name"|"desc",v:string) => setLegActs(p => p.map((a,j) => j===i ? {...a,[f]:v} : a));
  const remLeg = (i:number) => setLegActs(p => p.filter((_,j) => j!==i));
  const [hasLair, setHasLair] = useState(false);
  const [lairActs, setLairActs] = useState<{name:string;desc:string}[]>([]);
  const addLair = () => setLairActs(p => [...p,{name:"",desc:""}]);
  const updLair = (i:number,f:"name"|"desc",v:string) => setLairActs(p => p.map((a,j) => j===i ? {...a,[f]:v} : a));
  const remLair = (i:number) => setLairActs(p => p.filter((_,j) => j!==i));

  const sbToggleCls = (active: boolean) =>
    `rounded-lg border px-3 py-1 text-xs font-[var(--font-phb)] transition-colors ${active ? "border-[var(--color-gilding-dark)] bg-[#58180d] font-bold text-[#eee5ce]" : "border-[var(--color-parchment-dark)] bg-[var(--color-parchment)] text-[#766649] hover:border-[var(--color-gilding-dark)]"}`;

  const numberCls = "w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-2 py-2 text-center text-sm font-[var(--font-phb)] text-[var(--color-ink)] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600";
  const sbSection = "border-b border-[var(--color-gilding-dark)] pb-1 pt-5 text-base font-bold font-[var(--font-title)] text-[#58180d] first:pt-0";

  const getSave = (a: string): number => { const m = abilMod(abilScores[a]??10); return saveProfs[a] ? m+profBonus : m; };
  const getSkill = (s: string): number => { const abb = SKILL_ABIL[s]!; return skillProfs.includes(s) ? abilMod(abilScores[abb]??10)+profBonus : abilMod(abilScores[abb]??10); };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const properties: Record<string, unknown> = {};

    if (showStatBlock) {
      if (size) properties.size = size;
      if (creatureType.trim()) properties.creature_type = creatureType.trim();
      if (alignment.trim()) properties.alignment = alignment.trim();
      if (cr) properties.cr = cr;
      if (ac.trim()) properties.ac = ac.trim();
      if (hp.trim()) properties.hp = hp.trim();
      if (speed.trim()) properties.speed = speed.trim();
      properties.ability_str = str; properties.ability_dex = dex; properties.ability_con = con;
      properties.ability_int = intel; properties.ability_wis = wis; properties.ability_cha = cha;
      const sv = ABILITIES.filter(a => saveProfs[a]).map(a => `${a.toLowerCase()} +${getSave(a)}`).join(", ");
      if (sv) properties.saving_throws = sv;
      const sk = skillProfs.map(s => `${s} +${getSkill(s)}`).join(", ");
      if (sk) properties.skills = sk;
      if (vuln.tags.length) properties.damage_vulnerabilities = vuln.tags.join(", ");
      if (resist.tags.length) properties.damage_resistances = resist.tags.join(", ");
      if (immune.tags.length) properties.damage_immunities = immune.tags.join(", ");
      if (condImm.tags.length) properties.condition_immunities = condImm.tags.join(", ");
      if (senses.trim()) properties.senses = senses.trim();
      if (languages.trim()) properties.languages = languages.trim();
      if (traits.filter(t => t.name||t.desc).length) properties.traits = traits.filter(t => t.name||t.desc);
      if (hasSpell) properties.spellcasting = { ability: spellAbil, save_dc: spellSave, attack_bonus: spellAtk, spells: spellList.trim() };
      if (actions.filter(a => a.name||a.desc).length) properties.actions = actions.filter(a => a.name||a.desc);
      if (bonusActions.filter(a => a.name||a.desc).length) properties.bonus_actions = bonusActions.filter(a => a.name||a.desc);
      if (reactions.filter(a => a.name||a.desc).length) properties.reactions = reactions.filter(a => a.name||a.desc);
      if (hasLeg) properties.legendary_actions = { per_round: legPer, actions: legActs.filter(a => a.name||a.desc) };
      if (hasLair) properties.lair_actions = lairActs.filter(a => a.name||a.desc);
    }

    if (imageFile) {
      const ext = imageFile.name.split(".").pop() ?? "png";
      const filename = `${crypto.randomUUID()}.${ext}`;
      const { data: uploadData } = await supabase.storage.from("entry-images").upload(filename, imageFile);
      if (uploadData) {
        const { data: pub } = supabase.storage.from("entry-images").getPublicUrl(filename);
        properties.image_url = pub.publicUrl;
      } else {
        properties.image_data = imagePreview;
      }
    }

    try {
      const { error: insertError } = await supabase.from("entries").insert({
        name: name.trim(), type: entryType, description: description.trim(),
        tags: tags.tags, properties,
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setName(""); setDescription(""); tags.resetTags(); setImageFile(null); setImagePreview(null);
      setShowStatBlock(false); setSize(""); setCreatureType(""); setAlignment(""); setCr("");
      setAc(""); setHp(""); setSpeed("");
      setStr(10); setDex(10); setCon(10); setIntel(10); setWis(10); setCha(10);
      setSaveProfs({STR:false,DEX:false,CON:false,INT:false,WIS:false,CHA:false});
      setSkillProfs([]); vuln.reset(); resist.reset(); immune.reset(); condImm.reset();
      setSenses(""); setLanguages("");
      setTraits([]); setHasSpell(false); setSpellAbil("INT"); setSpellSave(10); setSpellAtk(0); setSpellList("");
      setActions([]); setBonusActions([]); setReactions([]);
      setHasLeg(false); setLegPer(3); setLegActs([]);
      setHasLair(false); setLairActs([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <div className="rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-sm text-green-800">Entry saved successfully!</div>}
      {error && <div className="rounded-lg border border-red-700/30 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>}

      <div>
        <label className={labelCls}>Name</label>
        <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Elara Moonshadow" className={inputCls} required />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe this entry…" className={textareaCls} />
      </div>

      <div>
        <label className={labelCls}>Tags</label>
        <div className="flex flex-wrap gap-1.5">
          {tags.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 rounded-md border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-2 py-0.5 text-xs font-[var(--font-phb)] text-[#58180d]">
              {tag}
              <button type="button" onClick={()=>tags.removeTag(tag)} className="ml-0.5 text-[#766649] hover:text-[#58180d]"><FontAwesomeIcon icon={faTimes} className="size-2.5" /></button>
            </span>
          ))}
        </div>
        <input type="text" value={tags.input} onChange={e=>tags.setInput(e.target.value)} onKeyDown={tags.handleKeyDown} onBlur={()=>{if(tags.input.trim())tags.addTag(tags.input);}} placeholder="Type a tag and press Enter or comma…" className={`mt-1.5 ${inputCls}`} />
      </div>

      <ImageUpload fileRef={fileRef} imageFile={imageFile} imagePreview={imagePreview} setImageFile={setImageFile} setImagePreview={setImagePreview} handleImage={handleImage} />

      {isNpc && (
        <div className="rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-[var(--font-title)] text-sm font-bold text-[#58180d]">Include Full Stat Block</span>
            <div className="flex gap-2">
              <button type="button" onClick={()=>setShowStatBlock(false)} className={sbToggleCls(!showStatBlock)}>No</button>
              <button type="button" onClick={()=>setShowStatBlock(true)} className={sbToggleCls(showStatBlock)}>Yes</button>
            </div>
          </div>

          {showStatBlock && (
            <div className="mt-4 space-y-1">
              <h4 className={sbSection}>Core Identity</h4>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Size</label><CustomSelect value={size} onChange={setSize} options={SIZE_LIST} getLabel={s=>s} placeholder="Select…" /></div>
                <div><label className={labelCls}>Type</label><input type="text" value={creatureType} onChange={e=>setCreatureType(e.target.value)} placeholder="e.g. Humanoid" className={inputCls} /></div>
                <div><label className={labelCls}>Alignment</label><input type="text" value={alignment} onChange={e=>setAlignment(e.target.value)} placeholder="e.g. Lawful Good" className={inputCls} /></div>
                <div><label className={labelCls}>Challenge Rating</label><CustomSelect value={cr} onChange={setCr} options={CR_LIST} getLabel={s=>s} placeholder="Select…" /></div>
              </div>
              <div className="rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-3 py-2 text-sm">
                <span className="font-[var(--font-title)] font-bold text-[#58180d]">Proficiency Bonus: </span>
                <span className="font-[var(--font-phb)] text-[var(--color-ink)]">+{profBonus}</span>
              </div>

              <h4 className={sbSection}>Defence</h4>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls}>Armour Class</label><input type="text" value={ac} onChange={e=>setAc(e.target.value)} placeholder="e.g. 15 (chain shirt)" className={inputCls} /></div>
                <div><label className={labelCls}>Hit Points</label><input type="text" value={hp} onChange={e=>setHp(e.target.value)} placeholder="e.g. 75 (10d10+20)" className={inputCls} /></div>
                <div><label className={labelCls}>Speed</label><input type="text" value={speed} onChange={e=>setSpeed(e.target.value)} placeholder="e.g. 30ft" className={inputCls} /></div>
              </div>

              <h4 className={sbSection}>Ability Scores</h4>
              <div className="grid grid-cols-6 gap-2">
                {[{k:"STR",v:str,s:setStr},{k:"DEX",v:dex,s:setDex},{k:"CON",v:con,s:setCon},{k:"INT",v:intel,s:setIntel},{k:"WIS",v:wis,s:setWis},{k:"CHA",v:cha,s:setCha}].map(({k,v,s}) => (
                  <div key={k} className="text-center">
                    <label className="mb-1 block text-xs font-bold font-[var(--font-title)] text-[#58180d]">{k}</label>
                    <input type="number" value={v} onChange={e=>s(Math.max(1,Math.min(30,parseInt(e.target.value)||1)))} className={numberCls} />
                    <span className="mt-0.5 block text-xs font-[var(--font-phb)] text-[#766649]">{modStr(v)}</span>
                  </div>
                ))}
              </div>

              <h4 className={sbSection}>Saving Throws</h4>
              <div className="flex flex-wrap gap-2">{ABILITIES.map(a=><button key={a} type="button" onClick={()=>setSaveProfs(p=>({...p,[a]:!p[a]}))} className={sbToggleCls(saveProfs[a]!)}>{a} +{getSave(a)}</button>)}</div>

              <h4 className={sbSection}>Skills</h4>
              <div className="flex flex-wrap gap-2">{SKILL_LIST.map(s=><button key={s} type="button" onClick={()=>setSkillProfs(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])} className={sbToggleCls(skillProfs.includes(s))}>{s} +{getSkill(s)}</button>)}</div>

              <h4 className={sbSection}>Damage &amp; Condition Modifiers</h4>
              <div className="space-y-3">
                <div><label className={labelCls}>Damage Vulnerabilities</label><TagRow hook={vuln} /></div>
                <div><label className={labelCls}>Damage Resistances</label><TagRow hook={resist} /></div>
                <div><label className={labelCls}>Damage Immunities</label><TagRow hook={immune} /></div>
                <div><label className={labelCls}>Condition Immunities</label><TagRow hook={condImm} /></div>
              </div>

              <h4 className={sbSection}>Senses &amp; Languages</h4>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Senses</label><input type="text" value={senses} onChange={e=>setSenses(e.target.value)} placeholder="e.g. darkvision 60ft, passive Perception 12" className={inputCls} /></div>
                <div><label className={labelCls}>Languages</label><input type="text" value={languages} onChange={e=>setLanguages(e.target.value)} placeholder="e.g. Common, Elvish" className={inputCls} /></div>
              </div>

              <h4 className={sbSection}>Traits</h4>
              <RepeatBlock items={traits} onChange={updTr} onRemove={remTr} onAdd={addTr} namePh="Trait name" descPh="Trait description…" addLabel="Add Trait" />

              <h4 className={sbSection}>Spellcasting</h4>
              <div className="flex items-center gap-3">
                <span className="text-sm font-[var(--font-phb)] text-[var(--color-ink)]">Has spellcasting?</span>
                <button type="button" onClick={()=>setHasSpell(false)} className={sbToggleCls(!hasSpell)}>No</button>
                <button type="button" onClick={()=>setHasSpell(true)} className={sbToggleCls(hasSpell)}>Yes</button>
              </div>
              {hasSpell && (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Spellcasting Ability</label><CustomSelect value={spellAbil} onChange={setSpellAbil} options={ABILITIES} getLabel={s=>s} /></div>
                  <div><label className={labelCls}>Spell Save DC</label><input type="number" value={spellSave} onChange={e=>setSpellSave(parseInt(e.target.value)||0)} className={inputCls} /></div>
                  <div><label className={labelCls}>Spell Attack Bonus</label><input type="number" value={spellAtk} onChange={e=>setSpellAtk(parseInt(e.target.value)||0)} className={inputCls} /></div>
                  <div className="col-span-2"><label className={labelCls}>Spell List</label><textarea value={spellList} onChange={e=>setSpellList(e.target.value)} placeholder="List spells or paste a spellcasting block…" className={textareaCls} /></div>
                </div>
              )}

              <h4 className={sbSection}>Actions</h4>
              <RepeatBlock items={actions} onChange={updAct} onRemove={remAct} onAdd={addAct} namePh="Action name" descPh="Action description…" addLabel="Add Action" />
              <h4 className={sbSection}>Bonus Actions</h4>
              <RepeatBlock items={bonusActions} onChange={updBonus} onRemove={remBonus} onAdd={addBonus} namePh="Bonus action name" descPh="Bonus action description…" addLabel="Add Bonus Action" />
              <h4 className={sbSection}>Reactions</h4>
              <RepeatBlock items={reactions} onChange={updReact} onRemove={remReact} onAdd={addReact} namePh="Reaction name" descPh="Reaction description…" addLabel="Add Reaction" />

              <h4 className={sbSection}>Legendary Actions</h4>
              <div className="flex items-center gap-3">
                <span className="text-sm font-[var(--font-phb)] text-[var(--color-ink)]">Has legendary actions?</span>
                <button type="button" onClick={()=>setHasLeg(false)} className={sbToggleCls(!hasLeg)}>No</button>
                <button type="button" onClick={()=>setHasLeg(true)} className={sbToggleCls(hasLeg)}>Yes</button>
              </div>
              {hasLeg && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-3"><label className={labelCls}>Uses per Round</label><input type="number" value={legPer} onChange={e=>setLegPer(parseInt(e.target.value)||1)} className="w-20 rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-center text-sm font-[var(--font-phb)] text-[var(--color-ink)]" /></div>
                  <RepeatBlock items={legActs} onChange={updLeg} onRemove={remLeg} onAdd={addLeg} namePh="Legendary action name" descPh="Legendary action description…" addLabel="Add Legendary Action" />
                </div>
              )}

              <h4 className={sbSection}>Lair Actions</h4>
              <div className="flex items-center gap-3">
                <span className="text-sm font-[var(--font-phb)] text-[var(--color-ink)]">Has lair actions?</span>
                <button type="button" onClick={()=>setHasLair(false)} className={sbToggleCls(!hasLair)}>No</button>
                <button type="button" onClick={()=>setHasLair(true)} className={sbToggleCls(hasLair)}>Yes</button>
              </div>
              {hasLair && (
                <div className="mt-3">
                  <RepeatBlock items={lairActs} onChange={updLair} onRemove={remLair} onAdd={addLair} namePh="Lair action name" descPh="Lair action description…" addLabel="Add Lair Action" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <SaveButton saving={saving} disabled={!name.trim()} />
    </form>
  );
}

/* ──────── Spell/Scroll combined form ──────── */
function SpellScrollForm({ entryType }: { entryType: EntryType }) {
  const [isSpell, setIsSpell] = useState(entryType === "spell");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [school, setSchool] = useState("");
  const [castingTime, setCastingTime] = useState("");
  const [range, setRange] = useState("");
  const [compV, setCompV] = useState(false);
  const [compS, setCompS] = useState(false);
  const [compM, setCompM] = useState(false);
  const [materialDesc, setMaterialDesc] = useState("");
  const [duration, setDuration] = useState("");
  const [concentration, setConcentration] = useState(false);
  const [rarity, setRarity] = useState("");
  const [description, setDescription] = useState("");
  const tags = useTagInput();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const components: string[] = [];
  if (compV) components.push("V");
  if (compS) components.push("S");
  if (compM) components.push("M");

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const properties: Record<string, unknown> = {};
    if (isSpell) {
      properties.level = level;
      properties.school = school;
      properties.casting_time = castingTime.trim();
      properties.range = range.trim();
      properties.components = components;
      if (compM && materialDesc.trim()) properties.material = materialDesc.trim();
      properties.duration = duration.trim();
      properties.concentration = concentration;
    } else {
      if (rarity) properties.rarity = rarity;
      if (level) properties.level = level;
      if (school) properties.school = school;
      if (castingTime.trim()) properties.casting_time = castingTime.trim();
      if (range.trim()) properties.range = range.trim();
      if (components.length > 0) properties.components = components;
      if (compM && materialDesc.trim()) properties.material = materialDesc.trim();
      if (duration.trim()) properties.duration = duration.trim();
      properties.concentration = concentration;
    }

    if (imageFile) {
      const ext = imageFile.name.split(".").pop() ?? "png";
      const filename = `${crypto.randomUUID()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("entry-images")
        .upload(filename, imageFile);
      if (!uploadError && uploadData) {
        const { data: publicUrl } = supabase.storage
          .from("entry-images")
          .getPublicUrl(filename);
        properties.image_url = publicUrl.publicUrl;
      } else {
        properties.image_data = imagePreview;
      }
    }

    try {
      const actualType: EntryType = isSpell ? "spell" : "scroll";
      const { error: insertError } = await supabase.from("entries").insert({
        name: name.trim(),
        type: actualType,
        description: description.trim(),
        tags: tags.tags,
        properties,
      });
      if (insertError) throw insertError;

      setSuccess(true);
      setName("");
      setLevel("");
      setSchool("");
      setCastingTime("");
      setRange("");
      setCompV(false);
      setCompS(false);
      setCompM(false);
      setMaterialDesc("");
      setDuration("");
      setConcentration(false);
      setRarity("");
      setDescription("");
      tags.resetTags();
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  const toggleCls = (active: boolean) =>
    `flex-1 rounded-lg border px-3 py-2 text-sm font-[var(--font-phb)] transition-colors ${
      active
        ? "border-[var(--color-gilding-dark)] bg-[#58180d] font-bold text-[#eee5ce]"
        : "border-[var(--color-parchment-dark)] bg-[var(--color-parchment)] text-[#766649] hover:border-[var(--color-gilding-dark)]"
    }`;

  const SpellSchoolLabel: Record<string, string> = {
    abjuration: "Abjuration",
    conjuration: "Conjuration",
    divination: "Divination",
    enchantment: "Enchantment",
    evocation: "Evocation",
    illusion: "Illusion",
    necromancy: "Necromancy",
    transmutation: "Transmutation",
  };

  const LevelLabel: Record<string, string> = {
    cantrip: "Cantrip",
    "1": "1st",
    "2": "2nd",
    "3": "3rd",
    "4": "4th",
    "5": "5th",
    "6": "6th",
    "7": "7th",
    "8": "8th",
    "9": "9th",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <div className="rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-sm text-green-800">Entry saved successfully!</div>}
      {error && <div className="rounded-lg border border-red-700/30 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>}

      {/* ───── Type toggle ───── */}
      <div>
        <label className={labelCls}>Type</label>
        <div className="flex gap-3">
          <button type="button" onClick={() => setIsSpell(true)} className={toggleCls(isSpell)}>Spell</button>
          <button type="button" onClick={() => setIsSpell(false)} className={toggleCls(!isSpell)}>Scroll</button>
        </div>
      </div>

      <div>
        <label className={labelCls}>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fireball" className={inputCls} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Level</label>
          <CustomSelect
            value={level}
            onChange={setLevel}
            options={SPELL_LEVEL_OPTIONS}
            getLabel={(l) => LevelLabel[l] ?? l}
            placeholder="Select…"
          />
        </div>
        <div>
          <label className={labelCls}>School</label>
          <CustomSelect
            value={school}
            onChange={setSchool}
            options={SCHOOL_OPTIONS}
            getLabel={(s) => SpellSchoolLabel[s] ?? s}
            placeholder="Select…"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Casting Time</label>
          <input type="text" value={castingTime} onChange={(e) => setCastingTime(e.target.value)} placeholder="e.g. 1 action" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Range</label>
          <input type="text" value={range} onChange={(e) => setRange(e.target.value)} placeholder="e.g. 60 ft" className={inputCls} />
        </div>
      </div>

      {/* ───── Components ───── */}
      <div>
        <label className={labelCls}>Components</label>
        <div className="flex flex-wrap gap-4">
          {COMPONENT_OPTIONS.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" checked={
                c === "V" ? compV : c === "S" ? compS : compM
              } onChange={() => {
                if (c === "V") setCompV(!compV);
                else if (c === "S") setCompS(!compS);
                else setCompM(!compM);
              }} className="accent-amber-700" />
              <span className="text-sm font-[var(--font-phb)] text-[var(--color-ink)]">{c}</span>
            </label>
          ))}
        </div>
        {compM && (
          <input type="text" value={materialDesc} onChange={(e) => setMaterialDesc(e.target.value)} placeholder="Material component description…" className={`mt-2 ${inputCls}`} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Duration</label>
          <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. Instantaneous" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Concentration</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setConcentration(false)} className={toggleCls(!concentration)}>No</button>
            <button type="button" onClick={() => setConcentration(true)} className={toggleCls(concentration)}>Yes</button>
          </div>
        </div>
      </div>

      {!isSpell && (
        <div>
          <label className={labelCls}>Rarity</label>
          <RarityDropdown value={rarity} onChange={setRarity} />
        </div>
      )}

      <div>
        <label className={labelCls}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the spell's effect…" className={textareaCls} />
      </div>

      <div>
        <label className={labelCls}>Tags</label>
        <div className="flex flex-wrap gap-1.5">
          {tags.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-md border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-2 py-0.5 text-xs font-[var(--font-phb)] text-[#58180d]">
              {tag}
              <button type="button" onClick={() => tags.removeTag(tag)} className="ml-0.5 text-[#766649] hover:text-[#58180d]">
                <FontAwesomeIcon icon={faTimes} className="size-2.5" />
              </button>
            </span>
          ))}
        </div>
        <input type="text" value={tags.input} onChange={(e) => tags.setInput(e.target.value)} onKeyDown={tags.handleKeyDown} onBlur={() => { if (tags.input.trim()) tags.addTag(tags.input); }} placeholder="Type a tag and press Enter or comma…" className={`mt-1.5 ${inputCls}`} />
      </div>

      <ImageUpload fileRef={fileRef} imageFile={imageFile} imagePreview={imagePreview} setImageFile={setImageFile} setImagePreview={setImagePreview} handleImage={handleImage} />

      <SaveButton saving={saving} disabled={!name.trim()} />
    </form>
  );
}

/* ──────── Shared ImageUpload component ──────── */
function ImageUpload({ fileRef, imageFile, imagePreview, setImageFile, setImagePreview, handleImage }: {
  fileRef: React.RefObject<HTMLInputElement | null>;
  imageFile: File | null;
  imagePreview: string | null;
  setImageFile: (f: File | null) => void;
  setImagePreview: (s: string | null) => void;
  handleImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className={labelCls}>Image</label>
      <div onClick={() => fileRef.current?.click()} className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-4 py-6 text-center transition-colors hover:border-amber-600 hover:bg-[var(--color-parchment-light)]">
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="max-h-40 rounded object-contain" />
        ) : (
          <>
            <FontAwesomeIcon icon={faUpload} className="text-2xl text-[#766649]" />
            <span className="font-[var(--font-phb)] text-sm text-[#766649]">Click to upload an image</span>
          </>
        )}
        {imageFile && (
          <button type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-xs text-red-600 hover:text-red-800">Remove</button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
    </div>
  );
}

/* ──────── Shared SaveButton component ──────── */
function SaveButton({ saving, disabled }: { saving: boolean; disabled: boolean }) {
  return (
    <div className="pt-2">
      <button type="submit" disabled={saving || disabled} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-gilding-dark)] bg-[#58180d] px-4 py-2.5 text-sm font-bold text-[#eee5ce] transition-colors hover:bg-[#6e2a1a] disabled:cursor-not-allowed disabled:opacity-50">
        <FontAwesomeIcon icon={faSave} />
        {saving ? "Saving…" : "Save Entry"}
      </button>
    </div>
  );
}

/* ──────── Helper ──────── */
function getParentCategory(type: string): string {
  for (const cat of CATEGORIES) {
    if (cat.types.includes(type as EntryType)) return cat.label;
  }
  return "";
}