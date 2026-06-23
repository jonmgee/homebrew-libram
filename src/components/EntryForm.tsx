import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboard,
  faImage,
  faFilePdf,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { formatEntryType, CATEGORIES } from "../types";
import type { EntryType } from "../types";

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
  const [importType, setImportType] = useState<string>(entryType);

  return (
    <div className="relative">
      {/* ───── wax seal ───── */}
      <img
        src="/assets/wax-seal-large.png"
        alt=""
        className="pointer-events-none absolute -right-6 -top-6 z-10 size-24 rotate-12 opacity-85 mix-blend-multiply sm:size-28"
      />

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

/* ──────── Manual Entry tab ──────── */
function ManualEntryTab({ entryType }: { entryType: EntryType }) {
  return (
    <div className="min-h-[200px]">
      <h2 className="font-[var(--font-title)] text-lg font-bold text-[#58180d]">
        {formatEntryType(entryType)}
      </h2>
      <p className="mt-2 text-sm italic text-[#766649]">
        Form fields coming soon
      </p>
    </div>
  );
}

/* ──────── Import tab ──────── */
function ImportTab({
  importType,
  setImportType,
}: {
  importType: string;
  setImportType: (v: string) => void;
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
        <select
          value={importType}
          onChange={(e) => setImportType(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
        >
          <option value="auto">Auto-detect</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>
              {formatEntryType(t)} — {getParentCategory(t)}
            </option>
          ))}
        </select>
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