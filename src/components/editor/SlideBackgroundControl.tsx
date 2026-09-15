import React, { useState, useRef } from 'react'
import {
  Sparkles,
  Image as ImageIcon,
  Sliders,
  Paintbrush,
  Palette,
  Check,
  Upload,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type {
  SlideBackgroundConfig,
  SlideBackgroundMode,
  SlideGradientMood,
  SlideSolidColor,
  SlidePhotoPosition,
  GiftThemeConfig,
} from '@/lib/database.types'
import {
  getCuratedGradientMoods,
  CURATED_SOLID_COLORS,
} from '@/lib/slideBackground'
import { cn } from '@/lib/utils'

export interface PhotoOption {
  id: string
  url?: string
  title?: string
}

interface SlideBackgroundControlProps {
  background?: SlideBackgroundConfig
  onChange: (bg: SlideBackgroundConfig) => void
  availablePhotos?: PhotoOption[]
  occasionSlug?: string | null
  theme?: GiftThemeConfig
  onUploadPhoto?: (file: File) => Promise<{ mediaId: string; url: string } | null>
  defaultCollapsed?: boolean
  title?: string
}

export default function SlideBackgroundControl({
  background,
  onChange,
  availablePhotos = [],
  occasionSlug,
  theme,
  onUploadPhoto,
  defaultCollapsed = true,
  title = 'Slide Background',
}: SlideBackgroundControlProps) {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mode: SlideBackgroundMode = background?.mode || 'automatic'
  const gradientMood: SlideGradientMood = background?.gradientMood || 'automatic'
  const solidColor: SlideSolidColor = background?.solidColor || 'ivory'
  const position: SlidePhotoPosition = background?.position || 'center'
  const overlay: number = typeof background?.overlay === 'number' ? background.overlay : 50

  const gradientOptions = getCuratedGradientMoods(occasionSlug, theme)

  const handleModeChange = (newMode: SlideBackgroundMode) => {
    // If switching to photo and no photo is selected, pick first available if any
    let nextMediaId = background?.mediaId
    let nextMediaUrl = background?.mediaUrl

    if (newMode === 'photo' && !nextMediaUrl && availablePhotos.length > 0) {
      nextMediaId = availablePhotos[0].id
      nextMediaUrl = availablePhotos[0].url
    }

    onChange({
      ...background,
      mode: newMode,
      mediaId: nextMediaId,
      mediaUrl: nextMediaUrl,
      gradientMood: gradientMood || 'automatic',
      solidColor: solidColor || 'ivory',
      position: position || 'center',
      overlay: overlay ?? 50,
    })
  }

  const handleSelectPhoto = (photo: PhotoOption) => {
    onChange({
      ...background,
      mode: 'photo',
      mediaId: photo.id,
      mediaUrl: photo.url,
      position,
      overlay,
    })
  }

  const handleUploadNewPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onUploadPhoto) return

    setIsUploading(true)
    try {
      const res = await onUploadPhoto(file)
      if (res) {
        onChange({
          ...background,
          mode: 'photo',
          mediaId: res.mediaId,
          mediaUrl: res.url,
          position,
          overlay,
        })
      }
    } catch (err) {
      console.error('[SlideBackgroundControl] Upload error:', err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="rounded-2xl border border-warm-200/80 bg-warm-50/50 overflow-hidden transition-all">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-warm-100/50 transition-colors min-h-[48px] cursor-pointer"
        aria-expanded={isExpanded}
        aria-label="Toggle Slide Background Customization"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Paintbrush className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-neutral-800 block truncate">
              {title}
            </span>
            <span className="text-[11px] text-neutral-500 capitalize">
              {mode === 'automatic'
                ? 'Automatic occasion theme'
                : mode === 'gradient'
                ? `Gradient (${gradientMood})`
                : mode === 'photo'
                ? 'Custom photo backdrop'
                : `Solid (${solidColor})`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-400">
          <span className="text-[11px] font-semibold text-rose-600 hidden sm:inline">
            {isExpanded ? 'Hide Controls' : 'Customize'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </button>

      {/* Expanded Controls Body */}
      {isExpanded && (
        <div className="p-4 pt-2 border-t border-warm-200/60 space-y-4 animate-fade-in">
          {/* Mode Selector Segmented Control */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-2">
              Background Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* 1. Automatic */}
              <button
                type="button"
                onClick={() => handleModeChange('automatic')}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all min-h-[44px] cursor-pointer',
                  mode === 'automatic'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-white text-neutral-700 border-warm-200 hover:bg-warm-100/70'
                )}
              >
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Automatic</span>
              </button>

              {/* 2. Gradient */}
              <button
                type="button"
                onClick={() => handleModeChange('gradient')}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all min-h-[44px] cursor-pointer',
                  mode === 'gradient'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-white text-neutral-700 border-warm-200 hover:bg-warm-100/70'
                )}
              >
                <Sliders className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Gradient</span>
              </button>

              {/* 3. Photo */}
              <button
                type="button"
                onClick={() => handleModeChange('photo')}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all min-h-[44px] cursor-pointer',
                  mode === 'photo'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-white text-neutral-700 border-warm-200 hover:bg-warm-100/70'
                )}
              >
                <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Photo</span>
              </button>

              {/* 4. Solid */}
              <button
                type="button"
                onClick={() => handleModeChange('solid')}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all min-h-[44px] cursor-pointer',
                  mode === 'solid'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-white text-neutral-700 border-warm-200 hover:bg-warm-100/70'
                )}
              >
                <Palette className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Solid</span>
              </button>
            </div>
          </div>

          {/* ── Mode 1: Automatic ── */}
          {mode === 'automatic' && (
            <div className="p-3 bg-white rounded-xl border border-warm-200/80 text-xs text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Default Recommended Style</span>
              </p>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Uses the curated occasion theme identity (joyful glows, celebratory particles, and theme accents) designed for maximum readability.
              </p>
            </div>
          )}

          {/* ── Mode 2: Gradient Moods ── */}
          {mode === 'gradient' && (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                Select Gradient Mood
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {gradientOptions.map((opt) => {
                  const isSelected = gradientMood === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...background,
                          mode: 'gradient',
                          gradientMood: opt.id,
                        })
                      }
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all min-h-[48px] cursor-pointer',
                        isSelected
                          ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-200'
                          : 'bg-white border-warm-200 hover:bg-warm-50'
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-lg border border-neutral-300/50 shadow-2xs flex-shrink-0 flex items-center justify-center"
                        style={{ background: opt.gradientCss }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-neutral-800 drop-shadow-xs" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-neutral-800 block truncate">
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-neutral-500 block truncate">
                          {opt.description}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Mode 3: Photo Background ── */}
          {mode === 'photo' && (
            <div className="space-y-4">
              {/* Photo Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                    Choose Photo
                  </label>
                  {onUploadPhoto && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Uploading…</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3" />
                          <span>+ Upload Photo</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUploadNewPhoto}
                  className="hidden"
                />

                {availablePhotos.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    {availablePhotos.map((photo) => {
                      const isSelected =
                        background?.mediaId === photo.id || background?.mediaUrl === photo.url

                      return (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => handleSelectPhoto(photo)}
                          className={cn(
                            'relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer group',
                            isSelected
                              ? 'border-rose-500 ring-2 ring-rose-300 shadow-xs scale-[0.98]'
                              : 'border-warm-200 hover:border-warm-400'
                          )}
                        >
                          {photo.url ? (
                            <img
                              src={photo.url}
                              alt={photo.title || 'Photo choice'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-warm-100 flex items-center justify-center text-neutral-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}

                          {isSelected && (
                            <div className="absolute inset-0 bg-rose-900/30 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-warm-300 bg-white text-center space-y-2">
                    <p className="text-xs text-neutral-500">
                      No photos added to this gift yet.
                    </p>
                    {onUploadPhoto && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer min-h-[44px]"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload a Backdrop Photo</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Position Selector */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  Photo Focus Position
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['top', 'center', 'bottom'] as SlidePhotoPosition[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...background,
                          mode: 'photo',
                          position: pos,
                        })
                      }
                      className={cn(
                        'py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all min-h-[44px] cursor-pointer',
                        position === pos
                          ? 'bg-rose-50 text-rose-700 border-rose-400 font-bold'
                          : 'bg-white text-neutral-700 border-warm-200 hover:bg-warm-50'
                      )}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Readability Overlay Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="overlaySlider"
                    className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider"
                  >
                    Readability Protection (Overlay)
                  </label>
                  <span className="text-[11px] font-mono font-medium text-neutral-600">
                    {overlay}%
                  </span>
                </div>
                <div className="space-y-1">
                  <input
                    id="overlaySlider"
                    type="range"
                    min={15}
                    max={85}
                    step={5}
                    value={overlay}
                    onChange={(e) =>
                      onChange({
                        ...background,
                        mode: 'photo',
                        overlay: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-rose-500 h-2 bg-warm-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
                    <span>Subtle Backdrop</span>
                    <span>High Contrast</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Mode 4: Solid Colors ── */}
          {mode === 'solid' && (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                Select Curated Color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CURATED_SOLID_COLORS.map((col) => {
                  const isSelected = solidColor === col.id
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...background,
                          mode: 'solid',
                          solidColor: col.id,
                        })
                      }
                      className={cn(
                        'flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all min-h-[44px] cursor-pointer',
                        isSelected
                          ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-200'
                          : 'bg-white border-warm-200 hover:bg-warm-50'
                      )}
                    >
                      <div
                        className="w-6 h-6 rounded-full border shadow-2xs flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: col.hex,
                          borderColor: col.borderHex,
                        }}
                      >
                        {isSelected && (
                          <Check
                            className="w-3.5 h-3.5"
                            style={{ color: col.id === 'midnight' || col.id === 'plum' ? '#fff' : '#000' }}
                          />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-neutral-800 truncate">
                        {col.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
