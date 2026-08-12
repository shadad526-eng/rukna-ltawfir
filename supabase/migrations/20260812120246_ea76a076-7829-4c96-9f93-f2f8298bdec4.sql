CREATE OR REPLACE FUNCTION public.save_product(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_id uuid := NULLIF(payload->>'id','')::uuid;
  v_keep uuid[];
  v_rows jsonb;
BEGIN
  IF v_id IS NULL THEN
    INSERT INTO public.products (
      brand_id, category_id, slug, name_ar, name_en,
      short_description_ar, short_description_en, long_description_ar, long_description_en,
      usage_instructions_ar, usage_instructions_en, key_benefits_ar, key_benefits_en,
      cover_asset_id, is_published, sort_order,
      seo_title_ar, seo_title_en, seo_description_ar, seo_description_en
    ) VALUES (
      NULLIF(payload->>'brand_id','')::uuid,
      NULLIF(payload->>'category_id','')::uuid,
      payload->>'slug', payload->>'name_ar', payload->>'name_en',
      payload->>'short_description_ar', payload->>'short_description_en',
      payload->>'long_description_ar', payload->>'long_description_en',
      payload->>'usage_instructions_ar', payload->>'usage_instructions_en',
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'key_benefits_ar','[]'::jsonb))), '{}'),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'key_benefits_en','[]'::jsonb))), '{}'),
      NULLIF(payload->>'cover_asset_id','')::uuid,
      COALESCE((payload->>'is_published')::boolean, false),
      COALESCE((payload->>'sort_order')::int, 0),
      payload->>'seo_title_ar', payload->>'seo_title_en',
      payload->>'seo_description_ar', payload->>'seo_description_en'
    )
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.products SET
      brand_id = NULLIF(payload->>'brand_id','')::uuid,
      category_id = NULLIF(payload->>'category_id','')::uuid,
      slug = payload->>'slug',
      name_ar = payload->>'name_ar',
      name_en = payload->>'name_en',
      short_description_ar = payload->>'short_description_ar',
      short_description_en = payload->>'short_description_en',
      long_description_ar = payload->>'long_description_ar',
      long_description_en = payload->>'long_description_en',
      usage_instructions_ar = payload->>'usage_instructions_ar',
      usage_instructions_en = payload->>'usage_instructions_en',
      key_benefits_ar = COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'key_benefits_ar','[]'::jsonb))), '{}'),
      key_benefits_en = COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'key_benefits_en','[]'::jsonb))), '{}'),
      cover_asset_id = NULLIF(payload->>'cover_asset_id','')::uuid,
      is_published = COALESCE((payload->>'is_published')::boolean, false),
      sort_order = COALESCE((payload->>'sort_order')::int, 0),
      seo_title_ar = payload->>'seo_title_ar',
      seo_title_en = payload->>'seo_title_en',
      seo_description_ar = payload->>'seo_description_ar',
      seo_description_en = payload->>'seo_description_en'
    WHERE id = v_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'المنتج غير موجود أو لا تملك صلاحية تعديله';
    END IF;
  END IF;

  -- ---------- variants ----------
  v_rows := COALESCE(payload->'variants','[]'::jsonb);
  v_keep := COALESCE(ARRAY(SELECT (e->>'id')::uuid FROM jsonb_array_elements(v_rows) e WHERE NULLIF(e->>'id','') IS NOT NULL), '{}');
  DELETE FROM public.product_variants WHERE product_id = v_id AND NOT (id = ANY(v_keep));
  INSERT INTO public.product_variants (id, product_id, slug, name_ar, name_en, variant_type, pack_size, unit_count, weight_grams, barcode, internal_sku, cover_asset_id, is_published, sort_order)
  SELECT COALESCE(NULLIF(e->>'id','')::uuid, gen_random_uuid()), v_id,
         e->>'slug', e->>'name_ar', e->>'name_en', COALESCE(NULLIF(e->>'variant_type',''),'size'),
         e->>'pack_size', NULLIF(e->>'unit_count','')::int, NULLIF(e->>'weight_grams','')::numeric,
         e->>'barcode', e->>'internal_sku', NULLIF(e->>'cover_asset_id','')::uuid,
         COALESCE((e->>'is_published')::boolean,false), (ord - 1)::int
  FROM jsonb_array_elements(v_rows) WITH ORDINALITY AS t(e, ord)
  ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug, name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
    variant_type = EXCLUDED.variant_type, pack_size = EXCLUDED.pack_size,
    unit_count = EXCLUDED.unit_count, weight_grams = EXCLUDED.weight_grams,
    barcode = EXCLUDED.barcode, internal_sku = EXCLUDED.internal_sku,
    cover_asset_id = EXCLUDED.cover_asset_id, is_published = EXCLUDED.is_published,
    sort_order = EXCLUDED.sort_order;

  -- ---------- assets ----------
  v_rows := COALESCE(payload->'assets','[]'::jsonb);
  v_keep := COALESCE(ARRAY(SELECT (e->>'id')::uuid FROM jsonb_array_elements(v_rows) e WHERE NULLIF(e->>'id','') IS NOT NULL), '{}');
  DELETE FROM public.product_assets WHERE product_id = v_id AND NOT (id = ANY(v_keep));
  INSERT INTO public.product_assets (id, product_id, asset_id, caption_ar, caption_en, sort_order)
  SELECT COALESCE(NULLIF(e->>'id','')::uuid, gen_random_uuid()), v_id,
         (e->>'asset_id')::uuid, e->>'caption_ar', e->>'caption_en', (ord - 1)::int
  FROM jsonb_array_elements(v_rows) WITH ORDINALITY AS t(e, ord)
  ON CONFLICT (id) DO UPDATE SET
    asset_id = EXCLUDED.asset_id, caption_ar = EXCLUDED.caption_ar,
    caption_en = EXCLUDED.caption_en, sort_order = EXCLUDED.sort_order;

  -- ---------- ingredients ----------
  v_rows := COALESCE(payload->'ingredients','[]'::jsonb);
  v_keep := COALESCE(ARRAY(SELECT (e->>'id')::uuid FROM jsonb_array_elements(v_rows) e WHERE NULLIF(e->>'id','') IS NOT NULL), '{}');
  DELETE FROM public.product_ingredients WHERE product_id = v_id AND NOT (id = ANY(v_keep));
  INSERT INTO public.product_ingredients (id, product_id, name_ar, name_en, percentage, origin_ar, origin_en, notes_ar, notes_en, sort_order)
  SELECT COALESCE(NULLIF(e->>'id','')::uuid, gen_random_uuid()), v_id,
         e->>'name_ar', e->>'name_en', NULLIF(e->>'percentage','')::numeric,
         e->>'origin_ar', e->>'origin_en', e->>'notes_ar', e->>'notes_en', (ord - 1)::int
  FROM jsonb_array_elements(v_rows) WITH ORDINALITY AS t(e, ord)
  ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en, percentage = EXCLUDED.percentage,
    origin_ar = EXCLUDED.origin_ar, origin_en = EXCLUDED.origin_en,
    notes_ar = EXCLUDED.notes_ar, notes_en = EXCLUDED.notes_en, sort_order = EXCLUDED.sort_order;

  -- ---------- nutrition ----------
  v_rows := COALESCE(payload->'nutrition','[]'::jsonb);
  v_keep := COALESCE(ARRAY(SELECT (e->>'id')::uuid FROM jsonb_array_elements(v_rows) e WHERE NULLIF(e->>'id','') IS NOT NULL), '{}');
  DELETE FROM public.product_nutrition WHERE product_id = v_id AND NOT (id = ANY(v_keep));
  INSERT INTO public.product_nutrition (id, product_id, label_ar, label_en, value, unit, sort_order)
  SELECT COALESCE(NULLIF(e->>'id','')::uuid, gen_random_uuid()), v_id,
         e->>'label_ar', e->>'label_en', e->>'value', e->>'unit', (ord - 1)::int
  FROM jsonb_array_elements(v_rows) WITH ORDINALITY AS t(e, ord)
  ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar, label_en = EXCLUDED.label_en, value = EXCLUDED.value,
    unit = EXCLUDED.unit, sort_order = EXCLUDED.sort_order;

  -- ---------- faqs ----------
  v_rows := COALESCE(payload->'faqs','[]'::jsonb);
  v_keep := COALESCE(ARRAY(SELECT (e->>'id')::uuid FROM jsonb_array_elements(v_rows) e WHERE NULLIF(e->>'id','') IS NOT NULL), '{}');
  DELETE FROM public.product_faqs WHERE product_id = v_id AND NOT (id = ANY(v_keep));
  INSERT INTO public.product_faqs (id, product_id, question_ar, answer_ar, question_en, answer_en, sort_order)
  SELECT COALESCE(NULLIF(e->>'id','')::uuid, gen_random_uuid()), v_id,
         e->>'question_ar', e->>'answer_ar', e->>'question_en', e->>'answer_en', (ord - 1)::int
  FROM jsonb_array_elements(v_rows) WITH ORDINALITY AS t(e, ord)
  ON CONFLICT (id) DO UPDATE SET
    question_ar = EXCLUDED.question_ar, answer_ar = EXCLUDED.answer_ar,
    question_en = EXCLUDED.question_en, answer_en = EXCLUDED.answer_en,
    sort_order = EXCLUDED.sort_order;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_product(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_product(jsonb) TO authenticated;