import type {
  GiftWithDetails,
  GiftSection,
  GiftMediaItem,
  CoverSectionContent,
  MessageSectionContent,
  FinalMessageSectionContent,
  GallerySectionContent,
  VideoSectionContent,
  VoiceSectionContent,
  SlideBackgroundConfig,
} from '@/lib/database.types'

export type RecipientPageType =
  | 'opening'
  | 'message'
  | 'story'
  | 'photos'
  | 'video'
  | 'voice'
  | 'closing'

export interface RecipientStoryItem {
  id?: string
  title: string
  description?: string
  date?: string
  imageUrl?: string
  mediaId?: string
  iconEmoji?: string
  colorTag?: string
}

export interface RecipientPageContent {
  headline?: string
  subheadline?: string
  heading?: string
  subtitle?: string
  body?: string
  items?: RecipientStoryItem[]
  backgroundImageUrl?: string
  backgroundMediaId?: string
  background?: SlideBackgroundConfig
  photos?: GiftMediaItem[]
  videos?: GiftMediaItem[]
  voice?: GiftMediaItem | null
  music?: GiftMediaItem | null
  signature?: string
  [key: string]: unknown
}

export interface RecipientPage {
  id: string
  type: RecipientPageType
  title: string
  subtitle?: string
  badge?: string
  sectionId?: string
  position: number
  background?: SlideBackgroundConfig
  content: RecipientPageContent
}

export interface ResolveRecipientPagesOptions {
  gift: GiftWithDetails
  sections: GiftSection[]
  mediaItems: GiftMediaItem[]
}

/**
 * Resolves raw gift database rows, sections, and media into an ordered,
 * validated sequence of recipient pages / moments.
 *
 * Rules:
 * - Opening, Message, and Final Wish (Closing) are required and always included.
 * - Optional pages (Story, Photos, Video, Voice) are only included if the section
 *   is marked visible AND has actual content (photos > 0, videos > 0, etc.).
 * - Background Music is a global ambient soundtrack, NOT a recipient page moment,
 *   and is NEVER included in the resolved recipient pages array.
 * - Empty states are automatically skipped so recipients never see a blank moment.
 */
