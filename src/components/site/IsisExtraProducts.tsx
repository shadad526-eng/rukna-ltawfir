import dietTeaCinnamon from "@/assets/isis-products/diet-tea-cinnamon.jpeg.asset.json";
import dietTeaLemon from "@/assets/isis-products/diet-tea-lemon.jpg.asset.json";
import greenTeaMint from "@/assets/isis-products/green-tea-mint.jpeg.asset.json";
import greenTea from "@/assets/isis-products/green-tea.jpeg.asset.json";
import greenCoffee from "@/assets/isis-products/green-coffee.jpg.asset.json";
import barley from "@/assets/isis-products/barley.jpeg.asset.json";
import anise from "@/assets/isis-products/anise.jpg.asset.json";
import oliveOil from "@/assets/isis-products/olive-oil.jpg.asset.json";
import datesSeedless from "@/assets/isis-products/dates-seedless.jpeg.asset.json";
import datesAlmonds from "@/assets/isis-products/dates-almonds.jpeg.asset.json";
import blackSeedHoney from "@/assets/isis-products/black-seed-honey.png.asset.json";
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
    image: datesAlmonds.url,
    name_ar: "تمر سيوة العضوي باللوز",
    name_en: "Organic Siwa Dates with Almonds",
    desc_ar:
      "تمر سيوة طبيعي وعضوي محشو باللوز الفاخر، يقدم تجربة طعم غنية ومغذية. خالٍ من الإضافات الصناعية والسكر المضاف، مثالي كوجبة خفيفة صحية وفاخرة.",
    desc_en:
      "Natural organic Siwa dates filled with premium almonds — a rich, nourishing treat. Free from artificial additives and added sugar; ideal as a healthy, premium snack.",
    features_ar: [
      "طبيعي وعضوي 100%",
      "محشو باللوز الفاخر",
      "غني بالألياف والمعادن",
      "مصدر طاقة طبيعي",
      "بدون سكر مضاف",
    ],
    features_en: [
      "100% natural and organic",
      "Filled with premium almonds",
      "Rich in fiber and minerals",
      "Natural energy source",
      "No added sugar",
    ],
  },
  {
    image: datesSeedless.url,
    name_ar: "تمور سيوة العضوية بدون نوى",
    name_en: "Organic Siwa Dates – Seedless",
    desc_ar:
      "تمر فاخر عضوي 100% من واحة سيوة، مختار بعناية ومفرغ من النوى لتجربة طبيعية صحية وغنية.",
    desc_en:
      "Premium 100% organic dates from Siwa Oasis, carefully selected and pitted for a wholesome, naturally rich experience.",
    features_ar: [
      "عضوي معتمد",
      "جودة ممتازة",
      "بدون نوى",
      "طعم طبيعي غني",
    ],
    features_en: [
      "Certified organic",
      "Premium quality",
      "Seedless",
      "Rich, natural flavor",
    ],
  },
  {
    image: oliveOil.url,
    name_ar: "زيت زيتون عضوي بكر ممتاز إيزيس",
    name_en: "iSiS Organic Extra Virgin Olive Oil",
    desc_ar:
      "زيت زيتون عضوي نقي عالي الجودة، معصور على البارد للحفاظ على فوائده الصحية ونكهته الغنية. مثالي للطهي والسلطات.",
    desc_en:
      "Pure, high-quality organic olive oil, cold-pressed to preserve its health benefits and rich flavor. Perfect for cooking and salads.",
    features_ar: [
      "عضوي معتمد 100%",
      "حموضة أقل من 0.8%",
      "معصور على البارد",
      "طعم غني وفاخر",
    ],
    features_en: [
      "100% certified organic",
      "Acidity below 0.8%",
      "Cold-pressed",
      "Rich, premium taste",
    ],
  },
  {
    image: blackSeedHoney.url,
    name_ar: "عسل حبة البركة",
    name_en: "Black Seed Honey",
    desc_ar:
      "عسل نقي وغني مستخلص بعناية من زهور حبة البركة، يجمع بين المذاق الرائع والفوائد الصحية العديدة.",
    desc_en:
      "Pure, rich honey carefully harvested from black seed (Nigella) blossoms — combining exceptional taste with numerous health benefits.",
    features_ar: [
      "100% طبيعي",
      "غني بمضادات الأكسدة",
      "يعزز المناعة",
      "مصدر للطاقة",
      "نكهة غنية وفريدة",
    ],
    features_en: [
      "100% natural",
      "Rich in antioxidants",
      "Boosts immunity",
      "Natural energy source",
      "Rich, unique flavor",
    ],
  },
  {
    image: barley.url,
    name_ar: "شعير عضوي إيزيس",
    name_en: "iSiS Organic Barley",
    desc_ar:
      "بديل صحي للقهوة خالٍ من الكافيين مصنوع من الشعير العضوي الطبيعي، غني بالنكهة والفوائد الغذائية.",
    desc_en:
      "A healthy caffeine-free coffee alternative made from natural organic barley — rich in flavor and nutritional benefits.",
    features_ar: [
      "خالٍ من الكافيين",
      "شعير عضوي طبيعي 100%",
      "نكهة غنية",
      "بديل صحي للقهوة",
    ],
    features_en: [
      "Caffeine-free",
      "100% natural organic barley",
      "Rich flavor",
      "Healthy coffee substitute",
    ],
  },
  {
    image: dietTeaLemon.url,
    name_ar: "شاي ريجيم بطعم الليمون",
    name_en: "iSiS Diet Tea – Lemon",
    desc_ar:
      "شاي أعشاب طبيعي بتركيبة خاصة للمساعدة في إدارة الوزن كجزء من نظام غذائي متوازن. غني بمكونات طبيعية ومحلى بالستيفيا لتمتع بطعم لذيذ بدون سكر إضافي.",
    desc_en:
      "Natural herbal tea with a special blend to support weight management as part of a balanced diet. Rich in natural ingredients and sweetened with stevia for a delicious sugar-free taste.",
    features_ar: [
      "تركيبة أعشاب طبيعية",
      "محلى بالستيفيا",
      "بدون سكر",
      "يساعد في إنقاص الوزن",
      "نكهة الليمون المنعشة",
    ],
    features_en: [
      "Natural herbal blend",
      "Sweetened with stevia",
      "Sugar-free",
      "Supports weight management",
      "Refreshing lemon flavor",
    ],
  },
  {
    image: dietTeaCinnamon.url,
    name_ar: "شاي ريجيم بطعم القرفة",
    name_en: "iSiS Diet Tea – Cinnamon",
    desc_ar:
      "تركيبة طبيعية لإنقاص الوزن، غنية بالستيفيا بطعم القرفة للمساعدة في خسارة الوزن، نتيجة أسرع وطعم أفضل بدون سكر.",
    desc_en:
      "Natural weight-loss blend rich in stevia with a cinnamon flavor — faster results, better taste, sugar-free.",
    features_ar: [
      "مكونات طبيعية",
      "خالي من السكر",
      "غني بالستيفيا",
      "طعم القرفة المميز",
    ],
    features_en: [
      "Natural ingredients",
      "Sugar-free",
      "Rich in stevia",
      "Distinctive cinnamon flavor",
    ],
  },
  {
    image: greenTeaMint.url,
    name_ar: "شاي أخضر بالنعناع",
    name_en: "Green Tea with Mint",
    desc_ar:
      "مزيج طبيعي 100% من الشاي الأخضر الفاخر مع النعناع المنعش، تجربة مذاق منعشة وصحية.",
    desc_en:
      "A 100% natural blend of premium green tea with refreshing mint — a fresh, healthy tasting experience.",
    features_ar: [
      "طبيعي 100%",
      "غني بمضادات الأكسدة",
      "منعش بالنعناع",
      "يدعم التمثيل الغذائي",
    ],
    features_en: [
      "100% natural",
      "Rich in antioxidants",
      "Refreshing mint",
      "Supports metabolism",
    ],
  },
  {
    image: greenTea.url,
    name_ar: "شاي أخضر",
    name_en: "Green Tea",
    desc_ar:
      "شاي أخضر طبيعي 100% من إيزيس. تجربة فريدة وصحية بمذاق غني يدعم الصحة.",
    desc_en:
      "100% natural green tea from iSiS — a unique, healthy experience with a rich, supportive taste.",
    features_ar: [
      "طبيعي بالكامل",
      "مذاق غني",
      "غني بمضادات الأكسدة",
      "يدعم الصحة",
    ],
    features_en: [
      "Fully natural",
      "Rich taste",
      "Rich in antioxidants",
      "Supports wellness",
    ],
  },
  {
    image: greenCoffee.url,
    name_ar: "قهوة خضراء",
    name_en: "Green Coffee",
    desc_ar:
      "قهوة خضراء فاخرة طبيعية 100% غنية بمضادات الأكسدة لتعزيز صحة الجسم.",
    desc_en:
      "Premium 100% natural green coffee rich in antioxidants to support overall body wellness.",
    features_ar: [
      "طبيعية 100%",
      "تعزز التمثيل الغذائي",
      "غنية بمضادات الأكسدة",
      "تحسن الطاقة والتركيز",
    ],
    features_en: [
      "100% natural",
      "Boosts metabolism",
      "Rich in antioxidants",
      "Improves energy and focus",
    ],
  },
  {
    image: anise.url,
    name_ar: "ينسون",
    name_en: "Anise",
    desc_ar:
      "أكياس شاي طبيعية نقية بنسبة 100% من أجود بذور الينسون العضوي، توفر مشروباً عطرياً ومهدئاً يساعد على الاسترخاء.",
    desc_en:
      "100% pure natural tea bags made from premium organic anise seeds — an aromatic, soothing drink that helps you relax.",
    features_ar: [
      "طبيعي 100%",
      "خالٍ من الكافيين",
      "مهدئ للأعصاب",
      "مساعد للهضم",
    ],
    features_en: [
      "100% natural",
      "Caffeine-free",
      "Soothes the nerves",
      "Aids digestion",
    ],
  },
];

export function IsisExtraProducts({
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
