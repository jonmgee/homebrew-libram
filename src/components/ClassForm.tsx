import { useState, useRef, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";
import { saveEntryWithImage } from "../lib/uploadImage";
import { useDuplicateNameCheck } from "../lib/useDuplicateNameCheck";
import { DuplicateNameWarning } from "./DuplicateNameWarning";
import { labelCls, inputCls, textareaCls, ImageUpload, SaveButton, SrdNameHint, chipCls } from "./FormParts";
import {
  ABILITY_KEYS,
  ABILITY_NAMES,
  CLASS_SKILLS,
  HIT_DIE_OPTIONS,
  SRD_CLASS_NAMES,
  srdNameClash,
  type AbilityKey,
  type ArmorTraining,
  type ClassFeature,
  type ClassResource,
  type DbEntry,
} from "../types";
import {
  readAbilities,
  readAbility,
  readArmor,
  readFeatures,
  readHitDie,
  readResources,
  readSkills,
} from "../lib/characterOptions";

type ParseResult = Record<string, unknown>;

const sectionCls = "border-b border-[var(--color-gilding-dark)] pb-1 pt-4 font-[var(--font-title)] text-base font-bold text-[#58180d]";
const hintCls = "mt-1 text-xs italic text-[#766649]";
const numberSmCls = "w-16 rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-2 py-1.5 text-center text-sm font-[var(--font-phb)] text-[var(--color-ink)] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600";

const ARMOR_LABELS: { key: keyof ArmorTraining; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "medium", label: "Medium" },
  { key: "heavy", label: "Heavy" },
  { key: "shields", label: "Shields" },
];

const blankResource = (): ClassResource => ({ name: "", by_level: Array(20).fill(0) });

