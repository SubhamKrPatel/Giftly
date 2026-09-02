import { useState, useEffect, useMemo } from 'react'
import {
  Heart,
  MessageSquareHeart,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic,
  ChevronLeft,
  ChevronRight,
  Gift as GiftIcon,
  Sparkles,
} from 'lucide-react'
import type {
  GiftWithDetails,
  GiftSection,
  GiftMediaItem,
} from '@/lib/database.types'
import { resolveRecipientPages, type RecipientPage } from '@/lib/recipientPages'
import { getOccasionVisualTheme } from '@/lib/occasionThemes'
import RecipientBackground from '@/components/recipient/visuals/RecipientBackground'
import RecipientMusicController from '@/components/recipient/RecipientMusicController'

interface GiftPreviewProps {
  gift: GiftWithDetails
  sections: GiftSection[]
  activeSectionType?: string
  mediaItems?: GiftMediaItem[]
  videoItems?: GiftMediaItem[]
  voiceItem?: GiftMediaItem | null
  musicItem?: GiftMediaItem | null
}

export default function GiftPreview({
  gift,
  sections,
  activeSectionType,
  mediaItems = [],
  videoItems = [],
  voiceItem = null,
  musicItem = null,
}: GiftPreviewProps) {
  // Resolve Occasion Theme
  const occasionTheme = useMemo(() => {
    return getOccasionVisualTheme(gift.occasion?.slug || gift.occasion?.name)
  }, [gift.occasion?.slug, gift.occasion?.name])

  const theme = gift.theme_config || {
    primaryColor: '#f43f5e',
    secondaryColor: '#fda4af',
    accentColor: '#e11d48',
    backgroundColor: '#fff1f2',
    textColor: '#1f2937',
  }

  const primaryColor = theme.primaryColor || occasionTheme.ambientGlows.primary || '#f43f5e'
  const accentColor = theme.accentColor || occasionTheme.ambientGlows.accent || '#e11d48'
  const backgroundColor = theme.backgroundColor || '#fff1f2'
  const textColor = theme.textColor || '#1f2937'

  // Combine media items for page resolver
  const allMedia = useMemo(() => {
    const list: GiftMediaItem[] = [...mediaItems, ...videoItems]
    if (voiceItem) list.push(voiceItem)
    if (musicItem) list.push(musicItem)
    return list
  }, [mediaItems, videoItems, voiceItem, musicItem])

  const pages: RecipientPage[] = useMemo(() => {
    return resolveRecipientPages({ gift, sections, mediaItems: allMedia })
  }, [gift, sections, allMedia])

  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  // Sync with active section selected in creator editor
  useEffect(() => {
    if (!activeSectionType) return

    let targetIdx = -1
    if (activeSectionType === 'cover' || activeSectionType === 'details' || activeSectionType === 'theme') {
      targetIdx = pages.findIndex((p) => p.type === 'opening')
    } else if (activeSectionType === 'message') {
      targetIdx = pages.findIndex((p) => p.type === 'message')
    } else if (activeSectionType === 'gallery') {
      targetIdx = pages.findIndex((p) => p.type === 'photos')
    } else if (activeSectionType === 'video') {
      targetIdx = pages.findIndex((p) => p.type === 'video')
    } else if (activeSectionType === 'voice') {
      targetIdx = pages.findIndex((p) => p.type === 'voice')
    } else if (activeSectionType === 'final_message') {
      targetIdx = pages.findIndex((p) => p.type === 'closing')
    }

    if (targetIdx !== -1) {
      setCurrentPageIndex(targetIdx)
    } else {
      // Fall back to nearest valid visible page
      setCurrentPageIndex((prev) => Math.max(0, Math.min(prev, pages.length - 1)))
    }
  }, [activeSectionType, pages])

  // Ensure index remains valid if pages array size changes
  useEffect(() => {
    setCurrentPageIndex((prev) => Math.max(0, Math.min(prev, pages.length - 1)))
  }, [pages.length])

  // Clamp current page index
  const safePageIndex = Math.max(0, Math.min(currentPageIndex, pages.length - 1))
  const currentPage = pages[safePageIndex] || pages[0]
  const isFirstPage = safePageIndex === 0
  const isLastPage = safePageIndex === pages.length - 1

  return (
    <div className="flex flex-col items-center">
      {/* Device Mockup Shell */}
      <div className="w-full max-w-[380px] bg-neutral-900 p-3 rounded-[40px] shadow-phone border-4 border-neutral-800">
        {/* Device Notch/Speaker Header */}
        <div className="flex items-center justify-between px-6 py-2 text-white text-[10px] font-medium">
          <span>9:41</span>
          <div className="w-20 h-4 bg-neutral-950 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2 bg-white rounded-sm" />
            <div className="w-3 h-2 bg-white rounded-sm" />
          </div>
        </div>

        {/* Device Inner Screen Container */}
        <div
          className="w-full rounded-[32px] overflow-hidden flex flex-col justify-between max-h-[620px] min-h-[560px] transition-colors duration-300 relative"
          style={{
            backgroundColor: backgroundColor,
            color: textColor,
          }}
        >
          {/* Dynamic Occasion Background */}
          <RecipientBackground
            occasionTheme={occasionTheme}
            theme={theme}
            pageType={currentPage.type}
            isCompact={true}
          />

          {/* Top Brand & Occasion Tag / Music Control */}
          <div className="relative z-10 pt-4 px-4 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-tight text-neutral-800 font-serif">
              Giftly
            </span>
            <div className="flex items-center gap-1.5">
              {/* Music Controller */}
              <RecipientMusicController
                musicItem={sections.find((s) => s.section_type === 'music')?.is_visible === false ? null : musicItem}
                theme={theme}
                isCompact={true}
              />
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-white/80 backdrop-blur-sm shadow-xs border border-warm-200/60"
                style={{ color: primaryColor }}
              >
                <span>{gift.occasion?.icon || '🎁'}</span>
                <span>{gift.occasion?.name || 'Surprise'}</span>
              </span>
            </div>
          </div>

          {/* Center Moment Canvas */}
          <div className="relative z-10 p-4 flex-1 flex flex-col justify-center overflow-y-auto scrollbar-thin">
            {currentPage && (
              <div className="w-full animate-fade-in space-y-3">
                {/* 1. Opening Page */}
                {currentPage.type === 'opening' && (
                  <div className="text-center space-y-3 py-4">
                    <div
                      className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                      }}
                    >
                      <GiftIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-bold tracking-tight text-neutral-900 leading-tight">
                        {currentPage.content.headline || `A Special Surprise for ${gift.recipient_name}`}
                      </h2>
                      {currentPage.content.subheadline && (
                        <p className="text-xs text-neutral-600 mt-1">
                          {currentPage.content.subheadline}
                        </p>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 pt-1">
                      For <strong className="text-neutral-800">{gift.recipient_name}</strong>
                      {gift.sender_name && <span> • From <strong>{gift.sender_name}</strong></span>}
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPageIndex((p) => Math.min(pages.length - 1, p + 1))}
                        className="px-5 py-2 rounded-full text-xs font-semibold text-white shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                        }}
                      >
                        Open Gift →
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Message Page */}
                {currentPage.type === 'message' && (
                  <div className="p-4 rounded-3xl bg-white/95 shadow-xs border border-warm-200/80 space-y-3">
                    <div className="flex items-center gap-2 border-b border-warm-100 pb-2">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <MessageSquareHeart className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-serif text-sm font-semibold text-neutral-800">
                        {currentPage.content.heading || 'A Message For You'}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line font-serif">
                      {currentPage.content.body}
                    </p>
                    {gift.sender_name && (
                      <p className="text-[11px] font-bold text-right italic pt-1" style={{ color: primaryColor }}>
                        — {gift.sender_name}
                      </p>
                    )}
                  </div>
                )}

                {/* 3. Story Page */}
                {currentPage.type === 'story' && (
                  <div className="p-4 rounded-3xl bg-white/95 shadow-xs border border-warm-200/80 space-y-3">
                    <div className="flex items-center gap-2 border-b border-warm-100 pb-2">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-serif text-sm font-semibold text-neutral-800">
                        {currentPage.content.heading || 'Our Story'}
                      </h3>
                    </div>
                    {currentPage.content.items && currentPage.content.items.length > 0 && (
                      <div className="space-y-2">
                        {currentPage.content.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-warm-50 text-xs">
                            <span className="font-semibold text-neutral-800">{item.title}</span>
                            {item.description && <p className="text-[11px] text-neutral-500">{item.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Photos Page */}
                {currentPage.type === 'photos' && (
                  <div className="p-4 rounded-3xl bg-white/95 shadow-xs border border-warm-200/80 space-y-3">
                    <div className="flex items-center justify-between border-b border-warm-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="font-serif text-sm font-semibold text-neutral-800">
                          Photo Memories
                        </h3>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {mediaItems.length} photos
                      </span>
                    </div>
                    {mediaItems.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {mediaItems.slice(0, 4).map((item) => (
                          <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-warm-100">
                            <img src={item.signedUrl} alt={item.file_name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-neutral-400">
                        Photos added in editor appear here
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Video / Voice Page */}
                {(currentPage.type === 'video' || currentPage.type === 'voice') && (
                  <div className="p-4 rounded-3xl bg-white/95 shadow-xs border border-warm-200/80 space-y-3">
                    <div className="flex items-center gap-2 border-b border-warm-100 pb-2">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {currentPage.type === 'voice' ? <Mic className="w-3.5 h-3.5" /> : <VideoIcon className="w-3.5 h-3.5" />}
                      </div>
                      <h3 className="font-serif text-sm font-semibold text-neutral-800">
                        {currentPage.type === 'voice' ? 'Voice Note' : 'Video Message'}
                      </h3>
                    </div>
                    {videoItems.length > 0 ? (
                      <div className="aspect-video rounded-xl overflow-hidden bg-neutral-950">
                        <video src={videoItems[0].signedUrl} controls className="w-full h-full object-contain" />
                      </div>
                    ) : voiceItem && voiceItem.signedUrl ? (
                      <div className="p-3 bg-warm-50 rounded-xl">
                        <audio src={voiceItem.signedUrl} controls className="w-full" />
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-neutral-400">
                        Media added in editor appears here
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Closing Page */}
                {currentPage.type === 'closing' && (
                  <div className="p-5 rounded-3xl bg-white/95 shadow-xs border border-warm-200/80 text-center space-y-3">
                    <div
                      className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Heart className="w-5 h-5 fill-white" />
                    </div>
                    <h3 className="font-serif text-base font-semibold text-neutral-800">
                      {currentPage.content.heading || 'With Love'}
                    </h3>
                    <p className="text-xs text-neutral-600 font-serif whitespace-pre-line leading-relaxed">
                      &quot;{currentPage.content.body}&quot;
                    </p>
                    {gift.sender_name && (
                      <p className="text-xs font-semibold italic pt-1" style={{ color: primaryColor }}>
                        — {gift.sender_name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Step Navigation Bar */}
          <div className="relative z-10 p-3 bg-white/60 backdrop-blur-md border-t border-warm-200/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                disabled={isFirstPage}
                className={`p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 transition-colors ${
                  isFirstPage ? 'opacity-20 cursor-not-allowed' : 'hover:bg-warm-100 cursor-pointer'
                }`}
                title="Previous Moment"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-[10px] font-mono font-medium text-neutral-500">
                {safePageIndex + 1} / {pages.length}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPageIndex((p) => (isLastPage ? 0 : Math.min(pages.length - 1, p + 1)))}
                className="p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-warm-100 transition-colors cursor-pointer"
                title={isLastPage ? 'Replay' : 'Next Moment'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-1.5">
              {pages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPageIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === safePageIndex
                      ? 'w-4'
                      : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  style={{
                    backgroundColor: idx === safePageIndex ? primaryColor : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
