// Supabase Edge Function: publish-gift
// Handles authenticated publishing and unpublishing of gifts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate URL-safe, non-guessable 8-character slug (avoids 0, O, 1, l, I)
function generateSlug(length = 8): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz'
  const randomBytes = new Uint8Array(length)
  crypto.getRandomValues(randomBytes)
  let slug = ''
  for (let i = 0; i < length; i++) {
    slug += chars[randomBytes[i] % chars.length]
  }
  return slug
}

serve(async (req) => {
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
    const { gift_id, action = 'publish' } = body

    if (!gift_id) {
      return new Response(
        JSON.stringify({ error: 'Missing gift_id.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Validate gift ownership
    const { data: gift, error: giftError } = await supabaseClient
      .from('gifts')
      .select('id, user_id, recipient_name, status, public_slug')
      .eq('id', gift_id)
      .single()

    if (giftError || !gift || gift.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Gift not found or you do not have permission to modify it.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Unpublish Action
    if (action === 'unpublish') {
      const { error: updateError } = await supabaseClient
        .from('gifts')
        .update({ status: 'draft', updated_at: new Date().toISOString() })
        .eq('id', gift_id)

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to unpublish gift.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: 'draft',
          public_slug: gift.public_slug,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Publish Action
    if (!gift.recipient_name || gift.recipient_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Gift must have a recipient name before publishing.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify at least one visible section
    const { count, error: sectionError } = await supabaseClient
      .from('gift_sections')
      .select('id', { count: 'exact', head: true })
      .eq('gift_id', gift_id)
      .eq('is_visible', true)

    if (sectionError || (count || 0) === 0) {
      return new Response(
        JSON.stringify({ error: 'Gift must have at least one visible section to publish.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine public_slug
    let slug = gift.public_slug
    if (!slug) {
      // Generate a unique slug
      let attempts = 0
      while (attempts < 5) {
        const candidate = generateSlug(8)
        const { data: existing } = await supabaseClient
          .from('gifts')
          .select('id')
          .eq('public_slug', candidate)
          .single()

        if (!existing) {
          slug = candidate
          break
        }
        attempts++
      }

      if (!slug) {
        slug = generateSlug(10)
      }
    }

    // Update gift to published
    const { error: pubError } = await supabaseClient
      .from('gifts')
      .update({
        status: 'published',
        public_slug: slug,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gift_id)

    if (pubError) {
      return new Response(
        JSON.stringify({ error: 'Failed to publish gift.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: 'published',
        public_slug: slug,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal publishing error'
    console.error('[publish-gift] Exception:', msg)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred while publishing the gift.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
