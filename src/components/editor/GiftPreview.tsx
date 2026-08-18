import { Heart, MessageSquareHeart, Image as ImageIcon, Video as VideoIcon } from 'lucide-react'
import type {
  GiftWithDetails,
  GiftSection,
  CoverSectionContent,
  MessageSectionContent,
  FinalMessageSectionContent,
  GiftMediaItem,
} from '@/lib/database.types'

interface GiftPreviewProps {
  gift: GiftWithDetails
  sections: GiftSection[]
  activeSectionType?: string
  mediaItems?: GiftMediaItem[]
  videoItems?: GiftMediaItem[]
}

export default function GiftPreview({
  gift,
  sections,
  mediaItems = [],
  videoItems = [],
}: GiftPreviewProps) {
  const theme = gift.theme_config || {
    primaryColor: '#f43f5e',
    secondaryColor: '#fda4af',
    accentColor: '#e11d48',
    backgroundColor: '#fff1f2',
    textColor: '#1f2937',
  }

  const primaryColor = theme.primaryColor || '#f43f5e'
  const secondaryColor = theme.secondaryColor || '#fda4af'
  const accentColor = theme.accentColor || '#e11d48'
  const backgroundColor = theme.backgroundColor || '#fff1f2'
  const textColor = theme.textColor || '#1f2937'

  // Filter only visible sections and sort by position
  const visibleSections = [...sections]
    .filter((s) => s.is_visible)
    .sort((a, b) => a.position - b.position)

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
          className="w-full rounded-[32px] overflow-y-auto max-h-[640px] min-h-[580px] scrollbar-thin transition-colors duration-300"
          style={{
            backgroundColor: backgroundColor,
            color: textColor,
          }}
        >
          {/* Top Brand Tag inside preview */}
          <div className="pt-5 pb-2 text-center">
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm shadow-xs"
              style={{ color: primaryColor }}
            >
              <span>{gift.occasion?.icon || '🎁'}</span>
              <span>{gift.occasion?.name || 'Giftly Surprise'}</span>
            </span>
          </div>

          {/* Sections Stack in Position Order */}
          <div className="p-4 space-y-4 pb-12">
            {visibleSections.map((section) => {
              if (section.section_type === 'cover') {
                const cover = (section.content as CoverSectionContent) || {}
                const headline =
                  cover.headline || `A Special Surprise for ${gift.recipient_name}`
                const subheadline = cover.subheadline

                return (
                  <div
                    key={section.id}
                    className="p-6 rounded-3xl relative overflow-hidden shadow-sm transition-all duration-300 animate-fade-in text-white"
                    style={{
                      background: `linear-gradient(145deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    {/* Ambient Glows */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20 blur-xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/15 blur-xl pointer-events-none" />

                    <div className="relative z-10 space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">
                        <span>{gift.occasion?.icon || '🌹'}</span>
                      </div>

                      <div>
                        <h2 className="font-serif text-2xl font-bold tracking-tight leading-snug drop-shadow-xs">
                          {headline}
                        </h2>

                        {subheadline && (
                          <p className="text-xs text-white/90 leading-relaxed mt-2">
                            {subheadline}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-white/90">
                        <span>For {gift.recipient_name}</span>
                        {gift.sender_name && <span>From {gift.sender_name}</span>}
                      </div>
                    </div>
                  </div>
                )
              }

              if (section.section_type === 'message') {
                const msg = (section.content as MessageSectionContent) || {}
                const heading = msg.heading || 'A Message For You'
                const body =
                  msg.body ||
                  `Dear ${gift.recipient_name},\n\nEvery moment with you has been a blessing. Wishing you the happiest day filled with love and laughter.`

                return (
                  <div
                    key={section.id}
                    className="p-5 rounded-3xl bg-white shadow-xs border border-warm-200/80 transition-all duration-300 animate-fade-in space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <MessageSquareHeart className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-serif text-base font-semibold text-neutral-800">
                        {heading}
                      </h3>
                    </div>

                    <div className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line font-normal">
                      {body}
                    </div>
                  </div>
                )
              }

              if (section.section_type === 'gallery') {
                return (
                  <div
                    key={section.id}
                    className="p-5 rounded-3xl bg-white shadow-xs border border-warm-200/80 transition-all duration-300 animate-fade-in space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="font-serif text-base font-semibold text-neutral-800">
                          Photo Memories
                        </h3>
                      </div>

                      {mediaItems.length > 0 && (
                        <span className="text-[10px] font-medium text-neutral-400">
                          {mediaItems.length} {mediaItems.length === 1 ? 'photo' : 'photos'}
                        </span>
                      )}
                    </div>

                    {mediaItems.length > 0 ? (
                      <div>
                        {mediaItems.length === 1 && (
                          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-warm-100 shadow-xs">
                            <img
                              src={mediaItems[0].signedUrl}
                              alt={mediaItems[0].file_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {mediaItems.length === 2 && (
                          <div className="grid grid-cols-2 gap-2">
                            {mediaItems.map((item) => (
                              <div
                                key={item.id}
                                className="aspect-square rounded-2xl overflow-hidden bg-warm-100 shadow-xs"
                              >
                                <img
                                  src={item.signedUrl}
                                  alt={item.file_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {mediaItems.length === 3 && (
                          <div className="space-y-2">
                            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-warm-100 shadow-xs">
                              <img
                                src={mediaItems[0].signedUrl}
                                alt={mediaItems[0].file_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {mediaItems.slice(1).map((item) => (
                                <div
                                  key={item.id}
                                  className="aspect-square rounded-2xl overflow-hidden bg-warm-100 shadow-xs"
                                >
                                  <img
                                    src={item.signedUrl}
                                    alt={item.file_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {mediaItems.length >= 4 && (
                          <div className="grid grid-cols-2 gap-2">
                            {mediaItems.map((item) => (
                              <div
                                key={item.id}
                                className="aspect-square rounded-2xl overflow-hidden bg-warm-100 shadow-xs"
                              >
                                <img
                                  src={item.signedUrl}
                                  alt={item.file_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-6 text-center border border-dashed border-warm-200 rounded-2xl p-4 text-neutral-400 text-xs">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                        <span>Photos added in the editor will appear here</span>
                      </div>
                    )}
                  </div>
                )
              }

              if (section.section_type === 'video') {
                return (
                  <div
                    key={section.id}
                    className="p-5 rounded-3xl bg-white shadow-xs border border-warm-200/80 transition-all duration-300 animate-fade-in space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <VideoIcon className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="font-serif text-base font-semibold text-neutral-800">
                          Video Message
                        </h3>
                      </div>

                      {videoItems.length > 0 && (
                        <span className="text-[10px] font-medium text-neutral-400">
                          {videoItems.length} {videoItems.length === 1 ? 'video' : 'videos'}
                        </span>
                      )}
                    </div>

                    {videoItems.length > 0 ? (
                      <div className="space-y-3">
                        {videoItems.map((item) => (
                          <div
                            key={item.id}
                            className="aspect-video rounded-2xl overflow-hidden bg-neutral-950 shadow-xs"
                          >
                            {item.signedUrl && (
                              <video
                                src={item.signedUrl}
                                controls
                                preload="metadata"
                                playsInline
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center border border-dashed border-warm-200 rounded-2xl p-4 text-neutral-400 text-xs">
                        <VideoIcon className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                        <span>Videos added in the editor will appear here</span>
                      </div>
                    )}
                  </div>
                )
              }

              if (section.section_type === 'final_message') {
                const finalMsg = (section.content as FinalMessageSectionContent) || {}
                const heading = finalMsg.heading || 'With Love'
                const body = finalMsg.body

                return (
                  <div
                    key={section.id}
                    className="p-5 rounded-3xl bg-white/90 backdrop-blur-md shadow-xs border border-warm-200/80 transition-all duration-300 animate-fade-in text-center space-y-2"
                  >
                    <div
                      className="w-8 h-8 rounded-full mx-auto flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Heart className="w-4 h-4 fill-white" />
                    </div>

                    <h3 className="font-serif text-base font-semibold text-neutral-800">
                      {heading}
                    </h3>

                    {body && (
                      <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
                        {body}
                      </p>
                    )}

                    {gift.sender_name && (
                      <p
                        className="text-xs font-semibold pt-1 italic font-serif"
                        style={{ color: primaryColor }}
                      >
                        — {gift.sender_name}
                      </p>
                    )}
                  </div>
                )
              }

              return null
            })}

            {visibleSections.length === 0 && (
              <div className="text-center py-12 px-4 text-xs text-neutral-400">
                All sections are currently hidden. Toggle section visibility to preview them.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
