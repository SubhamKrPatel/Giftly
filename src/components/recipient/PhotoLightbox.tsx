import { useState, useEffect, useCallback } from 'react'
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

  // Keyboard navigation
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

  if (!isOpen || items.length === 0) return null

  const currentItem = items[currentIndex]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox"
      className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Top Bar: Counter & Close */}
      <div className="absolute top-4 inset-x-4 max-w-5xl mx-auto flex items-center justify-between z-10">
        <span className="text-white/80 font-mono text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
          {currentIndex + 1} / {items.length}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="p-2 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors"
          aria-label="Close lightbox"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white/60">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        )}

        <img
          src={currentItem.signedUrl}
          alt={currentItem.file_name}
          onLoad={() => setImageLoaded(true)}
          className={`max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Previous Button */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handlePrev()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors shadow-lg"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Button */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors shadow-lg"
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
