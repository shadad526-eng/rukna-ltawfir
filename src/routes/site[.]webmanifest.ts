import { createFileRoute } from "@tanstack/react-router";

const manifest = {
  name: "ركن التوفير كوزمتك للتجارة",
  short_name: "ركن التوفير",
  lang: "ar",
  dir: "rtl",
  start_url: "/",
  scope: "/",
  display: "standalone",
  theme_color: "#ffffff",
  background_color: "#ffffff",
  icons: [
    { src: "/icon-16.png", sizes: "16x16", type: "image/png", purpose: "any" },
    { src: "/icon-32.png", sizes: "32x32", type: "image/png", purpose: "any" },
    { src: "/icon-48.png", sizes: "48x48", type: "image/png", purpose: "any" },
    { src: "/icon-180.png", sizes: "180x180", type: "image/png", purpose: "any" },
    { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  ],
};

export const Route = createFileRoute("/site.webmanifest")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(manifest, null, 2), {
          headers: {
            "Content-Type": "application/manifest+json; charset=utf-8",
            "Cache-Control": "public, max-age=3600, must-revalidate",
          },
        }),
    },
  },
});