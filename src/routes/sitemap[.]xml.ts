import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listBrands, listBrandProducts, listInsights } from "@/lib/site.functions";

const BASE_URL = "https://ruknaltawfer.com";
const LOCALES = ["ar", "en"] as const;
const STATIC_PATHS = ["", "/about", "/brands", "/catalogs", "/partners", "/contact", "/sugar-alternatives", "/oral-care", "/baby-care", "/immunity-vitamin-c"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls: string[] = [];
        for (const lang of LOCALES) {
          for (const p of STATIC_PATHS) {
            urls.push(`${BASE_URL}/${lang}${p}`);
          }
        }
        try {
          const [brands, insights] = await Promise.all([listBrands(), listInsights()]);
          for (const lang of LOCALES) {
            for (const n of insights) {
              urls.push(`${BASE_URL}/${lang}/news/${n.slug}`);
            }
          }
          for (const lang of LOCALES) {
            for (const b of brands) {
              urls.push(`${BASE_URL}/${lang}/brands/${b.slug}`);
            }
          }
          const productLists = await Promise.all(
            brands.map((b) => listBrandProducts({ data: { brandSlug: b.slug } }).catch(() => [])),
          );
          for (const lang of LOCALES) {
            brands.forEach((b, i) => {
              for (const p of productLists[i] ?? []) {
                urls.push(`${BASE_URL}/${lang}/brands/${b.slug}/${p.slug}`);
              }
            });
          }
        } catch {
          // ignore — fall back to static paths
        }

        // Encode each URL so non-ASCII slugs (Arabic titles, spaces, "?", etc.)
        // become valid absolute URLs; also drop any entry that somehow contains
        // an embedded scheme after the origin (e.g. ".../https://...") so we
        // never republish the invalid paths that once leaked into Search Console.
        const encodeLoc = (u: string): string | null => {
          try {
            const parsed = new URL(u);
            if (/\/https?:\//i.test(parsed.pathname)) return null;
            const encodedPath = parsed.pathname
              .split("/")
              .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
              .join("/");
            return `${parsed.origin}${encodedPath}`
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
          } catch {
            return null;
          }
        };
        const cleanUrls = urls
          .map(encodeLoc)
          .filter((u): u is string => !!u);
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...cleanUrls.map((u) => `  <url><loc>${u}</loc></url>`),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
