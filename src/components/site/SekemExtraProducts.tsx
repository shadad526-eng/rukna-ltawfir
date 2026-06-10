import herbalTea from "@/assets/sekem-products/herbal-tea.jpg.asset.json";
import coughHerbs from "@/assets/sekem-products/cough-herbs.jpg.asset.json";
import calmHerbs from "@/assets/sekem-products/calm-herbs.jpg.asset.json";
import babyCalm from "@/assets/sekem-products/baby-calm.jpg.asset.json";
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
    image: herbalTea.url,
    name_ar: "سيكم شاي أعشاب",
    name_en: "SEKEM Herbal Tea",
    desc_ar:
      "شاي أعشاب طبيعي للمساعدة في إدارة الوزن كجزء من نمط حياة صحي ونظام غذائي متوازن.",
    desc_en:
      "A natural herbal tea to support healthy weight management as part of a balanced lifestyle and diet.",
    features_ar: [
      "مكونات طبيعية وصحية",
      "مكمل غذائي عشبي",
      "يدعم برنامج إنقاص الوزن",
      "مغلفات لسهولة الاستخدام",
    ],
    features_en: [
      "Natural, wholesome ingredients",
      "Herbal dietary supplement",
      "Supports weight management",
      "Convenient single-use sachets",
    ],
  },
  {
    image: calmHerbs.url,
    name_ar: "سيكم أعشاب هادئة",
    name_en: "SEKEM Calm Herbs",
    desc_ar:
      "مزيج فريد من الأعشاب الطبيعية العضوية المختارة بعناية لتهدئة الأعصاب والاسترخاء، مما يساعد على النوم الهادئ وتقليل التوتر. منتج عضوي معتمد من ديميتر.",
    desc_en:
      "A unique blend of carefully selected organic herbs to soothe the nerves and promote relaxation, restful sleep and stress relief. Demeter-certified organic.",
    features_ar: [
      "عضوي 100%",
      "يساعد على الاسترخاء",
      "خالٍ من الكافيين",
      "يحتوي على 15 مغلفًا",
    ],
    features_en: [
      "100% organic",
      "Supports relaxation",
      "Caffeine-free",
      "15 sachets per pack",
    ],
  },
  {
    image: coughHerbs.url,
    name_ar: "سيكم أعشاب للكحة",
    name_en: "SEKEM Cough Herbs",
    desc_ar:
      "مزيج عشبي طبيعي تم تطويره بعناية من البابونج والشمر وأعشاب أخرى لتهدئة الكحة وتخفيف تهيج الحلق، مما يوفر راحة فعالة وطبيعية.",
    desc_en:
      "A natural herbal blend carefully crafted with chamomile, fennel and other herbs to soothe coughs and relieve throat irritation — gentle and effective.",
    features_ar: [
      "تخفيف طبيعي للكحة",
      "تركيبة عشبية آمنة وفعّالة",
      "خالٍ من الكافيين والمواد الصناعية",
      "يدعم صحة الجهاز التنفسي",
    ],
    features_en: [
      "Natural cough relief",
      "Safe, effective herbal formula",
      "Free from caffeine and artificial additives",
      "Supports respiratory wellness",
    ],
  },
  {
    image: babyCalm.url,
    name_ar: "سيكم بيبي كالم",
    name_en: "SEKEM Baby Calm Granules",
    desc_ar:
      "حبيبات طبيعية مهدئة للأطفال، تركيبة عشبية لطيفة تساعد على الاسترخاء والنوم الهادئ، وتخفف من المغص والانتفاخات.",
    desc_en:
      "Natural soothing granules for babies — a gentle herbal formula to encourage relaxation, restful sleep, and relief from colic and bloating.",
    features_ar: [
      "تركيبة عشبية طبيعية 100%",
      "يساعد على تهدئة الطفل ونومه",
      "يخفف المغص والانتفاخات",
      "آمن للأطفال والرضع",
    ],
    features_en: [
      "100% natural herbal formula",
      "Helps soothe and settle baby",
      "Eases colic and bloating",
      "Safe for infants and toddlers",
    ],
  },
];

export function SekemExtraProducts({
  whatsappNumber,
  accent,
}: {
  whatsappNumber: string;
  accent: string;
}) {
  const { lang, dir } = useLocale();
  const isAr = lang === "ar";
  const heading = isAr ? "مختارات سيكم الرسمية" : "Featured SEKEM Picks";
  const eyebrow = isAr ? "إضافة جديدة" : "New Arrivals";
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
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="hq-eyebrow" style={{ color: accent }}>
            {eyebrow}
          </div>
          <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
            {heading}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
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
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-600">
                  {altName}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink-600">{desc}</p>

                <div className="mt-4">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: accent }}
                  >
                    {featuresLabel}
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs leading-relaxed text-foreground/85"
                      >
                        <span
                          className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full"
                          style={{ background: accent }}
                          aria-hidden
                        />
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
