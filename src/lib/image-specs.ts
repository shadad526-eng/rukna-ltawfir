// Recommended image dimensions per upload destination.
// Values are derived from the actual frame each image renders into.

export type ImageSpec = {
  /** Recommended width in pixels. */
  width: number;
  /** Recommended height in pixels. */
  height: number;
  /** Human-readable aspect ratio, e.g. "8:3". */
  ratio: string;
  /** How the image is displayed in the target component. */
  fit: "cover" | "contain" | "natural";
  /** Optional extra guidance (Arabic). */
  note?: string;
};

const FIT_LABEL: Record<ImageSpec["fit"], string> = {
  cover: "تعبئة الإطار بالكامل (cover)",
  contain: "احتواء كامل الصورة دون قص (contain)",
  natural: "عرض طبيعي متجاوب",
};

export const IMAGE_SPECS: Record<string, ImageSpec> = {
  // Homepage managed slider
  "slider.desktop": { width: 1600, height: 600, ratio: "8:3", fit: "cover", note: "استخدم صورة بهذه النسبة لتظهر بصورة صحيحة دون قص أو تشويه." },
  "slider.mobile": { width: 1080, height: 810, ratio: "4:3", fit: "cover" },
  "hero.slider.desktop": { width: 1920, height: 840, ratio: "16:7", fit: "cover" },
  "hero.slider.mobile": { width: 1080, height: 810, ratio: "4:3", fit: "cover" },
  // Managed hero (image type)
  "hero.image.desktop": { width: 1920, height: 900, ratio: "32:15", fit: "cover" },
  "hero.image.mobile": { width: 1080, height: 1080, ratio: "1:1", fit: "cover" },
  // Managed hero (custom type)
  "hero.custom.bg": { width: 1920, height: 1080, ratio: "16:9", fit: "cover" },
  "hero.custom.main": { width: 1200, height: 1200, ratio: "1:1", fit: "contain" },
  "hero.custom.logo": { width: 600, height: 240, ratio: "5:2", fit: "contain", note: "يفضّل صيغة PNG بخلفية شفافة." },

  // Entity fields — keyed as `<entity>.<field>`
  "brands.logo_asset_id": { width: 600, height: 240, ratio: "5:2", fit: "contain", note: "يفضّل صيغة PNG بخلفية شفافة." },
  "brands.hero_asset_id": { width: 1600, height: 600, ratio: "8:3", fit: "cover" },
  "products.cover_asset_id": { width: 1000, height: 1000, ratio: "1:1", fit: "cover", note: "صورة منتج على خلفية نظيفة." },
  "product_variants.cover_asset_id": { width: 1000, height: 1000, ratio: "1:1", fit: "cover" },
  "product_categories.icon_asset_id": { width: 400, height: 400, ratio: "1:1", fit: "contain" },
  "insights.cover_asset_id": { width: 1200, height: 675, ratio: "16:9", fit: "cover" },
  "topic_hubs.cover_asset_id": { width: 1200, height: 675, ratio: "16:9", fit: "cover" },
  "pages.cover_asset_id": { width: 1600, height: 600, ratio: "8:3", fit: "cover" },
  "catalogs.cover_asset_id": { width: 900, height: 1200, ratio: "3:4", fit: "cover", note: "غلاف الكتالوج بشكل عمودي." },
  "certifications.logo_asset_id": { width: 400, height: 400, ratio: "1:1", fit: "contain" },
  "homepage_sections.media_asset_id": { width: 1200, height: 800, ratio: "3:2", fit: "cover" },
  "corporate_identity.logo_asset_id": { width: 600, height: 600, ratio: "1:1", fit: "contain", note: "يفضّل صيغة PNG بخلفية شفافة." },
};

export function getImageSpec(key: string | null | undefined): ImageSpec | null {
  if (!key) return null;
  return IMAGE_SPECS[key] ?? null;
}

export function describeSpec(spec: ImageSpec): string[] {
  const lines = [
    `المقاس الموصى به: ${spec.width} × ${spec.height} بكسل`,
    `نسبة الأبعاد: ${spec.ratio}`,
    `طريقة العرض: ${FIT_LABEL[spec.fit]}`,
  ];
  if (spec.note) lines.push(spec.note);
  return lines;
}

function parseRatio(ratio: string): number | null {
  const [w, h] = ratio.split(":").map(Number);
  if (!w || !h) return null;
  return w / h;
}

/** Returns an Arabic warning when the picked image doesn't suit the destination. */
export function checkImageAgainstSpec(
  spec: ImageSpec,
  naturalWidth: number,
  naturalHeight: number,
): string | null {
  if (!naturalWidth || !naturalHeight) return null;
  const target = parseRatio(spec.ratio) ?? spec.width / spec.height;
  const actual = naturalWidth / naturalHeight;
  const drift = Math.abs(actual - target) / target;
  if (spec.fit !== "contain" && drift > 0.08) {
    return `نسبة الصورة الحالية ${naturalWidth}×${naturalHeight} لا تطابق النسبة المطلوبة ${spec.ratio}. قد تظهر مقصوصة — يُفضّل استخدام صورة بمقاس ${spec.width}×${spec.height}.`;
  }
  if (naturalWidth < spec.width * 0.6 || naturalHeight < spec.height * 0.6) {
    return `دقة الصورة منخفضة (${naturalWidth}×${naturalHeight}). المقاس الموصى به ${spec.width}×${spec.height} لتفادي ظهورها غير واضحة.`;
  }
  return null;
}
