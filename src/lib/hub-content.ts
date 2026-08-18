// Editable content schemas + published-copy defaults for the four specialised
// topic-hub pages (sugar alternatives, baby care, oral care, immunity).
//
// The values live in `pages.extra.content` exactly like the corporate pages, and
// every default below is byte-for-byte the copy that is currently published, so
// switching these pages to the CMS changes nothing visually until an
// administrator edits something.
//
// Product and brand data is NOT duplicated here — it keeps coming from the
// database (brands / products / insights).

import type { ContentField, ContentGroup, PageContent } from "@/lib/page-content";

export const HUB_PAGE_SLUGS = [
  "sugar-alternatives",
  "baby-care",
  "oral-care",
  "immunity-vitamin-c",
] as const;
export type HubPageSlug = (typeof HUB_PAGE_SLUGS)[number];

export const HUB_PAGE_LABELS: Record<HubPageSlug, string> = {
  "sugar-alternatives": "بدائل السكر",
  "baby-care": "منتجات الأطفال",
  "oral-care": "العناية بالفم والأسنان",
  "immunity-vitamin-c": "فيتامين C والمناعة",
};

/* ------------------------------------------------------------------ */
/* Field helpers                                                       */
/* ------------------------------------------------------------------ */

const f = (key: string, label: string, hint?: string): ContentField =>
  ({ key, label, ui: "text", bilingual: true, hint });
const ta = (key: string, label: string, hint?: string): ContentField =>
  ({ key, label, ui: "textarea", bilingual: true, hint });
const rich = (key: string, label: string, hint?: string): ContentField =>
  ({ key, label, ui: "rich", bilingual: true, hint });
const head = (key: string, label: string, hint?: string): ContentField =>
  ({ key, label, ui: "heading", bilingual: true, hint });
const flag = (key: string, label = "إظهار هذا القسم"): ContentField =>
  ({ key, label, ui: "toggle", bilingual: false });
const plain = (key: string, label: string, hint?: string): ContentField =>
  ({ key, label, ui: "text", bilingual: false, hint });

const SEO_GROUP: ContentGroup = {
  key: "seo",
  label: "تحسين محركات البحث (SEO)",
  fields: [
    f("seo.title", "عنوان الصفحة في نتائج البحث", "يُفضَّل أقل من 60 حرفًا."),
    ta("seo.desc", "الوصف في نتائج البحث", "يُفضَّل أقل من 160 حرفًا."),
    ta("seo.keywords", "الكلمات المفتاحية", "مفصولة بفواصل."),
  ],
};

const FAQ_REPEATER = {
  key: "faq.items",
  label: "الأسئلة والأجوبة",
  itemFields: [
    { key: "q", label: "السؤال", ui: "text", bilingual: true } as ContentField,
    { key: "a", label: "الإجابة", ui: "rich", bilingual: true } as ContentField,
  ],
};

const LINKS_REPEATER = (key: string, label: string) => ({
  key,
  label,
  hint: "الرابط يُكتب نسبيًا بدون رمز اللغة، مثل: /sugar-alternatives",
  itemFields: [
    { key: "label", label: "النص", ui: "text", bilingual: true } as ContentField,
    { key: "url", label: "الرابط", ui: "text", bilingual: false } as ContentField,
  ],
});

const LIST_REPEATER = (key: string, label: string) => ({
  key,
  label,
  itemFields: [{ key: "text", label: "العنصر", ui: "rich", bilingual: true } as ContentField],
});

/* ------------------------------------------------------------------ */
/* Shared "simple hub" schema (baby / oral / immunity)                 */
/* ------------------------------------------------------------------ */

function simpleHubSchema(opts: {
  secondaryLink?: boolean;
  related?: boolean;
  brandNote?: boolean;
  productsTemplate?: boolean;
}): ContentGroup[] {
  const heroFields: ContentField[] = [
    f("crumb.label", "اسم الصفحة في مسار التنقل"),
    f("hero.eyebrow", "التسمية العلوية"),
    head("hero.title", "العنوان الرئيسي (H1)"),
    rich("hero.subtitle", "النص التعريفي"),
    f("hero.waLabel", "نص زر واتساب"),
    ta("hero.waMsg", "نص رسالة واتساب الجاهزة"),
    f("hero.link1Label", "نص الزر الثانوي الأول"),
  ];
  if (opts.secondaryLink) heroFields.push(f("hero.link2Label", "نص الزر الثانوي الثاني"));

  const productFields: ContentField[] = [flag("products.enabled")];
  if (opts.productsTemplate) {
    productFields.push(
      f("products.titleTemplate", "قالب عنوان قسم كل علامة", "استخدم {brand} مكان اسم العلامة."),
      f("products.emptyTemplate", "نص الرابط عند عدم وجود منتجات", "استخدم {brand} مكان اسم العلامة."),
    );
  } else {
    productFields.push(f("products.eyebrow", "التسمية العلوية"), head("products.title", "العنوان"));
  }
  productFields.push(f("products.caption", "الوصف أسفل صورة المنتج"));

  const groups: ContentGroup[] = [
    SEO_GROUP,
    { key: "hero", label: "المقدمة الرئيسية (Hero)", fields: heroFields },
    {
      key: "overview",
      label: "نظرة عامة",
      fields: [
        flag("overview.enabled"),
        f("overview.eyebrow", "التسمية العلوية"),
        head("overview.title", "العنوان"),
        rich("overview.body", "النص (فقرات)"),
      ],
    },
    { key: "products", label: "قسم المنتجات", fields: productFields },
    {
      key: "faq",
      label: "الأسئلة الشائعة",
      fields: [flag("faq.enabled"), f("faq.eyebrow", "التسمية العلوية"), head("faq.title", "العنوان")],
      repeater: FAQ_REPEATER,
    },
  ];

  if (opts.related) {
    groups.push({
      key: "related",
      label: "مقالات ذات صلة",
      fields: [flag("related.enabled"), f("related.eyebrow", "التسمية العلوية"), head("related.title", "العنوان")],
    });
  }

  groups.push({
    key: "hubs",
    label: "مراكز معرفية أخرى",
    fields: [
      flag("hubs.enabled"),
      f("hubs.eyebrow", "التسمية العلوية"),
      head("hubs.title", "العنوان"),
      rich("hubs.desc", "النص"),
    ],
    repeater: LINKS_REPEATER("hubs.links", "روابط المراكز"),
  });

  if (opts.brandNote) {
    groups.push({
      key: "note",
      label: "شريط العلامة أسفل الصفحة",
      fields: [flag("note.enabled"), f("note.text", "النص بجانب الشعار")],
    });
  }

  return groups;
}

/* ------------------------------------------------------------------ */
/* Schemas                                                             */
/* ------------------------------------------------------------------ */

