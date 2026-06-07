
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('super_admin','brand_manager','editor','viewer');
CREATE TYPE public.brand_status AS ENUM ('active','archived','draft');
CREATE TYPE public.asset_channel AS ENUM ('brand_logo','packaging_official','marketing_generated','catalog_pdf','document');
CREATE TYPE public.catalog_visibility AS ENUM ('public','restricted','b2b_only');
CREATE TYPE public.inquiry_kind AS ENUM ('whatsapp_click','b2b_lead','catalog_request','contact_form');
CREATE TYPE public.inquiry_status AS ENUM ('new','in_review','contacted','converted','closed');
CREATE TYPE public.partner_type AS ENUM ('local_distributor','international_supplier','retail_chain','pharmacy');
CREATE TYPE public.language_code AS ENUM ('ar','en');
CREATE TYPE public.identity_scope AS ENUM ('corporate','brand');

-- ============ SHARED TRIGGER FUNCTION ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  phone text,
  locale public.language_code NOT NULL DEFAULT 'ar',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ASSETS (DAM) ============
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_bucket text NOT NULL,
  storage_path text NOT NULL,
  original_filename text,
  mime_type text,
  width int,
  height int,
  file_size_bytes bigint,
  channel public.asset_channel NOT NULL,
  face_present boolean NOT NULL DEFAULT false,
  alt_text_ar text,
  alt_text_en text,
  is_official boolean NOT NULL DEFAULT false,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT zero_faces_rule CHECK (
    NOT face_present
    OR channel IN ('packaging_official','catalog_pdf','document')
  ),
  UNIQUE (storage_bucket, storage_path)
);
GRANT SELECT ON public.assets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- ============ CERTIFICATIONS ============
CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  logo_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certifications TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- ============ BRANDS ============
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  tagline_ar text,
  tagline_en text,
  description_ar text,
  description_en text,
  status public.brand_status NOT NULL DEFAULT 'active',
  is_partner boolean NOT NULL DEFAULT false,
  is_umbrella boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  logo_asset_id uuid REFERENCES public.assets(id) ON DELETE RESTRICT,
  hero_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  brand_tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER brands_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, brand_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ ROLE HELPER FUNCTIONS (security definer) ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.has_brand_role(_user_id uuid, _brand_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
      AND (brand_id = _brand_id OR brand_id IS NULL)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

-- ============ BRAND_CERTIFICATIONS ============
CREATE TABLE public.brand_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  certification_id uuid NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  valid_until date,
  UNIQUE (brand_id, certification_id)
);
GRANT SELECT ON public.brand_certifications TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.brand_certifications TO authenticated;
GRANT ALL ON public.brand_certifications TO service_role;
ALTER TABLE public.brand_certifications ENABLE ROW LEVEL SECURITY;

-- ============ CORPORATE IDENTITY (single row) ============
CREATE TABLE public.corporate_identity (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  legal_name_ar text NOT NULL,
  legal_name_en text NOT NULL,
  parent_group_ar text,
  parent_group_en text,
  hero_headline_ar text NOT NULL,
  hero_sub_ar text NOT NULL,
  hero_headline_en text,
  hero_sub_en text,
  whatsapp_number text NOT NULL DEFAULT '774040383',
  email text,
  address_ar text,
  address_en text,
  logo_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT ON public.corporate_identity TO anon, authenticated;
GRANT ALL ON public.corporate_identity TO service_role;
ALTER TABLE public.corporate_identity ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER corporate_identity_updated_at BEFORE UPDATE ON public.corporate_identity
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PRODUCT CATEGORIES ============
CREATE TABLE public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  parent_id uuid REFERENCES public.product_categories(id) ON DELETE SET NULL,
  sort_order int NOT NULL DEFAULT 0,
  icon_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;
GRANT ALL ON public.product_categories TO service_role;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- ============ PRODUCTS (NO PRICE COLUMN — intentional) ============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.product_categories(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  short_description_ar text,
  short_description_en text,
  long_description_ar text,
  long_description_en text,
  key_benefits_ar text[],
  key_benefits_en text[],
  usage_instructions_ar text,
  usage_instructions_en text,
  cover_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  seo_title_ar text, seo_title_en text,
  seo_description_ar text, seo_description_en text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PRODUCT VARIANTS (internal_sku & barcode are internal-only) ============
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  variant_type text NOT NULL DEFAULT 'pack_size',
  pack_size text,
  unit_count int,
  weight_grams numeric,
  dimensions_mm jsonb,
  barcode text,
  internal_sku text,
  cover_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, slug)
);
-- NOTE: no GRANT SELECT to anon on the base table — public reads go through view below
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER product_variants_updated_at BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public-safe view (hides barcode and internal_sku)
CREATE OR REPLACE VIEW public.product_variants_public
WITH (security_invoker = true) AS
SELECT
  id, product_id, slug, name_ar, name_en, variant_type, pack_size,
  unit_count, weight_grams, dimensions_mm, cover_asset_id, sort_order,
  is_published, created_at, updated_at
