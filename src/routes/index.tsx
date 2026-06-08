import { createFileRoute, redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";

type LocaleHints = { cookie: string | null; accept: string | null };

const getLocaleHints = createIsomorphicFn()
  .client((): LocaleHints => ({
    cookie: typeof document !== "undefined" ? document.cookie : null,
    accept: typeof navigator !== "undefined" ? navigator.language : null,
  }))
  .server((): LocaleHints => {
    // Dynamic import keeps the server-only module out of the client bundle.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getRequest } = require("@tanstack/react-start/server") as typeof import("@tanstack/react-start/server");
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
  beforeLoad: () => {
    const { cookie, accept } = getLocaleHints();
    const lang = pickLocale(cookie, accept);
    throw redirect({ to: "/$lang", params: { lang }, replace: true });
  },
  component: () => null,
});
