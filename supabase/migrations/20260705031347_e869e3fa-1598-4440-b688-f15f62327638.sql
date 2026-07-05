
-- 1. Topic Authority Hubs
CREATE TABLE IF NOT EXISTS public.topic_hubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL,
  title_en text,
  intro_ar text,
  intro_en text,
  cover_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  related_brand_ids uuid[] DEFAULT '{}',
  related_product_ids uuid[] DEFAULT '{}',
  related_article_ids uuid[] DEFAULT '{}',
  seo_title text,
  seo_description text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topic_hubs TO authenticated;
GRANT SELECT ON public.topic_hubs TO anon;
GRANT ALL ON public.topic_hubs TO service_role;
ALTER TABLE public.topic_hubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published hubs" ON public.topic_hubs FOR SELECT USING (is_published = true OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Super admin manage hubs" ON public.topic_hubs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 2. Navigation items
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL DEFAULT 'header',
  parent_id uuid REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  label_ar text NOT NULL,
  label_en text,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.navigation_items TO authenticated;
GRANT SELECT ON public.navigation_items TO anon;
GRANT ALL ON public.navigation_items TO service_role;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible nav" ON public.navigation_items FOR SELECT USING (is_visible = true OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Super admin manage nav" ON public.navigation_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 3. Homepage sections
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title_ar text,
  title_en text,
  subtitle_ar text,
  subtitle_en text,
  body_ar text,
  body_en text,
  cta_label_ar text,
  cta_url text,
  media_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_sections TO authenticated;
GRANT SELECT ON public.homepage_sections TO anon;
GRANT ALL ON public.homepage_sections TO service_role;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read enabled sections" ON public.homepage_sections FOR SELECT USING (is_enabled = true OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Super admin manage sections" ON public.homepage_sections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 4. Website settings key/value store (colors, fonts, social, contact overrides)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Super admin manage site settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 5. Convenience helper
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'super_admin');
$$;

-- 6. updated_at triggers
DROP TRIGGER IF EXISTS trg_hubs_updated ON public.topic_hubs;
CREATE TRIGGER trg_hubs_updated BEFORE UPDATE ON public.topic_hubs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_nav_updated ON public.navigation_items;
CREATE TRIGGER trg_nav_updated BEFORE UPDATE ON public.navigation_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_home_updated ON public.homepage_sections;
CREATE TRIGGER trg_home_updated BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_settings_updated ON public.site_settings;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Extend bootstrap trigger to include the new super admin email
CREATE OR REPLACE FUNCTION public.bootstrap_super_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) IN ('shadad526@gmail.com', 'rukn@ruknaltawfer.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role, brand_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_bootstrap_super_admin'
  ) THEN
    CREATE TRIGGER on_auth_user_bootstrap_super_admin
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.bootstrap_super_admin();
  END IF;
END $$;

-- 8. Create the primary Super Admin auth user (idempotent)
DO $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = 'rukn@ruknaltawfer.com';
  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'rukn@ruknaltawfer.com', crypt('774040383', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Rukn Super Admin"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
    VALUES (
      gen_random_uuid(), v_uid, v_uid::text,
      jsonb_build_object('sub', v_uid::text, 'email', 'rukn@ruknaltawfer.com', 'email_verified', true),
      'email', now(), now(), now()
    );
  END IF;
  -- Ensure super_admin role
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'super_admin')
  ON CONFLICT (user_id, role, brand_id) DO NOTHING;
  -- Ensure profile
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (v_uid, 'rukn@ruknaltawfer.com', 'Rukn Super Admin')
  ON CONFLICT (id) DO NOTHING;
END $$;
