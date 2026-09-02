import { useEffect } from 'react'
import { Video as VideoIcon, Mic } from 'lucide-react'
import type { GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface VideoMomentProps {
  page: RecipientPage
  theme: GiftThemeConfig
  onMediaPlay?: () => void
  onMediaPause?: () => void
}

export default function VideoMoment({
  page,
  theme,
  onMediaPlay,
  onMediaPause,
}: VideoMomentProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const videos = page.content.videos || []
  const voice = page.content.voice
  const isVoiceOnly = page.type === 'voice' || (videos.length === 0 && Boolean(voice))

  // When unmounting, inform parent that active media has ended
  useEffect(() => {
    return () => {
      onMediaPause?.()
    }
  }, [onMediaPause])

  return (
    <article className="max-w-xl mx-auto w-full bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-8 shadow-card border border-warm-200/80 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-warm-100 pb-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {isVoiceOnly ? <Mic className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {isVoiceOnly ? 'Voice Recording' : 'Personal Clip'}
          </span>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-800">
            {isVoiceOnly ? 'A Voice Note For You' : 'Video Message'}
          </h2>
        </div>
      </div>

      {/* Videos List */}
      {!isVoiceOnly && videos.length > 0 && (
        <div className="space-y-4">
          {videos.map((item) => (
            <div
              key={item.id}
              className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 shadow-md border border-neutral-800"
            >
              {item.signedUrl && (
                <video
                  src={item.signedUrl}
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={onMediaPlay}
                  onPause={onMediaPause}
                  onEnded={onMediaPause}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Voice Audio Player */}
      {voice && voice.signedUrl && (
        <div className="p-4 bg-warm-50 rounded-2xl border border-warm-200 space-y-2">
          <p className="text-xs font-medium text-neutral-600">
            🎙️ Listen to personal voice message:
          </p>
          <audio
            src={voice.signedUrl}
            controls
            preload="metadata"
            onPlay={onMediaPlay}
            onPause={onMediaPause}
            onEnded={onMediaPause}
            className="w-full"
          />
        </div>
      )}
    </article>
  )
}