export const HUB_SCHEMAS: Record<HubPageSlug, ContentGroup[]> = {
  "oral-care": simpleHubSchema({ related: true, brandNote: true }),
  "immunity-vitamin-c": simpleHubSchema({ related: true, brandNote: true }),
  "baby-care": simpleHubSchema({ secondaryLink: true, productsTemplate: true }),
  "sugar-alternatives": [
    SEO_GROUP,
    {
      key: "hero",
      label: "المقدمة الرئيسية (Hero)",
      fields: [
        f("crumb.label", "اسم الصفحة في مسار التنقل"),
        f("hero.eyebrow", "التسمية العلوية"),
        head("hero.title", "العنوان الرئيسي (H1)"),
        rich("hero.subtitle", "النص التعريفي"),
        f("hero.waLabel", "نص زر واتساب"),
        ta("hero.waMsg", "نص رسالة واتساب الجاهزة"),
        f("hero.link1Label", "نص الزر الثانوي الأول"),
        f("hero.link2Label", "نص الزر الثانوي الثاني"),
      ],
    },
    {
      key: "toc",
      label: "محتويات الدليل",
      fields: [flag("toc.enabled"), f("toc.title", "العنوان")],
      repeater: {
        key: "toc.items",
        label: "عناصر الفهرس",
        hint: "المعرّف هو اسم القسم داخل الصفحة (مثل: faq).",
        itemFields: [
          { key: "label", label: "النص", ui: "text", bilingual: true },
          { key: "anchor", label: "المعرّف", ui: "text", bilingual: false },
        ],
      },
    },
    {
      key: "what",
      label: "ما هي بدائل السكر؟",
      fields: [
        flag("what.enabled"),
        f("what.eyebrow", "التسمية العلوية"),
        head("what.title", "العنوان"),
        rich("what.body", "النص (فقرات)"),
      ],
    },
    {
      key: "diff",
      label: "جدول المقارنة",
      fields: [
        flag("diff.enabled"),
        f("diff.eyebrow", "التسمية العلوية"),
        head("diff.title", "العنوان"),
        f("diff.col1", "عنوان العمود الأول"),
        f("diff.col2", "عنوان العمود الثاني"),
        f("diff.col3", "عنوان العمود الثالث"),
      ],
      repeater: {
        key: "diff.rows",
        label: "صفوف الجدول",
        itemFields: [
          { key: "c1", label: "المعيار", ui: "text", bilingual: true },
          { key: "c2", label: "العمود الثاني", ui: "text", bilingual: true },
          { key: "c3", label: "العمود الثالث", ui: "text", bilingual: true },
        ],
      },
    },
    {
      key: "conv",
      label: "دليل التحويل",
      fields: [
        flag("conv.enabled"),
        f("conv.eyebrow", "التسمية العلوية"),
        head("conv.title", "العنوان"),
        rich("conv.intro", "النص التمهيدي"),
        f("conv.col1", "عنوان العمود الأول"),
        f("conv.col2", "عنوان العمود الثاني"),
        f("conv.col3", "عنوان العمود الثالث"),
        f("conv.col4", "عنوان العمود الرابع"),
        f("conv.card1Title", "عنوان البطاقة الأولى"),
        f("conv.card2Title", "عنوان البطاقة الثانية"),
        ta("conv.note", "الملاحظة أسفل القسم"),
      ],
      repeaters: [
        {
          key: "conv.rows",
          label: "صفوف جدول التحويل",
          itemFields: [
            { key: "c1", label: "كمية السكر", ui: "text", bilingual: true },
            { key: "c2", label: "العمود الثاني", ui: "text", bilingual: true },
            { key: "c3", label: "العمود الثالث", ui: "text", bilingual: true },
            { key: "c4", label: "العمود الرابع", ui: "text", bilingual: true },
          ],
        },
        LIST_REPEATER("conv.card1Items", "نقاط البطاقة الأولى"),
        LIST_REPEATER("conv.card2Items", "نقاط البطاقة الثانية"),
      ],
    },
    {
      key: "stevia",
      label: "قسم ستيفيا",
      fields: [
        flag("stevia.enabled"),
        f("stevia.eyebrow", "التسمية العلوية"),
        head("stevia.title", "العنوان"),
        rich("stevia.body", "النص"),
        f("stevia.usesTitle", "عنوان قائمة الاستخدامات"),
      ],
      repeater: LIST_REPEATER("stevia.uses", "قائمة الاستخدامات"),
    },
    {
      key: "steviola",
      label: "قسم Steviola",
      fields: [
        flag("steviola.enabled"),
        f("steviola.eyebrow", "التسمية العلوية"),
        head("steviola.title", "العنوان"),
        rich("steviola.body", "النص"),
        f("steviola.ctaLabel", "نص زر صفحة العلامة"),
        f("steviola.productsTitle", "عنوان قائمة المنتجات"),
      ],
      repeater: LIST_REPEATER("steviola.points", "نقاط المزايا"),
    },
    {
      key: "nocal",
      label: "قسم NO CAL",
      fields: [
        flag("nocal.enabled"),
        f("nocal.eyebrow", "التسمية العلوية"),
        head("nocal.title", "العنوان"),
        rich("nocal.body", "النص"),
        f("nocal.ctaLabel", "نص زر صفحة العلامة"),
        f("nocal.productsTitle", "عنوان قائمة المنتجات"),
      ],
      repeater: LIST_REPEATER("nocal.points", "نقاط المزايا"),
    },
    {
      key: "yemen",
      label: "السوق اليمني",
      fields: [
        flag("yemen.enabled"),
        f("yemen.eyebrow", "التسمية العلوية"),
        head("yemen.title", "العنوان"),
        rich("yemen.body", "النص"),
      ],
      repeater: LIST_REPEATER("yemen.points", "قائمة النقاط"),
    },
    {
      key: "articles",
      label: "مقالات ذات صلة",
      fields: [flag("articles.enabled"), f("articles.eyebrow", "التسمية العلوية"), head("articles.title", "العنوان")],
    },
    {
      key: "faq",
      label: "الأسئلة الشائعة",
      fields: [flag("faq.enabled"), f("faq.eyebrow", "التسمية العلوية"), head("faq.title", "العنوان")],
      repeater: FAQ_REPEATER,
    },
    {
      key: "links",
      label: "روابط مفيدة",
      fields: [flag("links.enabled"), f("links.title", "العنوان")],
      repeater: LINKS_REPEATER("links.items", "الروابط"),
    },
    {
      key: "cta",
      label: "دعوة التواصل",
      fields: [
        flag("cta.enabled"),
        head("cta.title", "العنوان"),
        rich("cta.desc", "النص"),
        f("cta.waLabel", "نص زر واتساب"),
      ],
    },
  ],
};

// Keeps `plain` referenced for schemas that may need non-translated fields.
void plain;

/* ------------------------------------------------------------------ */
/* Defaults — the exact copy currently published                       */
/* ------------------------------------------------------------------ */

type Pair = [string, string];
const bi = (out: PageContent, key: string, [ar, en]: Pair) => {
  out[`${key}_ar`] = ar;
  out[`${key}_en`] = en;
};
const p = (...paras: string[]) => paras.map((x) => `<p>${x}</p>`).join("");
const items = (rows: Pair[]) => rows.map(([ar, en]) => ({ text_ar: ar, text_en: en }));
const faqs = (rows: [string, string, string, string][]) =>
  rows.map(([qa, qe, aa, ae]) => ({ q_ar: qa, q_en: qe, a_ar: aa, a_en: ae }));

function hubLinks(rows: [string, string, string][]) {
  return rows.map(([ar, en, url]) => ({ label_ar: ar, label_en: en, url }));
}

/* ---------------------------- oral care ---------------------------- */

