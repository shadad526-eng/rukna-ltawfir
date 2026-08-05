// Structured, editable content for the corporate pages (about / partners / contact).
//
// Values live in `pages.extra.content` as a flat map of dotted keys:
//   "vision.title_ar" | "vision.title_en" | "values.items" (array of objects)
// Defaults are derived from the existing i18n dictionaries, so nothing that is
// already published on the site is ever lost — an empty field simply falls back
// to the original text.
//
// A value is either:
//   * a plain string (default, identical to the historic behaviour),
//   * a rich-text HTML string (when the admin applied formatting), or
//   * a styled-heading object `{ html, sizeDesktop, ... }` for major headings.

import arDict from "@/i18n/locales/ar.json";
import enDict from "@/i18n/locales/en.json";

export type PageContent = Record<string, any>;

/** How the field is edited in the dashboard. */
export type ContentFieldUI = "text" | "textarea" | "rich" | "heading";

export type ContentField = {
  /** Dotted key, stored as `${key}_ar` / `${key}_en` when bilingual. */
  key: string;
  label: string;
  ui?: ContentFieldUI;
  /** false → single (non-translated) value stored under `key`. */
  bilingual?: boolean;
  /** Path inside the i18n dictionaries used to seed the default value. */
  path?: string;
  hint?: string;
};

export type ContentRepeater = {
  key: string;
  label: string;
  hint?: string;
  itemFields: ContentField[];
};

export type ContentGroup = {
  key: string;
  label: string;
  fields?: ContentField[];
  repeater?: ContentRepeater;
};

export const CONTENT_PAGE_SLUGS = ["about", "partners", "contact", "branches"] as const;
export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];

export const CONTENT_PAGE_LABELS: Record<ContentPageSlug, string> = {
  about: "من نحن",
  partners: "الشراكات",
  contact: "تواصل معنا",
  branches: "الفروع والعناوين",
};

export function isContentPageSlug(slug: unknown): slug is ContentPageSlug {
  return typeof slug === "string" && (CONTENT_PAGE_SLUGS as readonly string[]).includes(slug);
}

/* ------------------------------------------------------------------ */
/* Styled headings                                                     */
/* ------------------------------------------------------------------ */

export type HeadingAlign = "start" | "center" | "end";

export type HeadingValue = {
  /** Inline HTML (span/strong/em/br only). Empty → use the site default text. */
  html?: string;
  /** Desktop font size in px. */
  sizeDesktop?: number | null;
  /** Mobile font size in px. */
  sizeMobile?: number | null;
  weight?: number | null;
  lineHeight?: number | null;
  align?: HeadingAlign | null;
};

export const HEADING_LIMITS = {
  desktop: { min: 20, max: 96 },
  mobile: { min: 16, max: 56 },
  weight: [400, 500, 600, 700, 800] as const,
  lineHeight: { min: 0.9, max: 2 },
};

export const HEADING_COLOR_PRESETS: { label: string; value: string }[] = [
  { label: "أزرق الثقة (أساسي)", value: "oklch(0.46 0.16 245)" },
  { label: "أخضر الطبيعة", value: "oklch(0.58 0.16 138)" },
  { label: "أخضر فاتح (تمييز)", value: "oklch(0.68 0.17 138)" },
  { label: "رمادي داكن", value: "oklch(0.38 0.02 250)" },
  { label: "أبيض", value: "#ffffff" },
];


export function clampHeadingSize(v: unknown, which: "desktop" | "mobile"): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  const { min, max } = HEADING_LIMITS[which];
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function isHeadingValue(v: unknown): v is HeadingValue {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/** Normalises a stored heading value, clamping every numeric setting. */
export function normalizeHeading(v: unknown): HeadingValue | null {
  if (!isHeadingValue(v)) return null;
  const html = typeof v.html === "string" ? v.html : "";
  const align = v.align === "center" || v.align === "end" || v.align === "start" ? v.align : null;
  const weight = HEADING_LIMITS.weight.includes(Number(v.weight) as any) ? Number(v.weight) : null;
  const lhNum = Number(v.lineHeight);
  const lineHeight = Number.isFinite(lhNum) && lhNum > 0
    ? Math.min(HEADING_LIMITS.lineHeight.max, Math.max(HEADING_LIMITS.lineHeight.min, lhNum))
    : null;
  const out: HeadingValue = {
    html,
    sizeDesktop: clampHeadingSize(v.sizeDesktop, "desktop"),
    sizeMobile: clampHeadingSize(v.sizeMobile, "mobile"),
    weight,
    lineHeight,
    align,
  };
  const hasAnything =
    !!out.html?.trim() || out.sizeDesktop || out.sizeMobile || out.weight || out.lineHeight || out.align;
  return hasAnything ? out : null;
}

/* ------------------------------------------------------------------ */
/* Schemas                                                             */
/* ------------------------------------------------------------------ */

function dig(dict: any, path?: string): string {
  if (!path) return "";
  let cur: any = dict;
  for (const p of path.split(".")) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return "";
  }
  return typeof cur === "string" ? cur : "";
}