export function resolveRecipientPages({
  gift,
  sections,
  mediaItems = [],
}: ResolveRecipientPagesOptions): RecipientPage[] {
  // Sort sections by position
  const sortedSections = [...sections].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  // Media partition
  const photos = mediaItems.filter((m) => m.media_type === 'image')
  const videos = mediaItems.filter((m) => m.media_type === 'video')
  const voiceItem =
    mediaItems.find(
      (m) =>
        m.media_type === 'audio' &&
        sections.find((s) => s.id === m.section_id)?.section_type === 'voice'
    ) || mediaItems.find((m) => m.media_type === 'audio' && m.storage_path.includes('/voice/')) || null

  const musicItem =
    mediaItems.find(
      (m) =>
        m.media_type === 'audio' &&
        sections.find((s) => s.id === m.section_id)?.section_type === 'music'
    ) || mediaItems.find((m) => m.media_type === 'audio' && m.storage_path.includes('/music/')) || null

  const recipientName = gift.recipient_name || 'Chahat'
  const senderName = gift.sender_name || undefined
  const occasionName = gift.occasion?.name || 'A Special Surprise'
  const occasionIcon = gift.occasion?.icon || '🎁'

  const resolvedPages: RecipientPage[] = []

  // ── 1. Opening Page (Required) ──
  const coverSection = sortedSections.find((s) => s.section_type === 'cover')
  const coverContent = (coverSection?.content as CoverSectionContent) || {}
  const headline = coverContent.headline || `A Special Surprise for ${recipientName}`
  const subheadline = coverContent.subheadline || (senderName ? `With love from ${senderName}` : undefined)

  resolvedPages.push({
    id: coverSection?.id || 'page-opening',
    type: 'opening',
    title: headline,
    subtitle: subheadline,
    badge: `${occasionIcon} ${occasionName}`,
    sectionId: coverSection?.id,
    position: 0,
    background: coverContent.background,
    content: {
      headline,
      subheadline,
      signature: senderName,
      background: coverContent.background,
    },
  })

  // ── 2. Message Page (Required) ──
  const messageSection = sortedSections.find((s) => s.section_type === 'message')
  const msgContent = (messageSection?.content as MessageSectionContent) || {}
  const msgHeading = msgContent.heading || 'A Message For You'
  const msgBody =
    msgContent.body !== undefined
      ? msgContent.body
      : `Dear ${recipientName},\n\nWishing you a wonderful day filled with happiness, love, and memorable moments.`

  resolvedPages.push({
    id: messageSection?.id || 'page-message',
    type: 'message',
    title: msgHeading,
    badge: 'Personal Note',
    sectionId: messageSection?.id,
    position: 1,
    background: msgContent.background,
    content: {
      heading: msgHeading,
      body: msgBody,
      signature: senderName,
      background: msgContent.background,
    },
  })

  // ── 3. Story Page (Optional) ──
  // Check for explicit 'story' section with items or text
  const storySection = sortedSections.find((s) => s.section_type === 'story')
  if (storySection && storySection.is_visible !== false) {
    const storyContent = (storySection.content as Record<string, unknown>) || {}
    const items = (storyContent.items as RecipientStoryItem[]) || []
    const storyBody = typeof storyContent.body === 'string' ? storyContent.body : undefined
    const storyHeading = typeof storyContent.heading === 'string' ? storyContent.heading : 'Our Story'
    const storySubtitle = typeof storyContent.subtitle === 'string' ? storyContent.subtitle : undefined
    const backgroundImageUrl = typeof storyContent.backgroundImageUrl === 'string' ? storyContent.backgroundImageUrl : undefined
    const backgroundMediaId = typeof storyContent.backgroundMediaId === 'string' ? storyContent.backgroundMediaId : undefined
    const storyBackground =
      (storyContent.background as SlideBackgroundConfig | undefined) ||
      (backgroundImageUrl
        ? {
            mode: 'photo' as const,
            mediaUrl: backgroundImageUrl,
            mediaId: backgroundMediaId,
            position: 'center' as const,
            overlay: 50,
          }
        : undefined)

    if (items.length > 0 || (storyBody && storyBody.trim().length > 0)) {
      resolvedPages.push({
        id: storySection.id,
        type: 'story',
        title: storyHeading,
        subtitle: storySubtitle,
        badge: 'Special Moments',
        sectionId: storySection.id,
        position: resolvedPages.length,
        background: storyBackground,
        content: {
          heading: storyHeading,
          subtitle: storySubtitle,
          body: storyBody,
          items,
          backgroundImageUrl,
          backgroundMediaId,
          background: storyBackground,
        },
      })
    }
  }

  // ── 4. Photos Page (Optional - only if visible AND photos exist) ──
  const gallerySection = sortedSections.find((s) => s.section_type === 'gallery')
  const galleryVisible = gallerySection ? gallerySection.is_visible !== false : false
  if (galleryVisible && photos.length > 0) {
    const galleryContent = (gallerySection?.content as GallerySectionContent) || {}
    const galleryItems = galleryContent.items || []
    const photosWithCaptions: GiftMediaItem[] = photos.map((p) => {
      const match = galleryItems.find((it) => it.id === p.id || it.mediaId === p.id)
      return {
        ...p,
        caption: match?.caption || p.caption,
      }
    })

    resolvedPages.push({
      id: gallerySection?.id || 'page-photos',
      type: 'photos',
      title: 'Photo Memories',
      subtitle: galleryContent.caption || `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} captured with love`,
      badge: 'Photo Memories',
      sectionId: gallerySection?.id,
      position: resolvedPages.length,
      background: galleryContent.background,
      content: {
        photos: photosWithCaptions,
        heading: 'Photo Memories',
        background: galleryContent.background,
      },
    })
  }

  // ── 5. Video Page (Optional - only if visible AND videos exist) ──
  const videoSection = sortedSections.find((s) => s.section_type === 'video')
  const videoVisible = videoSection ? videoSection.is_visible !== false : false
  if (videoVisible && videos.length > 0) {
    const videoContent = (videoSection?.content as VideoSectionContent) || {}
    const videoHeading = videoContent.heading || 'Video Message'
    const videoSubtitle = videoContent.subtitle || 'A recorded clip just for you'

    resolvedPages.push({
      id: videoSection?.id || 'page-video',
      type: 'video',
      title: videoHeading,
      subtitle: videoSubtitle,
      badge: 'Video Message',
      sectionId: videoSection?.id,
      position: resolvedPages.length,
      background: videoContent.background,
      content: {
        videos,
        heading: videoHeading,
        subtitle: videoSubtitle,
        background: videoContent.background,
      },
    })
  }

  // ── 6. Voice Page (Optional - only if visible AND voice item exists) ──
  const voiceSection = sortedSections.find((s) => s.section_type === 'voice')
  const voiceVisible = voiceSection ? voiceSection.is_visible !== false : false
  if (voiceVisible && voiceItem && voiceItem.signedUrl) {
    const voiceContent = (voiceSection?.content as VoiceSectionContent) || {}
    const voiceHeading = voiceContent.heading || 'A Voice Note For You'
    const voiceSubtitle = voiceContent.subtitle || 'A personal audio note'

    resolvedPages.push({
      id: voiceSection?.id || 'page-voice',
      type: 'voice',
      title: voiceHeading,
      subtitle: voiceSubtitle,
      badge: 'Voice Note',
      sectionId: voiceSection?.id,
      position: resolvedPages.length,
      background: voiceContent.background,
      content: {
        voice: voiceItem,
        heading: voiceHeading,
        subtitle: voiceSubtitle,
        background: voiceContent.background,
      },
    })
  }

  // ── 7. Final Wish / Closing Page (Required) ──
  const finalSection = sortedSections.find((s) => s.section_type === 'final_message')
  const finalContent = (finalSection?.content as FinalMessageSectionContent) || {}
  const finalHeading = finalContent.heading || 'With Love'
  const finalBody =
    finalContent.body !== undefined
      ? finalContent.body
      : 'May your days ahead be filled with endless joy, laughter, and blessings.'

  resolvedPages.push({
    id: finalSection?.id || 'page-closing',
    type: 'closing',
    title: finalHeading,
    badge: 'With Love',
    sectionId: finalSection?.id,
    position: resolvedPages.length,
    background: finalContent.background,
    content: {
      heading: finalHeading,
      body: finalBody,
      signature: senderName,
      music: musicItem,
      background: finalContent.background,
    },
  })

  // Normalize final positions
  return resolvedPages.map((page, index) => ({
    ...page,
    position: index,
  }))
}
