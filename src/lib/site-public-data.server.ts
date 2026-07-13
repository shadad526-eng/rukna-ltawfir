import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

let publicDataClient: SupabaseClient<Database> | undefined;

// Static property access lets Vite inline VITE_* values into the server bundle
// at build time. Dynamic access (`env[name]`) is NOT replaced and returns
// undefined at runtime on hosts (e.g. Vercel) that don't populate the .env
// file into `process.env` for server code.
const SUPABASE_URL_STATIC =
  import.meta.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY_STATIC =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;

function publicEnv(name: "SUPABASE_URL" | "SUPABASE_PUBLISHABLE_KEY") {
  const value = name === "SUPABASE_URL" ? SUPABASE_URL_STATIC : SUPABASE_PUBLISHABLE_KEY_STATIC;
  if (!value) throw new Error(`Missing public backend config: ${name}`);
  return value;
}

export function getPublicDataClient() {
  if (!publicDataClient) {
    publicDataClient = createClient<Database>(
      publicEnv("SUPABASE_URL"),
      publicEnv("SUPABASE_PUBLISHABLE_KEY"),
      {
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }
  return publicDataClient;
}

export async function signedUrl(bucket: string, path: string | null | undefined, ttl = 3600) {
  if (!path) return null;
  const { data } = await getPublicDataClient().storage.from(bucket).createSignedUrl(path, ttl);
  return data?.signedUrl ?? null;
}

export async function assetUrl(assetId: string | null | undefined) {
  if (!assetId) return null;
  const { data } = await getPublicDataClient()
    .from("assets")
    .select("storage_bucket, storage_path")
    .eq("id", assetId)
    .maybeSingle();
  if (!data) return null;
  return signedUrl(data.storage_bucket, data.storage_path);
}

export function paragraphs(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((p) => (typeof p === "string" ? p : typeof p === "object" && p && "text" in p ? String((p as { text: unknown }).text) : ""))
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}