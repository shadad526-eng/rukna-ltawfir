-- Staff/admin policies: restrict to signed-in users only
ALTER POLICY "Assets admin delete" ON public.assets TO authenticated;
ALTER POLICY "Audit admin read" ON public.audit_log TO authenticated;
ALTER POLICY "B2B admin delete" ON public.b2b_partner_applications TO authenticated;
ALTER POLICY "B2B admin update" ON public.b2b_partner_applications TO authenticated;
ALTER POLICY "Brand certs manager manage" ON public.brand_certifications TO authenticated;
ALTER POLICY "Brands admin manage" ON public.brands TO authenticated;
ALTER POLICY "Brands brand_manager update own" ON public.brands TO authenticated;
ALTER POLICY "Catalog requests admin update" ON public.catalog_requests TO authenticated;
ALTER POLICY "Catalogs staff manage" ON public.catalogs TO authenticated;
ALTER POLICY "Certifications admin manage" ON public.certifications TO authenticated;
ALTER POLICY "Corp identity admin manage" ON public.corporate_identity TO authenticated;
ALTER POLICY "Inquiries admin update" ON public.inquiries TO authenticated;
ALTER POLICY "Inquiries admin delete" ON public.inquiries TO authenticated;
ALTER POLICY "Product assets staff manage" ON public.product_assets TO authenticated;
ALTER POLICY "Categories admin manage" ON public.product_categories TO authenticated;
ALTER POLICY "Product faqs staff manage" ON public.product_faqs TO authenticated;
ALTER POLICY "Product ingredients staff manage" ON public.product_ingredients TO authenticated;
ALTER POLICY "Product nutrition staff manage" ON public.product_nutrition TO authenticated;
ALTER POLICY "Variants staff manage" ON public.product_variants TO authenticated;
ALTER POLICY "Products brand manager manage" ON public.products TO authenticated;
ALTER POLICY "Profiles admin all" ON public.profiles TO authenticated;
ALTER POLICY "User roles admin manage" ON public.user_roles TO authenticated;

-- Public SELECT policies: split into anon (no role helpers) + authenticated (with role helpers)
ALTER POLICY "Brands public read active" ON public.brands TO authenticated;
CREATE POLICY "Brands anon read active" ON public.brands FOR SELECT TO anon
USING (status = 'active'::brand_status);

ALTER POLICY "Products public read published" ON public.products TO authenticated;
CREATE POLICY "Products anon read published" ON public.products FOR SELECT TO anon
USING (is_published);

ALTER POLICY "Catalogs public read public" ON public.catalogs TO authenticated;
CREATE POLICY "Catalogs anon read public" ON public.catalogs FOR SELECT TO anon
USING (is_published AND visibility = 'public'::catalog_visibility);

ALTER POLICY "Pages public read published" ON public.pages TO authenticated;
CREATE POLICY "Pages anon read published" ON public.pages FOR SELECT TO anon
USING (is_published);

ALTER POLICY "Insights public read published" ON public.insights TO authenticated;
CREATE POLICY "Insights anon read published" ON public.insights FOR SELECT TO anon
USING (is_published);

ALTER POLICY "Public read visible nav" ON public.navigation_items TO authenticated;
CREATE POLICY "Anon read visible nav" ON public.navigation_items FOR SELECT TO anon
USING (is_visible = true);

ALTER POLICY "Public read enabled sections" ON public.homepage_sections TO authenticated;
CREATE POLICY "Anon read enabled sections" ON public.homepage_sections FOR SELECT TO anon
USING (is_enabled = true);

ALTER POLICY "Public read published hubs" ON public.topic_hubs TO authenticated;
CREATE POLICY "Anon read published hubs" ON public.topic_hubs FOR SELECT TO anon
USING (is_published = true);