import React, { useState, useRef, useCallback } from 'react'
import {
  Image as ImageIcon,
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertCircle,
  X,
  Maximize2,
  Edit2,
  Check,
  RefreshCw,
  Plus,
  GripVertical,
} from 'lucide-react'
import type {
  GiftMediaItem,
  GallerySectionContent,
  SlideBackgroundConfig,
  GiftThemeConfig,
} from '@/lib/database.types'
import { MAX_IMAGES_PER_GIFT, validateImageFile } from '@/lib/storage'
import Button from '@/components/ui/Button'
import SlideBackgroundControl, { type PhotoOption } from './SlideBackgroundControl'
import PhotoLightbox from '@/components/recipient/PhotoLightbox'
import { cn } from '@/lib/utils'

export interface SingleUploadState {
  file: File
  id: string
  status: 'waiting' | 'uploading' | 'uploaded' | 'failed'
  error?: string
}

interface GalleryEditorProps {
  mediaItems: GiftMediaItem[]
  loading: boolean
  uploading: boolean
  uploadProgress: { current: number; total: number; filename: string } | null
  error: string | null
  onUpload: (files: FileList | File[]) => Promise<{ successfulCount: number; errors: string[] }>
  onReorder: (mediaId: string, direction: 'up' | 'down') => Promise<void>
  onDelete: (item: GiftMediaItem) => Promise<{ success: boolean; error?: string }>
  content?: GallerySectionContent
  onChangeContent?: (updates: Partial<GallerySectionContent>) => void
  occasionSlug?: string | null
  theme?: GiftThemeConfig
  onReplacePhoto?: (oldItem: GiftMediaItem, newFile: File) => Promise<boolean>
  onUploadBackgroundPhoto?: (file: File) => Promise<{ mediaId: string; url: string } | null>
}

