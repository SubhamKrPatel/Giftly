import { supabase } from '@/lib/supabase'

export interface GenerateMessageParams {
  gift_id?: string
  occasion?: string
  recipientName: string
  relationship?: string
  tone?: string
  length?: 'Short' | 'Medium' | 'Long' | string
  language?: 'English' | 'Hinglish' | string
  context?: string
}

export interface ImproveMessageParams {
  gift_id?: string
  currentDraft: {
    heading?: string
    body: string
  }
  toneModifier?: string
  language?: 'English' | 'Hinglish' | string
}

export interface GenerateFullGiftParams {
  gift_id?: string
  occasion?: string
  recipientName: string
  relationship?: string
  tone?: string
  language?: 'English' | 'Hinglish' | string
  context?: string
}

export interface GeneratedMessageResult {
  heading: string
  body: string
}

export interface GeneratedFullGiftResult {
  cover: {
    headline: string
    subheadline: string
  }
  message: {
    heading: string
    body: string
  }
  final_message: {
    heading: string
    body: string
  }
}

export interface AIResponse<T> {
  data?: T
  error?: string
  limitReached?: boolean
  usageRemaining?: number
}

// Client-side synthesizer for local fallback
function fallbackSynthesizeMessage(params: GenerateMessageParams): GeneratedMessageResult {
  const isHinglish = params.language === 'Hinglish'
  const name = params.recipientName || 'You'
  const occ = params.occasion || 'Special Day'
  const ctx = params.context ? ` ${params.context.trim()}` : ''
  const tone = (params.tone || 'Heartfelt').toLowerCase()

  if (isHinglish) {
    if (tone.includes('romantic')) {
      return {
        heading: `Meri Pyari ${name} ke Liye`,
        body: `Dearest ${name},\n\nAaj ke is khoobsurat ${occ} par bas dil se itna kehna chahta hoon ki tum meri zindagi ki sabse pyari khushi ho.${ctx}\n\nTumhara sath har din ko khaas bana deta hai. Hamesha aise hi muskurati raho! With lots of love.`,
      }
    } else if (tone.includes('funny') || tone.includes('playful')) {
      return {
        heading: `Happy ${occ}, My Favorite Partner-in-Crime!`,
        body: `Hey ${name}!\n\n${occ} mubarak ho! Tumse zyada drama aur hasi kisi aur ke sath nahi milti.${ctx}\n\nParty kab de rahe ho? Wishing you non-stop laughter and joy today!`,
      }
    } else {
      return {
        heading: `Dil Se Ek Khaas Message For ${name}`,
        body: `Dear ${name},\n\nIs ${occ} ke mauke par dil se dua hai ki tumhari har khwahish poori ho.${ctx}\n\nTum jaisa dost sach mein kismat se milta hai. Stay blessed and keep shining!`,
      }
    }
  }

  if (tone.includes('romantic')) {
    return {
      heading: `To My Heart, With All My Love`,
      body: `Dearest ${name},\n\nOn this wonderful ${occ}, I find myself reflecting on just how lucky I am to have you in my life.${ctx}\n\nYour smile lights up my entire world, and your warmth makes every day brighter. Thank you for simply being you. Wishing you the most magical day.`,
    }
  } else if (tone.includes('funny') || tone.includes('playful')) {
    return {
      heading: `Happy ${occ} to My Favorite Troublemaker!`,
      body: `Hey ${name},\n\nAnother ${occ}, another excuse to celebrate how awesome you are (and how lucky you are to know me).${ctx}\n\nNever change your chaotic, fun-loving self. May your day be filled with your favorite treats and zero stress!`,
    }
  } else {
    return {
      heading: `Celebrating You on this ${occ}`,
      body: `Dear ${name},\n\nWishing you the warmest and happiest ${occ}!${ctx}\n\nYour kindness, support, and positive energy mean so much to everyone lucky enough to know you. I hope this year brings you everything you've ever wished for.`,
    }
  }
}

function fallbackSynthesizeImprovedMessage(params: ImproveMessageParams): GeneratedMessageResult {
  const currentHeading = params.currentDraft.heading || 'A Special Message'
  const currentBody = params.currentDraft.body || ''
  const modifier = (params.toneModifier || 'More emotional').toLowerCase()

  let heading = currentHeading
  let body = currentBody

  if (modifier.includes('romantic')) {
    heading = currentHeading.includes('Love') ? currentHeading : `${currentHeading} ❤️`
    body = `${currentBody.trim()}\n\nEvery day with you is a gift, and I'm so grateful to have you by my side.`
  } else if (modifier.includes('emotional')) {
    heading = `From the Bottom of My Heart`
    body = `Words often fall short, but please know this:\n\n${currentBody.trim()}\n\nThank you for being someone so genuinely special and irreplaceable in my life.`
  } else if (modifier.includes('concise')) {
    heading = currentHeading
    body = currentBody.trim().split('\n').filter(Boolean).slice(0, 2).join(' ')
  } else if (modifier.includes('playful')) {
    heading = `Big Smiles For You!`
    body = `${currentBody.trim()}\n\n(And yes, you definitely owe me a treat for being the best gift-giver ever!)`
  } else {
    body = `${currentBody.trim()}\n\nWishing you endless happiness, warmth, and smiles today!`
  }

  return { heading, body }
}

