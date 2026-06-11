import drops from "@/assets/steviola-products/steviola-drops.jpg.asset.json";
import family from "@/assets/steviola-products/steviola-family.jpg.asset.json";
import { useLocale } from "@/i18n/LocaleProvider";

type Item = {
  image: string;
  name_ar: string;
  name_en: string;
  desc_ar: string;
  desc_en: string;
  features_ar: string[];
  features_en: string[];
};

const ITEMS: Item[] = [
  {
    image: drops.url,
    name_ar: "ستيفيولا نقط",
    name_en: "Steviola Drops (Stevia Liquid Sweetener)",
    desc_ar:
      "بديل طبيعي وصحي للسكر، خالي من السعرات الحرارية، مناسب للدايت ومرضى السكري، يذوب بسهولة في المشروبات الساخنة والباردة.",
    desc_en:
      "A natural, healthy sugar alternative — zero calories, suitable for diet and diabetics, dissolves easily in hot and cold drinks.",
    features_ar: [
      "٠ سعرات حرارية",
      "بدون طعم مرارة",
      "٣٠٠ ملعقة في ٣٠ مل",
      "مناسب لمرضى السكري",
    ],
    features_en: [
      "Zero calories",
      "No bitter aftertaste",
      "300 servings in 30 ml",
      "Diabetic-friendly",
    ],
  },
  {
    image: family.url,
    name_ar: "ستيفيولا حجم عائلي — مُحلي للخبز والطهي",
    name_en: "Steviola Sweetener (Family Size, Baking & Cooking)",
    desc_ar:
      "مُحلي ستيفيا طبيعي ١٠٠٪، بديل مثالي للسكر بدون سعرات حرارية. مناسب للخبز والطهي ولجميع المشروبات. وزن صافي ٢٥٠ جرام.",
    desc_en:
      "100% natural stevia sweetener — an ideal zero-calorie sugar substitute, perfect for baking, cooking, and all beverages. Net weight 250 g.",
    features_ar: [
      "طبيعي بالكامل",
      "صفر سعرات حرارية",
      "خالٍ من السكر والدهون",
      "بدون طعم مر",
      "مناسب للريجيم والخبز",
    ],
    features_en: [
      "100% natural",
      "Zero calories",
      "Sugar- and fat-free",
      "No bitter aftertaste",
      "Great for diet, baking & cooking",
    ],
  },
];

export function SteviolaExtraProducts({
  whatsappNumber,
  accent,
}: {
  whatsappNumber: string;
  accent: string;
}) {
  const { lang, dir } = useLocale();
  const isAr = lang === "ar";
  const featuresLabel = isAr ? "أهم المميزات" : "Key features";
  const ctaLabel = isAr ? "للطلب أو الاستفسار" : "Order or inquire";

  const buildHref = (item: Item) => {
    const productName = isAr ? item.name_ar : item.name_en;
    const msg = isAr
      ? `السلام عليكم، أرغب بالاستفسار أو الطلب لمنتج: ${productName}.`
      : `Hello, I'd like to inquire about or order: ${productName}.`;
    const digits = (whatsappNumber || "").replace(/\D+/g, "");
    return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20" dir={dir}>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {ITEMS.map((item) => {
          const name = isAr ? item.name_ar : item.name_en;
          const altName = isAr ? item.name_en : item.name_ar;
          const desc = isAr ? item.desc_ar : item.desc_en;
          const features = isAr ? item.features_ar : item.features_en;
          return (
            <article key={item.name_en} className="prem-card group flex flex-col overflow-hidden">
              <div className="podium relative grid aspect-[4/3] place-items-center p-6">
                <img
                  src={item.image}
                  alt={name}
                  className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 prem-shimmer opacity-0 group-hover:opacity-100" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="font-arabic text-base font-bold text-foreground">{name}</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-600">{altName}</div>
                <p className="mt-3 text-xs leading-relaxed text-ink-600">{desc}</p>

                <div className="mt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
                    {featuresLabel}
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs leading-relaxed text-foreground/85">
                        <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full" style={{ background: accent }} aria-hidden />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-4 border-t border-border">
                  <a
                    href={buildHref(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-full bg-trust-700 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_10px_24px_-12px_oklch(0.32_0.13_245/0.55)] transition-transform hover:-translate-y-0.5"
                  >
                    {ctaLabel}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