export default function GalleryEditor({
  mediaItems,
  loading,
  uploading,
  uploadProgress,
  error,
  onUpload,
  onReorder,
  onDelete,
  content,
  onChangeContent,
  occasionSlug,
  theme,
  onReplacePhoto,
  onUploadBackgroundPhoto,
}: GalleryEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const replaceInputRef = useRef<HTMLInputElement | null>(null)

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false)

  // Multi-upload queue tracker for individual statuses
  const [uploadQueue, setUploadQueue] = useState<SingleUploadState[]>([])

  // Modal / Subview states
  const [itemToDelete, setItemToDelete] = useState<GiftMediaItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [itemToReplace, setItemToReplace] = useState<GiftMediaItem | null>(null)
  const [replacing, setReplacing] = useState(false)
  const [replaceError, setReplaceError] = useState<string | null>(null)

  // Caption editing state
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null)
  const [currentCaptionDraft, setCurrentCaptionDraft] = useState<string>('')

  // Full-screen Lightbox viewer state
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  // Drag reorder state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Extract captions mapped to media items
  const savedItems = content?.items || []

  // Resolve caption for a given media item
  const getCaptionForItem = useCallback(
    (mediaId: string) => {
      const match = savedItems.find((it) => it.id === mediaId || it.mediaId === mediaId)
      return match?.caption || ''
    },
    [savedItems]
  )

  // Save caption for a photo
  const handleSaveCaption = (mediaId: string, captionText: string) => {
    if (!onChangeContent) return
    const trimmed = captionText.trim()
    const existingIndex = savedItems.findIndex(
      (it) => it.id === mediaId || it.mediaId === mediaId
    )

    let updatedList = [...savedItems]
    if (existingIndex >= 0) {
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        id: mediaId,
        mediaId: mediaId,
        caption: trimmed || undefined,
      }
    } else {
      updatedList.push({
        id: mediaId,
        mediaId: mediaId,
        caption: trimmed || undefined,
      })
    }

    onChangeContent({ items: updatedList })
    setEditingCaptionId(null)
  }

  // Handle multi-file selection with independent upload tracking
  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    // Initial queue entries
    const newEntries: SingleUploadState[] = fileArray.map((f) => ({
      file: f,
      id: crypto.randomUUID(),
      status: 'waiting',
    }))
    setUploadQueue((prev) => [...prev, ...newEntries])

    // Validate and upload
    const validFiles: File[] = []
    for (const entry of newEntries) {
      const validation = validateImageFile(entry.file)
      if (!validation.valid) {
        setUploadQueue((prev) =>
          prev.map((e) =>
            e.id === entry.id
              ? { ...e, status: 'failed', error: validation.error }
              : e
          )
        )
      } else {
        validFiles.push(entry.file)
        setUploadQueue((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, status: 'uploading' } : e))
        )
      }
    }

    if (validFiles.length > 0) {
      try {
        const result = await onUpload(validFiles)
        setUploadQueue((prev) =>
          prev.map((e) => {
            if (e.status === 'uploading') {
              const err = result.errors.find((msg) => msg.includes(e.file.name))
              if (err) {
                return { ...e, status: 'failed', error: err }
              }
              return { ...e, status: 'uploaded' }
            }
            return e
          })
        )
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setUploadQueue((prev) =>
          prev.map((e) =>
            e.status === 'uploading' ? { ...e, status: 'failed', error: msg } : e
          )
        )
      }
    }

    // Clear completed items after delay
    setTimeout(() => {
      setUploadQueue((prev) => prev.filter((e) => e.status === 'failed'))
    }, 4000)
  }

  // Retry failed upload
  const handleRetryUpload = (item: SingleUploadState) => {
    setUploadQueue((prev) => prev.filter((e) => e.id !== item.id))
    handleFilesSelected([item.file])
  }

  // Handle Drag & Drop
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
      handleFilesSelected(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(e.target.files)
      e.target.value = ''
    }
  }

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setDeleting(true)
    try {
      await onDelete(itemToDelete)
      // Also clean up caption entry from items
      if (onChangeContent && savedItems.length > 0) {
        const remaining = savedItems.filter(
          (it) => it.id !== itemToDelete.id && it.mediaId !== itemToDelete.id
        )
        onChangeContent({ items: remaining })
      }
    } finally {
      setDeleting(false)
      setItemToDelete(null)
    }
  }

  // Replace photo handler
  const handleReplaceClick = (item: GiftMediaItem) => {
    setItemToReplace(item)
    setReplaceError(null)
    replaceInputRef.current?.click()
  }

  const handleReplaceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !itemToReplace) return

    setReplaceError(null)
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setReplaceError(validation.error || 'Invalid image file.')
      return
    }

    setReplacing(true)
    try {
      if (onReplacePhoto) {
        await onReplacePhoto(itemToReplace, file)
      } else {
        // Fallback replacement flow: upload new then delete old
        const uploadRes = await onUpload([file])
        if (uploadRes.successfulCount > 0) {
          await onDelete(itemToReplace)
        } else if (uploadRes.errors.length > 0) {
          throw new Error(uploadRes.errors[0])
        }
      }
      setItemToReplace(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo replacement failed.'
      setReplaceError(msg)
    } finally {
      setReplacing(false)
      if (replaceInputRef.current) {
        replaceInputRef.current.value = ''
      }
    }
  }

  // HTML5 drag and drop reordering
  const handleCardDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const item = mediaItems[draggedIndex]
    const direction = index < draggedIndex ? 'up' : 'down'
    onReorder(item.id, direction)
    setDraggedIndex(index)
  }

  const handleCardDragEnd = () => {
    setDraggedIndex(null)
  }

  const canAddMore = mediaItems.length < MAX_IMAGES_PER_GIFT

  // Available photos for SlideBackgroundControl
  const availablePhotosForBg: PhotoOption[] = mediaItems.map((m) => ({
    id: m.id,
    url: m.signedUrl,
    title: m.file_name,
  }))

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            <ImageIcon className="w-4 h-4 text-rose-500" />
            <span>Photo Memories Gallery</span>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-neutral-800">
            Cherished Photos
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Add your favorite moments and memories. Each photo can have its own caption and arranged in any order.
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
            <span>
              {mediaItems.length} / {MAX_IMAGES_PER_GIFT}
            </span>
            <span className="hidden sm:inline">Photos</span>
          </span>
        </div>
      </div>

      {/* ── Error Alert ── */}
      {(error || replaceError) && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm animate-shake"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">{error || replaceError}</div>
        </div>
      )}

      {/* ── Batch Upload Progress Indicator ── */}
      {uploading && uploadProgress && (
        <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
              <span>
                Uploading photo {uploadProgress.current} of {uploadProgress.total}…
              </span>
            </span>
            <span className="truncate max-w-[150px] font-normal text-rose-700">
              {uploadProgress.filename}
            </span>
          </div>
          <div className="w-full h-1.5 bg-rose-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all duration-300"
              style={{
                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ── Individual Upload Queue Tracker ── */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2 bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-rose-900 mb-1">
            <span>Uploading Photos ({uploadQueue.filter((q) => q.status === 'uploaded').length}/{uploadQueue.length})</span>
            {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />}
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white text-xs border border-rose-100 shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.status === 'uploading' && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500 flex-shrink-0" />
                  )}
                  {item.status === 'uploaded' && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] flex-shrink-0" />
                  )}
                  {item.status === 'failed' && (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  )}
                  {item.status === 'waiting' && (
                    <div className="w-2 h-2 rounded-full bg-neutral-300 flex-shrink-0" />
                  )}
                  <span className="truncate font-medium text-neutral-800">{item.file.name}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.status === 'failed' && (
                    <>
                      <span className="text-[10px] text-rose-600 truncate max-w-[120px]">
                        {item.error || 'Failed'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRetryUpload(item)}
                        className="p-1 text-rose-600 hover:text-rose-800 font-semibold text-[11px] underline cursor-pointer"
                      >
                        Retry
                      </button>
                    </>
                  )}
                  {item.status === 'uploaded' && (
                    <span className="text-[10px] font-semibold text-emerald-600">Saved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Slide Background Customization Component ── */}
      {onChangeContent && (
        <SlideBackgroundControl
          background={content?.background}
          onChange={(bg: SlideBackgroundConfig) => onChangeContent({ background: bg })}
          availablePhotos={availablePhotosForBg}
          occasionSlug={occasionSlug}
          theme={theme}
          onUploadPhoto={onUploadBackgroundPhoto}
          title="Photos Slide Background"
          defaultCollapsed={true}
        />
      )}

      {/* ── Hidden File Inputs ── */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        id="galleryFileInput"
      />

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleReplaceFileChange}
        className="hidden"
        id="galleryReplaceInput"
      />

      {/* ── Drag & Drop Dropzone ── */}
      {canAddMore ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            'group relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer min-h-[140px] flex flex-col items-center justify-center',
            isDragging
              ? 'border-rose-500 bg-rose-50/70 scale-[0.99]'
              : 'border-warm-300 hover:border-rose-400 bg-cream-50/60 hover:bg-rose-50/30'
          )}
        >
          <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-warm-200 flex items-center justify-center mx-auto mb-3 text-rose-500 group-hover:scale-110 group-hover:text-rose-600 transition-all">
            <Upload className="w-5 h-5" />
          </div>

          <h3 className="font-serif text-base font-semibold text-neutral-800 mb-1">
            Choose photos or drag & drop
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
            Supports JPG, PNG, and WebP up to 10 MB each. You can select multiple images simultaneously.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select Photos</span>
          </Button>
        </div>
      ) : (
        <div className="bg-warm-100/70 rounded-2xl p-4 text-center text-xs text-neutral-500">
          You have reached the maximum limit of {MAX_IMAGES_PER_GIFT} photos for this gift.
        </div>
      )}

      {/* ── Thumbnail Gallery Grid ── */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-xs">Loading photos…</span>
        </div>
      ) : mediaItems.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 px-1">
            <span>Uploaded Photos ({mediaItems.length})</span>
            <span className="text-[11px] text-neutral-400">Reorder with arrows or drag</span>
          </div>

          {/* Responsive Grid: 2 cols on mobile, 3 cols on tablet/desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {mediaItems.map((item, index) => {
              const isFirst = index === 0
              const isLast = index === mediaItems.length - 1
              const caption = getCaptionForItem(item.id)
              const isEditingCaption = editingCaptionId === item.id

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleCardDragStart(index)}
                  onDragOver={(e) => handleCardDragOver(e, index)}
                  onDragEnd={handleCardDragEnd}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-warm-200 shadow-xs hover:shadow-card hover:border-warm-300 transition-all flex flex-col"
                >
                  {/* Photo Preview Thumbnail */}
                  <div
                    onClick={() => setViewerIndex(index)}
                    className="relative aspect-square bg-warm-100 cursor-pointer overflow-hidden"
                  >
                    {item.signedUrl ? (
                      <img
                        src={item.signedUrl}
                        alt={caption || item.file_name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}

                    {/* Position Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold">
                      #{index + 1}
                    </div>

                    {/* Lightbox Trigger Hint */}
                    <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 backdrop-blur-xs text-white opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>

                    {/* Drag Handle Indicator */}
                    <div className="absolute bottom-2 left-2 p-1 rounded-md bg-black/50 backdrop-blur-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Caption & Actions Card Body */}
                  <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2 bg-warm-50/40 border-t border-warm-100">
                    {/* Caption Section */}
                    {isEditingCaption ? (
                      <div className="space-y-1.5 animate-fade-in">
                        <input
                          type="text"
                          maxLength={100}
                          value={currentCaptionDraft}
                          onChange={(e) => setCurrentCaptionDraft(e.target.value)}
                          placeholder="Add a memory caption…"
                          autoFocus
                          className="w-full px-2.5 py-1.5 text-xs border border-rose-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-rose-400"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveCaption(item.id, currentCaptionDraft)
                            } else if (e.key === 'Escape') {
                              setEditingCaptionId(null)
                            }
                          }}
                        />
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-neutral-400 font-mono">
                            {currentCaptionDraft.length}/100
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingCaptionId(null)}
                              className="px-2 py-0.5 text-neutral-500 hover:text-neutral-700 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveCaption(item.id, currentCaptionDraft)}
                              className="px-2.5 py-0.5 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-semibold cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setCurrentCaptionDraft(caption)
                          setEditingCaptionId(item.id)
                        }}
                        className="cursor-pointer group/caption py-0.5 min-h-[22px] flex items-center justify-between text-xs"
                      >
                        {caption ? (
                          <span className="text-neutral-800 font-medium truncate flex-1 italic text-[11px]">
                            &ldquo;{caption}&rdquo;
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[11px] group-hover/caption:text-rose-600 transition-colors flex items-center gap-1">
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>Add caption…</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Touch-Friendly Action Bar (approx 44px touch targets) */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-warm-200/50">
                      {/* Left: Reorder Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => onReorder(item.id, 'up')}
                          className="w-8 h-8 rounded-lg bg-white hover:bg-warm-100 text-neutral-700 border border-warm-200 flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                          title="Move photo earlier"
                          aria-label={`Move photo #${index + 1} earlier`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => onReorder(item.id, 'down')}
                          className="w-8 h-8 rounded-lg bg-white hover:bg-warm-100 text-neutral-700 border border-warm-200 flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                          title="Move photo later"
                          aria-label={`Move photo #${index + 1} later`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Right: Replace & Delete Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleReplaceClick(item)}
                          disabled={replacing}
                          className="w-8 h-8 rounded-lg bg-white hover:bg-warm-100 text-neutral-600 hover:text-neutral-900 border border-warm-200 flex items-center justify-center transition-colors cursor-pointer"
                          title="Replace this photo"
                          aria-label={`Replace photo #${index + 1}`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="w-8 h-8 rounded-lg bg-white hover:bg-rose-50 text-neutral-400 hover:text-rose-600 border border-warm-200 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete photo"
                          aria-label={`Delete photo #${index + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="py-10 px-4 text-center border-2 border-dashed border-warm-200 rounded-3xl bg-warm-50/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-neutral-800">
              Your memories deserve to be seen.
            </h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Add photos to make this moment feel even more personal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-sm transition-all cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Photos</span>
          </button>
        </div>
      )}

      {/* ── Full-Screen Lightbox Viewer ── */}
      {viewerIndex !== null && mediaItems.length > 0 && (
        <PhotoLightbox
          isOpen={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          items={mediaItems.map((m) => ({
            ...m,
            caption: getCaptionForItem(m.id),
          }))}
          initialIndex={viewerIndex}
        />
      )}

      {/* ── Delete Confirmation Modal (Part J) ── */}
      {itemToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deleteModalTitle"
          className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-warm-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 id="deleteModalTitle" className="font-serif text-lg font-semibold text-neutral-800">
                Delete this photo?
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                This photo will be removed from your gift.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                fullWidth
                disabled={deleting}
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </Button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-60 min-h-[44px] cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
