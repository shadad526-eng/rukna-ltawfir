
-- ============ STORAGE POLICIES ============
-- brand-assets: public read (bucket is private at the storage layer due to workspace policy,
-- but we surface logos/packaging through public-read RLS)
CREATE POLICY "Brand assets public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-assets');

CREATE POLICY "Brand assets staff write"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets'
  AND (
    public.is_admin(auth.uid())
    OR public.has_role(auth.uid(),'brand_manager')
    OR public.has_role(auth.uid(),'editor')
  )
);
CREATE POLICY "Brand assets staff update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'brand-assets'
  AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'brand_manager'))
);
CREATE POLICY "Brand assets admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'brand-assets' AND public.is_admin(auth.uid()));

-- catalogs: no public read. Server functions sign URLs based on catalog visibility.
CREATE POLICY "Catalogs admin manage"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'catalogs'
  AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'brand_manager'))
)
WITH CHECK (
  bucket_id = 'catalogs'
  AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'brand_manager'))
);

-- ============ SEED: ASSETS (logos, locked as official) ============
INSERT INTO public.assets (id, storage_bucket, storage_path, original_filename, mime_type, channel, is_official, alt_text_ar, alt_text_en) VALUES
  ('11111111-0000-0000-0000-000000000001','brand-assets','isis/logo.jpg','isis-logo.jpg','image/jpeg','brand_logo',true,'شعار iSiS','iSiS official logo'),
  ('11111111-0000-0000-0000-000000000002','brand-assets','sekem/logo.jpg','sekem-logo.jpg','image/jpeg','brand_logo',true,'شعار SEKEM','SEKEM official logo'),
  ('11111111-0000-0000-0000-000000000003','brand-assets','steviola/logo.jpg','steviola-logo.jpg','image/jpeg','brand_logo',true,'شعار Steviola','Steviola official logo'),
  ('11111111-0000-0000-0000-000000000004','brand-assets','nocal/logo.jpg','nocal-logo.jpg','image/jpeg','brand_logo',true,'شعار NO CAL','NO CAL official logo'),
  ('11111111-0000-0000-0000-000000000005','brand-assets','monivo/logo.jpg','monivo-logo.jpg','image/jpeg','brand_logo',true,'شعار Monivo','Monivo official logo'),
  ('11111111-0000-0000-0000-000000000006','brand-assets','baby-tawfir/logo.png','baby-tawfir-logo.png','image/png','brand_logo',true,'شعار بيبي توفير','Baby Tawfir official logo'),
  ('11111111-0000-0000-0000-000000000007','brand-assets','bambo-fresh/logo.jpg','bambo-fresh-logo.jpg','image/jpeg','brand_logo',true,'شعار Bambo Fresh','Bambo Fresh official logo');

