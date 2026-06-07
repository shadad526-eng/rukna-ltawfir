export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";

export const LOCALE_META: Record<Locale, { label: string; dir: "rtl" | "ltr"; htmlLang: string }> = {
  ar: { label: "العربية", dir: "rtl", htmlLang: "ar" },
  en: { label: "English", dir: "ltr", htmlLang: "en" },
};

export const LOCALE_COOKIE = "lovable-lang";

export function isLocale(x: unknown): x is Locale {
  return typeof x === "string" && (LOCALES as readonly string[]).includes(x);
}

export function dirFor(locale: Locale) {
  return LOCALE_META[locale].dir;
}