export default function ClassForm({ parsedData, capturedImage, initialData }: {
  parsedData?: ParseResult | null;
  capturedImage?: { file: File; preview: string };
  initialData?: DbEntry;
}) {
  const [name, setName] = useState("");
  const dupWarning = useDuplicateNameCheck(name, initialData);
  const clash = srdNameClash(name, SRD_CLASS_NAMES);
  const [description, setDescription] = useState("");
  const [primaryAbility, setPrimaryAbility] = useState("");
  const [hitDie, setHitDie] = useState(8);
  const [saves, setSaves] = useState<AbilityKey[]>([]);
  const [skillChoose, setSkillChoose] = useState(2);
  const [skillOptions, setSkillOptions] = useState<string[]>([]);
  const [weaponProfs, setWeaponProfs] = useState("");
  const [toolProfs, setToolProfs] = useState("");
  const [armor, setArmor] = useState<ArmorTraining>({ light: false, medium: false, heavy: false, shields: false });
  const [equipment, setEquipment] = useState("");
  const [spellAbility, setSpellAbility] = useState<AbilityKey | "">("");
  const [subclassLevel, setSubclassLevel] = useState(3);
  const [features, setFeatures] = useState<ClassFeature[]>([]);
  const [resources, setResources] = useState<ClassResource[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prepopNotice, setPrepopNotice] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  function load(p: Record<string, unknown>) {
    if (typeof p.primary_ability === "string") setPrimaryAbility(p.primary_ability);
    const hd = readHitDie(p.hit_die);
    if (hd) setHitDie(hd);
    setSaves(readAbilities(p.saves));
    const n = Number(p.skill_choose);
    if (Number.isFinite(n) && n >= 0) setSkillChoose(Math.floor(n));
    setSkillOptions(readSkills(p.skill_options));
    if (typeof p.weapon_profs === "string") setWeaponProfs(p.weapon_profs);
    if (typeof p.tool_profs === "string") setToolProfs(p.tool_profs);
    setArmor(readArmor(p.armor_training));
    if (typeof p.starting_equipment === "string") setEquipment(p.starting_equipment);
    setSpellAbility(readAbility(p.spell_ability) ?? "");
    const sl = Number(p.subclass_level);
    if (Number.isFinite(sl) && sl >= 1 && sl <= 20) setSubclassLevel(Math.floor(sl));
    setFeatures(readFeatures(p.features));
    setResources(readResources(p.resources));
  }

  useEffect(() => {
    if (!parsedData) return;
    if (typeof parsedData.name === "string") setName(parsedData.name);
    if (typeof parsedData.description === "string") setDescription(parsedData.description);
    load(parsedData);
    setPrepopNotice(true);
    const t = setTimeout(() => setPrepopNotice(false), 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── Features ──
  const addFeature = () => setFeatures((p) => [...p, { level: p.length ? p[p.length - 1]!.level : 1, name: "", desc: "" }]);
  const updFeature = (i: number, patch: Partial<ClassFeature>) =>
    setFeatures((p) => p.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const remFeature = (i: number) => setFeatures((p) => p.filter((_, j) => j !== i));

  // ── Resources ──
  const addResource = () => setResources((p) => [...p, blankResource()]);
  const updResource = (i: number, patch: Partial<ClassResource>) =>
    setResources((p) => p.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const remResource = (i: number) => setResources((p) => p.filter((_, j) => j !== i));
  /**
   * A class table mostly holds a number steady for several levels, so typing
   * one carries it forward through the later levels that held the same value
   * as this one. Setting Rage to 2 at level 1 fills all twenty; 3 at level 3
   * then lifts 3–20 and leaves 1–2 alone.
   *
   * The comparison is against the row as it stood when the box was focused,
   * not as it stands mid-typing: otherwise the "3" on the way to "30" would
   * also sweep up every later level that genuinely held 3.
   */
  const usesSnapshot = useRef<{ i: number; level: number; before: number[] } | null>(null);
  const snapshotUses = (i: number, level: number) => {
    usesSnapshot.current = { i, level, before: [...(resources[i]?.by_level ?? [])] };
  };
  const setUses = (i: number, level: number, value: number) => {
    const snap = usesSnapshot.current;
    setResources((p) =>
      p.map((r, j) => {
        if (j !== i) return r;
        const before = snap && snap.i === i && snap.level === level ? snap.before : r.by_level;
        const old = before[level];
        const by_level = before.map((n, k) => (k === level || (k > level && n === old) ? value : n));
        return { ...r, by_level };
      }),
    );
  };

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
      hit_die: hitDie,
      primary_ability: primaryAbility.trim(),
      saves,
      armor_training: armor,
      weapon_profs: weaponProfs.trim(),
      tool_profs: toolProfs.trim(),
      skill_choose: skillChoose,
      skill_options: skillOptions,
      starting_equipment: equipment.trim(),
      subclass_level: subclassLevel,
      features: features
        .map((f) => ({ level: f.level, name: f.name.trim(), desc: f.desc.trim() }))
        .filter((f) => f.name || f.desc)
        .sort((a, b) => a.level - b.level),
      resources: resources
        .map((r) => ({ ...r, name: r.name.trim() }))
        .filter((r) => r.name),
    };
    if (spellAbility) properties.spell_ability = spellAbility;

    try {
      await saveEntryWithImage(
        { name: name.trim(), type: "class", description: description.trim(), properties },
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
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hexblade" className={inputCls} required />
        <DuplicateNameWarning warning={dupWarning} />
        <SrdNameHint clash={clash} kind="class" onRename={setName} />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this class is about…" className={textareaCls} />
      </div>

      {/* ── Core traits ── */}
      <h3 className={sectionCls}>Core Traits</h3>

      <div>
        <label className={labelCls}>Primary Ability</label>
        <input type="text" value={primaryAbility} onChange={(e) => setPrimaryAbility(e.target.value)} placeholder="e.g. Strength or Dexterity" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Hit Point Die</label>
        <div className="flex flex-wrap gap-2">
          {HIT_DIE_OPTIONS.map((d) => (
            <button key={d} type="button" aria-pressed={hitDie === d} onClick={() => setHitDie(d)} className={chipCls(hitDie === d)}>
              d{d}
            </button>
          ))}
        </div>
        <p className={hintCls}>d6 for the frailest casters, d12 for the Barbarian.</p>
      </div>

      <div>
        <label className={labelCls}>Saving Throw Proficiencies</label>
        <div className="flex flex-wrap gap-2">
          {ABILITY_KEYS.map((k) => (
            <button key={k} type="button" aria-pressed={saves.includes(k)} onClick={() => setSaves((s) => ABILITY_KEYS.filter((x) => x === k ? !s.includes(k) : s.includes(x)))} className={chipCls(saves.includes(k))}>
              {ABILITY_NAMES[k]}
            </button>
          ))}
        </div>
        <p className={saves.length > 2 ? "mt-1 text-xs italic text-amber-700" : hintCls}>
          {saves.length > 2 ? "⚠️ Every SRD class has exactly two — one common, one rarer." : "Every SRD class has exactly two."}
        </p>
      </div>

      <div>
        <label className={labelCls}>Skill Proficiencies</label>
        <div className="mb-2 flex items-center gap-2 text-sm font-[var(--font-phb)]">
          <span>Choose</span>
          <input type="number" value={skillChoose} onFocus={(e) => e.target.select()} min={0} max={18} onChange={(e) => setSkillChoose(Math.max(0, parseInt(e.target.value, 10) || 0))} className={numberSmCls} />
          <span>{skillOptions.length ? "from:" : "from any skill"}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CLASS_SKILLS.map((s) => (
            <button key={s.id} type="button" aria-pressed={skillOptions.includes(s.id)} onClick={() => setSkillOptions((o) => CLASS_SKILLS.map((x) => x.id).filter((id) => id === s.id ? !o.includes(id) : o.includes(id)))} className={chipCls(skillOptions.includes(s.id))}>
              {s.label}
            </button>
          ))}
        </div>
        <p className={hintCls}>SRD classes choose 2–4. Leave every skill unselected to allow any, as the Bard does.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Weapon Proficiencies</label>
          <input type="text" value={weaponProfs} onChange={(e) => setWeaponProfs(e.target.value)} placeholder="e.g. Simple and Martial weapons" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Tool Proficiencies</label>
          <input type="text" value={toolProfs} onChange={(e) => setToolProfs(e.target.value)} placeholder="e.g. Thieves' Tools" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Armor Training</label>
        <div className="flex flex-wrap gap-2">
          {ARMOR_LABELS.map(({ key, label }) => (
            <button key={key} type="button" aria-pressed={armor[key]} onClick={() => setArmor((a) => ({ ...a, [key]: !a[key] }))} className={chipCls(armor[key])}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Starting Equipment</label>
        <textarea value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="e.g. Choose A or B: (A) Chain Mail, Greatsword… or (B) 155 GP" className={textareaCls} />
        <p className={hintCls}>Shown on the entry only; the sheet doesn't add it to inventory.</p>
      </div>

      {/* ── Spellcasting & subclass ── */}
      <h3 className={sectionCls}>Spellcasting &amp; Subclass</h3>

      <div>
        <label className={labelCls}>Spellcasting Ability</label>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={spellAbility === ""} onClick={() => setSpellAbility("")} className={chipCls(spellAbility === "")}>None</button>
          {ABILITY_KEYS.map((k) => (
            <button key={k} type="button" aria-pressed={spellAbility === k} onClick={() => setSpellAbility(k)} className={chipCls(spellAbility === k)}>
              {ABILITY_NAMES[k]}
            </button>
          ))}
        </div>
        <p className={hintCls}>The sheet works out spell save DC and attack bonus from this. Spell slots are still entered by hand, as for every class.</p>
      </div>

      <div className="flex items-center gap-2 text-sm font-[var(--font-phb)]">
        <label className={`${labelCls} !mb-0`}>Subclass chosen at level</label>
        <input type="number" value={subclassLevel} onFocus={(e) => e.target.select()} min={1} max={20} onChange={(e) => setSubclassLevel(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)))} className={numberSmCls} />
      </div>

      {/* ── Features ── */}
      <h3 className={sectionCls}>Class Features</h3>
      <p className={hintCls}>One row per feature. Something gained more than once, like Ability Score Improvement, gets a row at each level.</p>
      <div className="space-y-3">
        {features.map((f, i) => (
          <div key={i} className="relative space-y-2 rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] p-3">
            <button type="button" onClick={() => remFeature(i)} aria-label="Remove feature" className="absolute right-2 top-2 text-red-600 hover:text-red-800">
              <FontAwesomeIcon icon={faTimes} className="size-3.5" />
            </button>
            <div className="flex items-center gap-2 pr-6">
              <label className="text-xs font-bold font-[var(--font-title)] text-[#58180d]">Level</label>
              <input type="number" value={f.level} onFocus={(e) => e.target.select()} min={1} max={20} onChange={(e) => updFeature(i, { level: Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)) })} className={numberSmCls} />
              <input type="text" value={f.name} onChange={(e) => updFeature(i, { name: e.target.value })} placeholder="Feature name" className={inputCls} />
            </div>
            <textarea value={f.desc} onChange={(e) => updFeature(i, { desc: e.target.value })} placeholder="What it does…" className={textareaCls} />
          </div>
        ))}
        <button type="button" onClick={addFeature} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-3 py-2 text-sm font-[var(--font-title)] font-bold text-[#766649] transition-colors hover:border-amber-600 hover:text-[#58180d]">
          <FontAwesomeIcon icon={faPlus} className="size-3.5" /> Add Feature
        </button>
      </div>

      {/* ── Resources ── */}
      <h3 className={sectionCls}>Limited-Use Trackers</h3>
      <p className={hintCls}>Things counted per rest, like Rage or Channel Divinity. The sheet adds a tracker and raises it as the character levels. Typing a number carries it forward to later levels.</p>
      <div className="space-y-3">
        {resources.map((r, i) => (
          <div key={i} className="relative space-y-2 rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] p-3">
            <button type="button" onClick={() => remResource(i)} aria-label="Remove tracker" className="absolute right-2 top-2 text-red-600 hover:text-red-800">
              <FontAwesomeIcon icon={faTimes} className="size-3.5" />
            </button>
            <div className="flex flex-wrap items-center gap-3 pr-6">
              <input type="text" value={r.name} onChange={(e) => updResource(i, { name: e.target.value })} placeholder="Tracker name, e.g. Rage" className={`${inputCls} sm:!w-64`} />
              <label className="flex items-center gap-1.5 text-sm font-[var(--font-phb)]">
                <input type="checkbox" checked={!!r.pool} onChange={(e) => updResource(i, { pool: e.target.checked || undefined })} />
                A pool of points, not uses
              </label>
            </div>
            <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
              {r.by_level.map((n, lvl) => (
                <label key={lvl} className="flex flex-col items-center text-[10px] font-bold text-[#766649]">
                  Lv {lvl + 1}
                  <input type="number" value={n} min={0} onFocus={(e) => { snapshotUses(i, lvl); e.target.select(); }} onChange={(e) => setUses(i, lvl, Math.max(0, parseInt(e.target.value, 10) || 0))} className={`${numberSmCls} !w-full !px-1`} />
                </label>
              ))}
            </div>
          </div>
        ))}
        <button type="button" onClick={addResource} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-3 py-2 text-sm font-[var(--font-title)] font-bold text-[#766649] transition-colors hover:border-amber-600 hover:text-[#58180d]">
          <FontAwesomeIcon icon={faPlus} className="size-3.5" /> Add Tracker
        </button>
      </div>

      <ImageUpload fileRef={fileRef} imageFile={imageFile} imagePreview={imagePreview} setImageFile={setImageFile} setImagePreview={setImagePreview} handleImage={handleImage} />

      <SaveButton saving={saving} disabled={!name.trim()} label={initialData ? "Save Changes" : "Save Entry"} />
    </form>
  );
}
