import { createContext, useContext, useMemo, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALE_META, type Locale } from "./config";
import arDict from "./locales/ar.json";
import enDict from "./locales/en.json";

type Dict = typeof arDict;

const DICTS: Record<Locale, Dict> = { ar: arDict, en: enDict as Dict };

type LocaleCtx = {
  lang: Locale;
  dir: "rtl" | "ltr";
  t: (path: string, vars?: Record<string, string | number>) => string;
};

const Ctx = createContext<LocaleCtx | null>(null);

function lookup(dict: Dict, path: string): string {
  const parts = path.split(".");
  let cur: any = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return path;
  }
  return typeof cur === "string" ? cur : path;
}

function interp(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function LocaleProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  const value = useMemo<LocaleCtx>(() => {
    const dict = DICTS[lang] ?? DICTS[DEFAULT_LOCALE];
    return {
      lang,
      dir: LOCALE_META[lang].dir,
      t: (path, vars) => interp(lookup(dict, path), vars),
    };
  }, [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const v = useContext(Ctx);
  if (!v) return { lang: DEFAULT_LOCALE, dir: "rtl" as const, t: (s: string) => s };
  return v;
}

export function useT() {
  return useLocale().t;
}
