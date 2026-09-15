import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Music,
  Upload,
  Loader2,
  Trash2,
  AlertCircle,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Check,
} from 'lucide-react'
import type { GiftMediaItem, GiftThemeConfig, MusicSectionContent } from '@/lib/database.types'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface MusicEditorProps {
  audioItem: GiftMediaItem | null
  loading: boolean
  uploading: boolean
  error: string | null
  onUploadMusic: (file: File) => Promise<{ success: boolean; error?: string }>
  onDeleteMusic: () => Promise<{ success: boolean; error?: string }>
  content?: MusicSectionContent
  onChangeContent?: (updates: Partial<MusicSectionContent>) => void
  theme?: GiftThemeConfig
  occasionSlug?: string
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

export default function MusicEditor({
  audioItem,
  loading,
  uploading,
  error,
  onUploadMusic,
  onDeleteMusic,
  content,
  onChangeContent,
  theme,
}: MusicEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Custom preview player state (Strictly NO autoplay)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [previewVolume, setPreviewVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)

  const primaryColor = theme?.primaryColor || '#f43f5e'
  const accentColor = theme?.accentColor || '#e11d48'

  // Settings: volume from section content (default 70%)
  const configuredVolume = typeof content?.volume === 'number' ? content.volume : 70
  const startFromBeginning = content?.startFromBeginning ?? true

  // Reset preview player when audio item changes
  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.currentTime = 0
    }
  }, [audioItem?.id, audioItem?.signedUrl])

  // Sync audio element volume
  useEffect(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.volume = isMuted ? 0 : previewVolume
    }
  }, [previewVolume, isMuted])

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0])
      e.target.value = ''
    }
  }

  const handleFileSelected = async (file: File) => {
    await onUploadMusic(file)
    setShowReplaceModal(false)
  }

  const handleConfirmDelete = async () => {
    setDeleting(true)
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    await onDeleteMusic()
    setDeleting(false)
    setShowDeleteModal(false)
  }

  // Play / Pause toggle for creator preview
  const handleTogglePlay = useCallback(() => {
    const audio = previewAudioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      const promise = audio.play()
      if (promise !== undefined) {
        promise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('[MusicEditor] Preview play prevented:', err)
            setIsPlaying(false)
          })
      }
    }
  }, [isPlaying])

  // Seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (previewAudioRef.current) {
      previewAudioRef.current.currentTime = newTime
    }
  }

  // Time update from audio element
  const handleTimeUpdate = () => {
    if (previewAudioRef.current) {
      setCurrentTime(previewAudioRef.current.currentTime)
    }
  }

  // Loaded metadata
  const handleLoadedMetadata = () => {
    if (previewAudioRef.current) {
      setDuration(previewAudioRef.current.duration || 0)
    }
  }

  // Audio ended
  const handleAudioEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (previewAudioRef.current) {
      previewAudioRef.current.currentTime = 0
    }
  }

  // Volume setting change
  const handleConfiguredVolumeChange = (newVol: number) => {
    onChangeContent?.({ volume: newVol })
  }

  // Start from beginning setting change
  const handleToggleStartBeginning = () => {
    onChangeContent?.({ startFromBeginning: !startFromBeginning })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          <Music className="w-4 h-4 text-rose-500" />
          <span>Background Music Section</span>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-neutral-800">
          Background Soundtrack
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Choose a song to make your surprise feel even more cinematic and emotional (MP3, M4A, AAC, WAV up to 15 MB).
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm animate-shake"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/m4a,audio/aac,audio/wav,audio/webm,audio/ogg"
        onChange={handleFileInputChange}
        className="hidden"
        id="musicFileInput"
      />

      <input
        ref={replaceFileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/m4a,audio/aac,audio/wav,audio/webm,audio/ogg"
        onChange={handleFileInputChange}
        className="hidden"
        id="replaceMusicFileInput"
      />

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-neutral-400 gap-3 bg-white rounded-3xl border border-warm-200 shadow-xs">
          <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
          <span className="text-sm font-medium text-neutral-600">Loading soundtrack…</span>
        </div>
      ) : audioItem ? (
        /* ── Saved Music Track View ── */
        <div className="space-y-6">
          <div className="bg-white border border-warm-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6 animate-fade-in">
            {/* Top Track Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shadow-sm flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                  }}
                >
                  <Music className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3
                    className="font-serif text-base font-semibold text-neutral-800 truncate"
                    title={audioItem.file_name}
                  >
                    {audioItem.file_name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                    <span>
                      {audioItem.file_size
                        ? `${(audioItem.file_size / (1024 * 1024)).toFixed(2)} MB`
                        : 'Background Soundtrack'}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">Ready to play</span>
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 flex-shrink-0 border border-emerald-200">
                Active Track
              </span>
            </div>

            {/* Custom Creator Audio Preview Player Canvas */}
            <div className="bg-gradient-to-br from-warm-50/90 to-rose-50/40 p-5 rounded-2xl border border-warm-200/90 space-y-4">
              {/* Hidden audio element for preview */}
              {audioItem.signedUrl && (
                <audio
                  ref={previewAudioRef}
                  src={audioItem.signedUrl}
                  preload="metadata"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                  aria-hidden="true"
                />
              )}

              {/* Player Controls Row */}
              <div className="flex items-center gap-4">
                {/* Play / Pause Toggle Button */}
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                  className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Progress bar + Time displays */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between text-xs font-mono font-medium text-neutral-500 px-0.5">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || 0)}</span>
                  </div>

                  {/* Scrubber Range Slider */}
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      aria-label="Track progress"
                      className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>

                {/* Mini Preview Volume Controller */}
                <div className="hidden sm:flex items-center gap-2 border-l border-warm-200/80 pl-4 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-white transition-colors"
                    aria-label={isMuted ? 'Unmute preview' : 'Mute preview'}
                  >
                    {isMuted || previewVolume === 0 ? (
                      <VolumeX className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-neutral-600" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : previewVolume}
                    onChange={(e) => {
                      setPreviewVolume(parseFloat(e.target.value))
                      setIsMuted(false)
                    }}
                    aria-label="Preview volume"
                    className="w-16 h-1.5 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                </div>
              </div>

              {/* Status Notice */}
              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-warm-200/60">
                <span className="flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full', isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300')} />
                  <span>{isPlaying ? 'Playing track preview' : 'Click play to listen to preview'}</span>
                </span>
                <span className="text-[10px] text-neutral-400 italic">
                  Music starts only when the recipient taps 🎵
                </span>
              </div>
            </div>

            {/* ── Playback Settings Panel ── */}
            <div className="pt-2 border-t border-warm-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <Sliders className="w-3.5 h-3.5 text-rose-500" />
                <span>Recipient Playback Settings</span>
              </div>

              {/* Volume Slider Control */}
              <div className="bg-warm-50/80 p-4 rounded-2xl border border-warm-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="musicVolumeSlider" className="text-xs font-semibold text-neutral-800">
                      Default Recipient Volume
                    </label>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Sets comfortable initial volume that won&apos;t overpower voice notes or videos.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60">
                    {configuredVolume}%
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    id="musicVolumeSlider"
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={configuredVolume}
                    onChange={(e) => handleConfiguredVolumeChange(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 font-medium">
                    <span>Soft (30%)</span>
                    <span>Comfortable (70%)</span>
                    <span>Loud (100%)</span>
                  </div>
                </div>

                {/* Preset quick buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {[
                    { label: 'Soft', value: 30 },
                    { label: 'Comfortable', value: 70 },
                    { label: 'Loud', value: 95 },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleConfiguredVolumeChange(preset.value)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer',
                        configuredVolume === preset.value
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white text-neutral-600 hover:bg-warm-100 border border-warm-200'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start from beginning toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-warm-50/60 border border-warm-200/60">
                <div className="pr-4">
                  <span className="text-xs font-semibold text-neutral-800 block">
                    Play from start on recipient tap
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    Ensures your song begins from the intro when the recipient presses play.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={startFromBeginning}
                  onClick={handleToggleStartBeginning}
                  className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2',
                    startFromBeginning ? 'bg-rose-600' : 'bg-neutral-300'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      startFromBeginning ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Action buttons footer */}
            <div className="flex items-center justify-between pt-4 border-t border-warm-200">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Music</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Saved</span>
                </span>

                <button
                  type="button"
                  onClick={() => setShowReplaceModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-rose-600 px-3.5 py-2 rounded-xl bg-warm-100 hover:bg-warm-200/80 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replace Track</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Upload Music Dropzone (Empty State) ── */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            'group relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer bg-white shadow-xs',
            isDragging
              ? 'border-rose-500 bg-rose-50/70 scale-[0.99]'
              : 'border-warm-300 hover:border-rose-400 hover:bg-rose-50/20'
          )}
        >
          <div
            className="w-16 h-16 rounded-3xl shadow-sm border border-warm-200 flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-all"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
          >
            <Music className="w-7 h-7" />
          </div>

          <h3 className="font-serif text-xl font-semibold text-neutral-800 mb-1">
            Set the Mood 🎵
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mb-6 leading-relaxed">
            Add a song that makes this gift feel like you. It will play softly in the background across all pages once the recipient presses play.
          </p>

          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={uploading}
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                <span>Uploading Soundtrack…</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Choose Audio Track</span>
              </>
            )}
          </Button>

          <p className="text-[11px] text-neutral-400 mt-4">
            Supports MP3, M4A, AAC, WAV, and WebM up to 15 MB.
          </p>
        </div>
      )}

      {/* Replace Confirmation Modal */}
      {showReplaceModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-warm-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowReplaceModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-neutral-800">
                Replace background music?
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Uploading a new audio track will replace your current soundtrack.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setShowReplaceModal(false)}
              >
                Cancel
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowReplaceModal(false)
                  replaceFileInputRef.current?.click()
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white transition-colors shadow-sm cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                }}
              >
                <span>Select New File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-warm-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-neutral-800">
                Remove background music?
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                This music will be removed from your gift. Other media (photos, videos, story) will not be affected.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                fullWidth
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Removing…</span>
                  </>
                ) : (
                  <span>Remove</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
