// Image ALT-text helpers — Google Images / AI Overviews optimization.
// Filenames and URLs are NEVER modified by this module; it only enriches
// the ALT text, captions, and semantic context around existing images.

type Lang = "ar" | "en";

const BRAND_CONTEXT: Record<string, { ar: string; en: string }> = {
  nocal: {
    ar: "بديل سكر طبيعي خالٍ من السعرات لمرضى السكري",
    en: "natural sugar substitute, zero calories, diabetic-friendly",
  },
  steviola: {
    ar: "محلٍّ طبيعي من ستيفيا خالٍ من السعرات — بديل سكر صحي",
    en: "natural stevia sweetener, zero calories, healthy sugar alternative",
  },
  "y-kelin": {
    ar: "العناية بأطقم الأسنان وصحة الفم — لاصق الأطقم وفرش التقويم",
    en: "denture care and advanced oral care — denture adhesive and orthodontic brushes",
  },
  ykelin: {
    ar: "العناية بأطقم الأسنان وصحة الفم — لاصق الأطقم وفرش التقويم",
    en: "denture care and advanced oral care — denture adhesive and orthodontic brushes",
  },
  "baby-tawfir": {
    ar: "منتجات العناية بالطفل — مناديل مبللة ولوازم الرضّع",
    en: "baby care products — wet wipes and infant essentials",
  },
  bambo: {
    ar: "منتجات العناية ببشرة الطفل — حفاضات ومناديل لطيفة",
    en: "baby skin care — gentle diapers and wipes",
  },
  monivo: {
    ar: "فيتامين C ومصاصات الحلق لدعم المناعة",
    en: "vitamin C lozenges for immune and throat support",
  },
  sekem: {
    ar: "أعشاب وشاي بيوديناميكي طبيعي",
    en: "biodynamic herbal teas and natural wellness",
  },
  isis: {
    ar: "أعشاب وأغذية صحية طبيعية",
    en: "herbal foods, healthy teas and natural wellness",
  },
};

/** Descriptive product image ALT — "[product] من [brand] — [keyword context]". */
export function productAlt(
  brandSlug: string,
  brandName: string,
  productName: string,
  lang: Lang = "ar",
): string {
  const ctx = BRAND_CONTEXT[brandSlug];
  if (!ctx) {
    return lang === "ar"
      ? `${productName} من ${brandName} — منتج رسمي عبر ركن التوفير`
      : `${productName} by ${brandName} — official product via Rukn Al-Tawfir`;
  }
  return lang === "ar"
    ? `${productName} من ${brandName} — ${ctx.ar}`
    : `${productName} by ${brandName} — ${ctx.en}`;
}

/** Brand logo ALT with topical keyword context. */
export function brandLogoAlt(brandSlug: string, brandName: string, lang: Lang = "ar"): string {
  const ctx = BRAND_CONTEXT[brandSlug];
  if (!ctx) {
    return lang === "ar" ? `شعار ${brandName}` : `${brandName} logo`;
  }
  return lang === "ar"
    ? `شعار ${brandName} — ${ctx.ar}`
    : `${brandName} logo — ${ctx.en}`;
}

/** Short caption shown under product images (UI + semantic context). */
export function productCaption(
  brandSlug: string,
  brandName: string,
  productName: string,
  lang: Lang = "ar",
): string {
  const ctx = BRAND_CONTEXT[brandSlug];
  if (!ctx) {
    return lang === "ar"
      ? `${productName} — العبوة الرسمية من ${brandName}`
      : `${productName} — official ${brandName} package`;
  }
  return lang === "ar"
    ? `${productName} — ${ctx.ar} (${brandName})`
    : `${productName} — ${ctx.en} (${brandName})`;
}
