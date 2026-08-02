// Structured, editable content for the corporate pages (about / partners / contact).
//
// Values live in `pages.extra.content` as a flat map of dotted keys:
//   "vision.title_ar" | "vision.title_en" | "values.items" (array of objects)
// Defaults are derived from the existing i18n dictionaries, so nothing that is
// already published on the site is ever lost — an empty field simply falls back
// to the original text.

import arDict from "@/i18n/locales/ar.json";
import enDict from "@/i18n/locales/en.json";

export type PageContent = Record<string, any>;

export type ContentField = {
  /** Dotted key, stored as `${key}_ar` / `${key}_en` when bilingual. */
  key: string;
  label: string;
  kind?: "text" | "textarea";
  /** false → single (non-translated) value stored under `key`. */
  bilingual?: boolean;
  /** Path inside the i18n dictionaries used to seed the default value. */
  path?: string;
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

export const CONTENT_PAGE_SLUGS = ["about", "partners", "contact"] as const;
export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];

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

const f = (key: string, label: string, path: string, kind: ContentField["kind"] = "text"): ContentField => ({
  key, label, path, kind, bilingual: true,
});

const VALUE_KEYS = ["trust", "quality", "partnership", "innovation", "responsibility", "excellence"] as const;
const TIER_KEYS = ["wholesale", "pharma", "retail", "digital"] as const;

export const PAGE_SCHEMAS: Record<ContentPageSlug, ContentGroup[]> = {
  about: [
    {
      key: "hero", label: "المقدمة الرئيسية",
      fields: [
        f("hero.eyebrow", "التسمية العلوية", "about.eyebrow"),
        f("hero.titleSuffix", "تكملة العنوان", "about.titleSuffix"),
        f("hero.subtitle", "النص التعريفي", "about.subtitle", "textarea"),
      ],
    },
    {
      key: "vision", label: "الرؤية",
      fields: [f("vision.title", "العنوان", "about.vision.title"), f("vision.body", "النص", "about.vision.body", "textarea")],
    },
    {
      key: "mission", label: "الرسالة",
      fields: [f("mission.title", "العنوان", "about.mission.title"), f("mission.body", "النص", "about.mission.body", "textarea")],
    },
    {
      key: "values", label: "القيم",
      fields: [
        f("values.title", "العنوان", "about.values.title"),
        f("values.subtitle", "النص التمهيدي", "about.values.subtitle", "textarea"),
      ],
      repeater: {
        key: "values.items", label: "قائمة القيم",
        itemFields: [
          { key: "title", label: "اسم القيمة", bilingual: true },
          { key: "desc", label: "الوصف", kind: "textarea", bilingual: true },
        ],
      },
    },
    {
      key: "purpose", label: "الغاية المؤسسية",
      fields: [f("purpose.title", "العنوان", "about.purpose.title"), f("purpose.body", "النص", "about.purpose.body", "textarea")],
    },
    {
      key: "promise", label: "وعد العلامة",
      fields: [f("promise.title", "العنوان", "about.promise.title"), f("promise.body", "النص", "about.promise.body", "textarea")],
    },
    {
      key: "believe", label: "ما نؤمن به",
      fields: [
        f("believe.title", "العنوان", "about.believe.title"),
        f("believe.body1", "الفقرة الأولى", "about.believe.body1", "textarea"),
        f("believe.body2", "الفقرة الثانية", "about.believe.body2", "textarea"),
      ],
    },
    {
      key: "ecosystem", label: "قسم العلامات",
      fields: [
        f("ecosystem.eyebrow", "التسمية العلوية", "about.fullSystemEyebrow"),
        f("ecosystem.title", "العنوان", "about.fullSystemTitle"),
      ],
    },
    {
      key: "cta", label: "دعوة التواصل",
      fields: [
        f("cta.title", "العنوان", "about.ctaTitle"),
        f("cta.desc", "النص", "about.ctaDesc", "textarea"),
        f("cta.whatsapp", "زر واتساب", "about.ctaWhatsapp"),
        f("cta.partners", "زر الشراكات", "about.ctaPartners"),
      ],
    },
  ],
  partners: [
    {
      key: "hero", label: "المقدمة الرئيسية",
      fields: [
        f("hero.eyebrow", "التسمية العلوية", "partners.eyebrow"),
        f("hero.title", "العنوان", "partners.title"),
        f("hero.subtitle", "النص التعريفي", "partners.subtitle", "textarea"),
        f("hero.openChat", "زر فتح المحادثة", "partners.openChat"),
        f("hero.waMsg", "نص رسالة واتساب", "partners.waMsg", "textarea"),
      ],
    },
    {
      key: "tiers", label: "أنواع الشراكات",
      fields: [
        f("tiers.eyebrow", "التسمية العلوية", "partners.channelsEyebrow"),
        f("tiers.title", "العنوان", "partners.channelsTitle"),
      ],
      repeater: {
        key: "tiers.items", label: "قائمة الشراكات",
        itemFields: [
          { key: "title", label: "النوع", bilingual: true },
          { key: "desc", label: "الوصف", kind: "textarea", bilingual: true },
        ],
      },
    },
    {
      key: "why", label: "مزايا الشراكة",
      fields: [
        f("why.eyebrow", "التسمية العلوية", "partners.whyEyebrow"),
        f("why.title", "العنوان", "partners.whyTitle"),
      ],
      repeater: {
        key: "why.items", label: "قائمة المزايا",
        itemFields: [{ key: "text", label: "الميزة", bilingual: true }],
      },
    },
    {
      key: "channel", label: "قناة التواصل الرسمية",
      fields: [
        f("channel.eyebrow", "التسمية العلوية", "partners.channelEyebrow"),
        f("channel.title", "العنوان", "partners.channelTitle"),
        f("channel.desc", "النص", "partners.channelDesc", "textarea"),
        f("channel.numberLabel", "تسمية الرقم", "partners.waNumberLabel"),
        f("channel.sendNow", "زر الإرسال", "partners.sendNow"),
      ],
    },
  ],
  contact: [
    {
      key: "hero", label: "المقدمة الرئيسية",
      fields: [
        f("hero.eyebrow", "التسمية العلوية", "contact.eyebrow"),
        f("hero.title", "العنوان", "contact.title"),
        f("hero.subtitle", "النص التعريفي", "contact.subtitle", "textarea"),
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
        hint: "تظهر داخل بطاقة البريد الإلكتروني في صفحة التواصل.",
        itemFields: [
          { key: "label", label: "الوصف", bilingual: true },
          { key: "value", label: "البريد الإلكتروني", bilingual: false },
        ],
      },
    },
    {
      key: "branches", label: "قسم الفروع",
      fields: [
        f("branches.eyebrow", "التسمية العلوية", ""),
        f("branches.title", "عنوان القسم", ""),
        f("branches.subtitle", "نص تعريفي", "", "textarea"),
      ],
    },
    {
      key: "form", label: "نموذج الاستفسار",
      fields: [
        f("form.eyebrow", "التسمية العلوية", "contact.formEyebrow"),
        f("form.title", "العنوان", "contact.formTitle"),
        f("form.desc", "الوصف", "contact.formDesc", "textarea"),
        f("form.submit", "زر الإرسال", "contact.openChat"),
      ],
    },
  ],
};

