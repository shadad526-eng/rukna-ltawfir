/**
 * Managed homepage sections (everything after the Hero / Main Slider).
 *
 * Content lives in `public.homepage_sections`, one row per `section_key`.
 * When a row is missing or a field is empty, the site falls back to the
 * defaults below — which are byte-identical to the copy that used to be
 * hardcoded, so an empty table renders exactly the current production page.
 */

export type SectionItem = {
  icon?: string;
  title_ar?: string;
  title_en?: string;
  desc_ar?: string;
  desc_en?: string;
};

export type SectionExtra = {
  eyebrow_ar?: string;
  eyebrow_en?: string;
  cta_label_en?: string;
  cta2_label_ar?: string;
  cta2_label_en?: string;
  cta2_url?: string;
  wa_message_ar?: string;
  wa_message_en?: string;
  badge_ar?: string;
  badge_en?: string;
  title2_ar?: string;
  title2_en?: string;
  items?: SectionItem[];
};

export type HomepageSectionRow = {
  section_key: string;
  title_ar: string | null;
  title_en: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  body_ar: string | null;
  body_en: string | null;
  cta_label_ar: string | null;
  cta_url: string | null;
  sort_order: number;
  is_enabled: boolean;
  extra: SectionExtra;
};

export type HomepageSectionsMap = Record<string, HomepageSectionRow>;

export type SectionDefault = Omit<HomepageSectionRow, "section_key"> & { label: string };

/** Render/ordering units. `promos` covers the catalogs + partnerships pair. */
export const SECTION_ORDER_UNITS = [
  "features",
  "why",
  "ecosystem",
  "featured",
  "knowledge",
  "promos",
  "contact",
] as const;
export type SectionOrderUnit = (typeof SECTION_ORDER_UNITS)[number];

/** The row whose sort_order drives each render unit. */
export const UNIT_ORDER_SOURCE: Record<SectionOrderUnit, string> = {
  features: "features",
  why: "why",
  ecosystem: "ecosystem",
  featured: "featured",
  knowledge: "knowledge",
  promos: "catalogs",
  contact: "contact",
};

function row(v: Partial<SectionDefault> & { label: string }): SectionDefault {
  return {
    label: v.label,
    title_ar: v.title_ar ?? null,
    title_en: v.title_en ?? null,
    subtitle_ar: v.subtitle_ar ?? null,
    subtitle_en: v.subtitle_en ?? null,
    body_ar: v.body_ar ?? null,
    body_en: v.body_en ?? null,
    cta_label_ar: v.cta_label_ar ?? null,
    cta_url: v.cta_url ?? null,
    sort_order: v.sort_order ?? 0,
    is_enabled: v.is_enabled ?? true,
    extra: v.extra ?? {},
  };
}