-- ============ SEED: BRANDS ============
INSERT INTO public.brands (slug, name_ar, name_en, tagline_ar, tagline_en, status, is_partner, is_umbrella, sort_order, logo_asset_id, brand_tokens) VALUES
  ('isis','iSiS','iSiS','منذ ١٩٧٧','Since 1977','active', false, true, 1,
    '11111111-0000-0000-0000-000000000001',
    '{"primary":"oklch(0.48 0.15 148)","accent":"oklch(0.78 0.15 85)","gradient":"linear-gradient(135deg, oklch(0.48 0.15 148), oklch(0.78 0.15 85))","mood":"heritage"}'::jsonb),
  ('sekem','سيكم','SEKEM','شريك عضوي استراتيجي','Strategic organic partner','active', true, false, 2,
    '11111111-0000-0000-0000-000000000002',
    '{"primary":"oklch(0.36 0.07 30)","accent":"oklch(0.62 0.17 145)","gradient":"linear-gradient(135deg, oklch(0.36 0.07 30), oklch(0.62 0.17 145))","mood":"organic"}'::jsonb),
  ('steviola','ستيفيولا','Steviola','محلٍّ طبيعي ١٠٠٪ من نبات الستيفيا','100% natural stevia sweetener','active', false, false, 3,
    '11111111-0000-0000-0000-000000000003',
    '{"primary":"oklch(0.55 0.13 130)","accent":"oklch(0.70 0.13 75)","gradient":"linear-gradient(135deg, oklch(0.70 0.13 75), oklch(0.55 0.13 130))","mood":"natural-warm"}'::jsonb),
  ('nocal','نو كال','NO CAL','محلٍّ بديل للسكر بدون سعرات','No-calorie sweetener','active', false, false, 4,
    '11111111-0000-0000-0000-000000000004',
    '{"primary":"oklch(0.30 0.12 268)","accent":"oklch(0.62 0.17 145)","gradient":"linear-gradient(135deg, oklch(0.30 0.12 268), oklch(0.62 0.17 145))","mood":"clinical-trust"}'::jsonb),
  ('monivo','مونيفو','Monivo','نكهات طبيعية منعشة','Fresh natural flavors','active', false, false, 5,
    '11111111-0000-0000-0000-000000000005',
    '{"primary":"oklch(0.62 0.19 145)","accent":"oklch(0.85 0.13 110)","gradient":"linear-gradient(135deg, oklch(0.85 0.13 110), oklch(0.62 0.19 145))","mood":"fresh-youthful"}'::jsonb),
  ('baby-tawfir','بيبي توفير','Baby Tawfir','عناية لطيفة بطفلك','Gentle care for your baby','active', false, false, 6,
    '11111111-0000-0000-0000-000000000006',
    '{"primary":"oklch(0.72 0.13 355)","accent":"oklch(0.72 0.10 195)","gradient":"linear-gradient(135deg, oklch(0.72 0.13 355), oklch(0.72 0.10 195))","mood":"gentle-care"}'::jsonb),
  ('bambo-fresh','بامبو فريش','Bambo Fresh','نضارة جريئة كل يوم','Bold everyday freshness','active', false, false, 7,
    '11111111-0000-0000-0000-000000000007',
    '{"primary":"oklch(0.18 0.02 260)","accent":"oklch(0.985 0.005 95)","gradient":"linear-gradient(135deg, oklch(0.18 0.02 260), oklch(0.46 0.02 260))","mood":"bold-playful"}'::jsonb);

-- ============ SEED: CORPORATE IDENTITY ============
INSERT INTO public.corporate_identity (
  id, legal_name_ar, legal_name_en, parent_group_ar, parent_group_en,
  hero_headline_ar, hero_sub_ar,
  hero_headline_en, hero_sub_en,
  whatsapp_number, email, address_ar, address_en
) VALUES (
  1,
  'ركن التوفير كوزمتك للتجارة',
  'Rukn Al-Tawfir Cosmetic Trading',
  'مجموعة الجرادي ميد باور',
  'Aljaradi Medpower Group',
  'نبني حياة أكثر صحة... ونصنع مستقبلًا أقوى.',
  'الشريك الاستراتيجي والبوابة الأولى للعلامات التجارية الصحية في اليمن.',
  'Building healthier lives. Crafting a stronger future.',
  'The strategic partner and primary gateway for trusted health brands in Yemen.',
  '774040383',
  NULL,
  'الجمهورية اليمنية',
  'Republic of Yemen'
);

-- ============ SEED: PRODUCT CATEGORIES ============
INSERT INTO public.product_categories (slug, name_ar, name_en, sort_order) VALUES
  ('healthy-sweeteners','التحلية الصحية','Healthy Sweeteners',1),
  ('baby-care','العناية بالطفل','Baby Care',2),
  ('organic-products','المنتجات العضوية','Organic Products',3),
  ('beverages','المشروبات','Beverages',4),
  ('personal-care','العناية الشخصية','Personal Care',5);

-- ============ SEED: CERTIFICATIONS ============
INSERT INTO public.certifications (slug, name_ar, name_en) VALUES
  ('haccp','HACCP','HACCP'),
  ('iso-22000','ISO 22000','ISO 22000'),
  ('halal','حلال','Halal Certified'),
  ('sekem-organic','عضوي SEKEM','SEKEM Organic');
