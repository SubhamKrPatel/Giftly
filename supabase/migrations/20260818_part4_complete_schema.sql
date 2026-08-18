-- ==============================================================================
-- Giftly - Complete Part 4 Schema Migration (4A + 4B + 4C + 4D)
-- Run this in your Supabase SQL Editor to set up all tables, columns,
-- RLS policies, indexes, triggers, and storage bucket security.
-- ==============================================================================

-- 1. Add theme_config to gifts table
ALTER TABLE public.gifts 
ADD COLUMN IF NOT EXISTS theme_config jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2. Create gift_sections table
CREATE TABLE IF NOT EXISTS public.gift_sections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id      uuid NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  position     integer NOT NULL DEFAULT 0,
  content      jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible   boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes on gift_sections
CREATE INDEX IF NOT EXISTS idx_gift_sections_gift_id ON public.gift_sections(gift_id);
CREATE INDEX IF NOT EXISTS idx_gift_sections_position ON public.gift_sections(gift_id, position);

-- 4. Trigger on gift_sections
DROP TRIGGER IF EXISTS set_gift_sections_updated_at ON public.gift_sections;
CREATE TRIGGER set_gift_sections_updated_at
  BEFORE UPDATE ON public.gift_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. RLS on gift_sections
ALTER TABLE public.gift_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own gift sections" ON public.gift_sections;
CREATE POLICY "Users can view their own gift sections"
  ON public.gift_sections FOR SELECT
  USING (
    gift_id IN (SELECT id FROM public.gifts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert their own gift sections" ON public.gift_sections;
CREATE POLICY "Users can insert their own gift sections"
  ON public.gift_sections FOR INSERT
  WITH CHECK (
    gift_id IN (SELECT id FROM public.gifts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own gift sections" ON public.gift_sections;
CREATE POLICY "Users can update their own gift sections"
  ON public.gift_sections FOR UPDATE
  USING (
    gift_id IN (SELECT id FROM public.gifts WHERE user_id = auth.uid())
  )
  WITH CHECK (
    gift_id IN (SELECT id FROM public.gifts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete their own gift sections" ON public.gift_sections;
CREATE POLICY "Users can delete their own gift sections"
  ON public.gift_sections FOR DELETE
  USING (
    gift_id IN (SELECT id FROM public.gifts WHERE user_id = auth.uid())
  );

-- 6. Create gift_media table (photos, videos, audio/voice, music)
CREATE TABLE IF NOT EXISTS public.gift_media (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id      uuid NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  section_id   uuid REFERENCES public.gift_sections(id) ON DELETE CASCADE,
  media_type   text NOT NULL DEFAULT 'image',
  storage_path text NOT NULL,
  file_name    text NOT NULL,
  mime_type    text NOT NULL,
  file_size    bigint NOT NULL,
  position     integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 7. Indexes on gift_media
CREATE INDEX IF NOT EXISTS idx_gift_media_gift_id ON public.gift_media(gift_id);
CREATE INDEX IF NOT EXISTS idx_gift_media_section_id ON public.gift_media(section_id);
CREATE INDEX IF NOT EXISTS idx_gift_media_position ON public.gift_media(gift_id, position);

-- 8. Trigger on gift_media
DROP TRIGGER IF EXISTS set_gift_media_updated_at ON public.gift_media;
CREATE TRIGGER set_gift_media_updated_at
  BEFORE UPDATE ON public.gift_media
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. RLS on gift_media
ALTER TABLE public.gift_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own gift media" ON public.gift_media;
CREATE POLICY "Users can view their own gift media"
  ON public.gift_media FOR SELECT
  USING (
    gift_id IN (SELECT id FROM public.gifts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert their own gift media" ON public.gift_media;
CREATE POLICY "Users can insert their own gift media"
  ON public.gift_media FOR INSERT
  WITH CHECK (
    gift_id IN (SELECT id FROM public.gifts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own gift media" ON public.gift_media;
CREATE POLICY "Users can update their own gift media"
  ON public.gift_media FOR UPDATE
  USING (
    gift_id IN (SELECT id FROM public.gifts WHERE user_id = auth.uid())
  )
  WITH CHECK (
    gift_id IN (SELECT id FROM public.gifts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete their own gift media" ON public.gift_media;
CREATE POLICY "Users can delete their own gift media"
  ON public.gift_media FOR DELETE
  USING (
    gift_id IN (SELECT id FROM public.gifts WHERE user_id = auth.uid())
  );

-- 10. Private storage bucket: gift-media
INSERT INTO storage.buckets (id, name, public)
VALUES ('gift-media', 'gift-media', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 11. Storage object policies for gift-media bucket
DROP POLICY IF EXISTS "Users can view own gift media objects" ON storage.objects;
CREATE POLICY "Users can view own gift media objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'gift-media' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can upload own gift media objects" ON storage.objects;
CREATE POLICY "Users can upload own gift media objects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gift-media' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own gift media objects" ON storage.objects;
CREATE POLICY "Users can update own gift media objects"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'gift-media' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own gift media objects" ON storage.objects;
CREATE POLICY "Users can delete own gift media objects"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gift-media' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- 12. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
