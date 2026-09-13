import { useState, useRef, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";
import { saveEntryWithImage } from "../lib/uploadImage";
import { useDuplicateNameCheck } from "../lib/useDuplicateNameCheck";
import { DuplicateNameWarning } from "./DuplicateNameWarning";
import { labelCls, inputCls, textareaCls, ImageUpload, SaveButton, SrdNameHint, chipCls } from "./FormParts";
import { SPECIES_SIZE_OPTIONS, SRD_SPECIES_NAMES, srdNameClash } from "../types";
import type { DbEntry, SpeciesTrait } from "../types";
import { readSizes, readSpeed, readTraits } from "../lib/characterOptions";

type ParseResult = Record<string, unknown>;

export default function SpeciesForm({ parsedData, capturedImage, initialData }: {
  parsedData?: ParseResult | null;
  capturedImage?: { file: File; preview: string };
  initialData?: DbEntry;
}) {
  const [name, setName] = useState("");
  const dupWarning = useDuplicateNameCheck(name, initialData);
  const clash = srdNameClash(name, SRD_SPECIES_NAMES);
  const [description, setDescription] = useState("");
  const [creatureType, setCreatureType] = useState("Humanoid");
  const [sizes, setSizes] = useState<string[]>(["Medium"]);
  const [speed, setSpeed] = useState(30);
  const [traits, setTraits] = useState<SpeciesTrait[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prepopNotice, setPrepopNotice] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  function load(p: Record<string, unknown>) {
    if (typeof p.creature_type === "string" && p.creature_type.trim()) setCreatureType(p.creature_type);
    const sz = readSizes(p.sizes ?? p.size);
    if (sz.length) setSizes(sz);
    const sp = readSpeed(p.speed);
    if (sp) setSpeed(sp);
    const tr = readTraits(p.traits);
    if (tr.length) setTraits(tr);
  }

  useEffect(() => {
    if (!parsedData) return;
    if (typeof parsedData.name === "string") setName(parsedData.name);
    if (typeof parsedData.description === "string") setDescription(parsedData.description);
    load(parsedData);
    setPrepopNotice(true);
    const t = setTimeout(() => setPrepopNotice(false), 6000);
    return () => clearTimeout(t);
  }, [parsedData]);

  useEffect(() => {
    if (!initialData) return;
    setName(initialData.name);
    setDescription(initialData.description);
    load(initialData.properties ?? {});
    const imgUrl = initialData.properties?.image_url as string | undefined;
    if (imgUrl) setImagePreview(imgUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const existingImageUrl = imagePreview?.startsWith("http") ? imagePreview : undefined;

  const toggleSize = (s: string) =>
    setSizes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : SPECIES_SIZE_OPTIONS.filter((o) => o === s || cur.includes(o))));
  const addTrait = () => setTraits((p) => [...p, { name: "", desc: "" }]);
  const updTrait = (i: number, f: keyof SpeciesTrait, v: string) =>
    setTraits((p) => p.map((t, j) => (j === i ? { ...t, [f]: v } : t)));
  const remTrait = (i: number) => setTraits((p) => p.filter((_, j) => j !== i));

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

    const properties: Record<string, unknown> = {
      creature_type: creatureType.trim() || "Humanoid",
      sizes: sizes.length ? sizes : ["Medium"],
      speed,
    };
    const kept = traits
      .map((t) => ({ name: t.name.trim(), desc: t.desc.trim() }))
      .filter((t) => t.name || t.desc);
    if (kept.length) properties.traits = kept;

    try {
      await saveEntryWithImage(
        { name: name.trim(), type: "species", description: description.trim(), properties },
        imageFile ?? capturedImage?.file ?? null,
        navigate,
        initialData?.id,
        existingImageUrl,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg border border-red-700/30 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>}
      {prepopNotice && (
        <div className="rounded-lg border border-amber-600/30 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          ✨ Fields pre-populated from import. Please review and correct before saving.
        </div>
      )}

      <div>
        <label className={labelCls}>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hollowborn" className={inputCls} required />
        <DuplicateNameWarning warning={dupWarning} />
        <SrdNameHint clash={clash} kind="species" onRename={setName} />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Where they come from, what they look like…" className={textareaCls} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_8rem]">
        <div>
          <label className={labelCls}>Creature Type</label>
          <input type="text" value={creatureType} onChange={(e) => setCreatureType(e.target.value)} placeholder="Humanoid" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Speed (ft.)</label>
          <input type="number" value={speed} min={5} step={5} onFocus={(e) => e.target.select()} onChange={(e) => setSpeed(parseInt(e.target.value, 10) || 0)} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Size</label>
        <div className="flex flex-wrap gap-2">
          {SPECIES_SIZE_OPTIONS.map((s) => (
            <button key={s} type="button" aria-pressed={sizes.includes(s)} onClick={() => toggleSize(s)} className={chipCls(sizes.includes(s))}>
              {s}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs italic text-[#766649]">Pick more than one if the player chooses, like a Human's Medium or Small.</p>
      </div>

      <div>
        <label className={labelCls}>Species Traits</label>
        <div className="space-y-3">
          {traits.map((t, i) => (
            <div key={i} className="relative space-y-2 rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] p-3">
              <button type="button" onClick={() => remTrait(i)} aria-label="Remove trait" className="absolute right-2 top-2 text-red-600 hover:text-red-800">
                <FontAwesomeIcon icon={faTimes} className="size-3.5" />
              </button>
              <div className="pr-6">
                <input type="text" value={t.name} onChange={(e) => updTrait(i, "name", e.target.value)} placeholder="Trait name, e.g. Darkvision" className={inputCls} />
              </div>
              <textarea value={t.desc} onChange={(e) => updTrait(i, "desc", e.target.value)} placeholder="What it does…" className={textareaCls} />
            </div>
          ))}
          <button type="button" onClick={addTrait} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-3 py-2 text-sm font-[var(--font-title)] font-bold text-[#766649] transition-colors hover:border-amber-600 hover:text-[#58180d]">
            <FontAwesomeIcon icon={faPlus} className="size-3.5" /> Add Trait
          </button>
        </div>
      </div>

      <ImageUpload fileRef={fileRef} imageFile={imageFile} imagePreview={imagePreview} setImageFile={setImageFile} setImagePreview={setImagePreview} handleImage={handleImage} />

      <SaveButton saving={saving} disabled={!name.trim()} label={initialData ? "Save Changes" : "Save Entry"} />
    </form>
  );
}
