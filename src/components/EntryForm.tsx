import { useState, useRef, type FormEvent } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { formatEntryType, CATEGORIES } from "../types";
import type { EntryType } from "../types";
import { supabase } from "../lib/supabase";

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

/* ──────── Manual Entry tab ──────── */
function ManualEntryTab({ entryType }: { entryType: EntryType }) {
  const isTreasure = TREASURE_TYPES.includes(entryType);

  if (!isTreasure) {
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

  return <TreasureForm entryType={entryType} />;
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

/* ──────── Helper ──────── */
function getParentCategory(type: EntryType): string {
  for (const cat of CATEGORIES) {
    if (cat.types.includes(type)) return cat.label;
  }
  return "";
}