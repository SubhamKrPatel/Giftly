/**
 * Static demo content for Giftly Template Preview.
 * Used exclusively for in-modal preview demonstration without touching real gift data.
 * Standard Recipient: "Chahat" | Standard Sender: "Ayushi"
 */

export interface PreviewScreenData {
  pageNumber: number
  screenType: 'cover' | 'message' | 'memories' | 'final'
  badge?: string
  title: string
  subtitle?: string
  body?: string
  signature?: string
  items?: Array<{
    title: string
    description?: string
    iconEmoji?: string
    colorTag?: string
  }>
}

export interface TemplateDemoContent {
  templateSlug: string
  occasionName: string
  occasionIcon: string
  recipientName: string
  senderName: string
  screens: [PreviewScreenData, PreviewScreenData, PreviewScreenData, PreviewScreenData]
}

export const TEMPLATE_DEMO_DATA: Record<string, TemplateDemoContent> = {
  'birthday-confetti': {
    templateSlug: 'birthday-confetti',
    occasionName: 'Birthday',
    occasionIcon: '🎂',
    recipientName: 'Chahat',
    senderName: 'Ayushi',
    screens: [
      {
        pageNumber: 1,
        screenType: 'cover',
        badge: 'Birthday Surprise',
        title: 'A little surprise is waiting for you...',
        subtitle: 'A celebratory gift crafted with love for Chahat',
        signature: 'From Ayushi',
      },
      {
        pageNumber: 2,
        screenType: 'message',
        badge: 'Personal Note',
        title: 'Happy Birthday, Chahat! ❤️',
        body: 'To the one who brings infinite joy, radiant smiles, and warmth wherever you go. Wishing you a day as wonderfully vibrant as you are!',
      },
      {
        pageNumber: 3,
        screenType: 'memories',
        badge: 'Photo Memories',
        title: 'Our Favorite Moments',
        subtitle: 'Treasured chapters of laughter and fun',
        items: [
          {
            title: 'Weekend Coffee Runs',
            description: 'Countless hours of nonstop chatter and iced lattes.',
            iconEmoji: '☕',
            colorTag: '#f59e0b',
          },
          {
            title: 'Spontaneous Road Trips',
            description: 'Singing at the top of our lungs with the windows down.',
            iconEmoji: '🚗',
            colorTag: '#f43f5e',
          },
          {
            title: 'Late Night Heart-to-Hearts',
            description: 'The sweetest conversations that made everything better.',
            iconEmoji: '✨',
            colorTag: '#ec4899',
          },
        ],
      },
      {
        pageNumber: 4,
        screenType: 'final',
        badge: 'With Love',
        title: "Here's to another beautiful year...",
        body: 'May every single day ahead bring you closer to your wildest dreams and fill your heart with genuine happiness.',
        signature: 'With all my love, Ayushi ❤️',
      },
    ],
  },

  'birthday-midnight': {
    templateSlug: 'birthday-midnight',
    occasionName: 'Birthday',
    occasionIcon: '✨',
    recipientName: 'Chahat',
    senderName: 'Ayushi',
    screens: [
      {
        pageNumber: 1,
        screenType: 'cover',
        badge: 'Midnight Sparkle',
        title: 'The night is just beginning...',
        subtitle: 'A midnight celebration designed for Chahat',
        signature: 'Crafted by Ayushi',
      },
      {
        pageNumber: 2,
        screenType: 'message',
        badge: 'Midnight Wish',
        title: 'Happy Birthday, Chahat ✨',
        body: 'Under the glow of midnight stars, I celebrate the most extraordinary soul I know. Thank you for shining your light into my world.',
      },
      {
        pageNumber: 3,
        screenType: 'memories',
        badge: 'Soundtrack & Vibes',
        title: 'Neon Nights & Memories',
        subtitle: 'Highlights scored to our favorite music',
        items: [
          {
            title: 'Midnight Stargazing',
            description: 'Dreaming big under a sky full of constellations.',
            iconEmoji: '🌌',
            colorTag: '#6366f1',
          },
          {
            title: 'City Lights Playlist',
            description: 'Track 01: Midnight Symphony • 03:42',
            iconEmoji: '🎵',
            colorTag: '#a855f7',
          },
          {
            title: 'Unstoppable Energy',
            description: 'Dancing like nobody is watching until 3 AM.',
            iconEmoji: '⚡',
            colorTag: '#ec4899',
          },
        ],
      },
      {
        pageNumber: 4,
        screenType: 'final',
        badge: 'Glow Forever',
        title: 'Shine On, Always',
        body: 'May your new year be illuminated with endless creativity, bold adventures, and unforgettable memories.',
        signature: 'Always in your corner, Ayushi ✨',
      },
    ],
  },

  'valentines-rose': {
    templateSlug: 'valentines-rose',
    occasionName: "Valentine's",
    occasionIcon: '🌹',
    recipientName: 'Chahat',
    senderName: 'Ayushi',
    screens: [
      {
        pageNumber: 1,
        screenType: 'cover',
        badge: 'Romantic Rose',
        title: 'A love note written just for you...',
        subtitle: 'Happy Valentine’s Day, Chahat ❤️',
        signature: 'Forever Yours, Ayushi',
      },
      {
        pageNumber: 2,
        screenType: 'message',
        badge: 'From The Heart',
        title: 'To My Favorite Person ❤️',
        body: 'Every single day with you feels like a dream I never want to wake up from. You bring soft warmth, comfort, and poetry to my life.',
      },
      {
        pageNumber: 3,
        screenType: 'memories',
        badge: 'Love Gallery',
        title: 'Our Beautiful Story',
        subtitle: 'Little moments that meant the world',
        items: [
          {
            title: 'Our First Sunset',
            description: 'Watching the sky turn pink while holding hands.',
            iconEmoji: '🌅',
            colorTag: '#f43f5e',
          },
          {
            title: 'The Inside Jokes',
            description: 'Laughing so hard our cheeks hurt over the simplest things.',
            iconEmoji: '💌',
            colorTag: '#fda4af',
          },
          {
            title: 'Comfort in Quiet',
            description: 'Just sitting beside you feeling completely at home.',
            iconEmoji: '🕯️',
            colorTag: '#e11d48',
          },
        ],
      },
      {
        pageNumber: 4,
        screenType: 'final',
        badge: 'Forever & Always',
        title: 'You Have My Whole Heart',
        body: 'Thank you for being my constant peace, my safest place, and my greatest adventure.',
        signature: 'Forever & always yours, Ayushi 🌹',
      },
    ],
  },

  'valentines-serenade': {
    templateSlug: 'valentines-serenade',
    occasionName: "Valentine's",
    occasionIcon: '🍷',
    recipientName: 'Chahat',
    senderName: 'Ayushi',
    screens: [
      {
        pageNumber: 1,
        screenType: 'cover',
        badge: 'Sweet Serenade',
        title: 'A symphony of love for you...',
        subtitle: 'Dedicated to Chahat on Valentine’s Day',
        signature: 'Deepest Love from Ayushi',
      },
      {
        pageNumber: 2,
        screenType: 'message',
        badge: 'Love Letter',
        title: 'My Valentine, Chahat 🍷',
        body: 'In a world full of noise, your rhythm is my peace. Loving you is as natural as breathing and as profound as the deepest ocean.',
      },
      {
        pageNumber: 3,
        screenType: 'memories',
        badge: 'Melodic Memories',
        title: 'Harmonies of Us',
        subtitle: 'The unforgettable chapters we share',
        items: [
          {
            title: 'Candlelight Evenings',
            description: 'Rich wine, soft music, and your gaze across the table.',
            iconEmoji: '🍷',
            colorTag: '#be123c',
          },
          {
            title: 'Our Love Song',
            description: 'The track that will forever remind me of you.',
            iconEmoji: '🎶',
            colorTag: '#9f1239',
          },
          {
            title: 'Promises Kept',
            description: 'Standing strong together through every season.',
            iconEmoji: '🗝️',
            colorTag: '#fb7185',
          },
        ],
      },
      {
        pageNumber: 4,
        screenType: 'final',
        badge: 'Timeless Romance',
        title: 'Endlessly Devoted',
        body: 'I will choose you yesterday, today, tomorrow, and for all the tomorrows yet to come.',
        signature: 'With passionate love, Ayushi ❤️',
      },
    ],
  },

  'anniversary-golden': {
    templateSlug: 'anniversary-golden',
    occasionName: 'Anniversary',
    occasionIcon: '💑',
    recipientName: 'Chahat',
    senderName: 'Ayushi',
    screens: [
      {
        pageNumber: 1,
        screenType: 'cover',
        badge: 'Golden Anniversary',
        title: 'Celebrating our journey together...',
        subtitle: 'Happy Anniversary, Chahat 🥂',
        signature: 'With Love, Ayushi',
      },
      {
        pageNumber: 2,
        screenType: 'message',
        badge: 'Milestone Note',
        title: 'Another Golden Year of Us',
        body: 'Looking back on everything we have built side by side fills my heart with immense gratitude. Every year with you is richer than the last.',
      },
      {
        pageNumber: 3,
        screenType: 'memories',
        badge: 'Milestone Chapters',
        title: 'Treasured Milestones',
        subtitle: 'The golden moments of our shared life',
        items: [
          {
            title: 'Day One',
            description: 'Where our extraordinary story quietly began.',
            iconEmoji: '✨',
            colorTag: '#f59e0b',
          },
          {
            title: 'Building Our Dreams',
            description: 'Turning every hopeful ambition into reality together.',
            iconEmoji: '🏡',
            colorTag: '#8b5cf6',
          },
          {
            title: 'Through Every Season',
            description: 'Growing stronger, kinder, and closer each day.',
            iconEmoji: '🌿',
            colorTag: '#d97706',
          },
        ],
      },
      {
        pageNumber: 4,
        screenType: 'final',
        badge: 'To Tomorrow',
        title: "Here's to Our Lifetime",
        body: 'Thank you for being my steadfast partner and soulmate. I look forward to decades more of this beautiful life together.',
        signature: 'Forever your partner, Ayushi 🥂',
      },
    ],
  },

  'friendship-sunshine': {
    templateSlug: 'friendship-sunshine',
    occasionName: 'Friendship',
    occasionIcon: '🤝',
    recipientName: 'Chahat',
    senderName: 'Ayushi',
    screens: [
      {
        pageNumber: 1,
        screenType: 'cover',
        badge: 'Best Friend Vibes',
        title: 'To the one who makes life brighter...',
        subtitle: 'Happy Friendship Day, Chahat! ☀️',
        signature: 'From your ride-or-die Ayushi',
      },
      {
        pageNumber: 2,
        screenType: 'message',
        badge: 'Friendship Note',
        title: 'Cheers to My Best Friend! ☀️',
        body: 'Life is 100x more fun, chaotic, and meaningful with you in it. Thank you for always being the person I can call anytime, no matter what!',
      },
      {
        pageNumber: 3,
        screenType: 'memories',
        badge: 'Crazy Memories',
        title: 'Unfiltered Highlights',
        subtitle: 'Proof that we make the best team',
        items: [
          {
            title: 'Food Crawls & Chai',
            description: 'Trying every street food spot and rating them all.',
            iconEmoji: '🥟',
            colorTag: '#0ea5e9',
          },
          {
            title: 'Emergency Advice Sessions',
            description: 'Solving life’s biggest dilemmas in 15-minute voice notes.',
            iconEmoji: '🎙️',
            colorTag: '#38bdf8',
          },
          {
            title: 'Zero Judgment Zone',
            description: 'Where we can be our 100% goofy, authentic selves.',
            iconEmoji: '🎉',
            colorTag: '#f59e0b',
          },
        ],
      },
      {
        pageNumber: 4,
        screenType: 'final',
        badge: 'Friends Forever',
        title: 'Ride or Die, Always',
        body: 'No matter how far we travel or how busy life gets, you will always be family to me. Keep shining bright!',
        signature: 'With giant hugs, Ayushi 🤝',
      },
    ],
  },

  'wedding-elegance': {
    templateSlug: 'wedding-elegance',
    occasionName: 'Wedding',
    occasionIcon: '💍',
    recipientName: 'Chahat',
    senderName: 'Ayushi',
    screens: [
      {
        pageNumber: 1,
        screenType: 'cover',
        badge: 'Wedding Celebration',
        title: 'An invitation of love & grace...',
        subtitle: 'Honoring the marriage of Chahat & Partner 💍',
        signature: 'With Blessings from Ayushi',
      },
      {
        pageNumber: 2,
        screenType: 'message',
        badge: 'Warmest Wishes',
        title: 'A Lifetime of Joy & Elegance',
        body: 'May your sacred bond be blessed with everlasting tenderness, shared laughter, peace in your home, and mutual devotion.',
      },
      {
        pageNumber: 3,
        screenType: 'memories',
        badge: 'Celebration Moments',
        title: 'The Journey to Forever',
        subtitle: 'Cherished memories leading to the big day',
        items: [
          {
            title: 'The Proposal',
            description: 'A magical moment that sealed a lifelong promise.',
            iconEmoji: '💍',
            colorTag: '#0d9488',
          },
          {
            title: 'Festive Gatherings',
            description: 'Families coming together in music and celebration.',
            iconEmoji: '🌿',
            colorTag: '#10b981',
          },
          {
            title: 'Looking Ahead',
            description: 'Stepping into a lifetime of shared joy and love.',
            iconEmoji: '🕊️',
            colorTag: '#d97706',
          },
        ],
      },
      {
        pageNumber: 4,
        screenType: 'final',
        badge: 'Heartfelt Blessings',
        title: 'May Love Always Guide You',
        body: 'Wishing you both endless happiness, mutual respect, and abundant joy on this sacred milestone.',
        signature: 'Warmest congratulations, Ayushi 🥂',
      },
    ],
  },

  'festival-glow': {
    templateSlug: 'festival-glow',
    occasionName: 'Festival',
    occasionIcon: '🪔',
    recipientName: 'Chahat',
    senderName: 'Ayushi',
    screens: [
      {
        pageNumber: 1,
        screenType: 'cover',
        badge: 'Festive Radiance',
        title: 'Lighting up your festive season...',
        subtitle: 'Warm festive blessings for Chahat 🪔',
        signature: 'Festive Wishes from Ayushi',
      },
      {
        pageNumber: 2,
        screenType: 'message',
        badge: 'Festive Greeting',
        title: 'May Your Days Glow with Joy ✨',
        body: 'Sending you and your loved ones heartfelt wishes for prosperity, sweet celebrations, harmonious health, and luminous happiness.',
      },
      {
        pageNumber: 3,
        screenType: 'memories',
        badge: 'Festive Traditions',
        title: 'Warmth of Tradition',
        subtitle: 'Sweet moments of festive joy',
        items: [
          {
            title: 'Glowing Lanterns',
            description: 'Illuminating every corner with light and peace.',
            iconEmoji: '🪔',
            colorTag: '#d97706',
          },
          {
            title: 'Sweet Treats & Sweets',
            description: 'Sharing festive delicacies and joyous smiles.',
            iconEmoji: '🍯',
            colorTag: '#ea580c',
          },
          {
            title: 'Family Gatherings',
            description: 'Warm reunions and blessings from those who matter most.',
            iconEmoji: '🏮',
            colorTag: '#fbbf24',
          },
        ],
      },
      {
        pageNumber: 4,
        screenType: 'final',
        badge: 'Abundant Blessings',
        title: 'Peace, Light & Prosperity',
        body: 'May the festive glow brighten every step of your journey throughout the upcoming year.',
        signature: 'With warmest festive love, Ayushi 🪔',
      },
    ],
  },
}

