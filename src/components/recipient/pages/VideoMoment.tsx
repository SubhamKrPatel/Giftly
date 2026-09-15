import { useEffect } from 'react'
import { Video as VideoIcon, Mic, Sparkles } from 'lucide-react'
import type { GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface VideoMomentProps {
  page: RecipientPage
  theme: GiftThemeConfig
  onMediaPlay?: () => void
  onMediaPause?: () => void
  isCompact?: boolean
}

export default function VideoMoment({
  page,
  theme,
  onMediaPlay,
  onMediaPause,
  isCompact = false,
}: VideoMomentProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const videos = page.content.videos || []
  const voice = page.content.voice
  const isVoiceOnly = page.type === 'voice' || (videos.length === 0 && Boolean(voice))

  // Custom heading & subtitle if provided by creator
  const heading =
    page.content.heading ||
    page.title ||
    (isVoiceOnly ? 'A Voice Note For You' : 'Video Message')
  const subtitle = page.content.subtitle || page.subtitle

  // When unmounting or navigating away, ensure any paused background music is resumed if appropriate
  useEffect(() => {
    return () => {
      onMediaPause?.()
    }
  }, [onMediaPause])

  return (
    <article
      className={`max-w-xl mx-auto w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-card border border-warm-200/80 animate-fade-in ${
        isCompact ? 'p-4 space-y-3' : 'p-5 sm:p-8 space-y-5'
      }`}
    >
      {/* ── Moment Header ── */}
      <div className="flex items-center gap-3 border-b border-warm-100/90 pb-3.5">
        <div
          className={`rounded-2xl flex items-center justify-center text-white shadow-xs flex-shrink-0 ${
            isCompact ? 'w-8 h-8' : 'w-10 h-10'
          }`}
          style={{ backgroundColor: primaryColor }}
        >
          {isVoiceOnly ? (
            <Mic className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
          ) : (
            <VideoIcon className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>{isVoiceOnly ? 'Voice Recording' : 'Recorded Moment'}</span>
          </div>
          <h2 className={`font-serif font-bold text-neutral-800 truncate ${
            isCompact ? 'text-base' : 'text-lg sm:text-xl'
          }`}>
            {heading}
          </h2>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── Video Player Canvas (NO autoplay, pause/resume background music) ── */}
      {!isVoiceOnly && videos.length > 0 && (
        <div className="space-y-4">
          {videos.map((item, index) => (
            <div
              key={item.id || index}
              className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 shadow-md border border-neutral-800"
            >
              {item.signedUrl ? (
                <video
                  src={item.signedUrl}
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={onMediaPlay}
                  onPause={onMediaPause}
                  onEnded={onMediaPause}
                  className="w-full h-full object-contain"
                  aria-label={item.file_name ? `Video message: ${item.file_name}` : 'Personal video message'}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-2 p-4 text-center">
                  <VideoIcon className="w-8 h-8 opacity-40" />
                  <span className="text-xs">Video stream is preparing…</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Voice Audio Player Canvas (NO autoplay, pause/resume background music) ── */}
      {isVoiceOnly && voice && (
        <div className="p-4 sm:p-6 bg-gradient-to-br from-warm-50 to-rose-50/40 rounded-2xl border border-warm-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
            <Mic className="w-4 h-4 text-rose-500" />
            <span>Press play to listen to your voice message:</span>
          </div>

          {voice.signedUrl ? (
            <div className="w-full bg-white rounded-xl p-2 shadow-xs border border-warm-200/80">
              <audio
                src={voice.signedUrl}
                controls
                preload="metadata"
                onPlay={onMediaPlay}
                onPause={onMediaPause}
                onEnded={onMediaPause}
                className="w-full"
                aria-label="Voice message audio player"
              />
            </div>
          ) : (
            <div className="text-xs text-neutral-400 text-center py-3">
              Voice recording stream is preparing…
            </div>
          )}
        </div>
      )}

      {/* Fallback if somehow both empty */}
      {!isVoiceOnly && videos.length === 0 && !voice && (
        <div className="py-8 text-center text-xs text-neutral-400">
          No media available for this moment.
        </div>
      )}
    </article>
  )
}
