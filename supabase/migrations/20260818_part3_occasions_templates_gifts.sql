-- ==============================================================================
-- Giftly - Part 3 Migration: Occasions, Templates & Gifts
-- ==============================================================================

-- 1. Create occasions catalog table
CREATE TABLE IF NOT EXISTS public.occasions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text NOT NULL,
  icon        text NOT NULL,   -- emoji string
  sort_order  int  NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and allow public read-only access
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-only access on occasions" ON public.occasions;
CREATE POLICY "Allow public read-only access on occasions"
  ON public.occasions FOR SELECT
  USING (true);

-- 2. Create templates catalog table
CREATE TABLE IF NOT EXISTS public.templates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occasion_id    uuid NOT NULL REFERENCES public.occasions(id) ON DELETE CASCADE,
  name           text NOT NULL,
  slug           text UNIQUE NOT NULL,
  description    text NOT NULL,
  thumbnail_url  text,
  theme_config   jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active      boolean NOT NULL DEFAULT true,
  sort_order     int NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and allow public read-only access
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-only access on templates" ON public.templates;
CREATE POLICY "Allow public read-only access on templates"
  ON public.templates FOR SELECT
  USING (true);

-- 3. Create gifts table
CREATE TABLE IF NOT EXISTS public.gifts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occasion_id    uuid NOT NULL REFERENCES public.occasions(id),
  template_id    uuid NOT NULL REFERENCES public.templates(id),
  title          text,
  recipient_name text NOT NULL,
  sender_name    text,
  status         text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on gifts
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- 4 RLS policies for gifts (scoped strictly to auth.uid() = user_id)
DROP POLICY IF EXISTS "Users can view their own gifts" ON public.gifts;
CREATE POLICY "Users can view their own gifts"
  ON public.gifts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own gifts" ON public.gifts;
CREATE POLICY "Users can insert their own gifts"
  ON public.gifts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own gifts" ON public.gifts;
CREATE POLICY "Users can update their own gifts"
  ON public.gifts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own gifts" ON public.gifts;
CREATE POLICY "Users can delete their own gifts"
  ON public.gifts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_templates_updated_at ON public.templates;
CREATE TRIGGER set_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_gifts_updated_at ON public.gifts;
CREATE TRIGGER set_gifts_updated_at
  BEFORE UPDATE ON public.gifts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Seed Occasions (6 catalog items)
INSERT INTO public.occasions (slug, name, description, icon, sort_order, is_active)
VALUES
  ('birthday', 'Birthday', 'Make their day feel extra special.', '🎂', 1, true),
  ('valentines', 'Valentine''s', 'Turn your feelings into a surprise.', '🌹', 2, true),
  ('anniversary', 'Anniversary', 'Celebrate the story you''ve built together.', '💑', 3, true),
  ('friendship', 'Friendship', 'For the person who makes life better.', '🤝', 4, true),
  ('wedding', 'Wedding', 'Create an invitation they''ll remember.', '💍', 5, true),
  ('festival', 'Festival', 'Send something more personal than a greeting.', '🪔', 6, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- 6. Seed Templates (8 catalog items linked to occasions)
INSERT INTO public.templates (occasion_id, name, slug, description, theme_config, sort_order, is_active)
VALUES
  (
    (SELECT id FROM public.occasions WHERE slug = 'birthday'),
    'Confetti Celebration',
    'birthday-confetti',
    'Vibrant confetti burst with warm celebratory colors and joyful atmosphere.',
    '{"primaryColor": "#f59e0b", "secondaryColor": "#f43f5e", "accentColor": "#fbbf24", "tag": "Popular"}'::jsonb,
    1,
    true
  ),
  (
    (SELECT id FROM public.occasions WHERE slug = 'birthday'),
    'Midnight Sparkle',
    'birthday-midnight',
    'Sleek, glowing neon and deep midnight hues for a modern celebration.',
    '{"primaryColor": "#6366f1", "secondaryColor": "#ec4899", "accentColor": "#a855f7", "tag": "Modern"}'::jsonb,
    2,
    true
  ),
  (
    (SELECT id FROM public.occasions WHERE slug = 'valentines'),
    'Romantic Rose',
    'valentines-rose',
    'Soft blush pinks and elegant petals crafted for tender, romantic declarations.',
    '{"primaryColor": "#f43f5e", "secondaryColor": "#fda4af", "accentColor": "#e11d48", "tag": "Romantic"}'::jsonb,
    1,
    true
  ),
  (
    (SELECT id FROM public.occasions WHERE slug = 'valentines'),
    'Sweet Serenade',
    'valentines-serenade',
    'Deep wine and crimson tones expressing passionate and timeless affection.',
    '{"primaryColor": "#be123c", "secondaryColor": "#fb7185", "accentColor": "#9f1239", "tag": "Passionate"}'::jsonb,
    2,
    true
  ),
  (
    (SELECT id FROM public.occasions WHERE slug = 'anniversary'),
    'Golden Memories',
    'anniversary-golden',
    'Warm lavender and champagne gold celebrating timeless milestones together.',
    '{"primaryColor": "#8b5cf6", "secondaryColor": "#f59e0b", "accentColor": "#d97706", "tag": "Timeless"}'::jsonb,
    1,
    true
  ),
  (
    (SELECT id FROM public.occasions WHERE slug = 'friendship'),
    'Sunshine & Smiles',
    'friendship-sunshine',
    'Bright azure skies and cheerful sunshine colors celebrating true camaraderie.',
    '{"primaryColor": "#0ea5e9", "secondaryColor": "#38bdf8", "accentColor": "#f59e0b", "tag": "Cheerful"}'::jsonb,
    1,
    true
  ),
  (
    (SELECT id FROM public.occasions WHERE slug = 'wedding'),
    'Elegance & Grace',
    'wedding-elegance',
    'Soft emerald botanicals and gold leaf accents for exquisite invitations.',
    '{"primaryColor": "#0d9488", "secondaryColor": "#10b981", "accentColor": "#d97706", "tag": "Elegant"}'::jsonb,
    1,
    true
  ),
  (
    (SELECT id FROM public.occasions WHERE slug = 'festival'),
    'Festive Glow',
    'festival-glow',
    'Warm glowing lanterns, radiant amber hues, and joyous celebration energy.',
    '{"primaryColor": "#d97706", "secondaryColor": "#ea580c", "accentColor": "#fbbf24", "tag": "Festive"}'::jsonb,
    1,
    true
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  theme_config = EXCLUDED.theme_config,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;
