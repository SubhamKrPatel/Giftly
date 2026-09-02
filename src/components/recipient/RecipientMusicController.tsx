import { useState, useEffect, useRef, useCallback } from 'react'
import { Music, VolumeX } from 'lucide-react'
import type { GiftMediaItem, GiftThemeConfig } from '@/lib/database.types'

export interface RecipientMusicControllerHandle {
  handleVideoPlay: () => void
  handleVideoPause: () => void
}

interface RecipientMusicControllerProps {
  musicItem: GiftMediaItem | null
  theme: GiftThemeConfig
  isCompact?: boolean
  onRegisterHandle?: (handle: RecipientMusicControllerHandle) => void
}

export default function RecipientMusicController({
  musicItem,
  theme,
  isCompact = false,
  onRegisterHandle,
}: RecipientMusicControllerProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const accentColor = theme.accentColor || '#e11d48'

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Explicit user preference (starts false: NO autoplay)
  const [userWantsMusic, setUserWantsMusic] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPausedByVideo, setIsPausedByVideo] = useState(false)
  const [hasError, setHasError] = useState(false)

  // References to avoid stale state in event callbacks
  const userWantsMusicRef = useRef(userWantsMusic)
  const isPlayingRef = useRef(isPlaying)
  const isPausedByVideoRef = useRef(isPausedByVideo)

  userWantsMusicRef.current = userWantsMusic
  isPlayingRef.current = isPlaying
  isPausedByVideoRef.current = isPausedByVideo

  // Safe play helper preventing unhandled promise rejections
  const safePlay = useCallback(() => {
    if (!audioRef.current || !musicItem?.signedUrl) return
    const promise = audioRef.current.play()
    if (promise !== undefined) {
      promise
        .then(() => {
          setIsPlaying(true)
          setHasError(false)
        })
        .catch((err) => {
          console.warn('[RecipientMusicController] Play failed/prevented by browser:', err)
          setIsPlaying(false)
        })
    }
  }, [musicItem?.signedUrl])

  // Safe pause helper
  const safePause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
  }, [])

  // Explicit user toggle handler
  const handleToggleMusic = useCallback(() => {
    if (hasError || !musicItem?.signedUrl) return

    if (isPlaying) {
      // User explicitly pauses music
      setUserWantsMusic(false)
      setIsPausedByVideo(false)
      safePause()
    } else {
      // User explicitly starts music
      setUserWantsMusic(true)
      setIsPausedByVideo(false)
      safePlay()
    }
  }, [isPlaying, hasError, musicItem?.signedUrl, safePause, safePlay])

  // Video / Voice Note Play coordination
  const handleVideoPlay = useCallback(() => {
    if (userWantsMusicRef.current && isPlayingRef.current) {
      setIsPausedByVideo(true)
      safePause()
    }
  }, [safePause])

  // Video / Voice Note Pause/End coordination
  const handleVideoPause = useCallback(() => {
    if (userWantsMusicRef.current && isPausedByVideoRef.current) {
      setIsPausedByVideo(false)
      safePlay()
    }
  }, [safePlay])

  // Register external handles for VideoMoment coordination
  useEffect(() => {
    if (onRegisterHandle) {
      onRegisterHandle({
        handleVideoPlay,
        handleVideoPause,
      })
    }
  }, [onRegisterHandle, handleVideoPlay, handleVideoPause])

  // Cleanup on unmount
  useEffect(() => {
    const audio = audioRef.current
    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [])

  // If no music exists or signed URL is missing, do not render control
  if (!musicItem || !musicItem.signedUrl || hasError) {
    return null
  }

  return (
    <>
      {/* Hidden single HTMLAudioElement instance */}
      <audio
        ref={audioRef}
        src={musicItem.signedUrl}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        aria-hidden="true"
      />

      {/* Floating Music Control Button */}
      <div
        className={`z-30 select-none ${
          isCompact
            ? 'relative'
            : 'relative'
        }`}
      >
        <button
          type="button"
          onClick={handleToggleMusic}
          role="switch"
          aria-checked={isPlaying}
          aria-label={isPlaying ? 'Pause background soundtrack' : 'Play background soundtrack'}
          title={
            isPlaying
              ? `Music Playing: ${musicItem.file_name || 'Soundtrack'} (Click to pause)`
              : 'Play background music'
          }
          className={`group inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 shadow-sm border cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none min-h-[44px] ${
            isPlaying
              ? 'bg-white/90 text-neutral-900 border-rose-200 shadow-md hover:bg-white hover:scale-105 active:scale-95'
              : 'bg-white/70 text-neutral-600 border-warm-200/80 hover:bg-white/90 hover:text-neutral-900 active:scale-95'
          }`}
        >
          {/* Animated Music Note / Equalizer Icon */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-transform ${
              isPlaying ? 'scale-105 shadow-xs' : 'opacity-70'
            }`}
            style={{
              background: isPlaying
                ? `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`
                : '#737373',
            }}
          >
            {isPlaying ? (
              <Music className="w-3.5 h-3.5 animate-pulse-subtle" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </div>

          {/* Sound wave animated equalizer bars (hidden when reduced-motion is preferred) */}
          {isPlaying ? (
            <div className="flex items-center gap-0.5 h-3.5 px-0.5 motion-reduce:hidden" aria-hidden="true">
              <span
                className="w-0.5 h-3 rounded-full animate-sound-wave-1"
                style={{ backgroundColor: primaryColor }}
              />
              <span
                className="w-0.5 h-2 rounded-full animate-sound-wave-2"
                style={{ backgroundColor: accentColor }}
              />
              <span
                className="w-0.5 h-3.5 rounded-full animate-sound-wave-3"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          ) : null}

          {/* Label Text */}
          <span className="text-[11px] font-medium tracking-tight">
            {isPlaying ? 'Music On' : 'Music Off'}
          </span>
        </button>
      </div>
    </>
  )
}
