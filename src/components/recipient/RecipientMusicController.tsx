import { useState, useEffect, useRef, useCallback } from 'react'
import { Music, Volume2, VolumeX, SlidersHorizontal } from 'lucide-react'
import type { GiftMediaItem, GiftThemeConfig } from '@/lib/database.types'

export interface RecipientMusicControllerHandle {
  handleVideoPlay: () => void
  handleVideoPause: () => void
}

interface RecipientMusicControllerProps {
  musicItem: GiftMediaItem | null
  theme: GiftThemeConfig
  isCompact?: boolean
  defaultVolume?: number
  onRegisterHandle?: (handle: RecipientMusicControllerHandle) => void
}

export default function RecipientMusicController({
  musicItem,
  theme,
  isCompact = false,
  defaultVolume = 0.7,
  onRegisterHandle,
}: RecipientMusicControllerProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const accentColor = theme.accentColor || '#e11d48'

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Explicit user preference (starts false: STRICTLY NO AUTOPLAY)
  const [userWantsMusic, setUserWantsMusic] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPausedByVideo, setIsPausedByVideo] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [volume, setVolume] = useState(defaultVolume)
  const [showVolumeMenu, setShowVolumeMenu] = useState(false)
  const [hasEverPlayed, setHasEverPlayed] = useState(false)

  const volumeMenuRef = useRef<HTMLDivElement | null>(null)

  // References to avoid stale state in event callbacks
  const userWantsMusicRef = useRef(userWantsMusic)
  const isPlayingRef = useRef(isPlaying)
  const isPausedByVideoRef = useRef(isPausedByVideo)

  userWantsMusicRef.current = userWantsMusic
  isPlayingRef.current = isPlaying
  isPausedByVideoRef.current = isPausedByVideo

  // Update audio element volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume))
    }
  }, [volume])

  // Sync defaultVolume when prop changes
  useEffect(() => {
    if (typeof defaultVolume === 'number' && !isNaN(defaultVolume)) {
      setVolume(defaultVolume)
    }
  }, [defaultVolume])

  // Safe play helper preventing unhandled promise rejections
  const safePlay = useCallback(() => {
    if (!audioRef.current || !musicItem?.signedUrl) return
    const promise = audioRef.current.play()
    if (promise !== undefined) {
      promise
        .then(() => {
          setIsPlaying(true)
          setHasError(false)
          setHasEverPlayed(true)
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

  // Video / Voice Note Play coordination (background music pauses)
  const handleVideoPlay = useCallback(() => {
    if (userWantsMusicRef.current && isPlayingRef.current) {
      setIsPausedByVideo(true)
      safePause()
    }
  }, [safePause])

  // Video / Voice Note Pause/End coordination (background music resumes ONLY if it was playing before)
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

  // Close volume popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (volumeMenuRef.current && !volumeMenuRef.current.contains(e.target as Node)) {
        setShowVolumeMenu(false)
      }
    }

    if (showVolumeMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showVolumeMenu])

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

      {/* Floating Music Control Shell */}
      <div
        ref={volumeMenuRef}
        className="relative z-30 select-none flex items-center gap-1.5"
      >
        {/* Play / Pause Pill Button */}
        <button
          type="button"
          onClick={handleToggleMusic}
          role="switch"
          aria-checked={isPlaying}
          aria-label={
            isPlaying
              ? 'Pause background soundtrack'
              : hasEverPlayed
              ? 'Play background soundtrack'
              : 'Tap to play background soundtrack'
          }
          title={
            isPlaying
              ? `Playing soundtrack: ${musicItem.file_name || 'Soundtrack'} (Click to pause)`
              : 'Play soundtrack'
          }
          className={`group inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 shadow-sm border cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none min-h-[44px] ${
            isPlaying
              ? 'bg-white/95 text-neutral-900 border-rose-200 shadow-md hover:bg-white active:scale-95 ring-1 ring-rose-100'
              : 'bg-white/80 text-neutral-600 border-warm-200/90 hover:bg-white hover:text-neutral-900 active:scale-95'
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
              <Music className="w-3.5 h-3.5 motion-safe:animate-pulse-subtle" />
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

          {/* Subtle initial Invitation Pill when paused and not yet played */}
          {!hasEverPlayed && !isPlaying && !isCompact && (
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium border border-rose-100 animate-pulse">
              Tap 🎵
            </span>
          )}
        </button>

        {/* Volume Settings Toggle Button (Shown when playing or on hover) */}
        {!isCompact && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVolumeMenu(!showVolumeMenu)}
              aria-expanded={showVolumeMenu}
              aria-label="Adjust music volume"
              title="Adjust volume"
              className="p-2 rounded-full bg-white/80 hover:bg-white text-neutral-500 hover:text-neutral-800 backdrop-blur-md border border-warm-200/80 shadow-sm transition-colors cursor-pointer min-h-[44px] min-w-[36px] flex items-center justify-center"
            >
              {volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Volume Slider Popover */}
            {showVolumeMenu && (
              <div
                role="dialog"
                aria-label="Volume controls"
                className="absolute right-0 top-full mt-2 p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-warm-200 w-44 space-y-2.5 animate-scale-in z-50"
              >
                <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
                  <span className="flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-rose-500" />
                    <span>Volume</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-neutral-800">
                    {Math.round(volume * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  aria-label="Soundtrack volume level"
                  className="w-full h-1.5 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-rose-600 focus:outline-none"
                />

                <div className="flex items-center justify-between pt-1 border-t border-warm-100">
                  <button
                    type="button"
                    onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                    className="text-[10px] text-neutral-500 hover:text-rose-600 font-medium cursor-pointer"
                  >
                    {volume === 0 ? 'Unmute' : 'Mute'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVolumeMenu(false)}
                    className="text-[10px] text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

