-- ==============================================================================
-- Giftly - Migration: Public Anonymous Access for Published Gifts & Media
-- ==============================================================================

-- 1. Enable anonymous / public SELECT for published gifts with valid public slugs
DROP POLICY IF EXISTS "Anyone can view published gifts" ON public.gifts;
CREATE POLICY "Anyone can view published gifts"
  ON public.gifts FOR SELECT
  USING (status = 'published' AND public_slug IS NOT NULL);

-- 2. Enable anonymous / public SELECT for visible sections of published gifts
DROP POLICY IF EXISTS "Anyone can view sections of published gifts" ON public.gift_sections;
CREATE POLICY "Anyone can view sections of published gifts"
  ON public.gift_sections FOR SELECT
  USING (
    gift_id IN (
      SELECT id FROM public.gifts WHERE status = 'published' AND public_slug IS NOT NULL
    )
    AND is_visible = true
  );

-- 3. Enable anonymous / public SELECT for media metadata of published gifts
DROP POLICY IF EXISTS "Anyone can view media of published gifts" ON public.gift_media;
CREATE POLICY "Anyone can view media of published gifts"
  ON public.gift_media FOR SELECT
  USING (
    gift_id IN (
      SELECT id FROM public.gifts WHERE status = 'published' AND public_slug IS NOT NULL
    )
  );

-- 4. Enable anonymous / public SELECT for storage objects of published gifts
DROP POLICY IF EXISTS "Anyone can view media objects for published gifts" ON storage.objects;
CREATE POLICY "Anyone can view media objects for published gifts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'gift-media' AND
    (storage.foldername(name))[3] IN (
      SELECT id::text FROM public.gifts WHERE status = 'published' AND public_slug IS NOT NULL
    )
  );

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