const AR = arDict as any;
const EN = enDict as any;

/** Plain single-line text field. */
const f = (key: string, label: string, path = "", hint?: string): ContentField =>
  ({ key, label, path, ui: "text", bilingual: true, hint });
/** Formatted paragraph field (rich editor). */
const rich = (key: string, label: string, path = "", hint?: string): ContentField =>
  ({ key, label, path, ui: "rich", bilingual: true, hint });
/** Major heading (styled heading editor). */
const head = (key: string, label: string, path = "", hint?: string): ContentField =>
  ({ key, label, path, ui: "heading", bilingual: true, hint });

const VALUE_KEYS = ["trust", "quality", "partnership", "innovation", "responsibility", "excellence"] as const;
const TIER_KEYS = ["wholesale", "pharma", "retail", "digital"] as const;
const SUBJECT_KEYS = ["general", "product", "partnership", "catalog", "support"] as const;

export const PAGE_SCHEMAS: Record<ContentPageSlug, ContentGroup[]> = {
  about: [
    {
      key: "hero", label: "المقدمة الرئيسية (Hero)",
      fields: [
        f("hero.eyebrow", "التسمية العلوية", "about.eyebrow"),
        head("hero.title", "العنوان الرئيسي (H1)", "", "اتركه فارغًا لعرض اسم الشركة مع تكملة العنوان بالتنسيق الحالي."),
        f("hero.titleSuffix", "تكملة العنوان الافتراضية", "about.titleSuffix"),
        rich("hero.subtitle", "النص التعريفي", "about.subtitle"),
      ],
    },
    {
      key: "vision", label: "الرؤية",
      fields: [
        f("vision.eyebrow", "رقم/تسمية القسم", "about.vision.eyebrow"),
        head("vision.title", "العنوان", "about.vision.title"),
        rich("vision.body", "النص", "about.vision.body"),
      ],
    },
    {
      key: "mission", label: "الرسالة",
      fields: [
        f("mission.eyebrow", "رقم/تسمية القسم", "about.mission.eyebrow"),
        head("mission.title", "العنوان", "about.mission.title"),
        rich("mission.body", "النص", "about.mission.body"),
      ],
    },
    {
      key: "values", label: "القيم",
      fields: [
        f("values.eyebrow", "رقم/تسمية القسم", "about.values.eyebrow"),
        head("values.title", "العنوان", "about.values.title"),
        rich("values.subtitle", "النص التمهيدي", "about.values.subtitle"),
      ],
      repeater: {
        key: "values.items", label: "بطاقات القيم",
        itemFields: [
          { key: "title", label: "اسم القيمة", ui: "text", bilingual: true },
          { key: "desc", label: "الوصف", ui: "rich", bilingual: true },
        ],
      },
    },
    {
      key: "purpose", label: "الغاية المؤسسية",
      fields: [
        f("purpose.eyebrow", "رقم/تسمية القسم", "about.purpose.eyebrow"),
        head("purpose.title", "العنوان", "about.purpose.title"),
        rich("purpose.body", "النص", "about.purpose.body"),
      ],
    },
    {
      key: "promise", label: "وعد العلامة",
      fields: [
        f("promise.eyebrow", "رقم/تسمية القسم", "about.promise.eyebrow"),
        f("promise.title", "تسمية الشارة", "about.promise.title"),
        rich("promise.body", "نص الوعد", "about.promise.body"),
      ],
    },
    {
      key: "believe", label: "ما نؤمن به",
      fields: [
        f("believe.eyebrow", "رقم/تسمية القسم", "about.believe.eyebrow"),
        head("believe.title", "العنوان", "about.believe.title"),
        rich("believe.body1", "الفقرة الأولى", "about.believe.body1"),
        rich("believe.body2", "الفقرة الثانية", "about.believe.body2"),
      ],
    },
    {
      key: "ecosystem", label: "قسم العلامات",
      fields: [
        f("ecosystem.eyebrow", "التسمية العلوية", "about.fullSystemEyebrow"),
        head("ecosystem.title", "العنوان", "about.fullSystemTitle"),
      ],
    },
    {
      key: "cta", label: "دعوة التواصل",
      fields: [
        head("cta.title", "العنوان", "about.ctaTitle"),
        rich("cta.desc", "النص", "about.ctaDesc"),
        f("cta.whatsapp", "زر واتساب", "about.ctaWhatsapp"),
        f("cta.partners", "زر الشراكات", "about.ctaPartners"),
      ],
    },
  ],
  partners: [
    {
      key: "hero", label: "المقدمة الرئيسية (Hero)",
      fields: [
        f("hero.eyebrow", "التسمية العلوية", "partners.eyebrow"),
        head("hero.title", "العنوان الرئيسي (H1)", "partners.title"),
        rich("hero.subtitle", "النص التعريفي", "partners.subtitle"),
        f("hero.openChat", "زر فتح المحادثة", "partners.openChat"),
        { key: "hero.waMsg", label: "نص رسالة واتساب", ui: "textarea", bilingual: true, path: "partners.waMsg" },
      ],
    },
    {
      key: "tiers", label: "أنواع الشراكات",
      fields: [
        f("tiers.eyebrow", "التسمية العلوية", "partners.channelsEyebrow"),
        head("tiers.title", "العنوان", "partners.channelsTitle"),
      ],
      repeater: {
        key: "tiers.items", label: "بطاقات الشراكات",
        itemFields: [
          { key: "title", label: "النوع", ui: "text", bilingual: true },
          { key: "desc", label: "الوصف", ui: "rich", bilingual: true },
        ],
      },
    },
    {
      key: "why", label: "مزايا الشراكة",
      fields: [
        f("why.eyebrow", "التسمية العلوية", "partners.whyEyebrow"),
        head("why.title", "العنوان", "partners.whyTitle"),
      ],
      repeater: {
        key: "why.items", label: "قائمة المزايا",
        itemFields: [{ key: "text", label: "الميزة", ui: "rich", bilingual: true }],
      },
    },
    {
      key: "channel", label: "قناة التواصل الرسمية",
      fields: [
        f("channel.eyebrow", "التسمية العلوية", "partners.channelEyebrow"),
        head("channel.title", "العنوان", "partners.channelTitle"),
        rich("channel.desc", "النص", "partners.channelDesc"),
        f("channel.numberLabel", "تسمية الرقم", "partners.waNumberLabel"),
        f("channel.sendNow", "زر الإرسال", "partners.sendNow"),
      ],
    },
  ],
  contact: [
    {
      key: "hero", label: "المقدمة الرئيسية (Hero)",
      fields: [
        f("hero.eyebrow", "التسمية العلوية", "contact.eyebrow"),
        head("hero.title", "العنوان الرئيسي (H1)", "contact.title"),
        rich("hero.subtitle", "النص التعريفي", "contact.subtitle"),
      ],
    },
    {
      key: "cards", label: "بطاقات التواصل",
      fields: [
        f("cards.waTitle", "عنوان بطاقة واتساب", "contact.cards.waT"),
        f("cards.waHint", "وصف بطاقة واتساب", "contact.cards.waHint"),
        f("cards.emailTitle", "عنوان بطاقة البريد", "contact.cards.emailT"),
        f("cards.emailHint", "وصف بطاقة البريد", "contact.cards.emailHint"),
        f("cards.addressTitle", "عنوان بطاقة المقر", "contact.cards.addressT"),
        f("cards.addressHint", "وصف بطاقة المقر", "contact.cards.addressHint"),
      ],
    },
    {
      key: "emails", label: "عناوين البريد الرسمية",
      repeater: {
        key: "emails.items", label: "قائمة البريد الإلكتروني",
        hint: "تظهر داخل بطاقة البريد الإلكتروني في صفحة التواصل، وكل عنوان يفتح مباشرة عبر mailto.",
        itemFields: [
          { key: "label", label: "الوصف", ui: "text", bilingual: true },
          { key: "value", label: "البريد الإلكتروني", ui: "text", bilingual: false },
        ],
      },
    },
    {
      key: "branches", label: "قسم الفروع",
      fields: [
        f("branches.eyebrow", "التسمية العلوية"),
        head("branches.title", "عنوان القسم"),
        rich("branches.subtitle", "نص تعريفي"),
      ],
    },
    {
      key: "form", label: "نموذج الاستفسار",
      fields: [
        f("form.eyebrow", "التسمية العلوية", "contact.formEyebrow"),
        head("form.title", "العنوان", "contact.formTitle"),
        rich("form.desc", "الوصف", "contact.formDesc"),
        f("form.fieldName", "تسمية حقل الاسم", "contact.fieldName"),
        f("form.namePlaceholder", "نص إرشادي لحقل الاسم", "contact.namePlaceholder"),
        f("form.fieldSubject", "تسمية حقل الموضوع", "contact.fieldSubject"),
        f("form.fieldDetails", "تسمية حقل التفاصيل", "contact.fieldDetails"),
        f("form.detailsPlaceholder", "نص إرشادي لحقل التفاصيل", "contact.detailsPlaceholder"),
        f("form.submit", "زر الإرسال", "contact.openChat"),
        f("form.orDirect", "نص التواصل المباشر", "contact.orDirect"),
        f("form.directWa", "تسمية رابط واتساب", "contact.directWa"),
      ],
      repeater: {
        key: "form.subjects", label: "خيارات الموضوع",
        itemFields: [{ key: "label", label: "الخيار", ui: "text", bilingual: true }],
      },
    },
  ],
};

