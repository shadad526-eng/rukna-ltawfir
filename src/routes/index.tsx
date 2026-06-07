import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, type Locale } from "@/i18n/config";

function pickLocale(cookieHeader: string | null | undefined, acceptLang: string | null | undefined): Locale {
  if (cookieHeader) {
    const m = cookieHeader.match(/(?:^|; )lovable-lang=(ar|en)/);
    if (m && (LOCALES as readonly string[]).includes(m[1])) return m[1] as Locale;
  }
  if (acceptLang) {
    const first = acceptLang.split(",")[0]?.trim().toLowerCase() ?? "";
    if (first.startsWith("en")) return "en";
    if (first.startsWith("ar")) return "ar";
  }
  return DEFAULT_LOCALE;
}

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    let cookie: string | null = null;
    let accept: string | null = null;
    if (typeof document !== "undefined") {
      cookie = document.cookie || null;
      accept = navigator?.language ?? null;
    } else {
      try {
        const mod = await import("@tanstack/react-start/server");
        const req = mod.getRequest?.();
        if (req) {
          cookie = req.headers.get("cookie");
          accept = req.headers.get("accept-language");
        }
      } catch {
        // best-effort; fall back to default
      }
    }
    const lang = pickLocale(cookie, accept);
    throw redirect({ to: "/$lang", params: { lang }, replace: true });
  },
  // Should never render — beforeLoad throws redirect.
  component: () => null,
});

// Silence unused import lint
void LOCALE_COOKIE;