function oralCareDefaults(): PageContent {
  const out: PageContent = {};
  bi(out, "seo.title", [
    "العناية بأطقم الأسنان وصحة الفم — Y-Kelin | ركن التوفير",
    "Denture Care & Advanced Oral Care — Y-Kelin | Rukn Al-Tawfir",
  ]);
  bi(out, "seo.desc", [
    "الدليل الشامل للعناية بأطقم الأسنان وصحة الفم في اليمن: لاصق الأطقم، فرش التقويم، الفرشاة الكهربائية الصوتية، ومنتجات Y-Kelin الرسمية عبر ركن التوفير.",
    "The complete guide to denture care and advanced oral health in Yemen: denture adhesive, orthodontic brushes, sonic electric toothbrush and official Y-Kelin products via Rukn Al-Tawfir.",
  ]);
  bi(out, "seo.keywords", [
    "العناية بأطقم الأسنان, لاصق أطقم الأسنان, فرش أسنان للتقويم, العناية بالفم, Y-Kelin, فرشاة كهربائية, صحة الأسنان, اليمن",
    "denture care, denture adhesive, orthodontic toothbrush, oral care, Y-Kelin, electric toothbrush, dental hygiene, Yemen",
  ]);
  bi(out, "crumb.label", ["العناية بأطقم الأسنان وصحة الفم", "Denture & oral care"]);
  bi(out, "hero.eyebrow", ["الدليل المرجعي", "Authority guide"]);
  bi(out, "hero.title", [
    'العناية بأطقم الأسنان وصحة الفم <span style="color: oklch(0.46 0.16 245)">— الدليل الشامل</span>',
    'Denture Care &amp; Advanced Oral Care <span style="color: oklch(0.46 0.16 245)">— The Complete Guide</span>',
  ]);
  bi(out, "hero.subtitle", [
    "مرجع ركن التوفير كوزمتك للتجارة لكل ما يخصّ العناية بأطقم الأسنان، صحة الفم المتقدمة، فرش التقويم، والفرشاة الكهربائية الصوتية في اليمن، عبر منتجات Y-Kelin الرسمية.",
    "Rukn Al-Tawfir's authoritative reference for denture care, advanced oral hygiene, orthodontic brushes and sonic electric toothbrushes in Yemen, through the official Y-Kelin range.",
  ]);
  bi(out, "hero.waLabel", ["تواصل عبر واتساب", "Inquire on WhatsApp"]);
  bi(out, "hero.waMsg", [
    "السلام عليكم، أرغب بالاستفسار عن منتجات Y-Kelin للعناية بأطقم الأسنان وصحة الفم.",
    "Hello, I'd like to inquire about Y-Kelin denture and oral care products.",
  ]);
  bi(out, "hero.link1Label", ["تصفّح Y-Kelin", "Explore Y-Kelin"]);

  out["overview.enabled"] = true;
  bi(out, "overview.eyebrow", ["نظرة عامة", "Overview"]);
  bi(out, "overview.title", [
    "لماذا تحتاج العناية بالفم وأطقم الأسنان إلى منتجات متخصصة؟",
    "Why oral and denture care need specialized products",
  ]);
  out["overview.body_ar"] = p(
    "تختلف احتياجات العناية بأطقم الأسنان عن العناية اليومية بالأسنان الطبيعية. فالأطقم تحتاج إلى ثبات يمنحها الراحة عند الكلام والمضغ، وإلى نظافة منتظمة تمنع تراكم البلاك والروائح، وإلى أدوات تنظيف لا تخدش سطح الطقم. ومن هنا جاءت تشكيلة Y-Kelin المتخصصة لتقدّم ثلاثة محاور رئيسية: لاصق ثبات الطقم، فرش التنظيف المخصصة، وأقراص أو محاليل التنظيف العميق.",
    "إلى جانب أطقم الأسنان، تتسع الحاجة إلى منتجات متخصصة لمن يرتدون تقويم الأسنان. فالشعيرات العادية لا تصل بسهولة إلى المساحات بين أسلاك التقويم والأسنان، مما يستدعي فرش بشكل V أو فرش بين-أسنان (interdental) تساعد في إزالة بقايا الطعام والبلاك حول أجزاء التقويم. هذه التفاصيل الصغيرة هي ما يفرّق بين روتين عناية فعّال وآخر سطحي.",
    "أما الفرشاة الكهربائية الصوتية مثل Y-Kelin Sonic Electric Toothbrush فتقدّم آلاف الاهتزازات في الدقيقة لتنظيف أعمق مقارنة بالفرشاة اليدوية، مع مقاومة كاملة للماء IPX7 وعمر بطارية طويل يجعلها رفيقًا عمليًا للسفر والاستخدام اليومي. الجمع بين فرشاة كهربائية متطورة وأدوات تنظيف الطقم وفرش التقويم يبني روتينًا متكاملًا يشمل جميع احتياجات الفم في عائلة واحدة.",
    "كل هذه المنتجات متاحة عبر ركن التوفير كوزمتك للتجارة، الوكيل الرسمي لـ Y-Kelin في الجمهورية اليمنية، ويتم التواصل والطلب حصريًا عبر واتساب الأعمال.",
  );
  out["overview.body_en"] = p(
    "Denture care needs differ from daily natural-tooth care. Dentures need stability for comfortable speaking and chewing, regular hygiene to prevent plaque and odor build-up, and cleaning tools that do not scratch the denture surface. That is the reason behind Y-Kelin's three-pillar denture line: denture adhesive, dedicated cleaning brushes, and deep-cleaning tablets or solutions.",
    "Beyond dentures, specialized products matter for orthodontic patients. Regular bristles struggle to reach the spaces between braces wires and teeth, which is why V-shaped or interdental brushes are recommended to remove food debris and plaque around brackets. These small details separate an effective routine from a superficial one.",
    "A sonic electric toothbrush such as the Y-Kelin Sonic Electric Toothbrush adds thousands of vibrations per minute for deeper cleaning compared with a manual brush, with full IPX7 waterproofing and long battery life that makes it a practical travel and daily companion. Pairing an advanced sonic brush with denture cleaning and orthodontic brushes builds a complete routine that covers every mouth-care need in one family.",
    "All of these products are available through Rukn Al-Tawfir Cosmetic for Trade, the official agent for Y-Kelin in the Republic of Yemen, with orders and inquiries handled exclusively via WhatsApp Business.",
  );

  out["products.enabled"] = true;
  bi(out, "products.eyebrow", ["تشكيلة Y-Kelin", "Y-Kelin range"]);
  bi(out, "products.title", ["منتجات العناية بأطقم الأسنان وصحة الفم", "Denture & oral care products"]);
  bi(out, "products.caption", ["العناية بأطقم الأسنان وصحة الفم", "denture & oral care"]);

  out["faq.enabled"] = true;
  bi(out, "faq.eyebrow", ["أسئلة شائعة", "FAQ"]);
  bi(out, "faq.title", [
    "الأسئلة الشائعة حول العناية بأطقم الأسنان",
    "Frequently asked questions on denture & oral care",
  ]);
  out["faq.items"] = faqs([
    [
      "ما هي منتجات العناية بأطقم الأسنان المتوفرة في اليمن؟",
      "Which denture care products are available in Yemen?",
      "تقدّم Y-Kelin عبر ركن التوفير كوزمتك للتجارة تشكيلة متخصصة في العناية بأطقم الأسنان تشمل لاصق أطقم الأسنان، فرش تنظيف الأطقم، وأقراص التنظيف، بأحجام عبوات متنوعة للاستخدام اليومي. [للمراجعة البشرية قبل النشر]",
      "Y-Kelin offers, through Rukn Al-Tawfir Cosmetic for Trade, a specialized denture care range including denture adhesive, denture brushes and cleansing tablets, in several pack sizes for everyday use. [For human review before publication]",
    ],
    [
      "كيف أستخدم لاصق أطقم الأسنان بشكل صحيح؟",
      "How is denture adhesive typically used?",
      "بشكل عام يُوضع لاصق أطقم الأسنان على الطقم النظيف والجاف قبل تركيبه في الفم. تختلف الكمية والطريقة حسب التوصيات المطبوعة على العبوة. [للمراجعة البشرية قبل النشر]",
      "Generally, denture adhesive is applied to a clean and dry denture before placement. The exact amount and method follow the instructions printed on the pack. [For human review before publication]",
    ],
    [
      "ما هي مكوّنات تشكيلة Y-Kelin للعناية بالفم؟",
      "What does the Y-Kelin oral care line include?",
      "تشمل تشكيلة Y-Kelin منتجات للعناية بأطقم الأسنان، فرش أسنان متخصصة (بما فيها فرش للتقويم)، وفرشاة Sonic Electric Toothbrush بتقنية صوتية متقدمة، عمر بطارية طويل، ومقاومة كاملة للماء IPX7. [للمراجعة البشرية قبل النشر]",
      "The Y-Kelin range covers denture care, specialized toothbrushes (including orthodontic brushes), and a Sonic Electric Toothbrush with advanced sonic technology, long battery life and IPX7 full waterproofing. [For human review before publication]",
    ],
    [
      "هل تتوفر فرش أسنان مخصصة لتقويم الأسنان؟",
      "Are orthodontic toothbrushes available?",
      "نعم، تقدّم Y-Kelin فرش أسنان مصمّمة لمن يرتدون تقويم الأسنان، بشكل شعيرات يساعد الوصول حول أسلاك التقويم. [للمراجعة البشرية قبل النشر]",
      "Yes — Y-Kelin offers toothbrushes shaped for users wearing braces, with bristle layouts that help reach around the orthodontic wires. [For human review before publication]",
    ],
    [
      "كم مرة يُنصح بتبديل رأس الفرشاة؟",
      "How often should I replace the brush head?",
      "تتضمن إرشادات العناية بالفم الشائعة تبديل رأس الفرشاة كل 3 أشهر تقريبًا أو عند ظهور علامات التآكل على الشعيرات. [للمراجعة البشرية قبل النشر]",
      "Common oral care guidance is to replace the brush head roughly every 3 months or when the bristles show wear. [For human review before publication]",
    ],
    [
      "كيف أطلب منتجات Y-Kelin في اليمن؟",
      "How do I order Y-Kelin products in Yemen?",
      "تتم جميع الطلبات والاستفسارات حصريًا عبر واتساب الأعمال على الرقم +967 774040383. ركن التوفير كوزمتك للتجارة هو الوكيل الرسمي لـ Y-Kelin في الجمهورية اليمنية. [للمراجعة البشرية قبل النشر]",
      "All orders and inquiries are handled exclusively via WhatsApp Business at +967 774040383. Rukn Al-Tawfir Cosmetic for Trade is the official agent for Y-Kelin in the Republic of Yemen. [For human review before publication]",
    ],
  ]);

  out["related.enabled"] = true;
  bi(out, "related.eyebrow", ["مقالات ذات صلة", "Related articles"]);
  bi(out, "related.title", ["أدلة العناية بالفم والأسنان", "Oral & dental care guides"]);

  out["hubs.enabled"] = true;
  bi(out, "hubs.eyebrow", ["مراكز معرفية أخرى", "Other topic hubs"]);
  bi(out, "hubs.title", ["نمط حياة صحي متكامل", "A complete healthy-lifestyle ecosystem"]);
  bi(out, "hubs.desc", [
    "ركن التوفير يجمع العناية بالفم مع بدائل السكر الصحية، دعم المناعة، ومنتجات الأطفال ضمن منظومة موحّدة.",
    "Rukn Al-Tawfir unites oral care with healthy sugar alternatives, immunity support, and baby care under one ecosystem.",
  ]);
  out["hubs.links"] = hubLinks([
    ["بدائل السكر", "Sugar alternatives", "/sugar-alternatives"],
    ["دعم المناعة وفيتامين C", "Immunity & Vitamin C", "/immunity-vitamin-c"],
    ["العناية بالطفل", "Baby care", "/baby-care"],
  ]);

  out["note.enabled"] = true;
  bi(out, "note.text", [
    "Y-Kelin — متاحة حصريًا عبر ركن التوفير في اليمن.",
    "Y-Kelin — available exclusively via Rukn Al-Tawfir in Yemen.",
  ]);
  return out;
}

/* ------------------------- immunity / vitamin C -------------------- */

