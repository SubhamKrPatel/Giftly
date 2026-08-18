import { supabase } from '@/lib/supabase'
import type {
  GiftSection,
  GiftMediaItem,
  GiftThemeConfig,
  GiftMedia,
} from '@/lib/database.types'
import { getBatchSignedMediaUrls } from '@/lib/storage'
import { DEFAULT_THEME } from '@/config/themes'

export interface PublicGiftData {
  gift: {
    id: string
    title: string | null
    recipient_name: string
    sender_name: string | null
    theme_config: GiftThemeConfig
    public_slug: string
    occasion?: {
      name: string
      icon: string
    }
  }
  sections: GiftSection[]
  media: GiftMediaItem[]
}

// Generate URL-safe random 8-char slug
function generateLocalSlug(length = 8): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Publish a gift server-side
 */
export async function publishGift(giftId: string): Promise<{
  success: boolean
  public_slug?: string
  error?: string
}> {
  try {
    const { data, error } = await supabase.functions.invoke('publish-gift', {
      body: { gift_id: giftId, action: 'publish' },
    })

    if (!error && data?.success && data?.public_slug) {
      return { success: true, public_slug: data.public_slug }
    }

    if (error) {
      console.warn('[publishService] Edge Function error, running client fallback:', error.message)
    }

    // Direct database fallback for local development
    // First query basic gift information
    const { data: currentGift, error: fetchErr } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single()

    if (fetchErr || !currentGift) {
      console.error('[publishService] Fetch gift error:', fetchErr)
      return {
        success: false,
        error: fetchErr?.message || 'Gift not found.',
      }
    }

    if (!currentGift.recipient_name?.trim()) {
      return { success: false, error: 'Recipient name is required before publishing.' }
    }

    const slug = (currentGift as unknown as { public_slug?: string | null }).public_slug || generateLocalSlug(8)

    // Try updating status and public_slug
    let { error: updateErr } = await supabase
      .from('gifts')
      .update({
        status: 'published' as const,
        public_slug: slug,
        updated_at: new Date().toISOString(),
      })
      .eq('id', giftId)

    // If public_slug column is missing from PostgreSQL schema cache, fallback to updating status only
    if (updateErr && updateErr.message?.includes('public_slug')) {
      console.warn('[publishService] public_slug column not found in schema cache. Updating status only.')
      const fallbackResult = await supabase
        .from('gifts')
        .update({
          status: 'published' as const,
          updated_at: new Date().toISOString(),
        })
        .eq('id', giftId)

      updateErr = fallbackResult.error
    }

    if (updateErr) {
      return { success: false, error: updateErr.message }
    }

    return { success: true, public_slug: slug }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to publish gift'
    return { success: false, error: msg }
  }
}

/**
 * Unpublish a gift server-side
 */
export async function unpublishGift(giftId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { data, error } = await supabase.functions.invoke('publish-gift', {
      body: { gift_id: giftId, action: 'unpublish' },
    })

    if (!error && data?.success) {
      return { success: true }
    }

    if (error) {
      console.warn('[publishService] Edge Function unpublish error, running client fallback:', error.message)
    }

    // Client fallback
    const { error: updateErr } = await supabase
      .from('gifts')
      .update({
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', giftId)

    if (updateErr) {
      return { success: false, error: updateErr.message }
    }

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to unpublish gift'
    return { success: false, error: msg }
  }
}

/**
 * Fetch a published gift anonymously by public_slug
 */
export async function getPublicGift(slug: string): Promise<{
  data?: PublicGiftData
  error?: string
}> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  // 1. Try Supabase Functions SDK invocation
  try {
    const { data, error } = await supabase.functions.invoke('get-public-gift', {
      body: { slug },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!error && data?.data) {
      return { data: data.data }
    }

    if (error) {
      console.warn('[publishService] supabase.functions.invoke error:', error.message)
    }
  } catch (sdkErr) {
    console.warn('[publishService] SDK invoke exception:', sdkErr)
  }

  // 2. Try Direct HTTP GET to Edge Function endpoint with public anon key
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const edgeUrl = `${supabaseUrl}/functions/v1/get-public-gift?slug=${encodeURIComponent(slug)}`
      const res = await fetch(edgeUrl, {
        method: 'GET',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      })

      if (res.ok) {
        const json = await res.json()
        if (json?.data) {
          return { data: json.data }
        }
      } else {
        const errorJson = await res.json().catch(() => null)
        console.warn('[publishService] Direct HTTP Edge Function response not ok:', res.status, errorJson)
      }
    } catch (fetchErr) {
      console.warn('[publishService] Direct HTTP fetch error:', fetchErr)
    }
  }

  // 3. Direct client query fallback (works when creator is logged in or public read policy active)
  try {
    const { data: giftData, error: giftErr } = await supabase
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

    if (giftErr || !giftData) {
      return { error: "This gift isn't available right now." }
    }

    const { data: sectionData } = await supabase
      .from('gift_sections')
      .select('*')
      .eq('gift_id', giftData.id)
      .eq('is_visible', true)
      .order('position', { ascending: true })

    const { data: mediaData } = await supabase
      .from('gift_media')
      .select('*')
      .eq('gift_id', giftData.id)
      .order('position', { ascending: true })

    let resolvedMedia: GiftMediaItem[] = []
    if (mediaData && mediaData.length > 0) {
      const rawMedia = mediaData as GiftMedia[]
      const paths = rawMedia.map((m) => m.storage_path)
      const urlMap = await getBatchSignedMediaUrls(paths)

      resolvedMedia = rawMedia.map((m) => ({
        ...m,
        signedUrl: urlMap[m.storage_path] || undefined,
      }))
    }

    const loadedGift: PublicGiftData = {
      gift: {
        id: giftData.id,
        title: giftData.title,
        recipient_name: giftData.recipient_name,
        sender_name: giftData.sender_name,
        theme_config: (giftData.theme_config as GiftThemeConfig) || DEFAULT_THEME,
        public_slug: giftData.public_slug || slug,
        occasion: giftData.occasion as { name: string; icon: string } | undefined,
      },
      sections: (sectionData as GiftSection[]) || [],
      media: resolvedMedia,
    }

    return { data: loadedGift }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "This gift isn't available right now."
    return { error: msg }
  }
}