/** Default values seeded from the current published copy. */
export function defaultContent(slug: ContentPageSlug): PageContent {
  const out: PageContent = {};
  for (const g of PAGE_SCHEMAS[slug]) {
    for (const fl of g.fields ?? []) {
      out[`${fl.key}_ar`] = dig(AR, fl.path);
      out[`${fl.key}_en`] = dig(EN, fl.path);
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

  // Only keep the groups that belong to this page.
  const allowed = new Set<string>();
  for (const g of PAGE_SCHEMAS[slug]) {
    for (const fl of g.fields ?? []) { allowed.add(`${fl.key}_ar`); allowed.add(`${fl.key}_en`); }
    if (g.repeater) allowed.add(g.repeater.key);
  }
  for (const k of Object.keys(out)) if (!allowed.has(k)) delete out[k];
  return out;
}

/** Reads a localized value with a guaranteed fallback. */
export function pickText(
  content: PageContent | null | undefined,
  key: string,
  lang: "ar" | "en",
  fallback: string,
): string {
  const primary = content?.[`${key}_${lang}`];
  if (typeof primary === "string" && primary.trim()) return primary;
  const arabic = content?.[`${key}_ar`];
  if (lang === "en" && typeof arabic === "string" && arabic.trim() && !fallback) return arabic;
  return fallback;
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
  const v = row[`${key}_${lang}`];
  if (typeof v === "string" && v.trim()) return v;
  const ar = row[`${key}_ar`];
  if (typeof ar === "string" && ar.trim()) return ar;
  return typeof row[key] === "string" ? row[key] : "";
}
