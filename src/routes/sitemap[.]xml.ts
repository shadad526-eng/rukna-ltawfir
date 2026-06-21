import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listBrands, listBrandProducts } from "@/lib/site.functions";

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
          const brands = await listBrands();
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

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls.map((u) => `  <url><loc>${u}</loc></url>`),
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
