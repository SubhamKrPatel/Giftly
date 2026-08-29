/**
 * Frontend recommendation mapping for Giftly creation flow.
 * Uses occasion slug + relationship to recommend the most fitting existing template.
 * Does NOT alter or replace existing templates in Supabase.
 */

export interface RelationshipOption {
  id: string
  label: string
  iconName?: string
  description?: string
}

export const OCCASION_RELATIONSHIPS: Record<string, RelationshipOption[]> = {
  birthday: [
    { id: 'partner', label: 'Partner', iconName: 'Heart', description: 'For your significant other' },
    { id: 'friend', label: 'Friend', iconName: 'Users', description: 'For a great companion' },
    { id: 'sibling', label: 'Sibling', iconName: 'Smile', description: 'For your brother or sister' },
    { id: 'family', label: 'Family', iconName: 'Home', description: 'For parents, children, or relatives' },
    { id: 'someone_special', label: 'Someone Special', iconName: 'Sparkles', description: 'For someone who lights up your life' },
    { id: 'other', label: 'Other', iconName: 'Gift', description: 'Anyone else you celebrate' },
  ],
  valentines: [
    { id: 'partner', label: 'Partner', iconName: 'Heart', description: 'For your boyfriend/girlfriend or partner' },
    { id: 'spouse', label: 'Spouse', iconName: 'Flame', description: 'For your husband or wife' },
    { id: 'someone_special', label: 'Someone Special', iconName: 'Sparkles', description: 'For your crush or special person' },
    { id: 'other', label: 'Other', iconName: 'Gift', description: 'Someone you cherish' },
  ],
  anniversary: [
    { id: 'partner', label: 'Partner', iconName: 'Heart', description: 'Celebrating love & companionship' },
    { id: 'spouse', label: 'Spouse', iconName: 'Flame', description: 'Celebrating marital milestones' },
    { id: 'family', label: 'Family', iconName: 'Home', description: 'Celebrating parents or relatives' },
    { id: 'other', label: 'Other', iconName: 'Gift', description: 'Celebrating a special couple' },
  ],
  friendship: [
    { id: 'best_friend', label: 'Best Friend', iconName: 'Smile', description: 'For your ride-or-die buddy' },
    { id: 'friend', label: 'Friend', iconName: 'Users', description: 'For a cherished pal' },
    { id: 'college_friend', label: 'College Friend', iconName: 'GraduationCap', description: 'For campus memories' },
    { id: 'work_friend', label: 'Work Friend', iconName: 'Briefcase', description: 'For your favorite coworker' },
    { id: 'other', label: 'Other', iconName: 'Gift', description: 'A friend across distances' },
  ],
  wedding: [
    { id: 'my_wedding', label: 'My Wedding', iconName: 'Crown', description: 'For our own celebration & guests' },
    { id: 'couple', label: 'Couple', iconName: 'Heart', description: 'For the bride & groom' },
    { id: 'family', label: 'Family', iconName: 'Home', description: 'For family tying the knot' },
    { id: 'someone_else', label: 'Someone Else', iconName: 'Gift', description: 'For friends or colleagues marrying' },
  ],
  festival: [
    { id: 'family', label: 'Family', iconName: 'Home', description: 'For festive family reunions' },
    { id: 'friend', label: 'Friend', iconName: 'Users', description: 'Sharing joy and festivities' },
    { id: 'colleague', label: 'Colleague', iconName: 'Briefcase', description: 'Festive season wishes' },
    { id: 'someone_special', label: 'Someone Special', iconName: 'Sparkles', description: 'Lighting up their festival' },
    { id: 'other', label: 'Other', iconName: 'Gift', description: 'Festive blessings for all' },
  ],
}

// Default fallback relationships for any custom or newly added occasions
export const DEFAULT_RELATIONSHIPS: RelationshipOption[] = [
  { id: 'partner', label: 'Partner', iconName: 'Heart', description: 'For your loved one' },
  { id: 'friend', label: 'Friend', iconName: 'Users', description: 'For a dear friend' },
  { id: 'family', label: 'Family', iconName: 'Home', description: 'For family members' },
  { id: 'someone_special', label: 'Someone Special', iconName: 'Sparkles', description: 'For someone meaningful' },
  { id: 'other', label: 'Other', iconName: 'Gift', description: 'Anyone you care about' },
]

/**
 * Returns the list of relationship options appropriate for the given occasion slug.
 */
export function getRelationshipsForOccasion(occasionSlug?: string | null): RelationshipOption[] {
  if (!occasionSlug) return DEFAULT_RELATIONSHIPS
  const slug = occasionSlug.toLowerCase().trim()
  return OCCASION_RELATIONSHIPS[slug] || DEFAULT_RELATIONSHIPS
}

/**
 * Recommendation map: occasion slug + relationship label/id -> template slug
 */
const RECOMMENDATION_MAP: Record<string, Record<string, string>> = {
  birthday: {
    partner: 'birthday-midnight',
    someone_special: 'birthday-midnight',
    friend: 'birthday-confetti',
    sibling: 'birthday-confetti',
    family: 'birthday-confetti',
    other: 'birthday-confetti',
  },
  valentines: {
    partner: 'valentines-rose',
    spouse: 'valentines-serenade',
    someone_special: 'valentines-rose',
    other: 'valentines-rose',
  },
  anniversary: {
    partner: 'anniversary-golden',
    spouse: 'anniversary-golden',
    family: 'anniversary-golden',
    other: 'anniversary-golden',
  },
  friendship: {
    best_friend: 'friendship-sunshine',
    friend: 'friendship-sunshine',
    college_friend: 'friendship-sunshine',
    work_friend: 'friendship-sunshine',
    other: 'friendship-sunshine',
  },
  wedding: {
    my_wedding: 'wedding-elegance',
    couple: 'wedding-elegance',
    family: 'wedding-elegance',
    someone_else: 'wedding-elegance',
  },
  festival: {
    family: 'festival-glow',
    friend: 'festival-glow',
    colleague: 'festival-glow',
    someone_special: 'festival-glow',
    other: 'festival-glow',
  },
}

/**
 * Given an occasion slug and relationship ID, returns the recommended template slug, or null.
 */
export function getRecommendedTemplateSlug(
  occasionSlug?: string | null,
  relationshipId?: string | null
): string | null {
  if (!occasionSlug || !relationshipId) return null
  const occ = occasionSlug.toLowerCase().trim()
  const rel = relationshipId.toLowerCase().trim()

  const occMap = RECOMMENDATION_MAP[occ]
  if (!occMap) return null

  return occMap[rel] || null
}
