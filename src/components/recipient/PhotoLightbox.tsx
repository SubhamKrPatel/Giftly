import React, { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import type { GiftMediaItem } from '@/lib/database.types'

interface PhotoLightboxProps {
  isOpen: boolean
  onClose: () => void
  items: GiftMediaItem[]
  initialIndex?: number
}

export default function PhotoLightbox({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imageLoaded, setImageLoaded] = useState(false)
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setImageLoaded(false)
  }, [initialIndex, isOpen])

  const handlePrev = useCallback(() => {
    setImageLoaded(false)
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
  }, [items.length])

  const handleNext = useCallback(() => {
    setImageLoaded(false)
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
  }, [items.length])

  // Keyboard navigation & Escape support (Part F & AD)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handlePrev, handleNext])

  // Mobile Touch Swipe Handling (Part F & Z)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX
    touchEndXRef.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return
    const distance = touchStartXRef.current - touchEndXRef.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && items.length > 1) {
      handleNext()
    } else if (isRightSwipe && items.length > 1) {
      handlePrev()
    }

    touchStartXRef.current = null
    touchEndXRef.current = null
  }

  if (!isOpen || items.length === 0) return null

  const currentItem = items[currentIndex]
  const caption = currentItem?.caption

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox"
      className="fixed inset-0 z-50 bg-neutral-950/92 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none animate-fade-in"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar: Counter & Close */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 pt-2 px-2">
        <span className="text-white/90 font-mono text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
          Photo {currentIndex + 1} of {items.length}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="p-2.5 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Close photo viewer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-w-4xl w-full flex-1 flex flex-col items-center justify-center py-2 px-2"
        onClick={(e) => e.stopPropagation()}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white/60">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        )}

        <img
          src={currentItem.signedUrl}
          alt={caption || currentItem.file_name}
          onLoad={() => setImageLoaded(true)}
          className={`max-h-[70vh] sm:max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Caption Display (if present) */}
        {caption && (
          <div className="mt-3 px-4 py-2 rounded-xl bg-neutral-900/80 backdrop-blur-md border border-white/10 max-w-lg text-center animate-fade-in">
            <p className="text-white/95 text-xs sm:text-sm font-serif italic leading-relaxed">
              &ldquo;{caption}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons (Desktop & Touch accessible) */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full text-white/85 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 transition-all shadow-lg min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer active:scale-95"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full text-white/85 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 transition-all shadow-lg min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer active:scale-95"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom Hint */}
      <div className="w-full text-center pb-2">
        <span className="text-[11px] text-white/40 hidden sm:inline">
          Use ← / → keys or swipe to navigate • Esc to close
        </span>
      </div>
    </div>
  )
}