function immunityDefaults(): PageContent {
  const out: PageContent = {};
  bi(out, "seo.title", [
    "فيتامين C ودعم المناعة — Monivo | ركن التوفير",
    "Vitamin C & Immune Support — Monivo | Rukn Al-Tawfir",
  ]);
  bi(out, "seo.desc", [
    "الدليل الشامل لفيتامين C ودعم المناعة في اليمن: أقراص استحلاب Monivo الخالية من السكر بنكهات متعددة لدعم المناعة وراحة الحلق عبر ركن التوفير.",
    "Complete guide to vitamin C and immune support in Yemen: sugar-free Monivo lozenges in multiple flavors for immunity and throat comfort, via Rukn Al-Tawfir.",
  ]);
  bi(out, "seo.keywords", [
    "فيتامين سي, دعم المناعة, مصاصات الحلق, Monivo, أقراص استحلاب, مكملات فيتامين C, ركن التوفير, اليمن",
    "vitamin C, immune support, throat lozenges, Monivo, vitamin C supplement, Rukn Al-Tawfir, Yemen",
  ]);
  bi(out, "crumb.label", ["فيتامين C ودعم المناعة", "Vitamin C & immunity"]);
  bi(out, "hero.eyebrow", ["الدليل المرجعي", "Authority guide"]);
  bi(out, "hero.title", [
    'فيتامين C ودعم المناعة <span style="color: oklch(0.46 0.16 245)">— الدليل الشامل</span>',
    'Vitamin C &amp; Immune Support <span style="color: oklch(0.46 0.16 245)">— The Complete Guide</span>',
  ]);
  bi(out, "hero.subtitle", [
    "مرجع ركن التوفير كوزمتك للتجارة لفيتامين C ودعم المناعة في اليمن، عبر أقراص استحلاب Monivo الخالية من السكر بنكهات متعددة لراحة الحلق ودعم نمط حياة صحي.",
    "Rukn Al-Tawfir's authoritative reference for vitamin C and immune support in Yemen, via Monivo's sugar-free lozenges in multiple flavors for throat comfort and a healthy lifestyle.",
  ]);
  bi(out, "hero.waLabel", ["تواصل عبر واتساب", "Inquire on WhatsApp"]);
  bi(out, "hero.waMsg", [
    "السلام عليكم، أرغب بالاستفسار عن منتجات Monivo (فيتامين C).",
    "Hello, I'd like to inquire about Monivo vitamin C products.",
  ]);
  bi(out, "hero.link1Label", ["تصفّح Monivo", "Explore Monivo"]);

  out["overview.enabled"] = true;
  bi(out, "overview.eyebrow", ["نظرة عامة", "Overview"]);
  bi(out, "overview.title", ["لماذا يحظى فيتامين C بهذه الأهمية اليومية؟", "Why daily vitamin C matters"]);
  out["overview.body_ar"] = p(
    "فيتامين C من العناصر الغذائية الأساسية التي لا يستطيع جسم الإنسان تصنيعها أو تخزينها بكميات كبيرة. لذلك يحتاج الجسم إلى تجديد مخزون فيتامين C بانتظام، إما عبر الغذاء (الحمضيات، الفلفل، الخضروات الورقية) أو عبر مكملات عملية مثل أقراص الاستحلاب.",
    "يلعب فيتامين C دورًا داعمًا لجهاز المناعة، ويسهم كمضاد للأكسدة في حماية الخلايا من الإجهاد التأكسدي اليومي. كما يساعد في امتصاص الحديد من المصادر النباتية وتكوين الكولاجين، وهو البروتين الذي يدعم البشرة والأنسجة الضامة. تتراوح التوصيات الغذائية الشائعة للبالغين عمومًا بين 75 و90 ملغ يوميًا، مع حد أعلى يبلغ 2000 ملغ من جميع المصادر.",
    "تأتي Monivo كخيار يومي عملي بصيغة أقراص استحلاب خالية من السكر، بنكهات متعددة (برتقال، ليمون ومنثول، نعناع وأوكاليبتوس، فراولة، عسل وبروبوليس). هذا التنوع في النكهات لا يهدف فقط إلى المتعة، بل يمنح خيارات لراحة الحلق اليومية ولمن يبحثون عن صيغة سهلة الاستخدام أثناء العمل أو السفر.",
    "منتجات Monivo متوفرة في الجمهورية اليمنية حصريًا عبر ركن التوفير كوزمتك للتجارة، ويتم التواصل والطلب عبر واتساب الأعمال. هذا الدليل معلومات عامة ولا يُغني عن الاستشارة الطبية لمن لديهم حالات خاصة.",
  );
  out["overview.body_en"] = p(
    "Vitamin C is an essential nutrient that the human body cannot synthesize or store in large amounts. The body needs to replenish vitamin C regularly, either through food (citrus, peppers, leafy greens) or through practical supplements like lozenges.",
    "Vitamin C plays a supporting role for the immune system and acts as an antioxidant that helps protect cells from daily oxidative stress. It also aids absorption of non-heme iron and contributes to collagen formation — the protein that supports skin and connective tissue. Common dietary references cite around 75–90 mg per day for adults, with an upper limit of 2,000 mg from all sources.",
    "Monivo offers a practical daily option as sugar-free lozenges in multiple flavors (orange, lemon &amp; menthol, mint &amp; eucalyptus, strawberry, honey &amp; propolis). This flavor variety is not only about taste — it provides everyday throat-comfort options and an easy-to-use format during work or travel.",
    "Monivo products are available in the Republic of Yemen exclusively through Rukn Al-Tawfir Cosmetic for Trade, with orders handled via WhatsApp Business. This guide is general information and is not a substitute for medical advice for those with specific conditions.",
  );

  out["products.enabled"] = true;
  bi(out, "products.eyebrow", ["تشكيلة Monivo", "Monivo range"]);
  bi(out, "products.title", ["أقراص استحلاب فيتامين C — Monivo", "Vitamin C lozenges — Monivo"]);
  bi(out, "products.caption", ["فيتامين C ودعم المناعة", "vitamin C & immune support"]);

  out["faq.enabled"] = true;
  bi(out, "faq.eyebrow", ["أسئلة شائعة", "FAQ"]);
  bi(out, "faq.title", [
    "الأسئلة الشائعة حول فيتامين C ودعم المناعة",
    "Frequently asked questions on vitamin C & immunity",
  ]);
  out["faq.items"] = faqs([
    [
      "ما هي منتجات Monivo لدعم المناعة؟",
      "What Monivo products support immunity?",
      "تقدّم Monivo أقراص استحلاب مدعَّمة بفيتامين C بنكهات متعددة (برتقال، ليمون ومنثول، نعناع وأوكاليبتوس، فراولة، عسل وبروبوليس) بتركيبة خالية من السكر، تتوفر بأحجام عبوات يومية. [للمراجعة البشرية قبل النشر]",
      "Monivo offers vitamin C-enriched lozenges in multiple flavors (orange, lemon & menthol, mint & eucalyptus, strawberry, honey & propolis) in a sugar-free formula, in daily-use pack sizes. [For human review before publication]",
    ],
    [
      "ما هو الفرق بين النكهات المختلفة لأقراص Monivo؟",
      "What is the difference between Monivo flavor variants?",
      "تتشابه النكهات في كونها مصاصات استحلاب مدعَّمة بفيتامين C وخالية من السكر، وتختلف بشكل أساسي في الطعم والمكونات المساعدة لراحة الحلق (مثل المنثول أو الأوكاليبتوس أو العسل والبروبوليس). [للمراجعة البشرية قبل النشر]",
      "Flavors share the same vitamin C-enriched, sugar-free lozenge format. They mainly differ in taste and supporting throat-comfort ingredients such as menthol, eucalyptus, or honey and propolis. [For human review before publication]",
    ],
    [
      "هل أقراص Monivo خالية من السكر؟",
      "Are Monivo lozenges sugar-free?",
      "نعم، أقراص Monivo مصمَّمة بتركيبة خالية من السكر، ما يجعلها خيارًا عمليًا لمن يتجنّب السكر في نظامه اليومي. [للمراجعة البشرية قبل النشر]",
      "Yes, Monivo lozenges are formulated sugar-free, making them a practical choice for anyone avoiding sugar in their daily routine. [For human review before publication]",
    ],
    [
      "متى يُفضَّل استخدام أقراص الاستحلاب لراحة الحلق؟",
      "When are throat lozenges typically used?",
      "تُستخدم أقراص الاستحلاب بشكل شائع لتلطيف الحلق عند الإحساس بالخشونة أو الجفاف اليومي، مع الالتزام بالكمية المطبوعة على العبوة. تختلف الاحتياجات الفردية ويُنصح بمراجعة الطبيب عند استمرار الأعراض. [للمراجعة البشرية قبل النشر]",
      "Throat lozenges are commonly used to soothe a scratchy or dry throat sensation, following the daily amount printed on the pack. Individual needs vary; consult a physician if symptoms persist. [For human review before publication]",
    ],
    [
      "هل يحتاج البالغون إلى مكمل فيتامين C يوميًا؟",
      "Do adults need a daily vitamin C supplement?",
      "تختلف الحاجة الفردية لفيتامين C بحسب النظام الغذائي ونمط الحياة. توصي المراجع الغذائية الشائعة عمومًا بـ 75–90 ملغ يوميًا للبالغين، ويمكن الحصول عليه من مزيج بين الغذاء والمكملات. [للمراجعة البشرية قبل النشر]",
      "Individual vitamin C needs vary by diet and lifestyle. General nutrition references commonly cite 75–90 mg daily for adults, achievable through a mix of food and supplements. [For human review before publication]",
    ],
    [
      "كيف أطلب منتجات Monivo في اليمن؟",
      "How do I order Monivo products in Yemen?",
      "جميع الطلبات والاستفسارات تتم حصرًا عبر واتساب الأعمال على الرقم +967 774040383. ركن التوفير كوزمتك للتجارة هو الجهة الموثوقة لتوفير Monivo في الجمهورية اليمنية. [للمراجعة البشرية قبل النشر]",
      "All orders and inquiries are handled exclusively via WhatsApp Business at +967 774040383. Rukn Al-Tawfir Cosmetic for Trade is the trusted source for Monivo in the Republic of Yemen. [For human review before publication]",
    ],
  ]);

  out["related.enabled"] = true;
  bi(out, "related.eyebrow", ["مقالات ذات صلة", "Related articles"]);
  bi(out, "related.title", ["أدلة دعم المناعة وفيتامين C", "Immunity & vitamin C guides"]);

  out["hubs.enabled"] = true;
  bi(out, "hubs.eyebrow", ["مراكز معرفية أخرى", "Other topic hubs"]);
  bi(out, "hubs.title", ["صحة متكاملة لكل أفراد العائلة", "A complete wellness ecosystem"]);
  bi(out, "hubs.desc", [
    "دعم المناعة جزء من نمط حياة صحي يشمل بدائل السكر الصحية، والعناية بالطفل، وصحة الفم.",
    "Immune support is part of a wider healthy lifestyle including sugar alternatives, baby care, and oral health.",
  ]);
  out["hubs.links"] = hubLinks([
    ["بدائل السكر", "Sugar alternatives", "/sugar-alternatives"],
    ["العناية بأطقم الأسنان", "Denture & oral care", "/oral-care"],
    ["العناية بالطفل", "Baby care", "/baby-care"],
  ]);

  out["note.enabled"] = true;
  bi(out, "note.text", [
    "Monivo — متاحة حصريًا عبر ركن التوفير في اليمن.",
    "Monivo — available exclusively via Rukn Al-Tawfir in Yemen.",
  ]);
  return out;
}

/* ------------------------------ baby care -------------------------- */

