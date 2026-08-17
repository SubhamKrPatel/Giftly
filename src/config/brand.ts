/**
 * Centralized brand configuration for Giftly.
 * Update this file to change brand values across the entire application.
 * Do not hard-code these values in individual components.
 */
export const brand = {
  /** Display name of the product */
  name: 'Giftly',

  /** Short tagline used in footers, meta descriptions and marketing copy */
  tagline: 'Made for moments that matter.',

  /** Primary brand colour (Tailwind rose-500) */
  primaryColor: '#f43f5e',

  /** Hero headline */
  heroHeadline: "Create a surprise they'll never forget.",

  /** Hero sub-headline */
  heroSubline:
    'Turn your favorite memories, heartfelt words and special moments into a beautiful digital gift.',

  /** SEO meta description */
  metaDescription:
    "Giftly — Create a surprise they'll never forget. Turn your memories, words and moments into a beautiful digital gift you can share with someone special.",
} as const

export type Brand = typeof brand
