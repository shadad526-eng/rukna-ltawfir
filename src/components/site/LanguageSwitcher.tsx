import { useRouter } from "@tanstack/react-router";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";

function buildHref(pathname: string, search: string, next: Locale) {
  const replaced = pathname.replace(/^\/(ar|en)(\/|$)/, `/${next}$2`);
  const final = replaced === pathname ? `/${next}${pathname.startsWith("/") ? pathname : "/" + pathname}` : replaced;
  return final + (search ?? "");
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { lang } = useLocale();

  const onSelect = (next: Locale) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (next === lang) return;
    document.cookie = `${LOCALE_COOKIE}=${next};max-age=31536000;path=/;samesite=lax`;
    const loc = router.state.location;
    const href = buildHref(loc.pathname, loc.searchStr ?? "", next);
    // Full navigation ensures SSR re-renders <html lang dir> immediately.
    window.location.assign(href);
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-full border border-border/60 bg-card/60 px-0.5 py-0.5 text-[11px] font-bold tracking-wide backdrop-blur-sm ${className}`}
      dir="ltr"
    >
      {LOCALES.map((code) => {
        const active = code === lang;
        return (
          <a
            key={code}
            href="#"
            onClick={onSelect(code)}
            aria-current={active ? "true" : undefined}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              active
                ? "bg-trust-700 text-white shadow-sm"
                : "text-ink-500 hover:text-trust-700"
            }`}
          >
            {code === "ar" ? "AR" : "EN"}
          </a>
        );
      })}
    </div>
  );
}
