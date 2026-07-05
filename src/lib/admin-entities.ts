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
  | "asset";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
};

export type EntityConfig = {
  key: string;
  label: string;
  table: string;
  primaryKey?: string; // default id
  listColumns: string[]; // columns shown in table
  labelColumn: string; // human label per row
  orderBy?: { column: string; ascending: boolean };
  fields: Field[];
  group: "Content" | "Catalog" | "Media" | "Requests" | "Settings" | "System";
};

export const ENTITIES: EntityConfig[] = [
  {
    key: "brands", label: "Brands", table: "brands", group: "Catalog",
    listColumns: ["slug", "name_ar", "name_en", "is_partner", "sort_order", "status"],
    labelColumn: "name_ar",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "name_ar", label: "Name (AR)", type: "text", required: true },
      { key: "name_en", label: "Name (EN)", type: "text", required: true },
      { key: "tagline_ar", label: "Tagline (AR)", type: "text" },
      { key: "description_ar", label: "Description (AR)", type: "textarea" },
      { key: "is_partner", label: "Is Partner", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" },
      ] },
      { key: "logo_asset_id", label: "Logo Asset ID", type: "asset" },
      { key: "hero_asset_id", label: "Hero Asset ID", type: "asset" },
      { key: "brand_tokens", label: "Brand Tokens (JSON)", type: "json" },
    ],
  },
  {
    key: "products", label: "Products", table: "products", group: "Catalog",
    listColumns: ["slug", "name_ar", "brand_id", "is_published", "sort_order"],
    labelColumn: "name_ar",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "brand_id", label: "Brand ID", type: "text", required: true },
      { key: "name_ar", label: "Name (AR)", type: "text", required: true },
      { key: "name_en", label: "Name (EN)", type: "text", required: true },
      { key: "short_description_ar", label: "Short Description (AR)", type: "textarea" },
      { key: "long_description_ar", label: "Long Description (AR)", type: "textarea" },
      { key: "usage_instructions_ar", label: "Usage Instructions (AR)", type: "textarea" },
      { key: "key_benefits_ar", label: "Key Benefits (JSON array)", type: "json" },
      { key: "cover_asset_id", label: "Cover Asset ID", type: "asset" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  {
    key: "product_variants", label: "Product Variants", table: "product_variants", group: "Catalog",
    listColumns: ["slug", "name_ar", "product_id", "pack_size", "is_published"],
    labelColumn: "name_ar",
    fields: [
      { key: "product_id", label: "Product ID", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "name_ar", label: "Name (AR)", type: "text", required: true },
      { key: "pack_size", label: "Pack Size", type: "text" },
      { key: "cover_asset_id", label: "Cover Asset ID", type: "asset" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  {
    key: "product_categories", label: "Categories", table: "product_categories", group: "Catalog",
    listColumns: ["slug", "name_ar", "sort_order"],
    labelColumn: "name_ar",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "name_ar", label: "Name (AR)", type: "text", required: true },
      { key: "name_en", label: "Name (EN)", type: "text" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  {
    key: "insights", label: "Articles & News", table: "insights", group: "Content",
    listColumns: ["slug", "title_ar", "is_published", "published_at"],
    labelColumn: "title_ar",
    orderBy: { column: "published_at", ascending: false },
    fields: [
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "title_ar", label: "Title (AR)", type: "text", required: true },
      { key: "title_en", label: "Title (EN)", type: "text" },
      { key: "excerpt_ar", label: "Excerpt (AR)", type: "textarea" },
      { key: "body_ar", label: "Body (AR)", type: "textarea" },
      { key: "body_en", label: "Body (EN)", type: "textarea" },
      { key: "cover_asset_id", label: "Cover Asset ID", type: "asset" },
      { key: "brand_id", label: "Brand ID", type: "text" },
      { key: "tags", label: "Tags (JSON array)", type: "json" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "published_at", label: "Published At", type: "date" },
    ],
  },
  {
    key: "topic_hubs", label: "Topic Authority Hubs", table: "topic_hubs", group: "Content",
    listColumns: ["slug", "title_ar", "is_published", "sort_order"],
    labelColumn: "title_ar",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "title_ar", label: "Title (AR)", type: "text", required: true },
      { key: "title_en", label: "Title (EN)", type: "text" },
      { key: "intro_ar", label: "Intro (AR)", type: "textarea" },
      { key: "intro_en", label: "Intro (EN)", type: "textarea" },
      { key: "cover_asset_id", label: "Cover Asset ID", type: "asset" },
      { key: "seo_title", label: "SEO Title", type: "text" },
      { key: "seo_description", label: "SEO Description", type: "textarea" },
      { key: "related_brand_ids", label: "Brand IDs (JSON array)", type: "json" },
      { key: "related_product_ids", label: "Product IDs (JSON array)", type: "json" },
      { key: "related_article_ids", label: "Article IDs (JSON array)", type: "json" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  {
    key: "pages", label: "Pages", table: "pages", group: "Content",
    listColumns: ["slug", "title_ar", "is_published"],
    labelColumn: "title_ar",
    fields: [
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "title_ar", label: "Title (AR)", type: "text", required: true },
      { key: "title_en", label: "Title (EN)", type: "text" },
      { key: "body_ar", label: "Body (AR)", type: "textarea" },
      { key: "body_en", label: "Body (EN)", type: "textarea" },
      { key: "seo_title", label: "SEO Title", type: "text" },
      { key: "seo_description", label: "SEO Description", type: "textarea" },
      { key: "is_published", label: "Published", type: "boolean" },
    ],
  },
  {
    key: "catalogs", label: "Catalogs (PDF)", table: "catalogs", group: "Catalog",
    listColumns: ["slug", "title_ar", "year", "visibility", "is_published"],
    labelColumn: "title_ar",
    fields: [
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "title_ar", label: "Title (AR)", type: "text", required: true },
      { key: "description_ar", label: "Description (AR)", type: "textarea" },
      { key: "year", label: "Year", type: "number" },
      { key: "brand_id", label: "Brand ID", type: "text" },
      { key: "cover_asset_id", label: "Cover Asset ID", type: "asset" },
      { key: "pdf_asset_id", label: "PDF Asset ID", type: "asset" },
      { key: "visibility", label: "Visibility", type: "select", options: [
        { value: "public", label: "Public" }, { value: "restricted", label: "Restricted" }, { value: "b2b_only", label: "B2B Only" },
      ] },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  {
    key: "certifications", label: "Certifications", table: "certifications", group: "Catalog",
    listColumns: ["slug", "name_ar", "issuer"],
    labelColumn: "name_ar",
    fields: [
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "name_ar", label: "Name (AR)", type: "text", required: true },
      { key: "name_en", label: "Name (EN)", type: "text" },
      { key: "issuer", label: "Issuer", type: "text" },
      { key: "icon_asset_id", label: "Icon Asset ID", type: "asset" },
    ],
  },
  {
    key: "assets", label: "Media Library", table: "assets", group: "Media",
    listColumns: ["storage_bucket", "storage_path", "kind", "alt_ar"],
    labelColumn: "storage_path",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "storage_bucket", label: "Bucket", type: "select", options: [
        { value: "brand-assets", label: "brand-assets" }, { value: "catalogs", label: "catalogs" },
      ], required: true },
      { key: "storage_path", label: "Storage Path", type: "text", required: true },
      { key: "kind", label: "Kind", type: "select", options: [
        { value: "image", label: "Image" }, { value: "pdf", label: "PDF" }, { value: "video", label: "Video" },
      ] },
      { key: "alt_ar", label: "Alt Text (AR)", type: "text" },
      { key: "alt_en", label: "Alt Text (EN)", type: "text" },
      { key: "width", label: "Width", type: "number" },
      { key: "height", label: "Height", type: "number" },
    ],
  },
  {
    key: "navigation_items", label: "Navigation Menus", table: "navigation_items", group: "Settings",
    listColumns: ["location", "label_ar", "url", "sort_order", "is_visible"],
    labelColumn: "label_ar",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "location", label: "Location", type: "select", options: [
        { value: "header", label: "Header" }, { value: "footer", label: "Footer" }, { value: "mobile", label: "Mobile" },
      ], required: true },
      { key: "label_ar", label: "Label (AR)", type: "text", required: true },
      { key: "label_en", label: "Label (EN)", type: "text" },
      { key: "url", label: "URL", type: "text", required: true },
      { key: "parent_id", label: "Parent ID", type: "text" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "is_visible", label: "Visible", type: "boolean" },
      { key: "open_in_new_tab", label: "Open in new tab", type: "boolean" },
    ],
  },
  {
    key: "homepage_sections", label: "Homepage Sections", table: "homepage_sections", group: "Content",
    listColumns: ["section_key", "title_ar", "sort_order", "is_enabled"],
    labelColumn: "section_key",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "section_key", label: "Section Key", type: "text", required: true },
      { key: "title_ar", label: "Title (AR)", type: "text" },
      { key: "subtitle_ar", label: "Subtitle (AR)", type: "text" },
      { key: "body_ar", label: "Body (AR)", type: "textarea" },
      { key: "cta_label_ar", label: "CTA Label (AR)", type: "text" },
      { key: "cta_url", label: "CTA URL", type: "text" },
      { key: "media_asset_id", label: "Media Asset ID", type: "asset" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "is_enabled", label: "Enabled", type: "boolean" },
      { key: "extra", label: "Extra (JSON)", type: "json" },
    ],
  },
  {
    key: "inquiries", label: "Contact Inquiries", table: "inquiries", group: "Requests",
    listColumns: ["full_name", "email", "phone", "subject", "status", "created_at"],
    labelColumn: "full_name",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "full_name", label: "Full Name", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "subject", label: "Subject", type: "text" },
      { key: "message", label: "Message", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "new", label: "New" }, { value: "in_progress", label: "In Progress" }, { value: "closed", label: "Closed" },
      ] },
      { key: "internal_notes", label: "Internal Notes", type: "textarea" },
    ],
  },
  {
    key: "catalog_requests", label: "Catalog Requests", table: "catalog_requests", group: "Requests",
    listColumns: ["full_name", "email", "company", "status", "created_at"],
    labelColumn: "full_name",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "full_name", label: "Full Name", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "country", label: "Country", type: "text" },
      { key: "purpose", label: "Purpose", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "new", label: "New" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" },
      ] },
    ],
  },
  {
    key: "b2b_partner_applications", label: "Partner Applications", table: "b2b_partner_applications", group: "Requests",
    listColumns: ["company_name", "contact_name", "email", "country", "status", "created_at"],
    labelColumn: "company_name",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "company_name", label: "Company", type: "text" },
      { key: "contact_name", label: "Contact Name", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "country", label: "Country", type: "text" },
      { key: "message", label: "Message", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "new", label: "New" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" },
      ] },
    ],
  },
  {
    key: "site_settings", label: "Website Settings", table: "site_settings", group: "Settings",
    primaryKey: "key",
    listColumns: ["key", "updated_at"],
    labelColumn: "key",
    fields: [
      { key: "key", label: "Key (e.g. brand.colors, brand.fonts, contact, social)", type: "text", required: true },
      { key: "value", label: "Value (JSON)", type: "json", required: true, hint: "Any JSON object; consumed by the frontend by key." },
    ],
  },
  {
    key: "corporate_identity", label: "Corporate Identity", table: "corporate_identity", group: "Settings",
    listColumns: ["id", "legal_name_ar", "whatsapp_number", "email"],
    labelColumn: "legal_name_ar",
    fields: [
      { key: "legal_name_ar", label: "Legal Name (AR)", type: "text", required: true },
      { key: "legal_name_en", label: "Legal Name (EN)", type: "text", required: true },
      { key: "parent_group_ar", label: "Parent Group (AR)", type: "text" },
      { key: "hero_headline_ar", label: "Hero Headline (AR)", type: "text" },
      { key: "hero_sub_ar", label: "Hero Sub (AR)", type: "textarea" },
      { key: "whatsapp_number", label: "WhatsApp Number", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "address_ar", label: "Address (AR)", type: "textarea" },
      { key: "logo_asset_id", label: "Logo Asset ID", type: "asset" },
    ],
  },
  {
    key: "audit_log", label: "Audit Log", table: "audit_log", group: "System",
    listColumns: ["action", "actor_id", "entity_type", "entity_id", "created_at"],
    labelColumn: "action",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "action", label: "Action", type: "text" },
      { key: "entity_type", label: "Entity Type", type: "text" },
      { key: "entity_id", label: "Entity ID", type: "text" },
    ],
  },
];

export function getEntity(key: string): EntityConfig | undefined {
  return ENTITIES.find((e) => e.key === key);
}