function fallbackSynthesizeFullGift(params: GenerateFullGiftParams): GeneratedFullGiftResult {
  const name = params.recipientName || 'Someone Special'
  const occ = params.occasion || 'Special Occasion'
  const isHinglish = params.language === 'Hinglish'

  if (isHinglish) {
    return {
      cover: {
        headline: `Happy ${occ}, ${name}! ✨`,
        subheadline: `Ek chhota sa pyara surprise, khaas tumhare liye.`,
      },
      message: {
        heading: `Dil Ki Ek Khaas Baat`,
        body: `Dear ${name},\n\nTumhare sath bitaya har lamha yaadgar hai. Aaj ke is khoobsurat din par dua hai ki tumhari har khwahish poori ho aur tum hamesha muskurao.`,
      },
      final_message: {
        heading: `With Lots of Love & Smiles`,
        body: `Umeed hai is chhote se surprise ne tumhare chehre par ek pyari si muskan laayi hogi!`,
      },
    }
  }

  return {
    cover: {
      headline: `Happy ${occ}, ${name}! ❤️`,
      subheadline: `A special surprise crafted with love for someone truly extraordinary.`,
    },
    message: {
      heading: `A Message From The Heart`,
      body: `Dear ${name},\n\nOn this wonderful ${occ}, I wanted to take a moment to remind you how much you mean to me. Your kindness, laughter, and presence bring so much light into the world. Thank you for just being you.`,
    },
    final_message: {
      heading: `With All My Love`,
      body: `I hope this little surprise brought a bright smile to your day! Always cheering for you.`,
    },
  }
}

/**
 * Generate a personalized gift message
 */
export async function generateMessage(
  params: GenerateMessageParams
): Promise<AIResponse<GeneratedMessageResult>> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-gift-content', {
      body: {
        action_type: 'generate_message',
        ...params,
      },
    })

    if (!error && data?.data) {
      return { data: data.data, usageRemaining: data.usageRemaining }
    }

    if (error && (error as { limitReached?: boolean }).limitReached) {
      return { error: error.message, limitReached: true }
    }

    // Local fallback for offline/local development
    const fallbackData = fallbackSynthesizeMessage(params)
    return { data: fallbackData }
  } catch (err: unknown) {
    console.warn('[aiService] Edge Function fallback used:', err)
    const fallbackData = fallbackSynthesizeMessage(params)
    return { data: fallbackData }
  }
}

/**
 * Improve/refine existing draft message
 */
export async function improveMessage(
  params: ImproveMessageParams
): Promise<AIResponse<GeneratedMessageResult>> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-gift-content', {
      body: {
        action_type: 'improve_message',
        ...params,
      },
    })

    if (!error && data?.data) {
      return { data: data.data, usageRemaining: data.usageRemaining }
    }

    if (error && (error as { limitReached?: boolean }).limitReached) {
      return { error: error.message, limitReached: true }
    }

    const fallbackData = fallbackSynthesizeImprovedMessage(params)
    return { data: fallbackData }
  } catch (err: unknown) {
    console.warn('[aiService] Edge Function fallback used for improve:', err)
    const fallbackData = fallbackSynthesizeImprovedMessage(params)
    return { data: fallbackData }
  }
}

/**
 * Generate full gift content (Cover + Message + Final Message)
 */
export async function generateFullGiftContent(
  params: GenerateFullGiftParams
): Promise<AIResponse<GeneratedFullGiftResult>> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-gift-content', {
      body: {
        action_type: 'generate_gift_content',
        ...params,
      },
    })

    if (!error && data?.data) {
      return { data: data.data, usageRemaining: data.usageRemaining }
    }

    if (error && (error as { limitReached?: boolean }).limitReached) {
      return { error: error.message, limitReached: true }
    }

    const fallbackData = fallbackSynthesizeFullGift(params)
    return { data: fallbackData }
  } catch (err: unknown) {
    console.warn('[aiService] Edge Function fallback used for full gift:', err)
    const fallbackData = fallbackSynthesizeFullGift(params)
    return { data: fallbackData }
  }
}
