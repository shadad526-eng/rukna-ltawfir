import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { LOCALES, type Locale, isLocale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.lang)) throw notFound();
    return { lang: params.lang as Locale };
  },
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams();
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : "ar";
  const dir = locale === "en" ? "ltr" : "rtl";

  // Keep <html lang dir> in sync on the client after hydration. SSR value comes
  // from RootShell via the resolved match params.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    if (el.lang !== locale) el.lang = locale;
    if (el.dir !== dir) el.dir = dir;
  }, [locale, dir]);

  return (
    <LocaleProvider lang={locale}>
      <main>
        <Outlet />
      </main>
    </LocaleProvider>
  );
}