FROM public.product_variants
WHERE is_published = true;
GRANT SELECT ON public.product_variants_public TO anon, authenticated;

-- ============ PRODUCT_ASSETS / INGREDIENTS / NUTRITION / FAQs ============
CREATE TABLE public.product_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  caption_ar text, caption_en text
);
GRANT SELECT ON public.product_assets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_assets TO authenticated;
GRANT ALL ON public.product_assets TO service_role;
ALTER TABLE public.product_assets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.product_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name_ar text NOT NULL, name_en text NOT NULL,
  percentage numeric, origin_ar text, origin_en text,
  notes_ar text, notes_en text,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.product_ingredients TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_ingredients TO authenticated;
GRANT ALL ON public.product_ingredients TO service_role;
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.product_nutrition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label_ar text NOT NULL, label_en text NOT NULL,
  value text NOT NULL, unit text,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.product_nutrition TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_nutrition TO authenticated;
GRANT ALL ON public.product_nutrition TO service_role;
ALTER TABLE public.product_nutrition ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.product_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  question_ar text NOT NULL, answer_ar text NOT NULL,
  question_en text, answer_en text,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.product_faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_faqs TO authenticated;
GRANT ALL ON public.product_faqs TO service_role;
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;

-- ============ CATALOGS ============
CREATE TABLE public.catalogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL, title_en text NOT NULL,
  description_ar text, description_en text,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  year int,
  languages public.language_code[] NOT NULL DEFAULT ARRAY['ar']::public.language_code[],
  cover_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  pdf_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  visibility public.catalog_visibility NOT NULL DEFAULT 'public',
  is_published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.catalogs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.catalogs TO authenticated;
GRANT ALL ON public.catalogs TO service_role;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER catalogs_updated_at BEFORE UPDATE ON public.catalogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ INQUIRIES ============
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.inquiry_kind NOT NULL,
  status public.inquiry_status NOT NULL DEFAULT 'new',
  name text, company text, email text, phone text, country text, message text,
  partner_type public.partner_type,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  catalog_id uuid REFERENCES public.catalogs(id) ON DELETE SET NULL,
  source_url text, user_agent text, ip_hash text,
  locale public.language_code NOT NULL DEFAULT 'ar',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- ============ B2B APPLICATIONS ============
CREATE TABLE public.b2b_partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  country text NOT NULL,
  partner_type public.partner_type NOT NULL,
  years_in_market int,
  markets_served text[],
  brands_of_interest uuid[],
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  website text,
  message text,
  attachments uuid[],
  status public.inquiry_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.b2b_partner_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.b2b_partner_applications TO authenticated;
GRANT ALL ON public.b2b_partner_applications TO service_role;
ALTER TABLE public.b2b_partner_applications ENABLE ROW LEVEL SECURITY;

-- ============ PAGES ============
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  identity_scope public.identity_scope NOT NULL DEFAULT 'corporate',
  brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE,
  title_ar text NOT NULL, title_en text,
  body_ar jsonb, body_en jsonb,
  cover_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  seo_title_ar text, seo_title_en text,
  seo_description_ar text, seo_description_en text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ INSIGHTS ============