/**
 * Returns static demo content for a given template slug.
 * Falls back cleanly if a template is dynamically added in the future.
 */
export function getTemplateDemoContent(
  templateSlug?: string,
  occasionName?: string,
  occasionIcon?: string
): TemplateDemoContent {
  if (templateSlug && TEMPLATE_DEMO_DATA[templateSlug]) {
    return TEMPLATE_DEMO_DATA[templateSlug]
  }

  // Generic fallback demo content
  const occName = occasionName || 'Special Occasion'
  const occIcon = occasionIcon || '🎁'

  return {
    templateSlug: templateSlug || 'custom-template',
    occasionName: occName,
    occasionIcon: occIcon,
    recipientName: 'Chahat',
    senderName: 'Ayushi',
    screens: [
      {
        pageNumber: 1,
        screenType: 'cover',
        badge: 'Special Surprise',
        title: 'A little surprise is waiting for you...',
        subtitle: `A special ${occName.toLowerCase()} gift crafted for Chahat`,
        signature: 'From Ayushi',
      },
      {
        pageNumber: 2,
        screenType: 'message',
        badge: 'Personal Message',
        title: `Happy ${occName}, Chahat! ❤️`,
        body: `Wishing you a wonderful ${occName.toLowerCase()} filled with warmth, endless laughter, and treasured memories that last a lifetime.`,
      },
      {
        pageNumber: 3,
        screenType: 'memories',
        badge: 'Memories & Media',
        title: 'Our Favorite Memories',
        subtitle: 'Chapters of celebration and companionship',
        items: [
          {
            title: 'Special Moments',
            description: 'Unforgettable adventures and laughter.',
            iconEmoji: '🌟',
            colorTag: '#f43f5e',
          },
          {
            title: 'Cherished Times',
            description: 'Conversations and milestones shared together.',
            iconEmoji: '📸',
            colorTag: '#6366f1',
          },
          {
            title: 'Shared Joys',
            description: 'Smiles that brightened every single day.',
            iconEmoji: '✨',
            colorTag: '#f59e0b',
          },
        ],
      },
      {
        pageNumber: 4,
        screenType: 'final',
        badge: 'With Love',
        title: "Here's to another beautiful year...",
        body: 'Thank you for bringing so much happiness and meaning into my life.',
        signature: 'With all my love, Ayushi ❤️',
      },
    ],
  }
}
