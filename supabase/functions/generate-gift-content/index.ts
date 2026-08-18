// Supabase Edge Function: generate-gift-content
// Follows standard Deno/Supabase Edge Functions runtime

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 20

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // Authenticate user
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized request.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const {
      action_type,
      gift_id,
      occasion,
      recipientName,
      relationship,
      tone,
      length,
      language = 'English',
      context = '',
      currentDraft,
    } = body

    // 1. Validate inputs
    if (!action_type) {
      return new Response(
        JSON.stringify({ error: 'Missing action_type parameter.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (recipientName && recipientName.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Recipient name exceeds 100 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (context && context.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Additional context exceeds 1000 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Validate gift ownership if gift_id is provided
    if (gift_id) {
      const { data: giftData, error: giftError } = await supabaseClient
        .from('gifts')
        .select('user_id')
        .eq('id', gift_id)
        .single()

      if (giftError || !giftData || giftData.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'You do not have permission to modify this gift.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 3. Check daily rate limit in ai_usage (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabaseClient
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', twentyFourHoursAgo)

    if (countError) {
      console.warn('[AI Edge] Count error:', countError.message)
    }

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "You've reached today's AI generation limit. You can try again tomorrow.",
          limitReached: true,
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Generate structured content
    let generatedResult: Record<string, unknown> = {}

    if (action_type === 'generate_message') {
      generatedResult = synthesizeMessage({
        occasion: occasion || 'Special Occasion',
        recipientName: recipientName || 'My Favorite Person',
        relationship: relationship || 'someone special',
        tone: tone || 'Heartfelt',
        length: length || 'Medium',
        language,
        context,
      })
    } else if (action_type === 'improve_message') {
      generatedResult = synthesizeImprovedMessage({
        currentDraft: currentDraft || { heading: '', body: '' },
        toneModifier: tone || 'More emotional',
        language,
      })
    } else if (action_type === 'generate_gift_content') {
      generatedResult = synthesizeFullGiftContent({
        occasion: occasion || 'Special Day',
        recipientName: recipientName || 'My Favorite Person',
        relationship: relationship || 'someone special',
        tone: tone || 'Heartfelt',
        language,
        context,
      })
    } else {
      return new Response(
        JSON.stringify({ error: `Unsupported action_type: ${action_type}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Log usage in ai_usage
    await supabaseClient.from('ai_usage').insert({
      user_id: user.id,
      action_type,
    })

    return new Response(
      JSON.stringify({
        data: generatedResult,
        usageRemaining: Math.max(0, DAILY_LIMIT - ((count || 0) + 1)),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal AI generation error'
    console.error('[AI Edge] Exception:', msg)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred while generating content. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper synthesizers for clean structured outputs
function synthesizeMessage(params: {
  occasion: string
  recipientName: string
  relationship: string
  tone: string
  length: string
  language: string
  context: string
}) {
  const isHinglish = params.language === 'Hinglish'
  const name = params.recipientName
  const occ = params.occasion
  const ctx = params.context ? ` ${params.context.trim()}` : ''

  let heading = `A Special Message For You`
  let body = ''

  if (isHinglish) {
    heading = `Dil Se Ek Khaas Message, ${name} ke liye`
    if (params.tone.toLowerCase().includes('romantic')) {
      body = `Meri pyari ${name},\n\nAaj ke is khaas ${occ} par bas itna kehna chahta hoon ki tum meri zindagi ka sabse khoobsurat hissa ho.${ctx}\n\nTumhare sath har ek lamha ek pyari yaad ban jata hai. Hamesha aise hi muskurati raho!`
    } else if (params.tone.toLowerCase().includes('funny') || params.tone.toLowerCase().includes('playful')) {
      body = `Hey ${name}!\n\nHappy ${occ}! Tumse zyada drama aur koi nahi kar sakta, par sach kahun toh tumhare bina sab adhoora hai.${ctx}\n\nParty kab de rahe ho? Wishing you all the happiness and laughter!`
    } else {
      body = `Dear ${name},\n\nAaj ${occ} ke din dil se dua hai ki tumhari zindagi khushiyon se bhari rahe.${ctx}\n\nTum jaisa dost/insaan milna sach mein kismat ki baat hai. Have a wonderful day filled with love and smiles!`
    }
  } else {
    if (params.tone.toLowerCase().includes('romantic')) {
      heading = `To My Everything, With All My Love`
      body = `Dearest ${name},\n\nOn this beautiful ${occ}, I find myself reflecting on just how blessed I am to have you by my side.${ctx}\n\nYour smile lights up my darkest days, and your laughter is my favorite melody. Thank you for filling my world with so much warmth and happiness. Here's to us, today and always.`
    } else if (params.tone.toLowerCase().includes('funny') || params.tone.toLowerCase().includes('playful')) {
      heading = `Happy ${occ} to My Favorite Troublemaker!`
      body = `Hey ${name},\n\nAnother ${occ}, another excuse to celebrate how awesome you are (and how lucky you are to have me in your life).${ctx}\n\nNever stop being the wonderfully chaotic person you are. May your day be filled with cake, laughter, and zero adulting!`
    } else {
      heading = `Celebrating You Today, ${name}`
      body = `Dear ${name},\n\nWishing you the happiest and most magical ${occ}!${ctx}\n\nYour kindness, warmth, and positivity make such a difference to everyone around you. I hope this year brings you countless reasons to smile and dreams come true.`
    }
  }

  return { heading, body }
}

function synthesizeImprovedMessage(params: {
  currentDraft: { heading?: string; body?: string }
  toneModifier: string
  language: string
}) {
  const originalHeading = params.currentDraft.heading || 'A Special Message'
  const originalBody = params.currentDraft.body || 'Wishing you the very best on this special day.'

  let heading = originalHeading
  let body = originalBody

  if (params.toneModifier.toLowerCase().includes('romantic')) {
    heading = originalHeading.includes('Love') ? originalHeading : `${originalHeading} — With All My Heart`
    body = `${originalBody.trim()}\n\nEvery day with you is a reminder of how lucky I am. You mean the absolute world to me.`
  } else if (params.toneModifier.toLowerCase().includes('emotional')) {
    heading = `From the Bottom of My Heart`
    body = `Words often fall short, but please know this:\n\n${originalBody.trim()}\n\nThank you for being someone so truly special and irreplaceable in my life.`
  } else if (params.toneModifier.toLowerCase().includes('concise')) {
    heading = originalHeading
    body = originalBody.trim().split('\n').filter(Boolean).slice(0, 2).join(' ')
  } else {
    body = `${originalBody.trim()}\n\nWishing you endless joy, love, and light today and always!`
  }

  return { heading, body }
}

function synthesizeFullGiftContent(params: {
  occasion: string
  recipientName: string
  relationship: string
  tone: string
  language: string
  context: string
}) {
  const name = params.recipientName
  const occ = params.occasion
  const isHinglish = params.language === 'Hinglish'

  if (isHinglish) {
    return {
      cover: {
        headline: `Happy ${occ}, ${name}! ✨`,
        subheadline: `Ek chhota sa surprise, khaas tumhare liye banaya gaya.`,
      },
      message: {
        heading: `Dil Ki Kuch Baat`,
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
      body: `I hope this little surprise brought a bright smile to your day! Always here for you.`,
    },
  }
}
