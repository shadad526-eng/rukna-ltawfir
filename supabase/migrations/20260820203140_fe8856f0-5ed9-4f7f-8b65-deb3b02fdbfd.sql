INSERT INTO public.pages (slug, title_ar, title_en, is_published, published_at, extra)
VALUES
  ('sugar-alternatives', 'بدائل السكر', 'Sugar Alternatives', true, now(), '{}'::jsonb),
  ('baby-care', 'منتجات الأطفال', 'Baby Care', true, now(), '{}'::jsonb),
  ('oral-care', 'العناية بالفم والأسنان', 'Oral Care', true, now(), '{}'::jsonb),
  ('immunity-vitamin-c', 'المناعة وفيتامين سي', 'Immunity & Vitamin C', true, now(), '{}'::jsonb)
ON CONFLICT (slug) DO NOTHING;