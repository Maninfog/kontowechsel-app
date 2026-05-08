import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/** Trim and strip accidental wrapping quotes from env UI copy-paste. */
function normalizeEnvString(raw: unknown): string {
  if (typeof raw !== "string") return "";
  let v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

/**
 * Supabase `createClient` expects the project root URL only, e.g.
 * `https://xyzcompany.supabase.co` — not `/rest/v1/...`.
 */
export function normalizeSupabaseProjectUrl(raw: unknown): string {
  let url = normalizeEnvString(raw);
  if (!url) return "";
  const lower = url.toLowerCase();
  const restIdx = lower.indexOf("/rest/v1");
  if (restIdx !== -1) {
    url = url.slice(0, restIdx);
  }
  url = url.replace(/\/+$/, "");
  return url;
}

function isValidHttpUrl(s: string): boolean {
  if (!/^https?:\/\//i.test(s)) return false;
  try {
    const u = new URL(s);
    return Boolean(u.hostname);
  } catch {
    return false;
  }
}

/**
 * Lazy Supabase client so routes can SSR without env (e.g. Vercel preview
 * missing VITE_*). Call from the browser when submitting, not at module load.
 */
export function getSupabase(): SupabaseClient {
  const supabaseUrl = normalizeSupabaseProjectUrl(import.meta.env.VITE_SUPABASE_URL);
  const supabaseAnonKey = normalizeEnvString(import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them in .env.local (local) or Vercel → Settings → Environment Variables.",
    );
  }
  if (!isValidHttpUrl(supabaseUrl)) {
    throw new Error(
      `VITE_SUPABASE_URL is not a valid http(s) URL after cleanup (value starts with: "${supabaseUrl.slice(0, 24)}…").`,
    );
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  const url = normalizeSupabaseProjectUrl(import.meta.env.VITE_SUPABASE_URL);
  const key = normalizeEnvString(import.meta.env.VITE_SUPABASE_ANON_KEY);
  return Boolean(url && key && isValidHttpUrl(url));
}
