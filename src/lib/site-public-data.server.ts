import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import type { InsightDetail } from "./site.functions";

let publicDataClient: SupabaseClient<Database> | undefined;

function publicEnv(name: "SUPABASE_URL" | "SUPABASE_PUBLISHABLE_KEY", viteName: "VITE_SUPABASE_URL" | "VITE_SUPABASE_PUBLISHABLE_KEY") {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const value = process.env[name] ?? viteEnv?.[viteName];
  if (!value) throw new Error(`Missing public backend config: ${name}`);
  return value;
}

export function getPublicDataClient() {
  if (!publicDataClient) {
    publicDataClient = createClient<Database>(
      publicEnv("SUPABASE_URL", "VITE_SUPABASE_URL"),
      publicEnv("SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"),
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

export async function staticInsights(): Promise<InsightDetail[]> {
  const { NEWS } = await import("@/data/news");
  return NEWS.map((n) => ({
    slug: n.slug,
    title_ar: n.title.ar,
    title_en: n.title.en,
    excerpt_ar: n.excerpt.ar,
    excerpt_en: n.excerpt.en,
    cover_url: n.cover,
    published_at: n.date,
    tags: [n.eyebrow.ar, n.eyebrow.en].filter(Boolean),
    source: "static" as const,
    body_ar: n.body.ar,
    body_en: n.body.en,
  }));
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