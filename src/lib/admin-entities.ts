// Config for the generic entity admin. Each entity maps to a Supabase table
// with a set of editable fields. RLS enforces super_admin write access.

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "date"
  | "json"
  | "select"
  | "asset"
  | "image_url"
  | "brand_ref"
  | "product_ref"
  | "nav_parent_ref";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
};

export type Column = {
  key: string;
  label: string;
  type?: "text" | "boolean" | "date" | "image" | "status" | "brand" | "product" | "number" | "asset_ref";
};

export type EntityConfig = {
  key: string;
  label: string;
  table: string;
  primaryKey?: string;
  listColumns: Column[];
  searchColumns?: string[];
  labelColumn: string;
  orderBy?: { column: string; ascending: boolean };
  fields: Field[];
  group: "المحتوى" | "الكتالوج" | "الوسائط" | "الطلبات" | "الإعدادات" | "النظام";
};

export const ENTITIES: EntityConfig[] = [
  {
    key: "brands", label: "العلامات التجارية", table: "brands", group: "الكتالوج",
    listColumns: [
      { key: "name_ar", label: "الاسم", type: "text" },
      { key: "slug", label: "المعرّف", type: "text" },
      { key: "is_partner", label: "شريك", type: "boolean" },
      { key: "sort_order", label: "الترتيب", type: "number" },
      { key: "status", label: "الحالة", type: "status" },
    ],
    searchColumns: ["name_ar", "name_en", "slug"],
    labelColumn: "name_ar",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "slug", label: "المعرّف (Slug)", type: "text", required: true },
      { key: "name_ar", label: "الاسم بالعربية", type: "text", required: true },
      { key: "name_en", label: "Name (EN)", type: "text", required: true },
      { key: "tagline_ar", label: "الشعار الفرعي (AR)", type: "text" },
      { key: "description_ar", label: "الوصف (AR)", type: "textarea" },
      { key: "is_partner", label: "علامة شريكة", type: "boolean" },
      { key: "sort_order", label: "ترتيب العرض", type: "number" },
      { key: "status", label: "الحالة", type: "select", options: [
        { value: "active", label: "منشور" }, { value: "draft", label: "مسودة" }, { value: "archived", label: "مؤرشف" },
      ] },
      { key: "logo_asset_id", label: "شعار العلامة", type: "asset" },
      { key: "hero_asset_id", label: "صورة الهيرو", type: "asset" },
      { key: "brand_tokens", label: "متغيرات العلامة (JSON)", type: "json" },
    ],
  },
  {
    key: "products", label: "المنتجات", table: "products", group: "الكتالوج",
    listColumns: [
      { key: "cover_asset_id", label: "الصورة", type: "image" },
      { key: "name_ar", label: "الاسم", type: "text" },
      { key: "slug", label: "المعرّف", type: "text" },
      { key: "brand_id", label: "العلامة", type: "brand" },
      { key: "is_published", label: "منشور", type: "boolean" },
      { key: "sort_order", label: "الترتيب", type: "number" },
    ],
    searchColumns: ["name_ar", "name_en", "slug"],
    labelColumn: "name_ar",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "slug", label: "المعرّف", type: "text", required: true },
      { key: "brand_id", label: "العلامة", type: "select", required: true, options: [] },
      { key: "name_ar", label: "الاسم بالعربية", type: "text", required: true },
      { key: "name_en", label: "Name (EN)", type: "text", required: true },
      { key: "short_description_ar", label: "وصف مختصر", type: "textarea" },
      { key: "long_description_ar", label: "وصف تفصيلي", type: "textarea" },
      { key: "usage_instructions_ar", label: "طريقة الاستخدام", type: "textarea" },
      { key: "key_benefits_ar", label: "الفوائد الرئيسية (JSON)", type: "json" },
      { key: "cover_asset_id", label: "صورة الغلاف", type: "asset" },
      { key: "is_published", label: "منشور", type: "boolean" },
      { key: "sort_order", label: "ترتيب العرض", type: "number" },
    ],
  },
  {
    key: "product_variants", label: "أنواع المنتجات", table: "product_variants", group: "الكتالوج",
    listColumns: [
      { key: "cover_asset_id", label: "الصورة", type: "image" },
      { key: "name_ar", label: "الاسم", type: "text" },
      { key: "product_id", label: "المنتج", type: "product" },
      { key: "pack_size", label: "الحجم", type: "text" },
      { key: "is_published", label: "منشور", type: "boolean" },
    ],
    searchColumns: ["name_ar", "slug"],
    labelColumn: "name_ar",
    fields: [
      { key: "product_id", label: "المنتج", type: "product_ref", required: true },
      { key: "slug", label: "المعرّف", type: "text", required: true },
      { key: "name_ar", label: "الاسم", type: "text", required: true },
      { key: "pack_size", label: "حجم العبوة", type: "text" },
      { key: "cover_asset_id", label: "الصورة", type: "asset" },
      { key: "is_published", label: "منشور", type: "boolean" },
      { key: "sort_order", label: "الترتيب", type: "number" },
    ],
  },
  {
    key: "product_categories", label: "التصنيفات", table: "product_categories", group: "الكتالوج",
    listColumns: [
      { key: "name_ar", label: "الاسم", type: "text" },
      { key: "slug", label: "المعرّف", type: "text" },
      { key: "sort_order", label: "الترتيب", type: "number" },
    ],
    searchColumns: ["name_ar", "slug"],
    labelColumn: "name_ar",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "slug", label: "المعرّف", type: "text", required: true },
      { key: "name_ar", label: "الاسم", type: "text", required: true },
      { key: "name_en", label: "Name (EN)", type: "text" },
      { key: "sort_order", label: "الترتيب", type: "number" },
    ],
  },
  {
    key: "insights", label: "المقالات والأخبار", table: "insights", group: "المحتوى",
    listColumns: [
      { key: "cover_asset_id", label: "الصورة", type: "image" },
      { key: "title_ar", label: "العنوان", type: "text" },
      { key: "slug", label: "المعرّف", type: "text" },
      { key: "is_published", label: "منشور", type: "boolean" },
      { key: "published_at", label: "تاريخ النشر", type: "date" },
    ],
    searchColumns: ["title_ar", "title_en", "slug"],
    labelColumn: "title_ar",
    orderBy: { column: "published_at", ascending: false },
    fields: [
      { key: "slug", label: "المعرّف", type: "text", required: true },
      { key: "title_ar", label: "العنوان بالعربية", type: "text", required: true },
      { key: "title_en", label: "Title (EN)", type: "text" },
      { key: "excerpt_ar", label: "المقتطف (AR)", type: "textarea" },
      { key: "body_ar", label: "المحتوى (AR)", type: "textarea" },
      { key: "body_en", label: "Body (EN)", type: "textarea" },
      { key: "cover_asset_id", label: "صورة الغلاف", type: "asset" },
      { key: "brand_id", label: "العلامة", type: "brand_ref" },
      { key: "tags", label: "الوسوم (JSON)", type: "json" },
      { key: "is_published", label: "منشور", type: "boolean" },
      { key: "published_at", label: "تاريخ النشر", type: "date" },
    ],
  },
  {
    key: "topic_hubs", label: "المحاور المعرفية", table: "topic_hubs", group: "المحتوى",
    listColumns: [
      { key: "title_ar", label: "العنوان", type: "text" },
      { key: "slug", label: "المعرّف", type: "text" },
      { key: "is_published", label: "منشور", type: "boolean" },
      { key: "sort_order", label: "الترتيب", type: "number" },
    ],
    searchColumns: ["title_ar", "slug"],
    labelColumn: "title_ar",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "slug", label: "المعرّف", type: "text", required: true },
      { key: "title_ar", label: "العنوان (AR)", type: "text", required: true },
      { key: "title_en", label: "Title (EN)", type: "text" },
      { key: "intro_ar", label: "المقدمة (AR)", type: "textarea" },
      { key: "intro_en", label: "Intro (EN)", type: "textarea" },
      { key: "cover_asset_id", label: "صورة الغلاف", type: "asset" },
      { key: "seo_title", label: "عنوان SEO", type: "text" },
      { key: "seo_description", label: "وصف SEO", type: "textarea" },
      { key: "related_brand_ids", label: "معرّفات العلامات (JSON)", type: "json" },
      { key: "related_product_ids", label: "معرّفات المنتجات (JSON)", type: "json" },
      { key: "related_article_ids", label: "معرّفات المقالات (JSON)", type: "json" },
      { key: "is_published", label: "منشور", type: "boolean" },
      { key: "sort_order", label: "الترتيب", type: "number" },
    ],
  },
  {
    key: "pages", label: "الصفحات", table: "pages", group: "المحتوى",
    listColumns: [
      { key: "title_ar", label: "العنوان", type: "text" },
      { key: "slug", label: "المعرّف", type: "text" },
      { key: "is_published", label: "منشور", type: "boolean" },
    ],
    searchColumns: ["title_ar", "slug"],
    labelColumn: "title_ar",
    fields: [
      { key: "slug", label: "المعرّف", type: "text", required: true },
      { key: "title_ar", label: "العنوان (AR)", type: "text", required: true },
      { key: "title_en", label: "Title (EN)", type: "text" },
      { key: "body_ar", label: "المحتوى (AR)", type: "textarea" },
      { key: "body_en", label: "Body (EN)", type: "textarea" },
      { key: "seo_title", label: "عنوان SEO", type: "text" },
      { key: "seo_description", label: "وصف SEO", type: "textarea" },
      { key: "is_published", label: "منشور", type: "boolean" },
    ],
  },
  {
    key: "catalogs", label: "الكتالوجات (PDF)", table: "catalogs", group: "الكتالوج",
    listColumns: [
      { key: "title_ar", label: "العنوان", type: "text" },
      { key: "year", label: "السنة", type: "number" },
      { key: "visibility", label: "الظهور", type: "text" },
      { key: "is_published", label: "منشور", type: "boolean" },
    ],
    searchColumns: ["title_ar", "slug"],
    labelColumn: "title_ar",
    fields: [
      { key: "slug", label: "المعرّف", type: "text", required: true },
      { key: "title_ar", label: "العنوان (AR)", type: "text", required: true },
      { key: "description_ar", label: "الوصف (AR)", type: "textarea" },
      { key: "year", label: "السنة", type: "number" },
      { key: "brand_id", label: "العلامة", type: "brand_ref" },
      { key: "cover_asset_id", label: "الغلاف", type: "asset" },
      { key: "pdf_asset_id", label: "ملف PDF", type: "asset" },
      { key: "visibility", label: "الظهور", type: "select", options: [
        { value: "public", label: "عام" }, { value: "restricted", label: "مقيّد" }, { value: "b2b_only", label: "B2B فقط" },
      ] },
      { key: "is_published", label: "منشور", type: "boolean" },
      { key: "sort_order", label: "الترتيب", type: "number" },
    ],
  },
  {
    key: "certifications", label: "الشهادات", table: "certifications", group: "الكتالوج",
    listColumns: [
      { key: "name_ar", label: "الاسم", type: "text" },
      { key: "issuer", label: "الجهة المانحة", type: "text" },
    ],
    searchColumns: ["name_ar", "issuer"],
    labelColumn: "name_ar",
    fields: [
      { key: "slug", label: "المعرّف", type: "text", required: true },
      { key: "name_ar", label: "الاسم (AR)", type: "text", required: true },
      { key: "name_en", label: "Name (EN)", type: "text" },
      { key: "issuer", label: "الجهة المانحة", type: "text" },
      { key: "icon_asset_id", label: "الأيقونة", type: "asset" },
    ],
  },
  {
    key: "assets", label: "مكتبة الوسائط", table: "assets", group: "الوسائط",
    listColumns: [
      { key: "storage_path", label: "المسار", type: "text" },
      { key: "storage_bucket", label: "الحاوية", type: "text" },
      { key: "channel", label: "النوع", type: "text" },
      { key: "alt_text_ar", label: "النص البديل", type: "text" },
    ],
    searchColumns: ["storage_path", "alt_text_ar"],
    labelColumn: "storage_path",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "storage_bucket", label: "الحاوية", type: "select", options: [
        { value: "brand-assets", label: "brand-assets" }, { value: "catalogs", label: "catalogs" },
      ], required: true },
      { key: "storage_path", label: "المسار داخل الحاوية", type: "text", required: true },
      { key: "channel", label: "النوع", type: "select", options: [
        { value: "brand_logo", label: "شعار علامة" },
        { value: "packaging_official", label: "تغليف رسمي" },
        { value: "marketing_generated", label: "صورة تسويقية" },
        { value: "catalog_pdf", label: "كتالوج PDF" },
        { value: "document", label: "مستند" },
      ] },
      { key: "alt_text_ar", label: "نص بديل (AR)", type: "text" },
      { key: "alt_text_en", label: "نص بديل (EN)", type: "text" },
      { key: "width", label: "العرض", type: "number" },
      { key: "height", label: "الارتفاع", type: "number" },
    ],
  },
  {
    key: "navigation_items", label: "قوائم التنقل", table: "navigation_items", group: "الإعدادات",
    listColumns: [
      { key: "location", label: "الموقع", type: "text" },
      { key: "label_ar", label: "التسمية", type: "text" },
      { key: "url", label: "الرابط", type: "text" },
      { key: "sort_order", label: "الترتيب", type: "number" },
      { key: "is_visible", label: "ظاهر", type: "boolean" },
    ],
    searchColumns: ["label_ar", "url"],
    labelColumn: "label_ar",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "location", label: "الموقع", type: "select", options: [
        { value: "header", label: "الشريط العلوي" }, { value: "footer", label: "التذييل" }, { value: "mobile", label: "قائمة الجوال" },
      ], required: true },
      { key: "label_ar", label: "التسمية (AR)", type: "text", required: true },
      { key: "label_en", label: "Label (EN)", type: "text" },
      { key: "url", label: "الرابط", type: "text", required: true },
      { key: "parent_id", label: "العنصر الأب", type: "nav_parent_ref" },
      { key: "sort_order", label: "الترتيب", type: "number" },
      { key: "is_visible", label: "ظاهر", type: "boolean" },
      { key: "open_in_new_tab", label: "فتح في تبويب جديد", type: "boolean" },
    ],
  },
  {
    key: "homepage_sections", label: "أقسام الصفحة الرئيسية", table: "homepage_sections", group: "المحتوى",
    listColumns: [
      { key: "section_key", label: "المفتاح", type: "text" },
      { key: "title_ar", label: "العنوان", type: "text" },
      { key: "sort_order", label: "الترتيب", type: "number" },
      { key: "is_enabled", label: "مفعّل", type: "boolean" },
    ],
    searchColumns: ["section_key", "title_ar"],
    labelColumn: "section_key",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "section_key", label: "مفتاح القسم", type: "text", required: true },
      { key: "title_ar", label: "العنوان (AR)", type: "text" },
      { key: "subtitle_ar", label: "العنوان الفرعي (AR)", type: "text" },
      { key: "body_ar", label: "النص (AR)", type: "textarea" },
      { key: "cta_label_ar", label: "نص الزر (AR)", type: "text" },
      { key: "cta_url", label: "رابط الزر", type: "text" },
      { key: "media_asset_id", label: "صورة القسم", type: "asset" },
      { key: "sort_order", label: "الترتيب", type: "number" },
      { key: "is_enabled", label: "مفعّل", type: "boolean" },
      { key: "extra", label: "بيانات إضافية (JSON)", type: "json" },
    ],
  },
  {
    key: "inquiries", label: "طلبات التواصل", table: "inquiries", group: "الطلبات",
    listColumns: [
      { key: "full_name", label: "الاسم", type: "text" },
      { key: "email", label: "البريد", type: "text" },
      { key: "phone", label: "الهاتف", type: "text" },
      { key: "subject", label: "الموضوع", type: "text" },
      { key: "status", label: "الحالة", type: "status" },
      { key: "created_at", label: "التاريخ", type: "date" },
    ],
    searchColumns: ["full_name", "email", "subject"],
    labelColumn: "full_name",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "full_name", label: "الاسم", type: "text" },
      { key: "email", label: "البريد", type: "text" },
      { key: "phone", label: "الهاتف", type: "text" },
      { key: "subject", label: "الموضوع", type: "text" },
      { key: "message", label: "الرسالة", type: "textarea" },
      { key: "status", label: "الحالة", type: "select", options: [
        { value: "new", label: "جديد" }, { value: "in_progress", label: "قيد المعالجة" }, { value: "closed", label: "مغلق" },
      ] },
      { key: "internal_notes", label: "ملاحظات داخلية", type: "textarea" },
    ],
  },
  {
    key: "catalog_requests", label: "طلبات الكتالوج", table: "catalog_requests", group: "الطلبات",
    listColumns: [
      { key: "full_name", label: "الاسم", type: "text" },
      { key: "email", label: "البريد", type: "text" },
      { key: "company", label: "الشركة", type: "text" },
      { key: "status", label: "الحالة", type: "status" },
      { key: "created_at", label: "التاريخ", type: "date" },
    ],
    searchColumns: ["full_name", "email", "company"],
    labelColumn: "full_name",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "full_name", label: "الاسم", type: "text" },
      { key: "email", label: "البريد", type: "text" },
      { key: "company", label: "الشركة", type: "text" },
      { key: "phone", label: "الهاتف", type: "text" },
      { key: "country", label: "الدولة", type: "text" },
      { key: "purpose", label: "الغرض", type: "textarea" },
      { key: "status", label: "الحالة", type: "select", options: [
        { value: "new", label: "جديد" }, { value: "approved", label: "مقبول" }, { value: "rejected", label: "مرفوض" },
      ] },
    ],
  },
  {
    key: "b2b_partner_applications", label: "طلبات الشراكة", table: "b2b_partner_applications", group: "الطلبات",
    listColumns: [
      { key: "company_name", label: "الشركة", type: "text" },
      { key: "contact_name", label: "المسؤول", type: "text" },
      { key: "email", label: "البريد", type: "text" },
      { key: "country", label: "الدولة", type: "text" },
      { key: "status", label: "الحالة", type: "status" },
      { key: "created_at", label: "التاريخ", type: "date" },
    ],
    searchColumns: ["company_name", "contact_name", "email"],
    labelColumn: "company_name",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "company_name", label: "اسم الشركة", type: "text" },
      { key: "contact_name", label: "اسم المسؤول", type: "text" },
      { key: "email", label: "البريد", type: "text" },
      { key: "phone", label: "الهاتف", type: "text" },
      { key: "country", label: "الدولة", type: "text" },
      { key: "message", label: "الرسالة", type: "textarea" },
      { key: "status", label: "الحالة", type: "select", options: [
        { value: "new", label: "جديد" }, { value: "approved", label: "مقبول" }, { value: "rejected", label: "مرفوض" },
      ] },
    ],
  },
  {
    key: "site_settings", label: "إعدادات الموقع", table: "site_settings", group: "الإعدادات",
    primaryKey: "key",
    listColumns: [
      { key: "key", label: "المفتاح", type: "text" },
      { key: "updated_at", label: "آخر تحديث", type: "date" },
    ],
    searchColumns: ["key"],
    labelColumn: "key",
    fields: [
      { key: "key", label: "المفتاح (مثلاً brand.colors)", type: "text", required: true },
      { key: "value", label: "القيمة (JSON)", type: "json", required: true, hint: "أي كائن JSON يُستهلك حسب المفتاح" },
    ],
  },
  {
    key: "corporate_identity", label: "الهوية المؤسسية", table: "corporate_identity", group: "الإعدادات",
    listColumns: [
      { key: "legal_name_ar", label: "الاسم القانوني", type: "text" },
      { key: "whatsapp_number", label: "واتساب", type: "text" },
      { key: "email", label: "البريد", type: "text" },
    ],
    searchColumns: ["legal_name_ar", "legal_name_en"],
    labelColumn: "legal_name_ar",
    fields: [
      { key: "legal_name_ar", label: "الاسم القانوني (AR)", type: "text", required: true },
      { key: "legal_name_en", label: "Legal Name (EN)", type: "text", required: true },
      { key: "parent_group_ar", label: "المجموعة الأم (AR)", type: "text" },
      { key: "hero_headline_ar", label: "عنوان الهيرو (AR)", type: "text" },
      { key: "hero_sub_ar", label: "العنوان الفرعي للهيرو (AR)", type: "textarea" },
      { key: "whatsapp_number", label: "رقم واتساب", type: "text" },
      { key: "email", label: "البريد الإلكتروني", type: "text" },
      { key: "address_ar", label: "العنوان (AR)", type: "textarea" },
      { key: "logo_asset_id", label: "الشعار", type: "asset" },
    ],
  },
  {
    key: "audit_log", label: "سجل النشاط", table: "audit_log", group: "النظام",
    listColumns: [
      { key: "action", label: "الإجراء", type: "text" },
      { key: "entity_type", label: "الكيان", type: "text" },
      { key: "entity_id", label: "المعرّف", type: "text" },
      { key: "actor_id", label: "المستخدم", type: "text" },
      { key: "created_at", label: "التاريخ", type: "date" },
    ],
    searchColumns: ["action", "entity_type"],
    labelColumn: "action",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "action", label: "الإجراء", type: "text" },
      { key: "entity_type", label: "نوع الكيان", type: "text" },
      { key: "entity_id", label: "معرّف الكيان", type: "text" },
    ],
  },
];

export function getEntity(key: string): EntityConfig | undefined {
  return ENTITIES.find((e) => e.key === key);
}
