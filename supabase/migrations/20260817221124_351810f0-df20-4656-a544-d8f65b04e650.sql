DROP POLICY IF EXISTS "Anon read enabled sections" ON public.homepage_sections;
DROP POLICY IF EXISTS "Public read enabled sections" ON public.homepage_sections;
CREATE POLICY "Public read homepage sections"
  ON public.homepage_sections FOR SELECT
  TO anon, authenticated
  USING (true);
GRANT SELECT ON public.homepage_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_sections TO authenticated;
GRANT ALL ON public.homepage_sections TO service_role;