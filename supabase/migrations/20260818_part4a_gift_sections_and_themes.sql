-- ==============================================================================
-- Giftly - Part 4A Migration: Gift Sections & Theme Configuration
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

-- 3. Create indexes for quick section lookup and ordering
CREATE INDEX IF NOT EXISTS idx_gift_sections_gift_id ON public.gift_sections(gift_id);
CREATE INDEX IF NOT EXISTS idx_gift_sections_position ON public.gift_sections(gift_id, position);

-- 4. Add updated_at trigger to gift_sections
DROP TRIGGER IF EXISTS set_gift_sections_updated_at ON public.gift_sections;
CREATE TRIGGER set_gift_sections_updated_at
  BEFORE UPDATE ON public.gift_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Enable Row Level Security on gift_sections
ALTER TABLE public.gift_sections ENABLE ROW LEVEL SECURITY;

-- 4 RLS policies scoped to gifts owned by auth.uid()
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
