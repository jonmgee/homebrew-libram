import type { VercelRequest, VercelResponse } from "@vercel/node";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/* ──────── Type-specific extraction prompts ──────── */

const VERBATIM_NOTE = `CRITICAL — description field: Copy the full description text verbatim, preserving all mechanical details, examples, and specific numbers. Do not summarise, condense, or paraphrase the description.
Format the description as markdown: keep bold labels such as **Curse.** or **At Higher Levels.** as markdown bold, keep bullet lists as markdown "- " lists, and separate paragraphs with a blank line. Never wrap the description itself in quotes or code fences.
If the source is an image or scan, transcribe the text exactly as printed, correcting only obvious OCR artefacts (broken words, stray characters). Never invent content that is not in the source.`;

const PROMPTS: Record<string, string> = {

  magic_item: `Extract and return JSON only — no preamble, no fences.
{
  "name": "string",
  "rarity": one of "None", "Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact",
  "attunement": boolean,
  "attunement_by": "string or null",
  "description": "string",
  "tags": ["array of strings"]
}
Use null for unknown, false for attunement, "None" for rarity. Infer tags.
${VERBATIM_NOTE}
Content:\n`,

  weapon: `Extract and return JSON only — no preamble, no fences.
{
  "name": "string",
  "rarity": one of "None", "Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact",
  "attunement": boolean,
  "attunement_by": "string or null",
  "description": "string",
  "tags": ["array of strings"]
}
Use null for unknown, false for attunement, "None" for rarity. Infer tags.
${VERBATIM_NOTE}
Content:\n`,

  armour: `Extract and return JSON only — no preamble, no fences.
{
  "name": "string",
  "rarity": one of "None", "Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact",
  "attunement": boolean,
  "attunement_by": "string or null",
  "description": "string",
  "tags": ["array of strings"]
}
Use null for unknown, false for attunement, "None" for rarity.
${VERBATIM_NOTE}
Content:\n`,

  potion: `Extract and return JSON only — no preamble, no fences.
{
  "name": "string",
  "rarity": one of "None", "Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact",
  "attunement": boolean,
  "attunement_by": "string or null",
  "description": "string",
  "tags": ["array of strings"]
}
Use null for unknown, false for attunement, "None" for rarity.
${VERBATIM_NOTE}
Content:\n`,

  adventuring_gear: `Extract and return JSON only — no preamble, no fences.
{
  "name": "string",
  "rarity": one of "None", "Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact",
  "attunement": boolean,
  "attunement_by": "string or null",
  "description": "string",
  "tags": ["array of strings"]
}
Use null for unknown, false for attunement, "None" for rarity.
${VERBATIM_NOTE}
Content:\n`,

  trinket: `Extract and return JSON only — no preamble, no fences.
{
  "name": "string",
  "description": "string",
  "tags": ["array of strings"]
}
Use null for unknown. Infer tags.
${VERBATIM_NOTE}
Content:\n`,

  npc: `Extract NPC fields and return JSON only — no preamble, no fences.
{
  "name": "string",
  "description": "string",
  "tags": ["array of strings"]
}
Name is NPC name or title. Description captures role/appearance/background. Infer tags like "blacksmith", "noble", "quest-giver". Use null for unknown.
${VERBATIM_NOTE}
Content:\n`,

  background: `Extract background fields and return JSON only — no preamble, no fences.
{
  "name": "string",
  "description": "string",
  "tags": ["array of strings"]
}
Name is background title (e.g. "Acolyte", "Criminal"). Description summarises flavour and benefits. Infer tags like "roleplay", "skills". Use null for unknown.
${VERBATIM_NOTE}
Content:\n`,

  feat: `Extract feat fields and return JSON only — no preamble, no fences.
{
  "name": "string",
  "description": "string",
  "tags": ["array of strings"]
}
Name is feat title (e.g. "Tough", "Alert"). Description captures mechanical benefit. Infer tags like "combat", "roleplay". Use null for unknown.
${VERBATIM_NOTE}
Content:\n`,

  spell: `Extract spell fields and return JSON only — no preamble, no fences.
{
  "name": "string",
  "level": one of "cantrip", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "school": one of "abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation",
  "casting_time": "string", "range": "string",
  "components": ["V", "S", "M"],
  "material": "string or null",
  "duration": "string", "concentration": boolean,
  "description": "string", "tags": ["array of strings"]
}
Map "1st" to "1", "2nd" to "2", and "0"/"cantrip" to "cantrip". A line like "5th-level evocation" means level "5", school "evocation".
material is the text in parentheses after the M component, without the parentheses.
Set concentration true if the duration mentions concentration; the duration value itself should not repeat the word "Concentration" (e.g. "Concentration, up to 1 minute" → duration "1 minute", concentration true).
Include any "At Higher Levels" paragraph at the end of the description as **At Higher Levels.** followed by the text. Infer school and tags. Use null/false/[] for unknowns.
${VERBATIM_NOTE}
Content:\n`,

  scroll: `Extract scroll fields and return JSON only — no preamble, no fences.
{
  "name": "string",
  "level": one of "cantrip", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "school": one of "abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation",
  "rarity": one of "None", "Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact",
  "casting_time": "string", "range": "string",
  "components": ["V", "S", "M"],
  "material": "string or null",
  "duration": "string", "concentration": boolean,
  "description": "string", "tags": ["array of strings"]
}
Name often "Scroll of [Spell]". Extract spell properties + rarity. Use null/false/[]/None.
${VERBATIM_NOTE}
Content:\n`,

  subclass: `Extract subclass fields and return JSON only — no preamble, no fences.
{
  "name": "string",
  "parent_class": "string",
  "description": "string",
  "level_features": [ { "level": number, "desc": "string" } ],
  "tags": ["array of strings"]
}
Name is subclass title, parent_class is base class. Extract level features as named blocks. Use null/[] for unknowns.
${VERBATIM_NOTE}
Content:\n`,

  monster: `Extract monster stat block and return JSON only — no preamble, no fences.
{
  "name": "string", "size": one of "Tiny","Small","Medium","Large","Huge","Gargantuan",
  "creature_type": "string", "alignment": "string", "cr": "string",
  "ac": "string", "hp": "string", "speed": "string",
  "ability_str": number, "ability_dex": number, "ability_con": number,
  "ability_int": number, "ability_wis": number, "ability_cha": number,
  "saving_throws": "string or null", "skills": "string or null",
  "damage_vulnerabilities": "string or null", "damage_resistances": "string or null",
  "damage_immunities": "string or null", "condition_immunities": "string or null",
  "senses": "string or null", "languages": "string or null",
  "traits": [ { "name": "string", "desc": "string" } ],
  "actions": [ { "name": "string", "desc": "string" } ],
  "bonus_actions": [ { "name": "string", "desc": "string" } ],
  "reactions": [ { "name": "string", "desc": "string" } ],
  "legendary_actions": { "per_round": number, "actions": [ { "name": "string", "desc": "string" } ] },
  "description": "string", "tags": ["array of strings"]
}
Ability scores as plain numbers — a printed "24 (+7)" means 24; ignore the modifier in parentheses.
ac: keep any armour note, e.g. "17 (natural armor)". hp: keep the dice formula, e.g. "168 (16d12 + 64)". cr: keep XP if printed, e.g. "11 (7,200 XP)".
Attack lines go in actions verbatim, e.g. "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 25 (4d8 + 7) bludgeoning damage."
Recharge and usage notes stay in the block name, e.g. "Toll the Lantern (Recharge 5–6)" or "Fire Breath (1/Day)".
Traits are the passive abilities printed between the stat lines and the Actions header. Any flavour or lore paragraphs outside the stat block go in description.
Use null for unknown, [] for arrays.
${VERBATIM_NOTE}
Content:\n`,

  table: `Extract table fields and return JSON only — no preamble, no fences.
{
  "name": "string", "description": "string",
  "die_type": "string — d4/d6/d8/d10/d12/d20/d100",
  "columns": ["array of column header strings"],
  "rows": [ ["roll", "cell", "cell"], ... ],
  "tags": ["array of strings"]
}
CRITICAL: Expand roll ranges into one row per individual roll value.
Example: input "1-2: A merchant" → rows [["1", "A merchant"], ["2", "A merchant"]].
Input "20: A dragon" → rows [["20", "A dragon"]].
On d100 tables "00" means 100, and "96-00" expands to rows 96, 97, 98, 99, 100.
Each row first cell = single roll number (not a range), rest match columns.
Cells per row = 1 + columns.length. Rows must be complete and in ascending roll order with no gaps and no duplicates — a d20 table has exactly 20 rows, a d100 table exactly 100. Never stop early; output every row even if repetitive.
die_type is the die that matches the total row count. columns excludes the roll column (e.g. a two-column "d12 / Patron" table has columns ["Patron"]). Use null/[] if no value.
${VERBATIM_NOTE}
Content:
`,
};

