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

const PUBLIC_MEDIA_BUCKETS = new Set(["brand-assets"]);
const DEFAULT_QUERY_TIMEOUT_MS = 2_500;

function publicObjectUrl(bucket: string, path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const encodedPath = path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${publicEnv("SUPABASE_URL")}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

function timeoutSignal(ms = DEFAULT_QUERY_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

function resolveAssetRow(row: { storage_bucket: string | null; storage_path: string | null; public_url?: string | null }) {
  if (row.public_url && /^https?:\/\//i.test(row.public_url)) return row.public_url;
  if (row.storage_bucket && PUBLIC_MEDIA_BUCKETS.has(row.storage_bucket)) {
    return publicObjectUrl(row.storage_bucket, row.storage_path);
  }
  return null;
}

export async function signedUrl(bucket: string, path: string | null | undefined, ttl = 3600) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (PUBLIC_MEDIA_BUCKETS.has(bucket)) return publicObjectUrl(bucket, path);
  const timer = timeoutSignal(1_500);
  try {
    const { data } = await getPublicDataClient().storage.from(bucket).createSignedUrl(path, ttl, {
      signal: timer.signal,
    } as never);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  } finally {
    timer.clear();
  }
}

/**
 * Central media URL resolver. Supports both legacy records (storage_bucket +
 * storage_path only) and new records that carry a permanent public_url.
 * Never persists the resolved URL — signed URLs are created at read time.
 */
export async function resolveMediaUrl(assetId: string | null | undefined) {
  if (!assetId) return null;
  const timer = timeoutSignal();
  try {
    const { data } = await getPublicDataClient()
    .from("assets")
    .select("storage_bucket, storage_path, public_url")
    .eq("id", assetId)
    .abortSignal(timer.signal)
    .maybeSingle();
    if (!data) return null;
    return resolveAssetRow(data as { storage_bucket: string | null; storage_path: string | null; public_url?: string | null });
  } catch {
    return null;
  } finally {
    timer.clear();
  }
}

export async function resolveMediaUrls(assetIds: Array<string | null | undefined>) {
  const ids = Array.from(new Set(assetIds.filter((id): id is string => typeof id === "string" && id.length > 0)));
  const urls = new Map<string, string | null>();
  ids.forEach((id) => urls.set(id, null));
  if (ids.length === 0) return urls;
  const timer = timeoutSignal();
  try {
    const { data } = await getPublicDataClient()
      .from("assets")
      .select("id, storage_bucket, storage_path, public_url")
      .in("id", ids)
      .abortSignal(timer.signal);
    for (const row of (data ?? []) as Array<{ id: string; storage_bucket: string | null; storage_path: string | null; public_url?: string | null }>) {
      urls.set(row.id, resolveAssetRow(row));
    }
  } catch {
    // Keep SSR resilient: missing media is preferable to a 500/timeout.
  } finally {
    timer.clear();
  }
  return urls;
}

// Back-compat alias used across the site data layer.
export const assetUrl = resolveMediaUrl;


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