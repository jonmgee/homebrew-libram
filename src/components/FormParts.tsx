import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

/*
 * The field styles, image picker and save button every entry form shares.
 * They lived inside EntryForm.tsx until the Species and Class forms, which
 * are big enough to want files of their own, needed them too.
 */

export const labelCls = "mb-1 block font-[var(--font-title)] text-sm font-bold text-[#58180d]";
export const inputCls = "w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] placeholder:text-[#766649] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600";
export const textareaCls = "w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] placeholder:text-[#766649] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 min-h-[100px] resize-y";

/* ──────── Shared ImageUpload component ──────── */
export function ImageUpload({ fileRef, imageFile: _imageFile, imagePreview, setImageFile, setImagePreview, handleImage }: {
  fileRef: React.RefObject<HTMLInputElement | null>;
  imageFile: File | null;
  imagePreview: string | null;
  setImageFile: (f: File | null) => void;
  setImagePreview: (s: string | null) => void;
  handleImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const acceptImage = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    // Sync native input
    if (fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Always preventDefault — image (accept) or text (reject silently)
    e.preventDefault();
    const items = e.clipboardData.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) acceptImage(file);
        return;
      }
    }
  };

  return (
    <>
      <label className={labelCls}>Image</label>
      {imagePreview ? (
        <div className="relative flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-4 py-6">
          <img src={imagePreview} alt="Preview" className="max-h-40 rounded object-contain" />
          <button type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-xs text-red-600 hover:text-red-800">Remove</button>
        </div>
      ) : (
        <div className="relative">
          <textarea
            readOnly
            onPaste={handlePaste}
            placeholder="Paste a screenshot (Cmd+V or right-click &rarr; Paste)"
            className="w-full resize-none rounded-lg border-2 border-dashed border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-4 pb-10 pt-6 text-center font-[var(--font-phb)] text-sm text-[#766649] placeholder:text-[#766649] transition-colors hover:border-amber-600 hover:bg-[var(--color-parchment-light)] cursor-default"
            rows={3}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-[#766649] underline underline-offset-2 hover:text-amber-700"
          >
            or choose a file
          </button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
    </>
  );
}

/* ──────── Shared SaveButton component ──────── */
export function SaveButton({ saving, disabled, label = "Save Entry" }: { saving: boolean; disabled: boolean; label?: string }) {
  return (
    <div className="pt-2">
      <button type="submit" disabled={saving || disabled} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-gilding-dark)] bg-[#58180d] px-4 py-2.5 text-sm font-bold text-[#eee5ce] transition-colors hover:bg-[#6e2a1a] disabled:cursor-not-allowed disabled:opacity-50">
        <FontAwesomeIcon icon={faSave} />
        {saving ? "Saving…" : label}
      </button>
    </div>
  );
}


/* ──────── On/off chip, for the multi-pick fields ──────── */
export function chipCls(active: boolean) {
  return `cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-[var(--font-phb)] transition-colors ${
    active
      ? "border-[#58180d] bg-[#58180d] text-[#eee5ce]"
      : "border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] text-[var(--color-ink)] hover:border-amber-600"
  }`;
}

/**
 * Warns when a homebrew class or species takes an SRD name.
 *
 * PC on Parchment matches what a player types against the SRD list first, so
 * a homebrew "Warlock" would never be offered on the sheet — the SRD Warlock
 * would. A suffix lets both exist side by side. Advice, not a rule: nothing
 * stops the save.
 */
export function SrdNameHint({ clash, kind, onRename }: {
  clash: string | null;
  kind: "class" | "species";
  onRename: (name: string) => void;
}) {
  if (!clash) return null;
  const suggested = `${clash} HB`;
  return (
    <p className="mt-1 text-xs italic text-amber-700">
      ⚠️ {clash} is also an SRD {kind}, and PC on Parchment will fill a sheet from
      that one instead of yours. Name it{" "}
      <button
        type="button"
        onClick={() => onRename(suggested)}
        className="cursor-pointer font-bold not-italic underline underline-offset-2 hover:text-[#58180d]"
      >
        {suggested}
      </button>{" "}
      to keep both.
    </p>
  );
}
