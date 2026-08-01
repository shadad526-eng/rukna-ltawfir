-- 1) Pages: intro + repeatable extra fields (backward compatible)
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS intro_ar text;
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS intro_en text;
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS extra jsonb NOT NULL DEFAULT '{}'::jsonb;

INSERT INTO public.pages (slug, identity_scope, title_ar, title_en, intro_ar, intro_en, is_published, published_at)
VALUES
 ('about', 'corporate', 'من نحن', 'About',
  'نبني منظومة تجارية متكاملة تربط الابتكار العالمي باحتياجات المجتمع المحلي، وتصنع أثرًا مستدامًا في صحة الناس وجودة حياتهم.',
  'We build an integrated commercial ecosystem that connects global innovation with local needs, creating sustainable impact on people''s health and quality of life.',
  true, now()),
 ('partners', 'corporate', 'ابدأ شراكتك التجارية معنا', 'Start your business partnership',
  'للموزعين، الصيدليات، والمحلات الكبرى الراغبين في إدراج علامات المنظومة ضمن قنواتهم التجارية، نوفّر قناة تواصل موحّدة عبر واتساب الأعمال الرسمي بدلًا من النماذج العامة، لضمان سرعة الرد وسرّية شروط الشراكة.',
  'For distributors, pharmacies, and major retailers wishing to list our ecosystem''s brands in their channels, we provide a unified WhatsApp Business channel instead of generic forms — for fast response and confidential partnership terms.',
  true, now()),
 ('contact', 'corporate', 'قنوات التواصل الرسمية', 'Official communication channels',
  'نعتمد واتساب الأعمال قناةً أساسية لجميع الاستفسارات التجارية والاستهلاكية، لضمان سرعة الردّ وحماية بيانات العميل.',
  'We use WhatsApp Business as the primary channel for all trade and consumer inquiries — to ensure fast response and protect customer data.',
  true, now())
ON CONFLICT (slug) DO NOTHING;

-- 2) Branches
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  address_ar text NOT NULL,
  address_en text,
  whatsapp_number text NOT NULL DEFAULT '967774040383',
  whatsapp_message_ar text,
  whatsapp_message_en text,
  map_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.branches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Branches anon read visible" ON public.branches;
CREATE POLICY "Branches anon read visible" ON public.branches
  FOR SELECT TO anon USING (is_visible);

DROP POLICY IF EXISTS "Branches auth read" ON public.branches;
CREATE POLICY "Branches auth read" ON public.branches
  FOR SELECT TO authenticated USING (is_visible OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Branches admin manage" ON public.branches;
CREATE POLICY "Branches admin manage" ON public.branches
  FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP TRIGGER IF EXISTS update_branches_updated_at ON public.branches;
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.branches (name_ar, name_en, address_ar, address_en, whatsapp_number, whatsapp_message_ar, whatsapp_message_en, sort_order, is_visible)
SELECT * FROM (VALUES
 ('فرع عدن', 'Aden Branch',
  'الجمهورية اليمنية – محافظة عدن – مديرية المنصورة – شارع التسعين – خلف ناينتي مول',
  'Republic of Yemen – Aden – Al-Mansoura District – 90th Street – behind Ninety Mall',
  '967774040383',
  'مرحبًا، أود التواصل والاستفسار عن خدمات فرع عدن لدى ركن التوفير كوزمتك للتجارة.',
  'مرحبًا، أود التواصل والاستفسار عن خدمات فرع عدن لدى ركن التوفير كوزمتك للتجارة.',
  0, true),
 ('فرع تعز', 'Taiz Branch',
  'الجمهورية اليمنية – محافظة تعز – مديرية المظفر – حي الأجينات – سوق الأدوية – بجوار محطة 26',
  'Republic of Yemen – Taiz – Al-Mudhaffar District – Al-Ajinat – Medicine Market – next to Station 26',
  '967774040383',
  'مرحبًا، أود التواصل والاستفسار عن خدمات فرع تعز لدى ركن التوفير كوزمتك للتجارة.',
  'مرحبًا، أود التواصل والاستفسار عن خدمات فرع تعز لدى ركن التوفير كوزمتك للتجارة.',
  1, true),
 ('فرع صنعاء', 'Sanaa Branch',
  'الجمهورية اليمنية – أمانة العاصمة صنعاء – مديرية معين – شارع هائل – مبنى العيادات الاستشارية – مقابل صيدلية الجرادي فارما',
  'Republic of Yemen – Sanaa – Maeen District – Hail Street – Consultative Clinics Building – opposite Al-Jaradi Pharma',
  '967774040383',
  'مرحبًا، أود التواصل والاستفسار عن خدمات فرع صنعاء لدى ركن التوفير كوزمتك للتجارة.',
  'مرحبًا، أود التواصل والاستفسار عن خدمات فرع صنعاء لدى ركن التوفير كوزمتك للتجارة.',
  2, true)
) AS v(name_ar, name_en, address_ar, address_en, whatsapp_number, whatsapp_message_ar, whatsapp_message_en, sort_order, is_visible)
WHERE NOT EXISTS (SELECT 1 FROM public.branches);