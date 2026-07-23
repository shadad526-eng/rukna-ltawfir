
CREATE TABLE public.homepage_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  main_slider_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  main_slider_position TEXT NOT NULL DEFAULT 'before_hero',
  main_slider_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  hero_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  hero_type TEXT NOT NULL DEFAULT 'image',
  hero_image_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  hero_slider_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  hero_custom_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT homepage_settings_singleton CHECK (id = 1),
  CONSTRAINT homepage_settings_position_chk CHECK (main_slider_position IN ('before_hero','after_hero')),
  CONSTRAINT homepage_settings_hero_type_chk CHECK (hero_type IN ('image','slider','custom'))
);

GRANT SELECT ON public.homepage_settings TO anon, authenticated;
GRANT ALL ON public.homepage_settings TO service_role;

ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "homepage_settings public read"
  ON public.homepage_settings FOR SELECT
  USING (true);

CREATE POLICY "homepage_settings super admin write"
  ON public.homepage_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_homepage_settings_updated_at
  BEFORE UPDATE ON public.homepage_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.homepage_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE public.homepage_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slider_group TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  desktop_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  mobile_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  title_ar TEXT,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  alt_ar TEXT,
  alt_en TEXT,
  cta1 JSONB NOT NULL DEFAULT '{}'::jsonb,
  cta2 JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT homepage_slides_group_chk CHECK (slider_group IN ('main','hero'))
);

CREATE INDEX homepage_slides_group_order_idx
  ON public.homepage_slides (slider_group, sort_order);

GRANT SELECT ON public.homepage_slides TO anon, authenticated;
GRANT ALL ON public.homepage_slides TO service_role;

ALTER TABLE public.homepage_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "homepage_slides public read published"
  ON public.homepage_slides FOR SELECT
  USING (is_published = TRUE AND is_visible = TRUE);

CREATE POLICY "homepage_slides super admin read all"
  ON public.homepage_slides FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "homepage_slides super admin write"
  ON public.homepage_slides FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_homepage_slides_updated_at
  BEFORE UPDATE ON public.homepage_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
