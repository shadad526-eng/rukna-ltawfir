
WITH new_assets AS (
  INSERT INTO public.assets (storage_bucket, storage_path, original_filename, mime_type, channel, is_official, alt_text_ar)
  VALUES
    ('brand-assets','y-kelin/ortho-v-brush.jpg','ortho-v-brush.jpg','image/jpeg','packaging_official',true,'فرشاة تقويم الأسنان Ortho V Brush'),
    ('brand-assets','y-kelin/u-shaped-ortho-brush.jpg','u-shaped-ortho-brush.jpg','image/jpeg','packaging_official',true,'فرشاة تقويم الأسنان U-Shaped Ortho'),
    ('brand-assets','y-kelin/2in1-soft-toothbrush.jpg','2in1-soft-toothbrush.jpg','image/jpeg','packaging_official',true,'فرشاة أسنان 2-in-1 Soft'),
    ('brand-assets','y-kelin/ortho-u-brush.jpg','ortho-u-brush.jpg','image/jpeg','packaging_official',true,'فرشاة تقويم الأسنان Ortho U Brush')
  ON CONFLICT (storage_bucket, storage_path) DO UPDATE SET is_official = EXCLUDED.is_official
  RETURNING id, storage_path
)
UPDATE public.products p SET cover_asset_id = a.id
FROM new_assets a
WHERE
  (p.slug = 'y-kelin-ortho-v-brush' AND a.storage_path = 'y-kelin/ortho-v-brush.jpg')
  OR (p.slug = 'y-kelin-u-shaped-ortho-brush' AND a.storage_path = 'y-kelin/u-shaped-ortho-brush.jpg')
  OR (p.slug = 'y-kelin-2in1-soft-toothbrush' AND a.storage_path = 'y-kelin/2in1-soft-toothbrush.jpg')
  OR (p.slug = 'y-kelin-ortho-u-brush' AND a.storage_path = 'y-kelin/ortho-u-brush.jpg');
