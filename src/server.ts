import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Lovable-hosted asset CDN fallback. On Lovable, edge infra serves
// `/__l5e/assets-v1/*` before requests reach the worker. On other hosts
// (e.g. Vercel), the request lands here, so we redirect to the canonical
// Lovable-served origin where the CDN objects live.
const LOVABLE_ASSET_ORIGIN = "https://ruknaltawfer.com";

function maybeRedirectLovableAsset(request: Request): Response | undefined {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/__l5e/")) return undefined;
  const target = `${LOVABLE_ASSET_ORIGIN}${url.pathname}${url.search}`;
  return Response.redirect(target, 302);
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const assetRedirect = maybeRedirectLovableAsset(request);
      if (assetRedirect) return assetRedirect;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
