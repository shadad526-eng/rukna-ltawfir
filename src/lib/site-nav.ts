import { useQuery } from "@tanstack/react-query";

import { listNavigation } from "@/lib/site.functions";
import { useLocale } from "@/i18n/LocaleProvider";

export type SiteNavItem = {
  key: string;
  label: string;
  /** Ready-to-use href (locale prefixed for internal links). */
  to: string;
  exact?: boolean;
  hasMega?: boolean;
  external?: boolean;
  newTab?: boolean;
};

function normalizeInternal(url: string, lang: string) {
  let path = url.trim();
  if (!path.startsWith("/")) path = `/${path}`;
  // Tolerate admins pasting an already localized path (/ar/about).
  path = path.replace(/^\/(ar|en)(?=\/|$)/, "");
  if (!path.startsWith("/")) path = `/${path}`;
  return `/${lang}${path === "/" ? "/" : path}`;
}

/**
 * Navigation is managed in Admin → قوائم التنقل. When no rows exist for a
 * location the site keeps its built-in menu, so the public site never renders
 * an empty navigation bar.
 */
export function useSiteNav(location: "header" | "footer", fallback: SiteNavItem[]): SiteNavItem[] {
  const { lang } = useLocale();
  const { data } = useQuery({
    queryKey: ["navigation"],
    queryFn: () => listNavigation(),
    staleTime: 60_000,
  });

  const rows = (data ?? []).filter((r) => r.location === location);
  if (rows.length === 0) return fallback;

  return rows.map((r) => {
    const external = /^https?:\/\//i.test(r.url) || r.url.startsWith("mailto:") || r.url.startsWith("tel:");
    const to = external ? r.url : normalizeInternal(r.url, lang);
    return {
      key: r.id,
      label: (lang === "ar" ? r.label_ar : r.label_en || r.label_ar) ?? "",
      to,
      external,
      newTab: r.open_in_new_tab,
      exact: !external && to === `/${lang}/`,
      hasMega: !external && /\/brands\/?$/.test(to),
    };
  });
}
