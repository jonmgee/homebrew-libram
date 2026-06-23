import { useState, useRef, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave, faTimes, faUpload, faPlus, faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../lib/supabase";

/* ───── Shared styles ───── */
const labelCls = "mb-1 block font-[var(--font-title)] text-sm font-bold text-[#58180d]";
const inputCls = "w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] placeholder:text-[#766649] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600";
const textareaCls = "w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] placeholder:text-[#766649] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 min-h-[80px] resize-y";
const sectionHeadingCls = "border-b border-[var(--color-gilding-dark)] pb-1 pt-5 text-base font-bold font-[var(--font-title)] text-[#58180d] first:pt-0";
const numberCls = "w-full rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-2 py-2 text-center text-sm font-[var(--font-phb)] text-[var(--color-ink)] focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600";

/* ───── Helpers ───── */
function abilMod(s: number) { return Math.floor((s - 10) / 2); }
function modStr(s: number) { const m = abilMod(s); return m >= 0 ? `+${m}` : `${m}`; }

function crToProf(cr: string): number {
  const t: Record<string, number> = {
    "0":2,"1/8":2,"1/4":2,"1/2":2,"1":2,"2":2,"3":2,"4":2,
    "5":3,"6":3,"7":3,"8":3,"9":4,"10":4,"11":4,"12":4,
    "13":5,"14":5,"15":5,"16":5,"17":6,"18":6,"19":6,"20":6,
    "21":7,"22":7,"23":7,"24":7,"25":8,"26":8,"27":8,"28":8,"29":9,"30":9,
  };
  return t[cr] ?? 2;
}

const CR_LIST = ["0","1/8","1/4","1/2","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30"];
const SIZE_LIST = ["Tiny","Small","Medium","Large","Huge","Gargantuan"];
const ABILITIES = ["STR","DEX","CON","INT","WIS","CHA"] as const;
const SKILL_LIST = ["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"];
const SKILL_ABIL: Record<string,string> = {
  Acrobatics:"DEX","Animal Handling":"WIS",Arcana:"INT",Athletics:"STR",Deception:"CHA",
  History:"INT",Insight:"WIS",Intimidation:"CHA",Investigation:"INT",Medicine:"WIS",
  Nature:"INT",Perception:"WIS",Performance:"CHA",Persuasion:"CHA",Religion:"INT",
  "Sleight of Hand":"DEX",Stealth:"DEX",Survival:"WIS",
};

/* ───── Custom select (parchment/gold/maroon) ───── */
function CustomSelect({ value, onChange, options, getLabel, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  getLabel: (v: string) => string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(e.relatedTarget)) setOpen(false);
  };
  const selectedLabel = value ? getLabel(value) : (placeholder ?? "Select…");
  return (
    <div ref={ref} tabIndex={0} onBlur={handleBlur} className="relative">
      <button type="button" onClick={() => setOpen(p => !p)} className="flex w-full items-center justify-between rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-sm font-[var(--font-phb)] text-[var(--color-ink)] transition-colors focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600">
        <span>{selectedLabel}</span>
        <svg className={`size-4 text-[#766649] transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] shadow-lg">
          {options.map(opt => (
            <button key={opt} type="button" onMouseDown={e => { e.preventDefault(); onChange(opt); setOpen(false); }}
              className={`w-full px-3 py-1.5 text-left text-sm font-[var(--font-phb)] transition-colors hover:bg-[var(--color-parchment-dark)] ${opt === value ? "bg-[var(--color-parchment-dark)] font-bold text-[#58180d]" : "text-[var(--color-ink)]"}`}
            >{getLabel(opt)}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── Tag input ───── */
function useTags(initial: string[] = []) {
  const [tags, setTags] = useState(initial);
  const [input, setInput] = useState("");
  const add = (raw: string) => { const t = raw.trim(); if (t && !tags.includes(t)) setTags(p => [...p, t]); setInput(""); };
  const remove = (tag: string) => setTags(p => p.filter(x => x !== tag));
  const reset = () => setTags([]);
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); }
    if (e.key === "Backspace" && !input && tags.length > 0) remove(tags[tags.length - 1]!);
  };
  return { tags, input, setInput, add, remove, reset, handleKey };
}

function TagRow({ hook }: { hook: ReturnType<typeof useTags> }) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {hook.tags.map(t => (
          <span key={t} className="flex items-center gap-1 rounded-md border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-2 py-0.5 text-xs font-[var(--font-phb)] text-[#58180d]">
            {t}
            <button type="button" onClick={() => hook.remove(t)} className="ml-0.5 text-[#766649] hover:text-[#58180d]"><FontAwesomeIcon icon={faTimes} className="size-2.5" /></button>
          </span>
        ))}
      </div>
      <input type="text" value={hook.input} onChange={e => hook.setInput(e.target.value)} onKeyDown={hook.handleKey} onBlur={() => { if (hook.input.trim()) hook.add(hook.input); }} placeholder="Type and press Enter or comma…" className={`mt-1.5 ${inputCls}`} />
    </div>
  );
}

/* ───── Repeatable block ───── */
function RepeatBlock({ items, onChange, onRemove, onAdd, namePh, descPh, addLabel }: {
  items: {name:string;desc:string}[];
  onChange: (i:number,f:"name"|"desc",v:string)=>void;
  onRemove: (i:number)=>void;
  onAdd: ()=>void;
  namePh: string; descPh: string; addLabel: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="relative rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] p-3">
          <button type="button" onClick={() => onRemove(i)} className="absolute right-2 top-2 text-red-600 hover:text-red-800"><FontAwesomeIcon icon={faTrash} className="size-3.5" /></button>
          <input type="text" value={item.name} onChange={e => onChange(i,"name",e.target.value)} placeholder={namePh} className={`mb-2 ${inputCls}`} />
          <textarea value={item.desc} onChange={e => onChange(i,"desc",e.target.value)} placeholder={descPh} className={textareaCls} />
        </div>
      ))}
      <button type="button" onClick={onAdd} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-gilding-dark)] py-2 text-sm font-[var(--font-title)] font-bold text-[#766649] transition-colors hover:border-amber-600 hover:text-[#58180d]">
        <FontAwesomeIcon icon={faPlus} className="size-3.5" /> {addLabel}
      </button>
    </div>
  );
}

/* ───── MonsterForm ───── */
export default function MonsterForm() {
  /* Core */
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [creatureType, setCreatureType] = useState("");
  const [alignment, setAlignment] = useState("");
  const [cr, setCr] = useState("");
  const profBonus = crToProf(cr);

  /* Defence */
  const [ac, setAc] = useState("");
  const [hp, setHp] = useState("");
  const [speed, setSpeed] = useState("");

  /* Abilities */
  const [str, setStr] = useState(10);
  const [dex, setDex] = useState(10);
  const [con, setCon] = useState(10);
  const [intel, setIntel] = useState(10);
  const [wis, setWis] = useState(10);
  const [cha, setCha] = useState(10);
  const abilScores: Record<string,number> = { STR:str, DEX:dex, CON:con, INT:intel, WIS:wis, CHA:cha };

  /* Saves */
  const [saveProfs, setSaveProfs] = useState<Record<string,boolean>>({ STR:false, DEX:false, CON:false, INT:false, WIS:false, CHA:false });

  /* Skills */
  const [skillProfs, setSkillProfs] = useState<string[]>([]);

  /* Damage mods */
  const vuln = useTags(); const resist = useTags(); const immune = useTags(); const condImm = useTags();

  /* Senses & languages */
  const [senses, setSenses] = useState(""); const [languages, setLanguages] = useState("");

  /* Traits */
  const [traits, setTraits] = useState<{name:string;desc:string}[]>([]);
  const addTr = () => setTraits(p => [...p,{name:"",desc:""}]);
  const updTr = (i:number,f:"name"|"desc",v:string) => setTraits(p => p.map((t,j) => j===i ? {...t,[f]:v} : t));
  const remTr = (i:number) => setTraits(p => p.filter((_,j) => j!==i));

  /* Spellcasting */
  const [hasSpell, setHasSpell] = useState(false);
  const [spellAbil, setSpellAbil] = useState("INT"); const [spellSave, setSpellSave] = useState(10);
  const [spellAtk, setSpellAtk] = useState(0); const [spellList, setSpellList] = useState("");

  /* Actions */
  const [actions, setActions] = useState<{name:string;desc:string}[]>([]);
  const addAct = () => setActions(p => [...p,{name:"",desc:""}]);
  const updAct = (i:number,f:"name"|"desc",v:string) => setActions(p => p.map((a,j) => j===i ? {...a,[f]:v} : a));
  const remAct = (i:number) => setActions(p => p.filter((_,j) => j!==i));

  /* Bonus Actions */
  const [bonusActions, setBonusActions] = useState<{name:string;desc:string}[]>([]);
  const addBonus = () => setBonusActions(p => [...p,{name:"",desc:""}]);
  const updBonus = (i:number,f:"name"|"desc",v:string) => setBonusActions(p => p.map((a,j) => j===i ? {...a,[f]:v} : a));
  const remBonus = (i:number) => setBonusActions(p => p.filter((_,j) => j!==i));

  /* Reactions */
  const [reactions, setReactions] = useState<{name:string;desc:string}[]>([]);
  const addReact = () => setReactions(p => [...p,{name:"",desc:""}]);
  const updReact = (i:number,f:"name"|"desc",v:string) => setReactions(p => p.map((a,j) => j===i ? {...a,[f]:v} : a));
  const remReact = (i:number) => setReactions(p => p.filter((_,j) => j!==i));

  /* Legendary */
  const [hasLeg, setHasLeg] = useState(false);
  const [legPer, setLegPer] = useState(3);
  const [legActs, setLegActs] = useState<{name:string;desc:string}[]>([]);
  const addLeg = () => setLegActs(p => [...p,{name:"",desc:""}]);
  const updLeg = (i:number,f:"name"|"desc",v:string) => setLegActs(p => p.map((a,j) => j===i ? {...a,[f]:v} : a));
  const remLeg = (i:number) => setLegActs(p => p.filter((_,j) => j!==i));

  /* Lair */
  const [hasLair, setHasLair] = useState(false);
  const [lairActs, setLairActs] = useState<{name:string;desc:string}[]>([]);
  const addLair = () => setLairActs(p => [...p,{name:"",desc:""}]);
  const updLair = (i:number,f:"name"|"desc",v:string) => setLairActs(p => p.map((a,j) => j===i ? {...a,[f]:v} : a));
  const remLair = (i:number) => setLairActs(p => p.filter((_,j) => j!==i));

  /* Flavour */
  const [description, setDescription] = useState("");
  const tags = useTags();
  const [imgFile, setImgFile] = useState<File|null>(null);
  const [imgPrev, setImgPrev] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const getSave = (a: string): number => { const m = abilMod(abilScores[a]??10); return saveProfs[a] ? m+profBonus : m; };
  const getSkill = (s: string): number => { const abb = SKILL_ABIL[s]!; return skillProfs.includes(s) ? abilMod(abilScores[abb]??10)+profBonus : abilMod(abilScores[abb]??10); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null); setSuccess(false);
    const props: Record<string,unknown> = {};
    if (size) props.size = size;
    if (creatureType.trim()) props.creature_type = creatureType.trim();
    if (alignment.trim()) props.alignment = alignment.trim();
    if (cr) props.cr = cr;
    if (ac.trim()) props.ac = ac.trim();
    if (hp.trim()) props.hp = hp.trim();
    if (speed.trim()) props.speed = speed.trim();
    props.ability_str = str; props.ability_dex = dex; props.ability_con = con;
    props.ability_int = intel; props.ability_wis = wis; props.ability_cha = cha;

    const sv = ABILITIES.filter(a => saveProfs[a]).map(a => `${a.toLowerCase()} +${getSave(a)}`).join(", ");
    if (sv) props.saving_throws = sv;
    const sk = skillProfs.map(s => `${s} +${getSkill(s)}`).join(", ");
    if (sk) props.skills = sk;
    if (vuln.tags.length) props.damage_vulnerabilities = vuln.tags.join(", ");
    if (resist.tags.length) props.damage_resistances = resist.tags.join(", ");
    if (immune.tags.length) props.damage_immunities = immune.tags.join(", ");
    if (condImm.tags.length) props.condition_immunities = condImm.tags.join(", ");
    if (senses.trim()) props.senses = senses.trim();
    if (languages.trim()) props.languages = languages.trim();
    if (traits.filter(t => t.name||t.desc).length) props.traits = traits.filter(t => t.name||t.desc);
    if (hasSpell) props.spellcasting = { ability: spellAbil, save_dc: spellSave, attack_bonus: spellAtk, spells: spellList.trim() };
    if (actions.filter(a => a.name||a.desc).length) props.actions = actions.filter(a => a.name||a.desc);
    if (bonusActions.filter(a => a.name||a.desc).length) props.bonus_actions = bonusActions.filter(a => a.name||a.desc);
    if (reactions.filter(a => a.name||a.desc).length) props.reactions = reactions.filter(a => a.name||a.desc);
    if (hasLeg) props.legendary_actions = { per_round: legPer, actions: legActs.filter(a => a.name||a.desc) };
    if (hasLair) props.lair_actions = lairActs.filter(a => a.name||a.desc);

    if (imgFile) {
      const ext = imgFile.name.split(".").pop() ?? "png";
      const filename = `${crypto.randomUUID()}.${ext}`;
      const { data: uploadData } = await supabase.storage.from("entry-images").upload(filename, imgFile);
      if (uploadData) {
        const { data: pub } = supabase.storage.from("entry-images").getPublicUrl(filename);
        props.image_url = pub.publicUrl;
      } else {
        props.image_data = imgPrev;
      }
    }

    try {
      const { error: insertError } = await supabase.from("entries").insert({
        name: name.trim(),
        type: "monster",
        description: description.trim(),
        tags: tags.tags,
        properties: props,
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setName(""); setSize(""); setCreatureType(""); setAlignment(""); setCr("");
      setAc(""); setHp(""); setSpeed("");
      setStr(10); setDex(10); setCon(10); setIntel(10); setWis(10); setCha(10);
      setSaveProfs({ STR:false, DEX:false, CON:false, INT:false, WIS:false, CHA:false });
      setSkillProfs([]);
      vuln.reset(); resist.reset(); immune.reset(); condImm.reset();
      setSenses(""); setLanguages("");
      setTraits([]); setHasSpell(false); setSpellAbil("INT"); setSpellSave(10); setSpellAtk(0); setSpellList("");
      setActions([]); setBonusActions([]); setReactions([]);
      setHasLeg(false); setLegPer(3); setLegActs([]);
      setHasLair(false); setLairActs([]);
      setDescription(""); tags.reset(); setImgFile(null); setImgPrev(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  const toggleCls = (active: boolean) =>
    `rounded-lg border px-3 py-1.5 text-xs font-[var(--font-phb)] transition-colors ${
      active ? "border-[var(--color-gilding-dark)] bg-[#58180d] font-bold text-[#eee5ce]" : "border-[var(--color-parchment-dark)] bg-[var(--color-parchment)] text-[#766649] hover:border-[var(--color-gilding-dark)]"
    }`;

  const saveToggleCls = (active: boolean) =>
    `rounded border px-2 py-0.5 text-xs font-[var(--font-phb)] transition-colors ${
      active ? "border-[var(--color-gilding-dark)] bg-[#58180d] font-bold text-[#eee5ce]" : "border-[var(--color-parchment-dark)] bg-[var(--color-parchment)] text-[#766649] hover:border-[var(--color-gilding-dark)]"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      {success && <div className="rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-sm text-green-800">Saved!</div>}
      {error && <div className="rounded-lg border border-red-700/30 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>}

      <h3 className={sectionHeadingCls}>Core Identity</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className={labelCls}>Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Ancient Red Dragon" className={inputCls} required /></div>
        <div><label className={labelCls}>Size</label><CustomSelect value={size} onChange={setSize} options={SIZE_LIST} getLabel={s=>s.charAt(0).toUpperCase()+s.slice(1)} placeholder="Select…" /></div>
        <div><label className={labelCls}>Type</label><input type="text" value={creatureType} onChange={e=>setCreatureType(e.target.value)} placeholder="e.g. Dragon" className={inputCls} /></div>
        <div><label className={labelCls}>Alignment</label><input type="text" value={alignment} onChange={e=>setAlignment(e.target.value)} placeholder="e.g. Chaotic Evil" className={inputCls} /></div>
        <div><label className={labelCls}>Challenge Rating</label><CustomSelect value={cr} onChange={setCr} options={CR_LIST} getLabel={c=>c} placeholder="Select…" /></div>
      </div>
      <div className="rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-3 py-2 text-sm">
        <span className="font-[var(--font-title)] font-bold text-[#58180d]">Proficiency Bonus: </span>
        <span className="font-[var(--font-phb)] text-[var(--color-ink)]">+{profBonus}</span>
      </div>

      <h3 className={sectionHeadingCls}>Defence</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Armour Class</label><input type="text" value={ac} onChange={e=>setAc(e.target.value)} placeholder="e.g. 22 (natural armour)" className={inputCls} /></div>
        <div><label className={labelCls}>Hit Points</label><input type="text" value={hp} onChange={e=>setHp(e.target.value)} placeholder="e.g. 546 (28d12+196)" className={inputCls} /></div>
        <div><label className={labelCls}>Speed</label><input type="text" value={speed} onChange={e=>setSpeed(e.target.value)} placeholder="e.g. 40ft, fly 80ft" className={inputCls} /></div>
      </div>

      <h3 className={sectionHeadingCls}>Ability Scores</h3>
      <div className="grid grid-cols-6 gap-2">
        {[{k:"STR",v:str,s:setStr},{k:"DEX",v:dex,s:setDex},{k:"CON",v:con,s:setCon},{k:"INT",v:intel,s:setIntel},{k:"WIS",v:wis,s:setWis},{k:"CHA",v:cha,s:setCha}].map(({k,v,s}) => (
          <div key={k} className="text-center">
            <label className="mb-1 block text-xs font-bold font-[var(--font-title)] text-[#58180d]">{k}</label>
            <input type="number" value={v} onChange={e=>s(Math.max(1,Math.min(30,parseInt(e.target.value)||1)))} className={numberCls} />
            <span className="mt-0.5 block text-xs font-[var(--font-phb)] text-[#766649]">{modStr(v)}</span>
          </div>
        ))}
      </div>

      <h3 className={sectionHeadingCls}>Saving Throws</h3>
      <div className="flex flex-wrap gap-2">
        {ABILITIES.map(a => (
          <button key={a} type="button" onClick={()=>setSaveProfs(p=>({...p,[a]:!p[a]}))} className={saveToggleCls(saveProfs[a]!)}>{a} +{getSave(a)}</button>
        ))}
      </div>

      <h3 className={sectionHeadingCls}>Skills</h3>
      <div className="flex flex-wrap gap-2">
        {SKILL_LIST.map(s => (
          <button key={s} type="button" onClick={()=>setSkillProfs(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])} className={saveToggleCls(skillProfs.includes(s))}>{s} +{getSkill(s)}</button>
        ))}
      </div>

      <h3 className={sectionHeadingCls}>Damage &amp; Condition Modifiers</h3>
      <div className="space-y-3">
        <div><label className={labelCls}>Damage Vulnerabilities</label><TagRow hook={vuln} /></div>
        <div><label className={labelCls}>Damage Resistances</label><TagRow hook={resist} /></div>
        <div><label className={labelCls}>Damage Immunities</label><TagRow hook={immune} /></div>
        <div><label className={labelCls}>Condition Immunities</label><TagRow hook={condImm} /></div>
      </div>

      <h3 className={sectionHeadingCls}>Senses &amp; Languages</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Senses</label><input type="text" value={senses} onChange={e=>setSenses(e.target.value)} placeholder="e.g. darkvision 60ft, passive Perception 14" className={inputCls} /></div>
        <div><label className={labelCls}>Languages</label><input type="text" value={languages} onChange={e=>setLanguages(e.target.value)} placeholder="e.g. Common, Draconic" className={inputCls} /></div>
      </div>

      <h3 className={sectionHeadingCls}>Traits</h3>
      <RepeatBlock items={traits} onChange={updTr} onRemove={remTr} onAdd={addTr} namePh="Trait name (e.g. Legendary Resistance)" descPh="Trait description…" addLabel="Add Trait" />

      <h3 className={sectionHeadingCls}>Spellcasting</h3>
      <div className="flex items-center gap-3">
        <span className="text-sm font-[var(--font-phb)] text-[var(--color-ink)]">Has spellcasting?</span>
        <button type="button" onClick={()=>setHasSpell(false)} className={toggleCls(!hasSpell)}>No</button>
        <button type="button" onClick={()=>setHasSpell(true)} className={toggleCls(hasSpell)}>Yes</button>
      </div>
      {hasSpell && (
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Spellcasting Ability</label>
            <CustomSelect value={spellAbil} onChange={setSpellAbil} options={ABILITIES} getLabel={a=>a} /></div>
          <div><label className={labelCls}>Spell Save DC</label><input type="number" value={spellSave} onChange={e=>setSpellSave(parseInt(e.target.value)||0)} className={inputCls} /></div>
          <div><label className={labelCls}>Spell Attack Bonus</label><input type="number" value={spellAtk} onChange={e=>setSpellAtk(parseInt(e.target.value)||0)} className={inputCls} /></div>
          <div className="col-span-2"><label className={labelCls}>Spell List</label><textarea value={spellList} onChange={e=>setSpellList(e.target.value)} placeholder="List spells or paste a full spellcasting block…" className={textareaCls} /></div>
        </div>
      )}

      <h3 className={sectionHeadingCls}>Actions</h3>
      <RepeatBlock items={actions} onChange={updAct} onRemove={remAct} onAdd={addAct} namePh="Action name (e.g. Multiattack)" descPh="Action description…" addLabel="Add Action" />

      <h3 className={sectionHeadingCls}>Bonus Actions</h3>
      <RepeatBlock items={bonusActions} onChange={updBonus} onRemove={remBonus} onAdd={addBonus} namePh="Bonus action name" descPh="Bonus action description…" addLabel="Add Bonus Action" />

      <h3 className={sectionHeadingCls}>Reactions</h3>
      <RepeatBlock items={reactions} onChange={updReact} onRemove={remReact} onAdd={addReact} namePh="Reaction name (e.g. Shield)" descPh="Reaction description…" addLabel="Add Reaction" />

      <h3 className={sectionHeadingCls}>Legendary Actions</h3>
      <div className="flex items-center gap-3">
        <span className="text-sm font-[var(--font-phb)] text-[var(--color-ink)]">Has legendary actions?</span>
        <button type="button" onClick={()=>setHasLeg(false)} className={toggleCls(!hasLeg)}>No</button>
        <button type="button" onClick={()=>setHasLeg(true)} className={toggleCls(hasLeg)}>Yes</button>
      </div>
      {hasLeg && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <label className={labelCls}>Uses per Round</label>
            <input type="number" value={legPer} onChange={e=>setLegPer(parseInt(e.target.value)||1)} className="w-20 rounded-lg border border-[var(--color-gilding-dark)] bg-[var(--color-parchment-light)] px-3 py-2 text-center text-sm font-[var(--font-phb)] text-[var(--color-ink)]" />
          </div>
          <RepeatBlock items={legActs} onChange={updLeg} onRemove={remLeg} onAdd={addLeg} namePh="Legendary action name" descPh="Legendary action description…" addLabel="Add Legendary Action" />
        </div>
      )}

      <h3 className={sectionHeadingCls}>Lair Actions</h3>
      <div className="flex items-center gap-3">
        <span className="text-sm font-[var(--font-phb)] text-[var(--color-ink)]">Has lair actions?</span>
        <button type="button" onClick={()=>setHasLair(false)} className={toggleCls(!hasLair)}>No</button>
        <button type="button" onClick={()=>setHasLair(true)} className={toggleCls(hasLair)}>Yes</button>
      </div>
      {hasLair && (
        <div className="mt-3">
          <RepeatBlock items={lairActs} onChange={updLair} onRemove={remLair} onAdd={addLair} namePh="Lair action name" descPh="Lair action description…" addLabel="Add Lair Action" />
        </div>
      )}

      <h3 className={sectionHeadingCls}>Flavour</h3>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Lore, flavour text, lair description…" className={textareaCls} />
        </div>
        <div>
          <label className={labelCls}>Tags</label>
          <TagRow hook={tags} />
        </div>
        <div>
          <label className={labelCls}>Image</label>
          <div onClick={()=>fileRef.current?.click()} className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-gilding-dark)] bg-[var(--color-parchment)] px-4 py-6 text-center transition-colors hover:border-amber-600 hover:bg-[var(--color-parchment-light)]">
            {imgPrev ? <img src={imgPrev} alt="" className="max-h-40 rounded object-contain" /> : <><FontAwesomeIcon icon={faUpload} className="text-2xl text-[#766649]" /><span className="font-[var(--font-phb)] text-sm text-[#766649]">Click to upload an image</span></>}
            {imgFile && <button type="button" onClick={(e)=>{e.stopPropagation();setImgFile(null);setImgPrev(null);if(fileRef.current)fileRef.current.value="";}} className="text-xs text-red-600 hover:text-red-800">Remove</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(!f)return;setImgFile(f);const r=new FileReader();r.onload=()=>setImgPrev(r.result as string);r.readAsDataURL(f);}} className="hidden" />
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={saving||!name.trim()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-gilding-dark)] bg-[#58180d] px-4 py-2.5 text-sm font-bold text-[#eee5ce] transition-colors hover:bg-[#6e2a1a] disabled:cursor-not-allowed disabled:opacity-50">
          <FontAwesomeIcon icon={faSave} />
          {saving ? "Saving…" : "Save Entry"}
        </button>
      </div>
    </form>
  );
}