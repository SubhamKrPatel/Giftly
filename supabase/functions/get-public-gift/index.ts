// Supabase Edge Function: get-public-gift
// Public read endpoint for published gifts with safe allowlisting and temporary signed URLs

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    let slug = url.searchParams.get('slug')

    if (!slug && req.method === 'POST') {
      try {
        const body = await req.json()
        slug = body.slug
      } catch {
        // Body parsing error ignored
      }
    }

    if (!slug || !/^[a-zA-Z0-9_-]{6,32}$/.test(slug)) {
      return new Response(
        JSON.stringify({ error: "This gift isn't available right now." }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // 1. Fetch published gift
    const { data: gift, error: giftError } = await supabaseClient
      .from('gifts')
      .select(`
        id,
        title,
        recipient_name,
        sender_name,
        theme_config,
        status,
        public_slug,
        occasion:occasions(name, icon)
      `)
      .eq('public_slug', slug)
      .eq('status', 'published')
      .single()

    if (giftError || !gift) {
      return new Response(
        JSON.stringify({ error: "This gift isn't available right now." }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Fetch visible gift sections
    const { data: sections, error: secError } = await supabaseClient
      .from('gift_sections')
      .select('id, section_type, position, content')
      .eq('gift_id', gift.id)
      .eq('is_visible', true)
      .order('position', { ascending: true })

    if (secError) {
      console.warn('[get-public-gift] Error fetching sections:', secError.message)
    }

    // 3. Fetch media items & generate temporary signed URLs (3600 seconds = 1 hour)
    const { data: mediaItems, error: mediaError } = await supabaseClient
      .from('gift_media')
      .select('id, section_id, media_type, storage_path, file_name, position')
      .eq('gift_id', gift.id)
      .order('position', { ascending: true })

    if (mediaError) {
      console.warn('[get-public-gift] Error fetching media:', mediaError.message)
    }

    const resolvedMedia: Array<{
      id: string
      section_id: string | null
      media_type: string
      file_name: string
      position: number
      signedUrl?: string
    }> = []

    if (mediaItems && mediaItems.length > 0) {
      for (const item of mediaItems) {
        let signedUrl: string | undefined = undefined
        try {
          const { data: signedData } = await supabaseClient.storage
            .from('gift-media')
            .createSignedUrl(item.storage_path, 3600)
          if (signedData?.signedUrl) {
            signedUrl = signedData.signedUrl
          }
        } catch (storageErr) {
          console.warn('[get-public-gift] Signed URL generation failed for:', item.storage_path, storageErr)
        }

        resolvedMedia.push({
          id: item.id,
          section_id: item.section_id,
          media_type: item.media_type,
          file_name: item.file_name,
          position: item.position,
          signedUrl,
        })
      }
    }

    // 4. Return strictly allowlisted recipient payload
    const allowlistedGift = {
      id: gift.id,
      title: gift.title,
      recipient_name: gift.recipient_name,
      sender_name: gift.sender_name,
      theme_config: gift.theme_config,
      public_slug: gift.public_slug,
      occasion: gift.occasion,
    }

    return new Response(
      JSON.stringify({
        data: {
          gift: allowlistedGift,
          sections: sections || [],
          media: resolvedMedia,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal public gift fetch error'
    console.error('[get-public-gift] Exception:', msg)
    return new Response(
      JSON.stringify({ error: "This gift isn't available right now." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