export const SECTION_DEFAULTS: Record<string, SectionDefault> = {
  fallback_hero: row({
    label: "الهيرو الاحتياطي (عند تعطيل الهيرو المُدار)",
    sort_order: 0,
    title_ar: "نبني حياة أكثر صحة...",
    title_en: "Building a healthier life...",
    subtitle_ar: "ونصنع مستقبلاً أقوى",
    subtitle_en: "and a stronger future",
    body_ar: "الشريك الاستراتيجي والبوابة الأولى للعلامات التجارية الصحية في اليمن.",
    body_en: "The strategic partner and primary gateway for trusted health brands in Yemen.",
    cta_label_ar: "استكشف المنتجات",
    cta_url: "/brands",
    extra: {
      badge_ar: "منظومة علامات عالمية في مظلّة واحدة",
      badge_en: "A global brand ecosystem under one umbrella",
      cta_label_en: "Explore products",
      cta2_label_ar: "تواصل معنا",
      cta2_label_en: "Contact us",
    },
  }),
  features: row({
    label: "شريط المزايا",
    sort_order: 10,
    extra: {
      items: [
        { icon: "shield", title_ar: "وكالات حصرية", title_en: "Exclusive agencies", desc_ar: "لأكبر العلامات العالمية", desc_en: "for the world's leading brands" },
        { icon: "award", title_ar: "جودة عالية", title_en: "High quality", desc_ar: "معايير عالمية ومنتجات موثوقة", desc_en: "Global standards and trusted products" },
        { icon: "truck", title_ar: "توزيع وطني", title_en: "Nationwide distribution", desc_ar: "شبكة تغطي جميع المحافظات", desc_en: "Network covering every governorate" },
        { icon: "support", title_ar: "خدمة عملاء متميزة", title_en: "Outstanding customer service", desc_ar: "دعم سريع واحترافي", desc_en: "Fast and professional support" },
      ],
    },
  }),
  why: row({
    label: "لماذا ركن التوفير",
    sort_order: 20,
    title_ar: "مرجعية مؤسسية تحمي العلامة والعميل والشريك",
    title_en: "An institutional reference protecting the brand, the customer, and the partner",
    body_ar: "ستة محاور تشكّل الحوكمة التي نلتزم بها مع كل علامة وكل شريك تجاري.",
    body_en: "Six pillars define the governance we uphold with every brand and every business partner.",
    extra: {
      eyebrow_ar: "لماذا ركن التوفير",
      eyebrow_en: "Why Rukn Al-Tawfir",
      items: [
        { icon: "◆", title_ar: "وكالات حصرية", title_en: "Exclusive agencies", desc_ar: "تمثيل رسمي لعلامات دولية مختارة داخل السوق اليمنية.", desc_en: "Official representation of select international brands within the Yemeni market." },
        { icon: "✦", title_ar: "منتجات أصلية", title_en: "Authentic products", desc_ar: "أصول رسمية وعبوات معتمدة، دون أي إعادة تصميم.", desc_en: "Official assets and certified packaging, with no redesign." },
        { icon: "✺", title_ar: "جودة عالمية", title_en: "Global quality", desc_ar: "معايير تصنيع وتعبئة موثّقة من الشركات الأم.", desc_en: "Manufacturing and packaging standards documented by parent companies." },
        { icon: "✪", title_ar: "توزيع وطني", title_en: "Nationwide distribution", desc_ar: "شبكة شركاء معتمدين تغطّي جميع المحافظات.", desc_en: "A network of accredited partners covering every governorate." },
        { icon: "❖", title_ar: "شراكات قوية", title_en: "Strong partnerships", desc_ar: "اتفاقيات طويلة الأمد مع موزعين وصيدليات ومحلات.", desc_en: "Long-term agreements with distributors, pharmacies, and retailers." },
        { icon: "✧", title_ar: "دعم احترافي", title_en: "Professional support", desc_ar: "إسناد تقني وتجاري متواصل عبر واتساب الأعمال.", desc_en: "Continuous technical and commercial support via WhatsApp Business." },
      ],
    },
  }),
  ecosystem: row({
    label: "منظومة العلامات",
    sort_order: 30,
    title_ar: "منظومة علامات عالمية في مظلّة واحدة",
    title_en: "A global brand ecosystem under one umbrella",
    body_ar: "علامات تجارية عالمية موثوقة، تُدار ضمن منظومة احترافية واحدة تجمع بين الجودة والحوكمة والشراكات الاستراتيجية، مع الحفاظ على الهوية المستقلة لكل علامة.",
    body_en: "Trusted international brands managed within a single professional ecosystem that combines quality, governance, and strategic partnerships — while preserving each brand's independent identity.",
    cta_label_ar: "دليل العلامات الكامل ←",
    cta_url: "/brands",
    extra: {
      eyebrow_ar: "العلامات الدولية الحصرية",
      eyebrow_en: "Exclusive international brands",
      cta_label_en: "Full brand directory →",
    },
  }),
  featured: row({
    label: "منتجات مختارة",
    sort_order: 40,
    title_ar: "لمحة من منتجات المنظومة",
    title_en: "A glimpse of the ecosystem",
    cta_label_ar: "استعراض جميع العلامات ←",
    cta_url: "/brands",
    extra: {
      eyebrow_ar: "منتجات مختارة",
      eyebrow_en: "Selected products",
      cta_label_en: "Browse all brands →",
    },
  }),
  knowledge: row({
    label: "المركز المعرفي (المقالات)",
    sort_order: 50,
    title_ar: "مقالات ودلائل من خبراء المنظومة",
    title_en: "Articles and guides from our experts",
    cta_label_ar: "عرض كل المقالات والأخبار ←",
    cta_url: "/news",
    extra: {
      eyebrow_ar: "المركز المعرفي",
      eyebrow_en: "Knowledge center",
      cta_label_en: "View all news & articles →",
    },
  }),
  catalogs: row({
    label: "بطاقة الكتالوجات",
    sort_order: 60,
    title_ar: "تصفّح مكتبة الكتالوجات",
    title_en: "Browse the catalog library",
    body_ar: "كتالوجات رسمية لكل علامة، مع ملفات قابلة للتنزيل وفق سياسة الوصول.",
    body_en: "Official catalogs for every brand, with downloadable files per access policy.",
    cta_label_ar: "دخول مكتبة الكتالوجات",
    cta_url: "/catalogs",
    extra: {
      eyebrow_ar: "الكتالوجات الرسمية",
      eyebrow_en: "Official catalogs",
      cta_label_en: "Enter the catalog library",
    },
  }),
  partners: row({
    label: "بطاقة الشراكات",
    sort_order: 60,
    title_ar: "ابدأ شراكتك التجارية معنا",
    title_en: "Start your business partnership",
    body_ar: "للموزعين والمشترين بالجملة: قناة موحّدة عبر واتساب الأعمال للحصول على شروط الشراكة.",
    body_en: "For distributors and wholesale buyers: a unified WhatsApp Business channel for partnership terms.",
    cta_label_ar: "صفحة الشراكات",
    cta_url: "/partners",
    extra: {
      eyebrow_ar: "شراكات الأعمال",
      eyebrow_en: "Business partnerships",
      cta_label_en: "Partnerships page",
      cta2_label_ar: "فتح محادثة شراكة",
      cta2_label_en: "Open a partnership chat",
      wa_message_ar: "السلام عليكم، أرغب في فتح حساب شراكة تجارية مع ركن التوفير.",
      wa_message_en: "Hello, I would like to open a business partnership account with Rukn Al-Tawfir.",
    },
  }),
  contact: row({
    label: "بطاقة التواصل",
    sort_order: 70,
    title_ar: "قناة تجارية موحّدة وردّ سريع",
    title_en: "A unified commercial channel with fast replies",
    cta_label_ar: "تواصل واتساب",
    cta_url: "/contact",
    extra: {
      eyebrow_ar: "تواصل معنا",
      eyebrow_en: "Contact us",
      cta_label_en: "WhatsApp us",
      cta2_label_ar: "صفحة التواصل الكاملة",
      cta2_label_en: "Full contact page",
    },
  }),
};

