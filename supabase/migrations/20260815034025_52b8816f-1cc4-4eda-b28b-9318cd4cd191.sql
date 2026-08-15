CREATE OR REPLACE FUNCTION public.assets_block_delete_when_referenced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  used text[] := '{}';
  n bigint;
  refs constant text[][] := ARRAY[
    ARRAY['brands','logo_asset_id','علامة تجارية (شعار)'],
    ARRAY['brands','hero_asset_id','علامة تجارية (غلاف)'],
    ARRAY['products','cover_asset_id','منتج (غلاف)'],
    ARRAY['product_variants','cover_asset_id','عبوة منتج'],
    ARRAY['product_assets','asset_id','صورة منتج'],
    ARRAY['product_categories','icon_asset_id','تصنيف'],
    ARRAY['insights','cover_asset_id','مقال'],
    ARRAY['pages','cover_asset_id','صفحة'],
    ARRAY['catalogs','cover_asset_id','كتالوج (غلاف)'],
    ARRAY['catalogs','pdf_asset_id','كتالوج (PDF)'],
    ARRAY['certifications','logo_asset_id','شهادة'],
    ARRAY['corporate_identity','logo_asset_id','الهوية المؤسسية'],
    ARRAY['topic_hubs','cover_asset_id','محور معرفي'],
    ARRAY['homepage_sections','media_asset_id','قسم الصفحة الرئيسية'],
    ARRAY['homepage_slides','desktop_asset_id','شريحة (سطح المكتب)'],
    ARRAY['homepage_slides','mobile_asset_id','شريحة (جوال)']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(refs, 1) LOOP
    EXECUTE format('SELECT count(*) FROM public.%I WHERE %I = $1', refs[i][1], refs[i][2])
      INTO n USING OLD.id;
    IF n > 0 THEN
      used := used || (refs[i][3] || ' (' || n || ')');
    END IF;
  END LOOP;

  SELECT count(*) INTO n
  FROM public.homepage_settings s
  WHERE s.id = 1
    AND (COALESCE(s.published_slides::text,'') || COALESCE(s.hero_image_config::text,'')
      || COALESCE(s.hero_custom_config::text,'') || COALESCE(s.hero_slider_config::text,'')
      || COALESCE(s.main_slider_config::text,'') || COALESCE(s.draft_settings::text,'')
      || COALESCE(s.published_snapshot::text,'')) LIKE '%' || OLD.id::text || '%';
  IF n > 0 THEN
    used := used || 'الصفحة الرئيسية المنشورة';
  END IF;

  IF array_length(used, 1) > 0 THEN
    RAISE EXCEPTION 'لا يمكن حذف هذا الملف لأنه مستخدم في: %. أزل الارتباط أولاً.', array_to_string(used, '، ');
  END IF;

  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION public.assets_block_delete_when_referenced() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_assets_block_delete_when_referenced ON public.assets;
CREATE TRIGGER trg_assets_block_delete_when_referenced
BEFORE DELETE ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.assets_block_delete_when_referenced();