/** Default values seeded from the current published copy. */
export function defaultContent(slug: ContentPageSlug): PageContent {
  const out: PageContent = {};
  for (const g of PAGE_SCHEMAS[slug]) {
    for (const fl of g.fields ?? []) {
      if (fl.bilingual === false) {
        out[fl.key] = dig(AR, fl.path);
      } else {
        out[`${fl.key}_ar`] = dig(AR, fl.path);
        out[`${fl.key}_en`] = dig(EN, fl.path);
      }
    }
  }
  // Headings default to plain text (no custom typography) so the site keeps its
  // exact current look until the administrator changes something.
  for (const g of PAGE_SCHEMAS[slug]) {
    for (const fl of g.fields ?? []) {
      if (fl.ui !== "heading") continue;
      for (const l of ["ar", "en"] as const) {
        const txt = out[`${fl.key}_${l}`];
        out[`${fl.key}_${l}`] = typeof txt === "string" ? txt : "";
      }
    }
  }

  out["values.items"] = VALUE_KEYS.map((k) => ({
    title_ar: dig(AR, `about.values.${k}T`), title_en: dig(EN, `about.values.${k}T`),
    desc_ar: dig(AR, `about.values.${k}D`), desc_en: dig(EN, `about.values.${k}D`),
  }));
  out["tiers.items"] = TIER_KEYS.map((k) => ({
    title_ar: dig(AR, `partners.tiers.${k}T`), title_en: dig(EN, `partners.tiers.${k}T`),
    desc_ar: dig(AR, `partners.tiers.${k}D`), desc_en: dig(EN, `partners.tiers.${k}D`),
  }));
  const advAr: string[] = Array.isArray(AR?.partners?.advantages) ? AR.partners.advantages : [];
  const advEn: string[] = Array.isArray(EN?.partners?.advantages) ? EN.partners.advantages : [];
  out["why.items"] = advAr.map((t, i) => ({ text_ar: t, text_en: advEn[i] ?? t }));
  out["form.subjects"] = SUBJECT_KEYS.map((k) => ({
    label_ar: dig(AR, `contact.subjects.${k}`), label_en: dig(EN, `contact.subjects.${k}`),
  }));
  out["emails.items"] = [
    { label_ar: "البريد الرسمي", label_en: "Official email", value: "Info@algarademedpower.com" },
    { label_ar: "إدارة العلاقات التجارية", label_en: "Business relations", value: "Mohammed@algarademedpower.com" },
  ];
  out["branches.eyebrow_ar"] = "شبكة الفروع";
  out["branches.eyebrow_en"] = "Branch network";
  out["branches.title_ar"] = "فروعنا وعناويننا";
  out["branches.title_en"] = "Our branches and addresses";
  out["branches.subtitle_ar"] = "اختر الفرع الأقرب إليك وتواصل معنا مباشرة عبر واتساب.";
  out["branches.subtitle_en"] = "Choose the branch nearest to you and reach us directly on WhatsApp.";

  // Only keep the keys that belong to this page.
  const allowed = new Set<string>();
  for (const g of PAGE_SCHEMAS[slug]) {
    for (const fl of g.fields ?? []) {
      if (fl.bilingual === false) allowed.add(fl.key);
      else { allowed.add(`${fl.key}_ar`); allowed.add(`${fl.key}_en`); }
    }
    if (g.repeater) allowed.add(g.repeater.key);
  }
  for (const k of Object.keys(out)) if (!allowed.has(k)) delete out[k];
  return out;
}