CREATE TABLE public.insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL, title_en text,
  excerpt_ar text, excerpt_en text,
  body_ar jsonb, body_en jsonb,
  cover_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  tags text[],
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.insights TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.insights TO authenticated;
GRANT ALL ON public.insights TO service_role;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER insights_updated_at BEFORE UPDATE ON public.insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUDIT LOG ============
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before jsonb, after jsonb,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- profiles: own row
CREATE POLICY "Profiles self read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles self update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles admin all" ON public.profiles FOR ALL USING (public.is_admin(auth.uid()));

-- user_roles: own read; admin manages
CREATE POLICY "User roles self read" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User roles admin manage" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));

-- corporate_identity
CREATE POLICY "Corp identity public read" ON public.corporate_identity FOR SELECT USING (true);
CREATE POLICY "Corp identity admin manage" ON public.corporate_identity FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- brands
CREATE POLICY "Brands public read active" ON public.brands FOR SELECT
  USING (status = 'active' OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'brand_manager') OR public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'viewer'));
CREATE POLICY "Brands admin manage" ON public.brands FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Brands brand_manager update own" ON public.brands FOR UPDATE
  USING (public.has_brand_role(auth.uid(), id, 'brand_manager'));

-- certifications: public read, admin manage
CREATE POLICY "Certifications public read" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Certifications admin manage" ON public.certifications FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Brand certs public read" ON public.brand_certifications FOR SELECT USING (true);
CREATE POLICY "Brand certs manager manage" ON public.brand_certifications FOR ALL
  USING (public.is_admin(auth.uid()) OR public.has_brand_role(auth.uid(), brand_id, 'brand_manager'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_brand_role(auth.uid(), brand_id, 'brand_manager'));

-- assets: public read non-document; staff write
CREATE POLICY "Assets public read non-doc" ON public.assets FOR SELECT
  USING (channel <> 'document' OR auth.uid() IS NOT NULL);
CREATE POLICY "Assets staff insert" ON public.assets FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin(auth.uid())
    OR public.has_role(auth.uid(),'brand_manager')
    OR public.has_role(auth.uid(),'editor')
  );
CREATE POLICY "Assets admin update" ON public.assets FOR UPDATE
  USING (public.is_admin(auth.uid()) OR (public.has_role(auth.uid(),'brand_manager') AND NOT is_official));
CREATE POLICY "Assets admin delete" ON public.assets FOR DELETE
  USING (public.is_admin(auth.uid()) AND NOT is_official);

-- product_categories
CREATE POLICY "Categories public read" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Categories admin manage" ON public.product_categories FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- products
CREATE POLICY "Products public read published" ON public.products FOR SELECT
  USING (is_published OR public.is_admin(auth.uid()) OR public.has_brand_role(auth.uid(), brand_id, 'brand_manager') OR public.has_brand_role(auth.uid(), brand_id, 'editor'));
CREATE POLICY "Products brand manager manage" ON public.products FOR ALL
  USING (public.is_admin(auth.uid()) OR public.has_brand_role(auth.uid(), brand_id, 'brand_manager') OR public.has_brand_role(auth.uid(), brand_id, 'editor'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_brand_role(auth.uid(), brand_id, 'brand_manager') OR public.has_brand_role(auth.uid(), brand_id, 'editor'));

-- product_variants: only staff via base table; public reads via view
CREATE POLICY "Variants staff manage" ON public.product_variants FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (
      public.has_brand_role(auth.uid(), p.brand_id, 'brand_manager')
      OR public.has_brand_role(auth.uid(), p.brand_id, 'editor')
    ))
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (
      public.has_brand_role(auth.uid(), p.brand_id, 'brand_manager')
      OR public.has_brand_role(auth.uid(), p.brand_id, 'editor')
    ))
  );

-- product child tables: public read where parent product is published
CREATE POLICY "Product assets public read" ON public.product_assets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_published));
CREATE POLICY "Product assets staff manage" ON public.product_assets FOR ALL
  USING (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (public.has_brand_role(auth.uid(), p.brand_id, 'brand_manager') OR public.has_brand_role(auth.uid(), p.brand_id, 'editor'))))
  WITH CHECK (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (public.has_brand_role(auth.uid(), p.brand_id, 'brand_manager') OR public.has_brand_role(auth.uid(), p.brand_id, 'editor'))));