export const SECTION_KEYS = Object.keys(SECTION_DEFAULTS);

export function defaultRow(key: string): HomepageSectionRow {
  const d = SECTION_DEFAULTS[key] ?? row({ label: key });
  const { label: _label, ...rest } = d;
  return { section_key: key, ...rest };
}

/** Merge a DB row over its defaults; empty strings count as "not set". */
export function mergeSection(key: string, dbRow?: Partial<HomepageSectionRow> | null): HomepageSectionRow {
  const base = defaultRow(key);
  if (!dbRow) return base;
  const pick = (v: unknown, fallback: string | null) =>
    typeof v === "string" && v.trim() !== "" ? v : fallback;
  const extra = { ...(base.extra ?? {}), ...((dbRow.extra as SectionExtra) ?? {}) };
  if (!Array.isArray(extra.items) || extra.items.length === 0) extra.items = base.extra?.items;
  return {
    section_key: key,
    title_ar: pick(dbRow.title_ar, base.title_ar),
    title_en: pick(dbRow.title_en, base.title_en),
    subtitle_ar: pick(dbRow.subtitle_ar, base.subtitle_ar),
    subtitle_en: pick(dbRow.subtitle_en, base.subtitle_en),
    body_ar: pick(dbRow.body_ar, base.body_ar),
    body_en: pick(dbRow.body_en, base.body_en),
    cta_label_ar: pick(dbRow.cta_label_ar, base.cta_label_ar),
    cta_url: pick(dbRow.cta_url, base.cta_url),
    sort_order: typeof dbRow.sort_order === "number" ? dbRow.sort_order : base.sort_order,
    is_enabled: typeof dbRow.is_enabled === "boolean" ? dbRow.is_enabled : base.is_enabled,
    extra,
  };
}

/** Build a complete, ready-to-render map from whatever rows exist in the DB. */
export function buildSectionsMap(rows: Partial<HomepageSectionRow>[] | null | undefined): HomepageSectionsMap {
  const byKey = new Map<string, Partial<HomepageSectionRow>>();
  for (const r of rows ?? []) if (r?.section_key) byKey.set(r.section_key, r);
  const out: HomepageSectionsMap = {};
  for (const key of SECTION_KEYS) out[key] = mergeSection(key, byKey.get(key));
  return out;
}

/** Localized reader for a merged section. */
export function sectionText(
  section: HomepageSectionRow | undefined,
  field: "title" | "subtitle" | "body" | "eyebrow" | "cta_label" | "cta2_label" | "badge" | "wa_message",
  lang: "ar" | "en",
): string {
  if (!section) return "";
  const ar = lang === "ar";
  const get = (a: unknown, b: unknown) => {
    const primary = ar ? a : b;
    const value = typeof primary === "string" && primary.trim() ? primary : (typeof a === "string" ? a : "");
    return value ?? "";
  };
  const e = section.extra ?? {};
  switch (field) {
    case "title": return get(section.title_ar, section.title_en);
    case "subtitle": return get(section.subtitle_ar, section.subtitle_en);
    case "body": return get(section.body_ar, section.body_en);
    case "eyebrow": return get(e.eyebrow_ar, e.eyebrow_en);
    case "cta_label": return get(section.cta_label_ar, e.cta_label_en);
    case "cta2_label": return get(e.cta2_label_ar, e.cta2_label_en);
    case "badge": return get(e.badge_ar, e.badge_en);
    case "wa_message": return get(e.wa_message_ar, e.wa_message_en);
    default: return "";
  }
}

export function itemText(item: SectionItem | undefined, field: "title" | "desc", lang: "ar" | "en"): string {
  if (!item) return "";
  const ar = lang === "ar";
  const a = field === "title" ? item.title_ar : item.desc_ar;
  const b = field === "title" ? item.title_en : item.desc_en;
  const primary = ar ? a : b;
  return (typeof primary === "string" && primary.trim() ? primary : a) ?? "";
}

/** Ordered render units, honouring admin sort_order. */
export function orderedUnits(map: HomepageSectionsMap): SectionOrderUnit[] {
  return [...SECTION_ORDER_UNITS].sort((a, b) => {
    const sa = map[UNIT_ORDER_SOURCE[a]]?.sort_order ?? 0;
    const sb = map[UNIT_ORDER_SOURCE[b]]?.sort_order ?? 0;
    return sa - sb;
  });
}
