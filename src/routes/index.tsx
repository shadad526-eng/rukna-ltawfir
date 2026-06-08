import { createFileRoute, redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";

type LocaleHints = { cookie: string | null; accept: string | null };

// createIsomorphicFn strips the .server() callback (and its imports) from the
// client bundle, so the dynamic server-only import never reaches the browser.
const getLocaleHints = createIsomorphicFn()
  .client(async (): Promise<LocaleHints> => ({
    cookie: typeof document !== "undefined" ? document.cookie : null,
    accept: typeof navigator !== "undefined" ? navigator.language : null,
  }))
  .server(async (): Promise<LocaleHints> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest?.();
    return {
      cookie: req?.headers.get("cookie") ?? null,
      accept: req?.headers.get("accept-language") ?? null,
    };
  });

function pickLocale(cookieHeader: string | null, acceptLang: string | null): Locale {
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
    const { cookie, accept } = await getLocaleHints();
    const lang = pickLocale(cookie, accept);
    throw redirect({ to: "/$lang", params: { lang }, replace: true });
  },
  component: () => null,
});
