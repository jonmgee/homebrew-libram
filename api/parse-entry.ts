import type { VercelRequest, VercelResponse } from "@vercel/node";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const EXTRACTION_PROMPT = `Extract the following fields from the content below and return a JSON object only — no preamble, no explanation, no markdown code fences, just raw JSON.

{
 "name": "string",
 "rarity": one of "None", "Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact",
 "attunement": boolean,
 "attunement_by": "string or null",
 "description": "string",
 "tags": ["array of strings"]
}

If a field cannot be determined, use null (or false for attunement, or "None" for rarity). For rarity, match to the closest allowed value. For attunement, look for phrases like "requires attunement". Infer tags from the content. Return only valid JSON.

Content:
`;

function stripMarkdownFence(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/gm, "").replace(/```\s*$/gm, "").trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for Vite dev server
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, image, entryType } = req.body;

    if (!text && !image) {
      return res.status(400).json({ error: "No content provided. Send either 'text' or 'image'." });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY not configured" });
    }

    // Build messages array
    const messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }> = [];

    if (image) {
      // Vision: send image + prompt together
      messages.push({
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_PROMPT },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${image}`,
              detail: "high",
            },
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: EXTRACTION_PROMPT + text,
      });
    }

    const body = {
      model: "google/gemini-3.1-flash-lite",
      messages,
      temperature: 0.1,
      max_tokens: 2048,
    };

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://homebrew-libram.vercel.app",
        "X-Title": "Homebrew Libram",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenRouter error:", response.status, errBody);
      return res.status(502).json({
        error: `AI service returned ${response.status}. Please try again or enter manually.`,
      });
    }

    const data = await response.json();
    const rawContent: string = data.choices?.[0]?.message?.content ?? "";

    if (!rawContent) {
      return res.status(502).json({
        error: "AI service returned an empty response. Please try again.",
      });
    }

    // Parse — strip fences first as safety measure
    const cleaned = stripMarkdownFence(rawContent);
    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error. Raw content:", rawContent);
      return res.status(502).json({
        error: "Could not parse the extracted data. Please try again or enter manually.",
      });
    }

    // Validate + normalise expected fields
    const result: Record<string, unknown> = {
      name: typeof parsed.name === "string" ? parsed.name.trim() : null,
      rarity: typeof parsed.rarity === "string" ? parsed.rarity.trim() : "None",
      attunement: typeof parsed.attunement === "boolean" ? parsed.attunement : false,
      attunement_by: typeof parsed.attunement_by === "string" ? parsed.attunement_by.trim() || null : null,
      description: typeof parsed.description === "string" ? parsed.description.trim() : null,
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter((t): t is string => typeof t === "string") : [],
    };

    // Map "None" rarity -> "" for our form's dropdown
    if (result.rarity === "None") result.rarity = "";
    // Lowercase rarity to match our dropdown values
    if (typeof result.rarity === "string" && result.rarity) {
      result.rarity = result.rarity.toLowerCase();
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({
      error: "Something went wrong processing your request. Please try again.",
    });
  }
}