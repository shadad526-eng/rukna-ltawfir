import { createFileRoute } from "@tanstack/react-router";

/**
 * Public delivery for article inline images.
 *
 * The `article-inline` bucket is private and its objects are deliberately not
 * registered in the Media Library. This route resolves a stable, never-expiring
 * public URL to a short-lived signed storage URL.
 */
export const Route = createFileRoute("/api/public/article-media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params as any)._splat ?? "";
        const path = decodeURIComponent(String(raw));
        if (!path || path.includes("..") || path.startsWith("/")) {
          return new Response("Not found", { status: 404 });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.storage
            .from("article-inline")
            .createSignedUrl(path, 3600);
          if (error || !data?.signedUrl) return new Response("Not found", { status: 404 });
          return new Response(null, {
            status: 302,
            headers: {
              location: data.signedUrl,
              "cache-control": "public, max-age=600",
            },
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      },
    },
  },
});
