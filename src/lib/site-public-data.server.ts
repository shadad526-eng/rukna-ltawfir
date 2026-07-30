import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { toRichHtml } from "./rich-html";

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

/* ------------------------------------------------------------------ *
 * Resilience helpers
 *
 * Pages resolve dozens of media URLs per render. Issuing one asset row
 * lookup + one storage signed-URL call per media item (N+1) saturates the
 * backend and makes SSR hang, which surfaces as a 500. The helpers below
 * keep the exact same public API (`assetUrl` / `signedUrl`) while:
 *   - coalescing calls made in the same tick into ONE batched request,
 *   - caching results in-process with a TTL,
 *   - de-duplicating concurrent identical lookups,
 *   - enforcing a hard timeout so a slow backend degrades to a missing
 *     image instead of a hanging request.
 * ------------------------------------------------------------------ */

const LOOKUP_TIMEOUT_MS = 8_000;
const SIGNED_URL_TTL_SECONDS = 3600;
// Re-sign well before expiry so cached URLs are never handed out stale.
const SIGNED_URL_CACHE_MS = (SIGNED_URL_TTL_SECONDS - 600) * 1000;
const ASSET_META_CACHE_MS = 5 * 60 * 1000;
const NEGATIVE_CACHE_MS = 30 * 1000;

type AssetMeta = { storage_bucket: string; storage_path: string } | null;

type CacheEntry<T> = { value: T; expiresAt: number };

const assetMetaCache = new Map<string, CacheEntry<AssetMeta>>();
const signedUrlCache = new Map<string, CacheEntry<string | null>>();

function readCache<T>(cache: Map<string, CacheEntry<T>>, key: string): { hit: boolean; value?: T } {
  const entry = cache.get(key);
  if (!entry) return { hit: false };
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return { hit: false };
  }
  return { hit: true, value: entry.value };
}

function writeCache<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

async function withTimeout<T>(work: Promise<T>, fallback: T, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.error(`[site-public-data] timeout after ${LOOKUP_TIMEOUT_MS}ms: ${label}`);
      resolve(fallback);
    }, LOOKUP_TIMEOUT_MS);
  });
  try {
    return await Promise.race([
      work.catch((error) => {
        console.error(`[site-public-data] failed: ${label}`, error);
        return fallback;
      }),
      guard,
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/* ---------------- batched asset metadata resolution ---------------- */

type PendingAsset = {
  resolve: (meta: AssetMeta) => void;
};

let assetBatch: Map<string, PendingAsset[]> | undefined;

function flushAssetBatch(batch: Map<string, PendingAsset[]>) {
  const ids = [...batch.keys()];
  const work = (async (): Promise<Map<string, AssetMeta>> => {
    const { data, error } = await getPublicDataClient()
      .from("assets")
      .select("id, storage_bucket, storage_path")
      .in("id", ids);
    if (error) throw error;
    const map = new Map<string, AssetMeta>();
    for (const row of (data ?? []) as Array<{
      id: string;
      storage_bucket: string;
      storage_path: string;
    }>) {
      map.set(row.id, { storage_bucket: row.storage_bucket, storage_path: row.storage_path });
    }
    return map;
  })();

  void withTimeout(work, new Map<string, AssetMeta>(), `assets lookup (${ids.length})`).then(
    (map) => {
      for (const [id, waiters] of batch) {
        const meta = map.get(id) ?? null;
        writeCache(assetMetaCache, id, meta, meta ? ASSET_META_CACHE_MS : NEGATIVE_CACHE_MS);
        for (const waiter of waiters) waiter.resolve(meta);
      }
    },
  );
}

function loadAssetMeta(assetId: string): Promise<AssetMeta> {
  const cached = readCache(assetMetaCache, assetId);
  if (cached.hit) return Promise.resolve(cached.value as AssetMeta);

  return new Promise<AssetMeta>((resolve) => {
    if (!assetBatch) {
      assetBatch = new Map();
      const batch = assetBatch;
      queueMicrotask(() => {
        assetBatch = undefined;
        flushAssetBatch(batch);
      });
    }
    const waiters = assetBatch.get(assetId);
    if (waiters) waiters.push({ resolve });
    else assetBatch.set(assetId, [{ resolve }]);
  });
}

/* ---------------- batched signed URL resolution ---------------- */

type PendingSigned = { resolve: (url: string | null) => void };

let signedBatch: Map<string, Map<string, PendingSigned[]>> | undefined;

function flushSignedBatch(batch: Map<string, Map<string, PendingSigned[]>>) {
  for (const [bucket, byPath] of batch) {
    const paths = [...byPath.keys()];
    const work = (async (): Promise<Map<string, string | null>> => {
      const map = new Map<string, string | null>();
      const { data, error } = await getPublicDataClient()
        .storage.from(bucket)
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
      if (error) throw error;
      for (const item of data ?? []) {
        if (item.path) map.set(item.path, item.signedUrl ?? null);
      }
      return map;
    })();

    void withTimeout(
      work,
      new Map<string, string | null>(),
      `signed urls ${bucket} (${paths.length})`,
    ).then((map) => {
      for (const [path, waiters] of byPath) {
        const url = map.get(path) ?? null;
        writeCache(
          signedUrlCache,
          `${bucket}::${path}`,
          url,
          url ? SIGNED_URL_CACHE_MS : NEGATIVE_CACHE_MS,
        );
        for (const waiter of waiters) waiter.resolve(url);
      }
    });
  }
}

export async function signedUrl(
  bucket: string,
  path: string | null | undefined,
  _ttl = SIGNED_URL_TTL_SECONDS,
): Promise<string | null> {
  if (!path) return null;
  const key = `${bucket}::${path}`;
  const cached = readCache(signedUrlCache, key);
  if (cached.hit) return cached.value ?? null;

  return new Promise<string | null>((resolve) => {
    if (!signedBatch) {
      signedBatch = new Map();
      const batch = signedBatch;
      queueMicrotask(() => {
        signedBatch = undefined;
        flushSignedBatch(batch);
      });
    }
    let byPath = signedBatch.get(bucket);
    if (!byPath) {
      byPath = new Map();
      signedBatch.set(bucket, byPath);
    }
    const waiters = byPath.get(path);
    if (waiters) waiters.push({ resolve });
    else byPath.set(path, [{ resolve }]);
  });
}

export async function assetUrl(assetId: string | null | undefined): Promise<string | null> {
  if (!assetId) return null;
  const meta = await loadAssetMeta(assetId);
  if (!meta) return null;
  return signedUrl(meta.storage_bucket, meta.storage_path);
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

/**
 * Inline article images are stored with `data-asset-id` so their (expiring)
 * signed URLs can be refreshed on every render.
 */
export async function richBodyHtml(input: unknown): Promise<string> {
  const html = toRichHtml(input);
  if (!html.includes("data-asset-id")) return html;
  const ids = Array.from(new Set(
    Array.from(html.matchAll(/data-asset-id="([^"]+)"/g)).map((m) => m[1]),
  ));
  const urls = await Promise.all(ids.map((id) => assetUrl(id)));
  const map = new Map(ids.map((id, i) => [id, urls[i]]));
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const idMatch = tag.match(/data-asset-id="([^"]+)"/);
    if (!idMatch) return tag;
    const url = map.get(idMatch[1]);
    if (!url) return tag;
    return tag.match(/\bsrc="[^"]*"/)
      ? tag.replace(/\bsrc="[^"]*"/, `src="${url.replace(/"/g, "&quot;")}"`)
      : tag.replace(/^<img\b/i, `<img src="${url.replace(/"/g, "&quot;")}"`);
  });
}