function babyCareDefaults(): PageContent {
  const out: PageContent = {};
  bi(out, "seo.title", [
    "منتجات الأطفال في اليمن — Baby Tawfir و Bambo | ركن التوفير",
    "Baby Care in Yemen — Baby Tawfir & Bambo | Rukn Al-Tawfir",
  ]);
  bi(out, "seo.desc", [
    "منتجات الأطفال في اليمن: مناديل مبللة، حفاضات إيكولوجية، والعناية ببشرة الرضّع عبر Baby Tawfir و Bambo من ركن التوفير.",
    "Baby care in Yemen: wet wipes, eco diapers and infant skincare via Baby Tawfir and Bambo from Rukn Al-Tawfir.",
  ]);
  bi(out, "seo.keywords", [
    "منتجات الأطفال, مناديل مبللة للأطفال, العناية ببشرة الطفل, حفاضات إيكولوجية, Bambo, Baby Tawfir, ركن التوفير, اليمن",
    "baby care, baby wet wipes, eco diapers, baby skin care, Bambo, Baby Tawfir, Rukn Al-Tawfir, Yemen",
  ]);
  bi(out, "crumb.label", ["منتجات الأطفال", "Baby care"]);
  bi(out, "hero.eyebrow", ["الدليل المرجعي", "Authority guide"]);
  bi(out, "hero.title", [
    'منتجات الأطفال والعناية بالطفل <span style="color: oklch(0.46 0.16 245)">— الدليل الشامل</span>',
    'Baby Products &amp; Baby Care <span style="color: oklch(0.46 0.16 245)">— The Complete Guide</span>',
  ]);
  bi(out, "hero.subtitle", [
    "مرجع ركن التوفير كوزمتك للتجارة لمنتجات الأطفال في اليمن: المناديل المبللة من Baby Tawfir، الحفاضات الإيكولوجية من Bambo، والعناية اليومية ببشرة الطفل.",
    "Rukn Al-Tawfir's authoritative reference for baby products in Yemen: Baby Tawfir wet wipes, Bambo eco diapers, and everyday baby skin care.",
  ]);
  bi(out, "hero.waLabel", ["تواصل عبر واتساب", "Inquire on WhatsApp"]);
  bi(out, "hero.waMsg", [
    "السلام عليكم، أرغب بالاستفسار عن منتجات الأطفال (Baby Tawfir / Bambo).",
    "Hello, I'd like to inquire about baby products (Baby Tawfir / Bambo).",
  ]);
  bi(out, "hero.link1Label", ["تصفّح Baby Tawfir", "Explore Baby Tawfir"]);
  bi(out, "hero.link2Label", ["تصفّح Bambo", "Explore Bambo"]);

  out["overview.enabled"] = true;
  bi(out, "overview.eyebrow", ["نظرة عامة", "Overview"]);
  bi(out, "overview.title", [
    "لماذا تستحق العناية بالطفل منتجات متخصصة؟",
    "Why baby care needs specialized products",
  ]);
  out["overview.body_ar"] = p(
    "بشرة الطفل أرقّ من بشرة البالغ بعدة طبقات، وتفقد الرطوبة بسرعة أكبر وتتأثر بسهولة بالاحتكاك والمواد الكيميائية القوية. لهذا فإن اختيار منتجات الأطفال — من المناديل المبللة إلى الحفاضات — ليس قرارًا تجميليًا بل قرار يخصّ صحة بشرة الرضيع وراحته اليومية.",
    "تركّز Baby Tawfir على تشكيلة عملية من المناديل المبللة بصيغ مدروسة لعمليات تغيير الحفاض المتكررة وتنظيف اليدين والوجه، بحيث يبقى التنظيف لطيفًا وسريعًا دون الحاجة إلى ماء وصابون في كل مرة. بينما تأتي Bambo كعلامة دانماركية متخصصة في الحفاضات الإيكولوجية المختبَرة دلائلياً للبشرة الحساسة، مع التزام واضح بمعايير الاستدامة والتغليف المسؤول.",
    "الجمع بين هاتين العلامتين يمنح الأسر روتينًا متكاملًا للعناية بالطفل: حفاضات لطيفة وعالية الامتصاص، ومناديل مبللة للاستخدام اليومي، بحيث تقلّ احتمالات تهيّج البشرة وتزداد ساعات الراحة لكل من الطفل ووالديه. تأتي العبوات بأحجام متعددة تناسب الاستخدام المنزلي والسفر.",
    "جميع هذه المنتجات متوفرة في الجمهورية اليمنية عبر ركن التوفير كوزمتك للتجارة، ويتم الطلب والاستفسار حصريًا عبر واتساب الأعمال.",
  );
  out["overview.body_en"] = p(
    "Baby skin is several layers thinner than adult skin, loses moisture faster, and reacts more easily to friction and harsh chemicals. Choosing baby care — from wet wipes to diapers — is not a cosmetic decision but one that directly affects a child's skin health and daily comfort.",
    "Baby Tawfir focuses on a practical wet-wipe range formulated for frequent diaper changes and hand/face cleaning, so cleaning stays gentle and quick without needing soap and water every time. Bambo, in turn, is a Danish brand specialized in eco diapers dermatologically tested for sensitive skin, with a clear commitment to sustainability and responsible packaging.",
    "Together, both brands give families a complete baby care routine: gentle, highly-absorbent diapers and daily wet wipes — reducing the risk of skin irritation and increasing comfort for both baby and parents. Pack sizes are available for home and travel use.",
    "All of these products are available in the Republic of Yemen through Rukn Al-Tawfir Cosmetic for Trade, with orders and inquiries handled exclusively via WhatsApp Business.",
  );

  out["products.enabled"] = true;
  bi(out, "products.titleTemplate", ["منتجات {brand}", "{brand} products"]);
  bi(out, "products.emptyTemplate", ["تصفّح صفحة {brand}", "Browse the {brand} brand page"]);
  bi(out, "products.caption", ["منتجات العناية بالطفل", "baby care"]);

  out["faq.enabled"] = true;
  bi(out, "faq.eyebrow", ["أسئلة شائعة", "FAQ"]);
  bi(out, "faq.title", ["الأسئلة الشائعة حول منتجات الأطفال", "Frequently asked questions on baby care"]);
  out["faq.items"] = faqs([
    [
      "ما هي منتجات العناية بالطفل المتوفرة لدى ركن التوفير؟",
      "Which baby care products are available at Rukn Al-Tawfir?",
      "يقدّم ركن التوفير كوزمتك للتجارة تشكيلتي Baby Tawfir و Bambo، وتشمل المناديل المبللة للأطفال ولوازم العناية اليومية بالرضّع، بأحجام عبوات متعددة. [للمراجعة البشرية قبل النشر]",
      "Rukn Al-Tawfir Cosmetic for Trade offers Baby Tawfir and Bambo ranges, including baby wet wipes and everyday infant essentials in various pack sizes. [For human review before publication]",
    ],
    [
      "ما الذي يميّز حفاضات Bambo الإيكولوجية؟",
      "What makes Bambo eco diapers distinctive?",
      "Bambo علامة دانماركية معروفة بحفاضاتها الإيكولوجية المختبَرة دلائلياً للبشرة الحساسة، مع التزام بمعايير الاستدامة والتغليف المسؤول. [للمراجعة البشرية قبل النشر]",
      "Bambo is a Danish brand known for eco diapers dermatologically tested for sensitive skin, with a strong sustainability and responsible-packaging commitment. [For human review before publication]",
    ],
    [
      "هل المناديل المبللة من Baby Tawfir مناسبة للاستخدام اليومي؟",
      "Are Baby Tawfir wet wipes suitable for daily use?",
      "تأتي مناديل Baby Tawfir بصيغ مصمَّمة للاستخدام اليومي لتغيير الحفاض وتنظيف اليدين والوجه. يُفضَّل قراءة الملصق على العبوة للتأكد من ملاءمة الصيغة لعمر الطفل. [للمراجعة البشرية قبل النشر]",
      "Baby Tawfir wet wipes come in formats designed for daily diaper changes and hand/face cleaning. We recommend reading the pack label to confirm the formula fits the child's age. [For human review before publication]",
    ],
    [
      "كيف يمكنني الحفاظ على بشرة الطفل أثناء تغيير الحفاض؟",
      "How can I look after baby skin during diaper changes?",
      "تتضمن الممارسات الشائعة تغيير الحفاض بانتظام، التجفيف اللطيف للبشرة، واستخدام مناديل لطيفة وحفاضات مناسبة للحجم. تختلف التوصيات حسب عمر الطفل ونوع البشرة. [للمراجعة البشرية قبل النشر]",
      "Common practices include frequent diaper changes, gentle drying, and using mild wipes and correctly-sized diapers. Recommendations vary by age and skin type. [For human review before publication]",
    ],
    [
      "هل منتجات Bambo و Baby Tawfir معتمدة وآمنة؟",
      "Are Bambo and Baby Tawfir products certified?",
      "تحمل علامة Bambo اعتمادات أوروبية شائعة في فئة الحفاضات الإيكولوجية، ويتم تصنيع منتجات Baby Tawfir وفق معايير صناعية معتمدة لمنتجات الأطفال. [للمراجعة البشرية قبل النشر]",
      "Bambo carries widely-recognized European certifications for the eco diaper category, and Baby Tawfir products are manufactured to recognized industry standards for baby products. [For human review before publication]",
    ],
    [
      "كيف أطلب منتجات الأطفال في اليمن؟",
      "How do I order baby products in Yemen?",
      "جميع الطلبات والاستفسارات حصرًا عبر واتساب الأعمال على الرقم +967 774040383. ركن التوفير كوزمتك للتجارة هو الجهة الموثوقة لتوفير Baby Tawfir و Bambo في الجمهورية اليمنية. [للمراجعة البشرية قبل النشر]",
      "All orders and inquiries are handled exclusively via WhatsApp Business at +967 774040383. Rukn Al-Tawfir Cosmetic for Trade is the trusted source for Baby Tawfir and Bambo in the Republic of Yemen. [For human review before publication]",
    ],
  ]);

  out["hubs.enabled"] = true;
  bi(out, "hubs.eyebrow", ["مراكز معرفية أخرى", "Other topic hubs"]);
  bi(out, "hubs.title", ["صحة العائلة بأكملها", "Whole-family wellbeing"]);
  bi(out, "hubs.desc", [
    "العناية بالطفل تتكامل مع نمط حياة صحي للعائلة — بدائل سكر صحية، دعم المناعة، وعناية متقدمة بالفم.",
    "Baby care fits into a wider healthy family lifestyle — healthy sugar alternatives, immunity support, and advanced oral care.",
  ]);
  out["hubs.links"] = hubLinks([
    ["بدائل السكر", "Sugar alternatives", "/sugar-alternatives"],
    ["دعم المناعة وفيتامين C", "Immunity & Vitamin C", "/immunity-vitamin-c"],
    ["العناية بأطقم الأسنان", "Denture & oral care", "/oral-care"],
  ]);
  return out;
}