CREATE POLICY "Product ingredients public read" ON public.product_ingredients FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_published));
CREATE POLICY "Product ingredients staff manage" ON public.product_ingredients FOR ALL
  USING (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (public.has_brand_role(auth.uid(), p.brand_id, 'brand_manager') OR public.has_brand_role(auth.uid(), p.brand_id, 'editor'))))
  WITH CHECK (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (public.has_brand_role(auth.uid(), p.brand_id, 'brand_manager') OR public.has_brand_role(auth.uid(), p.brand_id, 'editor'))));

CREATE POLICY "Product nutrition public read" ON public.product_nutrition FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_published));
CREATE POLICY "Product nutrition staff manage" ON public.product_nutrition FOR ALL
  USING (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (public.has_brand_role(auth.uid(), p.brand_id, 'brand_manager') OR public.has_brand_role(auth.uid(), p.brand_id, 'editor'))))
  WITH CHECK (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (public.has_brand_role(auth.uid(), p.brand_id, 'brand_manager') OR public.has_brand_role(auth.uid(), p.brand_id, 'editor'))));

CREATE POLICY "Product faqs public read" ON public.product_faqs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_published));
CREATE POLICY "Product faqs staff manage" ON public.product_faqs FOR ALL
  USING (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (public.has_brand_role(auth.uid(), p.brand_id, 'brand_manager') OR public.has_brand_role(auth.uid(), p.brand_id, 'editor'))))
  WITH CHECK (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (public.has_brand_role(auth.uid(), p.brand_id, 'brand_manager') OR public.has_brand_role(auth.uid(), p.brand_id, 'editor'))));

-- catalogs: visibility-aware
CREATE POLICY "Catalogs public read public" ON public.catalogs FOR SELECT
  USING (
    (is_published AND visibility = 'public')
    OR (is_published AND visibility = 'restricted' AND auth.uid() IS NOT NULL)
    OR (visibility = 'b2b_only' AND auth.uid() IS NOT NULL)
    OR public.is_admin(auth.uid())
  );
CREATE POLICY "Catalogs staff manage" ON public.catalogs FOR ALL
  USING (public.is_admin(auth.uid()) OR (brand_id IS NOT NULL AND public.has_brand_role(auth.uid(), brand_id, 'brand_manager')))
  WITH CHECK (public.is_admin(auth.uid()) OR (brand_id IS NOT NULL AND public.has_brand_role(auth.uid(), brand_id, 'brand_manager')));

-- inquiries: anyone insert; staff read
CREATE POLICY "Inquiries public insert" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Inquiries staff read" ON public.inquiries FOR SELECT
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'viewer') OR public.has_role(auth.uid(),'brand_manager') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Inquiries admin update" ON public.inquiries FOR UPDATE
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'brand_manager'));
CREATE POLICY "Inquiries admin delete" ON public.inquiries FOR DELETE
  USING (public.is_admin(auth.uid()));

-- b2b applications
CREATE POLICY "B2B public insert" ON public.b2b_partner_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "B2B staff read" ON public.b2b_partner_applications FOR SELECT
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'brand_manager') OR public.has_role(auth.uid(),'viewer'));
CREATE POLICY "B2B admin update" ON public.b2b_partner_applications FOR UPDATE
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'brand_manager'));
CREATE POLICY "B2B admin delete" ON public.b2b_partner_applications FOR DELETE
  USING (public.is_admin(auth.uid()));

-- pages
CREATE POLICY "Pages public read published" ON public.pages FOR SELECT
  USING (is_published OR public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'brand_manager'));
CREATE POLICY "Pages staff manage" ON public.pages FOR ALL
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor') OR (brand_id IS NOT NULL AND public.has_brand_role(auth.uid(), brand_id, 'brand_manager')))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor') OR (brand_id IS NOT NULL AND public.has_brand_role(auth.uid(), brand_id, 'brand_manager')));

-- insights
CREATE POLICY "Insights public read published" ON public.insights FOR SELECT
  USING (is_published OR public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Insights staff manage" ON public.insights FOR ALL
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'));

-- audit_log
CREATE POLICY "Audit admin read" ON public.audit_log FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Audit staff insert" ON public.audit_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
