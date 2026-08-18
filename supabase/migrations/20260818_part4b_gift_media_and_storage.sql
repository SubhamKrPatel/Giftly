-- ==============================================================================
-- Giftly - Part 4B Migration: Gift Media & Storage Security
-- ==============================================================================

-- 1. Create gift_media table
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

-- 2. Indexes for media lookup and ordering
CREATE INDEX IF NOT EXISTS idx_gift_media_gift_id ON public.gift_media(gift_id);
CREATE INDEX IF NOT EXISTS idx_gift_media_section_id ON public.gift_media(section_id);
CREATE INDEX IF NOT EXISTS idx_gift_media_position ON public.gift_media(gift_id, position);

-- 3. Add updated_at trigger
DROP TRIGGER IF EXISTS set_gift_media_updated_at ON public.gift_media;
CREATE TRIGGER set_gift_media_updated_at
  BEFORE UPDATE ON public.gift_media
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security on gift_media
ALTER TABLE public.gift_media ENABLE ROW LEVEL SECURITY;

-- 4 RLS policies on gift_media scoped to gifts owned by auth.uid()
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

-- 5. Create private storage bucket: gift-media
INSERT INTO storage.buckets (id, name, public)
VALUES ('gift-media', 'gift-media', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 6. Storage object policies for gift-media bucket
-- Storage path structure: gifts/{user_id}/{gift_id}/images/{media_id}.ext
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