/**
 * Merges stored content over the published defaults without ever overwriting an
 * administrator edit. Used to seed the dashboard editor with real values.
 */
export function withDefaults(slug: ContentPageSlug, stored: PageContent | null | undefined): PageContent {
  const defaults = defaultContent(slug);
  const out: PageContent = { ...defaults };
  for (const [k, v] of Object.entries(stored ?? {})) {
    if (v === undefined) continue;
    if (typeof v === "string" && !v.trim()) continue; // keep the default copy
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Readers used by the public pages                                    */
/* ------------------------------------------------------------------ */

function asText(v: unknown): string {
  if (typeof v === "string") return v;
  if (isHeadingValue(v) && typeof v.html === "string") return v.html;
  return "";
}

/** Strips markup so legacy plain-text renderers never show raw tags. */
export function stripTags(v: string): string {
  if (!v.includes("<")) return v;
  return v
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Reads a localized value with a guaranteed fallback. */
export function pickText(
  content: PageContent | null | undefined,
  key: string,
  lang: "ar" | "en",
  fallback: string,
): string {
  const primary = stripTags(asText(content?.[`${key}_${lang}`]));
  if (primary.trim()) return primary;
  const arabic = stripTags(asText(content?.[`${key}_ar`]));
  if (lang === "en" && arabic.trim() && !fallback) return arabic;
  return fallback;
}

/** Reads a styled-heading value, or null when the site default should be used. */
export function pickHeading(
  content: PageContent | null | undefined,
  key: string,
  lang: "ar" | "en",
): HeadingValue | null {
  const raw = content?.[`${key}_${lang}`] ?? (lang === "en" ? content?.[`${key}_ar`] : undefined);
  return normalizeHeading(raw);
}

/** Reads a repeatable list with a fallback to the original hardcoded list. */
export function pickList<T = any>(
  content: PageContent | null | undefined,
  key: string,
  fallback: T[],
): T[] {
  const v = content?.[key];
  if (Array.isArray(v) && v.length > 0) return v as T[];
  return fallback;
}

/** Localized item value inside a repeater row. */
export function itemText(row: any, key: string, lang: "ar" | "en"): string {
  if (!row) return "";
  const v = stripTags(asText(row[`${key}_${lang}`]));
  if (v.trim()) return v;
  const ar = stripTags(asText(row[`${key}_ar`]));
  if (ar.trim()) return ar;
  return typeof row[key] === "string" ? row[key] : "";
}

/**
 * Reads a localized value preserving admin formatting (inline HTML). Used with
 * the public `<RichText>` renderer; falls back to the original published copy.
 */
export function pickRich(
  content: PageContent | null | undefined,
  key: string,
  lang: "ar" | "en",
  fallback: string,
): string {
  const primary = asText(content?.[`${key}_${lang}`]);
  if (primary.trim()) return primary;
  const arabic = asText(content?.[`${key}_ar`]);
  if (lang === "en" && arabic.trim() && !fallback) return arabic;
  return fallback;
}

/** Localized repeater value preserving admin formatting. */
export function itemRich(row: any, key: string, lang: "ar" | "en"): string {
  if (!row) return "";
  const v = asText(row[`${key}_${lang}`]);
  if (v.trim()) return v;
  const ar = asText(row[`${key}_ar`]);
  if (ar.trim()) return ar;
  return typeof row[key] === "string" ? row[key] : "";
}
