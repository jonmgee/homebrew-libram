/**
 * _auth.ts — shared guard for the AI endpoints.
 *
 * These functions spend real money on OpenRouter. Before this existed they
 * accepted anonymous POSTs from any origin, so anyone could drain the account
 * or embed the endpoint in their own site for free AI billed to us.
 *
 * Underscore prefix keeps Vercel from routing this as an endpoint itself.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Origins allowed to call these endpoints. Anything else gets no CORS headers. */
const ALLOWED_ORIGINS = [
  "https://homebrewlibram.com",
  "https://www.homebrewlibram.com",
  "https://homebrew-libram.vercel.app",
  "http://localhost:5173",
  "http://localhost:5192",
];

/**
 * Applies CORS for known origins only, and answers preflight.
 * Returns true if the request has been fully handled and the caller should stop.
 */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  if (req.method === "OPTIONS") {
    res.status(ALLOWED_ORIGINS.includes(origin) ? 204 : 403).end();
    return true;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return true;
  }

  return false;
}

/**
 * Requires a valid Supabase session. Returns the user id, or null once it has
 * already sent a 401 — callers should return immediately on null.
 *
 * Verifies against Supabase rather than trusting the token, so an expired or
 * forged JWT is rejected.
 */
export async function requireUser(
  req: VercelRequest,
  res: VercelResponse,
): Promise<string | null> {
  const header = req.headers.authorization;
  const token =
    typeof header === "string" && header.startsWith("Bearer ")
      ? header.slice(7).trim()
      : "";

  if (!token) {
    res.status(401).json({ error: "Please sign in to use this feature." });
    return null;
  }

  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Misconfiguration, not the caller's fault — do not imply their session is bad.
    console.error("[auth] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set");
    res.status(500).json({ error: "Server auth is not configured." });
    return null;
  }

  try {
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    });
    if (!r.ok) {
      res.status(401).json({ error: "Your session has expired. Sign in again." });
      return null;
    }
    const user = (await r.json()) as { id?: string };
    if (!user?.id) {
      res.status(401).json({ error: "Your session has expired. Sign in again." });
      return null;
    }
    return user.id;
  } catch (e) {
    console.error("[auth] verification failed:", e);
    res.status(503).json({ error: "Could not verify your session. Try again." });
    return null;
  }
}
