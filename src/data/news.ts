// News data — simple template. To add a new news item:
// 1) Upload its cover image via `lovable-assets create` into src/assets/news/*.png.asset.json
// 2) Import the cover and append a new entry below with a unique `slug`.
// 3) Fill ar/en title, excerpt, eyebrow, and body paragraphs. Done.

import ykelinCover from "@/assets/news/ykelin-dental-care.png.asset.json";
import monivoCover from "@/assets/news/monivo-vitamin-c.png.asset.json";
import sweetenersCover from "@/assets/news/natural-sweeteners.png.asset.json";

export type NewsItem = {
  slug: string;
  cover: string;
  date: string; // YYYY-MM-DD
  eyebrow: { ar: string; en: string };
  title: { ar: string; en: string };
  excerpt: { ar: string; en: string };
  /** Body paragraphs (plain text, rendered as <p>). */
  body: { ar: string[]; en: string[] };
};

export const NEWS: NewsItem[] = [
  {
    slug: "natural-sweeteners-daily-health",
    cover: sweetenersCover.url,
    date: "2026-05-20",
    eyebrow: { ar: "نصائح صحية", en: "Health tips" },
    title: {
      ar: "فوائد المحليات الطبيعية للصحة اليومية",
      en: "The benefits of natural sweeteners for daily health",
    },
    excerpt: {
      ar: "كيف تساهم المحليات الطبيعية مثل ستيفيا في توازن السكر اليومي وتقليل السعرات.",
      en: "How natural sweeteners like stevia help balance daily sugar intake and reduce calories.",
    },
    body: {
      ar: [
        "أصبح خفض استهلاك السكر من أهم التوصيات الغذائية الحديثة لما له من أثر مباشر على الوزن وصحة القلب وتوازن مستويات السكر في الدم. ومن هنا تبرز أهمية المحليات الطبيعية كبديل عملي يحافظ على المذاق دون تحميل الجسم سعرات إضافية.",
        "تُستخلص ستيفيا من أوراق نبتة Stevia rebaudiana، وتمتاز بكونها خالية تقريبًا من السعرات الحرارية ولا ترفع مستوى السكر في الدم بشكل ملحوظ، ما يجعلها خيارًا مناسبًا لمن يتبعون أنماط غذائية متوازنة أو يهتمون بضبط الوزن.",
        "ضمن منظومة ركن التوفير نقدّم خيارين رئيسيين: Steviola المعتمد على ستيفيا الطبيعية بنسبة 100%، و NO CAL كمحلٍّ منخفض السعرات بصيغة عملية للاستخدام اليومي مع المشروبات الساخنة والوصفات.",
        "للحصول على أفضل نتيجة يُنصح بإدخال المحليات تدريجيًا، وقراءة الملصق الغذائي، والالتزام بالكميات الموصى بها على العبوة. لا تُعدّ هذه المعلومات بديلًا عن الاستشارة الطبية لمن لديهم حالات صحية خاصة.",
      ],
      en: [
        "Reducing added sugar is one of the most consistent modern nutrition recommendations, with direct effects on weight, heart health, and stable blood sugar. Natural sweeteners offer a practical way to keep the taste without extra calories.",
        "Stevia is extracted from the leaves of Stevia rebaudiana. It is virtually calorie-free and does not meaningfully raise blood sugar, which makes it a sensible option within balanced eating patterns or weight-management routines.",
        "Within the Rukn Al-Tawfir ecosystem we offer two complementary choices: Steviola, based on 100% natural stevia, and NO CAL, a low-calorie sweetener formatted for everyday use with hot drinks and recipes.",
        "For best results introduce sweeteners gradually, read the nutrition label, and stay within the serving size printed on the pack. This article is general information and is not a substitute for medical advice for people with specific health conditions.",
      ],
    },
  },
  {
    slug: "vitamin-c-immunity-energy",
    cover: monivoCover.url,
    date: "2026-05-28",
    eyebrow: { ar: "دليل المنتجات", en: "Product guide" },
    title: {
      ar: "دليل فيتامين C وأهميته للمناعة والطاقة",
      en: "Vitamin C: a guide to immunity and daily energy",
    },
    excerpt: {
      ar: "نظرة عملية على دور فيتامين C في دعم المناعة وأفضل ممارسات الجرعة اليومية.",
      en: "A practical look at vitamin C's role in supporting immunity and best-practice daily dosing.",
    },
    body: {
      ar: [
        "فيتامين C من العناصر الغذائية الأساسية التي لا يستطيع الجسم تصنيعها أو تخزينها بكميات كبيرة، لذا يحتاج إلى تجديد منتظم عبر الغذاء أو المكملات المناسبة.",
        "يلعب فيتامين C دورًا داعمًا لجهاز المناعة، ويساهم كمضاد للأكسدة في حماية الخلايا من الإجهاد التأكسدي، إضافةً إلى مساعدته في امتصاص الحديد من المصادر النباتية وتكوين الكولاجين الذي يدعم البشرة والأنسجة.",
        "تقدّم Monivo أقراص استحلاب بنكهات متعددة (برتقال، ليمون ومنثول، نعناع وأوكاليبتوس، فراولة، عسل وبروبوليس) مدعّمة بفيتامين C، بتركيبة خالية من السكر تجعلها مناسبة كخيار يومي مريح.",
        "الجرعة اليومية الموصى بها للبالغين تتراوح عمومًا بين 75 و90 ملغ، مع حدّ أعلى يبلغ 2000 ملغ من جميع المصادر. الالتزام بتعليمات الملصق ومراجعة الطبيب عند وجود حالات مزمنة هو الممارسة الأسلم.",
      ],
      en: [
        "Vitamin C is an essential nutrient that the body cannot synthesize or store in large amounts, so it needs to be replenished regularly through food or a suitable supplement.",
        "It plays a supporting role for the immune system, acts as an antioxidant that helps protect cells from oxidative stress, and improves the absorption of non-heme iron while contributing to collagen formation for skin and connective tissue.",
        "Monivo offers vitamin-C-enriched lozenges in several flavors (orange, lemon & menthol, mint & eucalyptus, strawberry, honey & propolis) in a sugar-free formula, making them a convenient daily option.",
        "Typical adult daily intake recommendations range between 75 and 90 mg, with an upper limit of 2,000 mg from all sources. Always follow the label and consult a physician for chronic conditions.",
      ],
    },
  },
  {
    slug: "daily-dental-care-routine",
    cover: ykelinCover.url,
    date: "2026-06-05",
    eyebrow: { ar: "العناية الشخصية", en: "Personal care" },
    title: {
      ar: "كيف تحافظ على صحة أسنانك يوميًا",
      en: "How to keep your teeth healthy every day",
    },
    excerpt: {
      ar: "روتين بسيط من Y-Kelin للحفاظ على أسنان قوية ولثة سليمة طوال اليوم.",
      en: "A simple Y-Kelin routine for strong teeth and healthy gums throughout the day.",
    },
    body: {
      ar: [
        "صحة الفم لا تقتصر على ابتسامة جميلة، بل تنعكس على صحة الجسم بشكل عام. الروتين اليومي البسيط هو خط الدفاع الأول ضد التسوس والتهابات اللثة.",
        "توصي الجمعيات الطبية بتنظيف الأسنان مرتين يوميًا لمدة دقيقتين في كل مرة، مع استخدام معجون يحتوي على الفلورايد، وتنظيف ما بين الأسنان بالخيط أو الفرشاة البينية مرة واحدة يوميًا على الأقل.",
        "تقدّم Y-Kelin فرشاة Sonic Electric Toothbrush بتقنية صوتية متقدمة، وعمر بطارية طويل، وتصنيف IPX7 للمقاومة الكاملة للماء، مع رؤوس قابلة للاستبدال تناسب مختلف أفراد العائلة.",
        "للحصول على أفضل النتائج: استبدل رأس الفرشاة كل 3 أشهر، تجنّب الضغط الزائد أثناء التنظيف، واحرص على زيارة طبيب الأسنان دوريًا للفحص والتنظيف المهني.",
      ],
      en: [
        "Oral health is not just about a nice smile — it has broader effects on overall wellbeing, and a simple daily routine is the first line of defense against cavities and gum inflammation.",
        "Major dental associations recommend brushing twice a day for two minutes with a fluoride toothpaste, plus cleaning between teeth with floss or an interdental brush at least once a day.",
        "Y-Kelin offers a Sonic Electric Toothbrush with advanced sonic technology, long battery life, an IPX7 waterproof rating, and replaceable heads suitable for the whole family.",
        "For best results, replace the brush head every three months, avoid pressing too hard while brushing, and schedule regular professional check-ups and cleanings.",
      ],
    },
  },
];

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return NEWS.find((n) => n.slug === slug);
}