/* -------------------------- sugar alternatives --------------------- */

function sugarDefaults(): PageContent {
  const out: PageContent = {};
  bi(out, "seo.title", [
    "بدائل السكر في اليمن — Steviola و NO CAL | ركن التوفير",
    "Sugar Alternatives in Yemen — Steviola & NO CAL | Rukn Al-Tawfir",
  ]);
  bi(out, "seo.desc", [
    "دليل بدائل السكر الصحية في اليمن: ستيفيا طبيعية، محليات خالية من السعرات لمرضى السكري، ودليل التحويل بين الستيفيا والسكر.",
    "Healthy sugar alternatives in Yemen: natural stevia, zero-calorie sweeteners for diabetics, plus a stevia-to-sugar conversion guide.",
  ]);
  bi(out, "seo.keywords", [
    "بدائل السكر, بديل السكر, محليات صحية, محليات طبيعية, ستيفيا, ستيفيولا, نوكال, Steviola, NO CAL, محلي لمرضى السكري, بدائل السكر في اليمن, محليات بدون أسبارتام, سكر دايت",
    "sugar alternatives, sugar substitutes, natural sweeteners, stevia, Steviola, NO CAL, diabetic sweeteners, Yemen",
  ]);
  bi(out, "crumb.label", ["بدائل السكر", "Sugar alternatives"]);
  bi(out, "hero.eyebrow", ["الدليل المرجعي", "Authority guide"]);
  bi(out, "hero.title", [
    'بدائل السكر في اليمن <span style="color: oklch(0.46 0.16 245)">— الدليل الشامل</span>',
    'Sugar Alternatives in Yemen <span style="color: oklch(0.46 0.16 245)">— The Complete Guide</span>',
  ]);
  bi(out, "hero.subtitle", [
    "مرجع ركن التوفير كوزمتك للتجارة لكل ما يخصّ بدائل السكر الصحية والمحليات الطبيعية في اليمن. نشرح الفروق بين السكر والمحليات، ونقدّم خيارات Steviola (ستيفيولا) و NO CAL (نوكال) الموثوقة لمرضى السكري ومتّبعي الحميات، مع إجابات عملية لأكثر الأسئلة شيوعًا.",
    "Rukn Al-Tawfir's authoritative reference for healthy sugar alternatives and natural sweeteners in Yemen. We explain the difference between sugar and sweeteners, present the trusted Steviola and NO CAL options for diabetics and dieters, and answer the most common practical questions.",
  ]);
  bi(out, "hero.waLabel", ["تواصل عبر واتساب", "Inquire on WhatsApp"]);
  bi(out, "hero.waMsg", [
    "السلام عليكم، أرغب بالاستفسار عن بدائل السكر المتوفرة (Steviola / NO CAL).",
    "Hello, I'd like to inquire about your sugar alternatives (Steviola / NO CAL).",
  ]);
  bi(out, "hero.link1Label", ["تصفّح Steviola", "Explore Steviola"]);
  bi(out, "hero.link2Label", ["تصفّح NO CAL", "Explore NO CAL"]);

  out["toc.enabled"] = true;
  bi(out, "toc.title", ["محتويات الدليل", "On this page"]);
  out["toc.items"] = [
    ["ما هي بدائل السكر؟", "What are sugar alternatives?", "what"],
    ["الفرق بين السكر والمحليات", "Sugar vs. sweeteners", "diff"],
    ["ستيفيا — المحلي الطبيعي", "Stevia — the natural sweetener", "stevia"],
    ["Steviola (ستيفيولا)", "Steviola", "steviola"],
    ["NO CAL (نوكال)", "NO CAL", "nocal"],
    ["بدائل السكر في اليمن", "Sugar alternatives in Yemen", "yemen"],
    ["مقالات ذات صلة", "Related articles", "articles"],
    ["الأسئلة الشائعة", "Frequently asked questions", "faq"],
  ].map(([ar, en, anchor]) => ({ label_ar: ar, label_en: en, anchor }));

  out["what.enabled"] = true;
  bi(out, "what.eyebrow", ["تعريف", "Definition"]);
  bi(out, "what.title", ["ما هي بدائل السكر؟", "What are sugar alternatives?"]);
  out["what.body_ar"] = p(
    "بدائل السكر هي مواد تمنح المذاق الحلو دون أن تحمل السعرات الحرارية العالية للسكر التقليدي (السكروز). تنقسم إلى محليات طبيعية مستخلصة من النباتات مثل الستيفيا، ومحليات منخفضة السعرات مصمّمة لتقديم خيار يومي عملي لمن يرغب في خفض استهلاك السكر، أو لمرضى السكري الذين يحتاجون إلى ضبط مؤشر السكر في الدم.",
    "في اليمن، يتنامى الطلب على البدائل الصحية مع تزايد الوعي بالأنماط الغذائية المتوازنة. توفّر ركن التوفير كوزمتك للتجارة، الوكيل الحصري في الجمهورية اليمنية لعدد من العلامات العالمية، خيارات موثوقة مفحوصة بمواصفات دولية.",
  );
  out["what.body_en"] = p(
    "Sugar alternatives are substances that provide a sweet taste without the high calories of regular sugar (sucrose). They include natural sweeteners extracted from plants — such as stevia — and low-calorie sweeteners designed for daily use by those reducing sugar intake or by diabetics who need to manage blood-sugar response.",
    "Demand for healthy alternatives is growing in Yemen with rising awareness of balanced eating. Rukn Al-Tawfir Cosmetic for Trade — exclusive agent in Yemen for several international brands — provides trusted, internationally compliant options.",
  );

  out["diff.enabled"] = true;
  bi(out, "diff.eyebrow", ["مقارنة", "Comparison"]);
  bi(out, "diff.title", [
    "الفرق بين السكر التقليدي والمحليات الصحية",
    "Regular sugar vs. healthy sweeteners",
  ]);
  bi(out, "diff.col1", ["المعيار", "Criterion"]);
  bi(out, "diff.col2", ["السكر التقليدي", "Regular sugar"]);
  bi(out, "diff.col3", ["المحليات الطبيعية", "Natural sweeteners"]);
  out["diff.rows"] = [
    ["السعرات الحرارية", "Calories", "~387 سعرة / 100 جم", "~387 kcal / 100 g", "≈ 0 سعرة", "≈ 0 kcal"],
    ["مؤشر السكر", "Glycemic index", "65 (مرتفع)", "65 (high)", "0 (لا يرفع السكر)", "0 (no blood-sugar spike)"],
    ["مناسب لمرضى السكري", "Diabetic-friendly", "لا", "No", "نعم", "Yes"],
    ["ملائم للحميات", "Diet-friendly", "لا", "No", "نعم", "Yes"],
    ["الثبات الحراري", "Heat-stable", "نعم", "Yes", "نعم", "Yes"],
  ].map(([a1, e1, a2, e2, a3, e3]) => ({
    c1_ar: a1, c1_en: e1, c2_ar: a2, c2_en: e2, c3_ar: a3, c3_en: e3,
  }));

  out["conv.enabled"] = true;
  bi(out, "conv.eyebrow", ["دليل التحويل", "Conversion guide"]);
  bi(out, "conv.title", [
    "دليل تحويل الستيفيا مقابل السكر — للطبخ والمشروبات",
    "Stevia vs sugar conversion guide — for cooking and beverages",
  ]);
  bi(out, "conv.intro", [
    "الستيفيا النقية أحلى من السكر بنحو 200–300 مرة، لذلك يُستبدل السكر بكميات صغيرة جدًا. الجدول التالي يعرض النِسَب التقريبية باستخدام Steviola (نقط ومسحوق) و NO CAL (أكياس وحجم عائلي) لتحلية المشروبات والخبز. المقادير إرشادية — عدّلها حسب ذوقك واقرأ الملصق دائمًا.",
    "Pure stevia is roughly 200–300× sweeter than sugar, so it replaces sugar in very small amounts. The table below shows approximate ratios using Steviola (drops & powder) and NO CAL (sachets & family-size) for beverages and baking. Values are guidance — adjust to taste and always check the pack label.",
  ]);
  bi(out, "conv.col1", ["كمية السكر", "Amount of sugar"]);
  bi(out, "conv.col2", ["Steviola نقط", "Steviola drops"]);
  bi(out, "conv.col3", ["Steviola / NO CAL مسحوق", "Steviola / NO CAL powder"]);
  bi(out, "conv.col4", ["NO CAL أكياس", "NO CAL sachets"]);
  out["conv.rows"] = [
    ["1 ملعقة صغيرة (4 جم)", "1 tsp (4 g)", "2–3 نقط", "2–3 drops", "⅛ ملعقة صغيرة", "⅛ tsp", "1 كيس", "1 sachet"],
    ["1 ملعقة كبيرة (12 جم)", "1 tbsp (12 g)", "6–9 نقط", "6–9 drops", "⅓ ملعقة صغيرة", "⅓ tsp", "3 أكياس", "3 sachets"],
    ["¼ كوب (50 جم)", "¼ cup (50 g)", "24 نقطة", "24 drops", "1½ ملعقة صغيرة", "1½ tsp", "12 كيس", "12 sachets"],
    ["½ كوب (100 جم)", "½ cup (100 g)", "48 نقطة", "48 drops", "1 ملعقة كبيرة", "1 tbsp", "24 كيس", "24 sachets"],
    ["1 كوب (200 جم)", "1 cup (200 g)", "—", "—", "2 ملعقة كبيرة", "2 tbsp", "الحجم العائلي", "Use family-size"],
  ].map(([a1, e1, a2, e2, a3, e3, a4, e4]) => ({
    c1_ar: a1, c1_en: e1, c2_ar: a2, c2_en: e2, c3_ar: a3, c3_en: e3, c4_ar: a4, c4_en: e4,
  }));
  bi(out, "conv.card1Title", ["للمشروبات (شاي، قهوة، عصائر)", "For beverages (tea, coffee, juice)"]);
  out["conv.card1Items"] = items([
    ["ابدأ بنقطتين من Steviola لكل كوب واذق قبل الزيادة.", "Start with 2 drops of Steviola per cup and taste before adding more."],
    ["لتحلية إبريق شاي 1 لتر: 8–12 نقطة.", "For a 1-litre teapot: 8–12 Steviola drops."],
    ["كيس NO CAL واحد يعادل ملعقة سكر صغيرة تقريبًا.", "One NO CAL sachet ≈ 1 teaspoon of sugar."],
  ]);
  bi(out, "conv.card2Title", ["للخبز والحلويات", "For baking and desserts"]);
  out["conv.card2Items"] = items([
    ["استخدم الحجم العائلي المخصص للخبز لضمان الحجم والقوام.", "Use the family-size baking pack to preserve batter volume and texture."],
    ["لتعويض حجم السكر أضف ملعقة زبادي أو تفاح مبشور لكل كوب.", "Compensate the missing sugar bulk with a tablespoon of yogurt or grated apple per cup."],
    ["الستيفيا ثابتة حراريًا حتى 200°م، مناسبة للفرن.", "Stevia is heat-stable up to 200°C — oven-safe."],
  ]);
  bi(out, "conv.note", [
    "ملاحظة: النِسَب تقديرية وقد تختلف حسب صيغة المنتج. راجع الملصق على العبوة، واستشر طبيبك في حالات السكري أو الحمل.",
    "Note: ratios are approximate and vary by product formulation. Check the pack label, and consult your physician for diabetes or pregnancy.",
  ]);

  out["stevia.enabled"] = true;
  bi(out, "stevia.eyebrow", ["النبتة", "The plant"]);
  bi(out, "stevia.title", [
    "ستيفيا — المحلي الطبيعي الأول عالميًا",
    "Stevia — the world's leading natural sweetener",
  ]);
  bi(out, "stevia.body", [
    "ستيفيا (Stevia rebaudiana) نبتة جنوب أمريكية تُستخلص من أوراقها مركّبات حلوة (الستيفيوسيد والريباوديوسيد) تصل حلاوتها إلى 200–300 ضعف حلاوة السكر العادي مع صفر سعرات حرارية تقريبًا. اعتُمدت ستيفيا من قِبل هيئات صحية دولية، واستُخدمت لعقود في اليابان وأمريكا الجنوبية قبل انتشارها عالميًا.",
    "Stevia (Stevia rebaudiana) is a South American plant whose leaves yield sweet compounds (stevioside and rebaudioside) up to 200–300 times sweeter than regular sugar, with near-zero calories. Stevia has been approved by international health authorities and used for decades in Japan and South America before its global expansion.",
  ]);
  bi(out, "stevia.usesTitle", ["أبرز استخدامات ستيفيا", "Key uses of stevia"]);
  out["stevia.uses"] = items([
    ["تحلية المشروبات الساخنة (الشاي، القهوة، الأعشاب).", "Sweetening hot drinks (tea, coffee, herbal infusions)."],
    ["تحلية العصائر والمشروبات الباردة.", "Sweetening juices and cold beverages."],
    ["الخبز والحلويات بأحجام عائلية مخصصة للطهي.", "Baking and desserts using family-size cooking packs."],
    ["حمية مرضى السكري والحميات منخفضة الكربوهيدرات.", "Diabetic diets and low-carb meal plans."],
  ]);

  out["steviola.enabled"] = true;
  bi(out, "steviola.eyebrow", ["العلامة", "Brand"]);
  bi(out, "steviola.title", ["Steviola (ستيفيولا) — ستيفيا طبيعية 100%", "Steviola — 100% natural stevia"]);
  bi(out, "steviola.body", [
    "Steviola هي علامة محليات الستيفيا الطبيعية المعتمدة بنسبة 100%، تأتي بصيغ عملية (نقط، أقراص، أكياس وحجم عائلي للخبز والطهي). خالية من السعرات، خالية من الأسبارتام، بدون طعم مرارة، ومثالية لمرضى السكري ومتّبعي الحميات.",
    "Steviola is the 100% natural stevia-based sweetener brand, available in practical formats (drops, tablets, sachets and family-size for baking and cooking). Zero-calorie, aspartame-free, no bitter aftertaste, and ideal for diabetics and dieters.",
  ]);
  out["steviola.points"] = items([
    ["100% ستيفيا طبيعية", "100% natural stevia"],
    ["صفر سعرات حرارية", "Zero calories"],
    ["خالٍ من الأسبارتام", "Aspartame-free"],
    ["مناسب لمرضى السكري", "Diabetic-friendly"],
  ]);
  bi(out, "steviola.ctaLabel", ["صفحة Steviola الكاملة", "Full Steviola page"]);
  bi(out, "steviola.productsTitle", ["منتجات Steviola", "Steviola products"]);

  out["nocal.enabled"] = true;
  bi(out, "nocal.eyebrow", ["العلامة", "Brand"]);
  bi(out, "nocal.title", ["NO CAL (نوكال) — محلٍّ منخفض السعرات", "NO CAL — low-calorie sweetener"]);
  bi(out, "nocal.body", [
    "NO CAL محلٍّ منخفض السعرات الحرارية بتركيبة عملية للاستخدام اليومي. متوفر بأحجام عائلية مناسبة للخبز والطهي، وخالٍ من الأسبارتام في الحجم العائلي، وآمن لمرضى السكري ضمن نظام غذائي متوازن.",
    "NO CAL is a low-calorie sweetener with a practical everyday formula. Available in family-size packs suitable for baking and cooking, aspartame-free in the family size, and safe for diabetics as part of a balanced diet.",
  ]);
  out["nocal.points"] = items([
    ["تركيبة عملية للاستخدام اليومي", "Practical everyday formula"],
    ["حجم عائلي للخبز والطهي", "Family-size for baking & cooking"],
    ["خالٍ من الأسبارتام (الحجم العائلي)", "Aspartame-free (family size)"],
    ["آمن لمرضى السكري", "Safe for diabetics"],
  ]);
  bi(out, "nocal.ctaLabel", ["صفحة NO CAL الكاملة", "Full NO CAL page"]);
  bi(out, "nocal.productsTitle", ["منتجات NO CAL", "NO CAL products"]);

  out["yemen.enabled"] = true;
  bi(out, "yemen.eyebrow", ["السوق اليمني", "Yemen market"]);
  bi(out, "yemen.title", [
    "بدائل السكر في اليمن: لماذا تختار ركن التوفير؟",
    "Sugar alternatives in Yemen: why choose Rukn Al-Tawfir?",
  ]);
  bi(out, "yemen.body", [
    "ركن التوفير كوزمتك للتجارة هو الوكيل الحصري في الجمهورية اليمنية لعلامتي Steviola و NO CAL، إضافة إلى منظومة من العلامات الصحية والاستهلاكية العالمية. يضمن هذا التمثيل الحصري وصول منتجات أصلية بمواصفات مطابقة، عبر قنوات توزيع موثوقة في المحافظات الرئيسية.",
    "Rukn Al-Tawfir Cosmetic for Trade is the exclusive agent in Yemen for both Steviola and NO CAL, alongside a portfolio of international health and consumer brands. This exclusive representation ensures authentic, spec-compliant products are delivered through trusted distribution channels across major governorates.",
  ]);
  out["yemen.points"] = items([
    ["وكيل حصري مرخّص في الجمهورية اليمنية.", "Licensed exclusive agent in the Republic of Yemen."],
    ["منتجات أصلية بضمان العلامة.", "Authentic products with brand-backed guarantee."],
    ["قنوات توزيع للجملة والتجزئة.", "Wholesale and retail distribution channels."],
    ["خدمة استفسار وطلب مباشرة عبر واتساب الأعمال.", "Direct inquiry & order service via WhatsApp Business."],
  ]);

  out["articles.enabled"] = true;
  bi(out, "articles.eyebrow", ["أدلة بدائل السكر", "Sugar-alternatives guides"]);
  bi(out, "articles.title", ["مقالات ذات صلة", "Related articles"]);

  out["faq.enabled"] = true;
  bi(out, "faq.eyebrow", ["الأسئلة الشائعة", "FAQ"]);
  bi(out, "faq.title", [
    "أسئلة يطرحها العملاء حول بدائل السكر",
    "Common customer questions about sugar alternatives",
  ]);
  out["faq.items"] = faqs([
    [
      "ما هي أفضل بدائل السكر المتوفرة في اليمن؟",
      "What are the best sugar alternatives available in Yemen?",
      "أفضل بدائل السكر المتوفرة في اليمن عبر ركن التوفير كوزمتك للتجارة هي Steviola (ستيفيولا) المعتمدة على ستيفيا الطبيعية بنسبة 100%، و NO CAL (نوكال) كمحلٍّ منخفض السعرات. كلا الخيارين يأتيان بصيغ عملية (نقط، أقراص، أكياس، أحجام عائلية) تناسب المشروبات الساخنة والباردة والخبز والطهي.",
      "The best sugar alternatives available in Yemen through Rukn Al-Tawfir are Steviola, based on 100% natural stevia, and NO CAL, a low-calorie sweetener. Both come in practical formats (drops, tablets, sachets, family-size) for drinks, baking and cooking.",
    ],
    [
      "هل بدائل السكر آمنة لمرضى السكري؟",
      "Are sugar alternatives safe for diabetics?",
      "نعم. محليات الستيفيا الطبيعية مثل Steviola لا ترفع مستوى السكر في الدم بشكل ملحوظ، وهي مدرجة ضمن الخيارات المقبولة لمرضى السكري والمتبعين لأنظمة غذائية منخفضة الكربوهيدرات. يفضّل دائمًا قراءة الملصق الغذائي ومراجعة الطبيب المختص في الحالات الخاصة.",
      "Yes. Natural stevia sweeteners like Steviola do not meaningfully raise blood sugar and are considered acceptable for diabetics and low-carb diets. Always read the nutrition label and consult a physician for special cases.",
    ],
    [
      "ما الفرق بين Steviola و NO CAL؟",
      "What is the difference between Steviola and NO CAL?",
      "Steviola محلٍّ طبيعي بنسبة 100% مستخلص من أوراق نبتة ستيفيا، خالٍ من السعرات الحرارية ومن طعم المرارة. NO CAL محلٍّ منخفض السعرات الحرارية بتركيبة عملية للاستخدام اليومي، متوفر بأحجام عائلية مناسبة للخبز والطهي، وخالٍ من الأسبارتام في الحجم العائلي.",
      "Steviola is a 100% natural stevia-based sweetener, zero-calorie and free of bitter aftertaste. NO CAL is a low-calorie sweetener with a practical everyday formula, available in family-size packs suitable for baking and cooking, and aspartame-free in the family size.",
    ],
    [
      "هل تحتوي بدائل السكر على أسبارتام؟",
      "Do sugar alternatives contain aspartame?",
      "محليات Steviola طبيعية بالكامل وخالية من الأسبارتام. أما NO CAL في الحجم العائلي فهو أيضًا خالٍ من الأسبارتام. ننصح دائمًا بقراءة قائمة المكونات على العبوة لتأكيد التركيبة المناسبة لاحتياجك.",
      "Steviola sweeteners are fully natural and aspartame-free. NO CAL family-size is also aspartame-free. We always recommend reading the ingredient list on the pack to confirm the formula that fits your needs.",
    ],
    [
      "هل يمكن استخدام بدائل السكر في الخبز والطهي؟",
      "Can sugar alternatives be used for baking and cooking?",
      "نعم. الأحجام العائلية من Steviola و NO CAL مصمّمة خصيصًا للخبز والطهي وتُحافظ على ثباتها الحراري في درجات الحرارة العالية، وتمنح المذاق الحلو دون السعرات الحرارية للسكر التقليدي.",
      "Yes. The family-size Steviola and NO CAL packs are designed specifically for baking and cooking, are heat-stable at high temperatures, and deliver sweetness without the calories of regular sugar.",
    ],
    [
      "كيف أطلب بدائل السكر في اليمن؟",
      "How do I order sugar alternatives in Yemen?",
      "جميع الطلبات والاستفسارات تتم حصريًا عبر واتساب الأعمال على الرقم +967 774040383. ركن التوفير كوزمتك للتجارة هو الوكيل الحصري في الجمهورية اليمنية لعلامتي Steviola و NO CAL وعدد من العلامات الصحية العالمية.",
      "All orders and inquiries are handled exclusively via WhatsApp Business at +967 774040383. Rukn Al-Tawfir Cosmetic for Trade is the exclusive agent in the Republic of Yemen for Steviola, NO CAL and several international health brands.",
    ],
    [
      "ما هي ستيفيا وما مصدرها؟",
      "What is stevia and where does it come from?",
      "ستيفيا (Stevia rebaudiana) نبتة طبيعية تُستخلص من أوراقها مركبات حلوة (الستيفيوسيد والريباوديوسيد) تبلغ حلاوتها أضعاف حلاوة السكر العادي مع صفر سعرات حرارية تقريبًا، ولا ترفع مؤشر السكر في الدم.",
      "Stevia (Stevia rebaudiana) is a natural plant whose leaves yield sweet compounds (stevioside and rebaudioside) that are many times sweeter than regular sugar, with near-zero calories and no meaningful blood-sugar impact.",
    ],
    [
      "هل بدائل السكر مناسبة للأطفال؟",
      "Are sugar alternatives suitable for children?",
      "يمكن استخدامها بكميات معتدلة ضمن نظام غذائي متوازن للأطفال فوق سن معينة، مع الالتزام بالكميات الموصى بها على العبوة. ننصح بمراجعة طبيب الأطفال لتحديد الكميات المناسبة لكل عمر.",
      "They can be used in moderation as part of a balanced diet for children above a certain age, sticking to the serving sizes on the pack. We recommend consulting a pediatrician to determine age-appropriate amounts.",
    ],
    [
      "ما هو أفضل بديل للسكر في اليمن لمتّبعي حمية الكيتو؟",
      "What is the best sugar substitute in Yemen for keto dieters?",
      "Steviola هو الخيار الأول لمتّبعي حمية الكيتو لأنه طبيعي 100%، صفر سعرات، ولا يرفع مستوى الإنسولين. أما NO CAL فيُعدّ بديلًا منخفض الكربوهيدرات يدعم نمط الكيتو، خاصةً في الحجم العائلي للخبز والطهي.",
      "Steviola is the first choice for keto dieters because it is 100% natural, zero-calorie, and does not spike insulin. NO CAL is a low-carb alternative that supports keto, especially the family-size pack for baking and cooking.",
    ],
    [
      "هل ستيفيا تسبب ارتفاع ضغط الدم؟",
      "Does stevia raise blood pressure?",
      "على العكس، تشير الدراسات السريرية إلى أن ستيفيا قد تساهم في خفض ضغط الدم بشكل طفيف لدى بعض الأشخاص. تبقى الاستشارة الطبية ضرورية لمن يتناولون أدوية ضغط الدم.",
      "On the contrary, clinical studies suggest stevia may help slightly lower blood pressure in some people. Medical consultation remains essential for those taking blood pressure medication.",
    ],
    [
      "هل يمكن استخدام Steviola و NO CAL أثناء الحمل والرضاعة؟",
      "Can Steviola and NO CAL be used during pregnancy and breastfeeding?",
      "تُعتبر مستخلصات الستيفيا النقية (الموجودة في Steviola) ضمن قائمة GRAS الآمنة عمومًا. مع ذلك، نوصي بالاعتدال واستشارة الطبيب أو أخصائي التغذية خلال الحمل والرضاعة.",
      "Pure stevia extracts (in Steviola) are on the GRAS list of generally recognized as safe ingredients. Still, we recommend moderation and consulting a doctor or dietitian during pregnancy and breastfeeding.",
    ],
    [
      "هل بدائل السكر تساعد في إنقاص الوزن؟",
      "Do sugar alternatives help with weight loss?",
      "نعم، استبدال السكر التقليدي ببدائل خالية أو منخفضة السعرات مثل Steviola و NO CAL يقلّل السعرات اليومية، وعند دمجه مع نظام غذائي متوازن ونشاط بدني منتظم يدعم خسارة الوزن.",
      "Yes. Swapping regular sugar for zero or low-calorie alternatives like Steviola and NO CAL reduces daily calorie intake, and when combined with a balanced diet and regular exercise it supports weight loss.",
    ],
  ]);

  out["links.enabled"] = true;
  bi(out, "links.title", ["روابط مفيدة", "Useful links"]);
  out["links.items"] = hubLinks([
    ["صفحة علامة Steviola", "Steviola brand page", "/brands/steviola"],
    ["صفحة علامة NO CAL", "NO CAL brand page", "/brands/nocal"],
    ["كل العلامات التجارية", "All brands", "/brands"],
    ["الكتالوجات الرسمية", "Official catalogs", "/catalogs"],
    ["من نحن", "About Rukn Al-Tawfir", "/about"],
    ["تواصل معنا", "Contact us", "/contact"],
  ]);

  out["cta.enabled"] = true;
  bi(out, "cta.title", [
    "جاهز للتحوّل إلى بديل صحي للسكر؟",
    "Ready to switch to a healthy sugar alternative?",
  ]);
  bi(out, "cta.desc", [
    "تواصل مع فريق ركن التوفير عبر واتساب الأعمال للاستفسار عن المنتجات والأسعار والتوفّر.",
    "Talk to the Rukn Al-Tawfir team on WhatsApp Business for products, pricing and availability.",
  ]);
  bi(out, "cta.waLabel", ["تواصل عبر واتساب", "Chat on WhatsApp"]);
  return out;
}

export const HUB_DEFAULTS: Record<HubPageSlug, () => PageContent> = {
  "oral-care": oralCareDefaults,
  "immunity-vitamin-c": immunityDefaults,
  "baby-care": babyCareDefaults,
  "sugar-alternatives": sugarDefaults,
};

export function isHubPageSlug(slug: unknown): slug is HubPageSlug {
  return typeof slug === "string" && (HUB_PAGE_SLUGS as readonly string[]).includes(slug);
}