const MULTI_PART_NOTE = `
The source material is provided as multiple sequential parts (e.g. several screenshots of one document). Treat all parts as ONE continuous document, in the order given. If parts overlap at the seams (e.g. the same table rows appear at the bottom of one screenshot and the top of the next), include the overlapping content only once.`;

const ARTWORK_NOTE = `
Additionally, if any provided image contains a distinct piece of illustration or artwork (a drawing/painting of a creature, item or scene — not text, tables, stat-block layout or UI), add this to the JSON: "artwork": { "image_index": <0-based index of the FIRST provided image that contains artwork>, "box": [x0, y0, x1, y1] } where the box coordinates are normalized to 0-1000 of that image's width and height (y increases downward) and tightly enclose ONLY the artwork, excluding all text columns, headers, stat blocks and interface chrome. If no image contains distinct artwork, use "artwork": null.`;

const TREASURE_TYPES = new Set(["magic_item", "wondrous_item", "weapon", "armour", "potion", "adventuring_gear"]);

function getPrompt(entryType: string): string | null {
  if (PROMPTS[entryType]) return PROMPTS[entryType];
  if (TREASURE_TYPES.has(entryType)) return PROMPTS["magic_item"];
  return null;
}

function stripMarkdownFence(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/gm, "").replace(/```\s*$/gm, "").trim();
}

/* ──────── Access control ────────
 * This endpoint spends real money on OpenRouter. It used to accept anonymous
 * POSTs from any origin, so anyone could drain the account or embed it in
 * their own site for free AI billed to us.
 *
 * Kept inline deliberately: Vercel does not deploy files whose names start
 * with an underscore, and a shared api/_auth.ts import compiled fine but
 * threw ERR_MODULE_NOT_FOUND at runtime. Duplication beats a 500. */

const ALLOWED_ORIGINS = [
  "https://homebrewlibram.com",
  "https://www.homebrewlibram.com",
  "https://homebrew-libram.vercel.app",
  "http://localhost:5173",
  "http://localhost:5192",
];

/** Vision calls bill per image, so cap how many one request can trigger. */
const MAX_IMAGES = 6;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const originAllowed = ALLOWED_ORIGINS.includes(origin);

  if (originAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  if (req.method === "OPTIONS") return res.status(originAllowed ? 204 : 403).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Signed-in users only. Verified against Supabase rather than trusted, so an
  // expired or forged token is rejected.
  const authHeader = req.headers.authorization;
  const accessToken =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

  if (!accessToken) {
    return res.status(401).json({ error: "Please sign in to use this feature." });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    // Our misconfiguration, not the caller's — don't imply their session is bad.
    console.error("[parse-entry] Supabase env vars not set");
    return res.status(500).json({ error: "Server auth is not configured." });
  }

  try {
    const check = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${accessToken}`, apikey: supabaseAnonKey },
    });
    if (!check.ok) {
      return res.status(401).json({ error: "Your session has expired. Sign in again." });
    }
  } catch (e) {
    console.error("[parse-entry] session verification failed:", e);
    return res.status(503).json({ error: "Could not verify your session. Try again." });
  }

  try {
    const { text, image, images, entryType } = req.body;

    // Accept a list of images (new) or a single image (legacy callers)
    const imageList: string[] = Array.isArray(images)
      ? images.filter((i): i is string => typeof i === "string" && i.length > 0)
      : typeof image === "string" && image.length > 0
        ? [image]
        : [];

    if (!text && !imageList.length) return res.status(400).json({ error: "No content provided." });
    if (imageList.length > MAX_IMAGES) {
      return res.status(400).json({ error: `Too many images (max ${MAX_IMAGES}).` });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OPENROUTER_API_KEY not configured" });

    let prompt = getPrompt(entryType);
    if (!prompt) return res.status(400).json({ error: `No prompt for entry type "${entryType}".` });

    const partCount = imageList.length + (text ? 1 : 0);
    if (partCount > 1) prompt += MULTI_PART_NOTE;
    if (imageList.length) prompt += ARTWORK_NOTE;

    const messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }> = [];

    if (imageList.length) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: prompt + (typeof text === "string" ? text : "") },
          ...imageList.map((img) => ({
            type: "image_url",
            image_url: { url: `data:image/png;base64,${img}`, detail: "high" },
          })),
        ],
      });
    } else {
      messages.push({ role: "user", content: prompt + text });
    }

    const body = {
      model: "google/gemini-3.1-flash-lite",
      messages, temperature: 0.1,
      // d100 tables and long stat blocks can exceed 4096 output tokens
      max_tokens: 16384,
      response_format: { type: "json_object" },
    };

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json",
        "HTTP-Referer": "https://homebrew-libram.vercel.app",
        "X-Title": "Homebrew Libram",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenRouter error:", response.status, errBody);
      return res.status(502).json({ error: `AI service returned ${response.status}. Please try again.` });
    }

    const data = await response.json();
    const rawContent: string = data.choices?.[0]?.message?.content ?? "";
    if (!rawContent) return res.status(502).json({ error: "AI returned empty response." });

    const cleaned = stripMarkdownFence(rawContent);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error:", rawContent);
      return res.status(502).json({ error: "Could not parse extracted data. Please try again." });
    }

    // Assemble response
    const result: Record<string, unknown> = {};

    // Shared
    if (typeof parsed.name === "string") result.name = parsed.name.trim();
    if (typeof parsed.description === "string") result.description = parsed.description.trim();
    if (Array.isArray(parsed.tags)) result.tags = parsed.tags.filter((t): t is string => typeof t === "string");
    if (typeof parsed.rarity === "string") {
      const r = parsed.rarity.trim();
      result.rarity = (r === "None" || r === "") ? "" : r.toLowerCase();
    }
    if (typeof parsed.attunement === "boolean") result.attunement = parsed.attunement;
    if (typeof parsed.attunement_by === "string") result.attunement_by = parsed.attunement_by.trim() || null;

    // Spell/Scroll
    if (typeof parsed.level === "string") {
      const lvl = parsed.level.trim().toLowerCase();
      result.level = lvl === "0" ? "cantrip" : lvl;
    }
    if (typeof parsed.school === "string") result.school = parsed.school.trim();
    if (typeof parsed.casting_time === "string") result.casting_time = parsed.casting_time.trim();
    if (typeof parsed.range === "string") result.range = parsed.range.trim();
    if (Array.isArray(parsed.components)) result.components = parsed.components.filter((c): c is string => typeof c === "string");
    if (typeof parsed.material === "string") result.material = parsed.material.trim();
    if (typeof parsed.duration === "string") result.duration = parsed.duration.trim();
    if (typeof parsed.concentration === "boolean") result.concentration = parsed.concentration;

    // Subclass
    if (typeof parsed.parent_class === "string") result.parent_class = parsed.parent_class.trim();
    if (Array.isArray(parsed.level_features)) result.level_features = parsed.level_features;

    // Monster/NPC stat block
    if (typeof parsed.size === "string") result.size = parsed.size.trim();
    if (typeof parsed.creature_type === "string") result.creature_type = parsed.creature_type.trim();
    if (typeof parsed.alignment === "string") result.alignment = parsed.alignment.trim();
    if (typeof parsed.cr === "string") result.cr = parsed.cr.trim();
    if (typeof parsed.ac === "string") result.ac = parsed.ac.trim();
    if (typeof parsed.hp === "string") result.hp = parsed.hp.trim();
    if (typeof parsed.speed === "string") result.speed = parsed.speed.trim();
    if (typeof parsed.ability_str === "number") result.ability_str = parsed.ability_str;
    if (typeof parsed.ability_dex === "number") result.ability_dex = parsed.ability_dex;
    if (typeof parsed.ability_con === "number") result.ability_con = parsed.ability_con;
    if (typeof parsed.ability_int === "number") result.ability_int = parsed.ability_int;
    if (typeof parsed.ability_wis === "number") result.ability_wis = parsed.ability_wis;
    if (typeof parsed.ability_cha === "number") result.ability_cha = parsed.ability_cha;
    if (typeof parsed.saving_throws === "string") result.saving_throws = parsed.saving_throws.trim();
    if (typeof parsed.skills === "string") result.skills = parsed.skills.trim();
    if (typeof parsed.damage_vulnerabilities === "string") result.damage_vulnerabilities = parsed.damage_vulnerabilities.trim();
    if (typeof parsed.damage_resistances === "string") result.damage_resistances = parsed.damage_resistances.trim();
    if (typeof parsed.damage_immunities === "string") result.damage_immunities = parsed.damage_immunities.trim();
    if (typeof parsed.condition_immunities === "string") result.condition_immunities = parsed.condition_immunities.trim();
    if (typeof parsed.senses === "string") result.senses = parsed.senses.trim();
    if (typeof parsed.languages === "string") result.languages = parsed.languages.trim();
    if (Array.isArray(parsed.traits)) result.traits = parsed.traits;
    if (Array.isArray(parsed.actions)) result.actions = parsed.actions;
    if (Array.isArray(parsed.bonus_actions)) result.bonus_actions = parsed.bonus_actions;
    if (Array.isArray(parsed.reactions)) result.reactions = parsed.reactions;
    if (typeof parsed.legendary_actions === "object" && parsed.legendary_actions !== null) result.legendary_actions = parsed.legendary_actions;

    // Artwork region (for client-side cropping of the entry image)
    if (
      typeof parsed.artwork === "object" && parsed.artwork !== null &&
      typeof (parsed.artwork as Record<string, unknown>).image_index === "number" &&
      Array.isArray((parsed.artwork as Record<string, unknown>).box)
    ) {
      const aw = parsed.artwork as { image_index: number; box: unknown[] };
      const box = aw.box.map(Number);
      const valid =
        box.length === 4 &&
        box.every((n) => Number.isFinite(n) && n >= 0 && n <= 1000) &&
        box[2]! > box[0]! && box[3]! > box[1]! &&
        aw.image_index >= 0 && aw.image_index < imageList.length;
      if (valid) result.artwork = { image_index: aw.image_index, box };
    }

    // Table
    if (typeof parsed.die_type === "string") result.die_type = parsed.die_type.trim();
    if (Array.isArray(parsed.columns)) result.columns = parsed.columns.filter((c): c is string => typeof c === "string");
    if (Array.isArray(parsed.rows)) result.rows = parsed.rows;

    return res.status(200).json(result);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
}