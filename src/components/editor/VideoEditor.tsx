import React, { useState, useRef } from 'react'
import {
  Video as VideoIcon,
  Upload,
  Loader2,
  ChevronUp,
  ChevronDown,
  Trash2,
  AlertCircle,
  X,
  PlayCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import type {
  GiftMediaItem,
  VideoSectionContent,
  SlideBackgroundConfig,
  GiftThemeConfig,
} from '@/lib/database.types'
import { MAX_VIDEOS_PER_GIFT, validateVideoFile } from '@/lib/storage'
import Button from '@/components/ui/Button'
import SlideBackgroundControl from '@/components/editor/SlideBackgroundControl'
import { cn } from '@/lib/utils'

interface VideoEditorProps {
  videoItems: GiftMediaItem[]
  loading: boolean
  uploading: boolean
  uploadProgress: { current: number; total: number; filename: string } | null
  error: string | null
  onUpload: (files: FileList | File[]) => Promise<{ successfulCount: number; errors: string[] }>
  onReorder: (mediaId: string, direction: 'up' | 'down') => Promise<void>
  onDelete: (item: GiftMediaItem) => Promise<{ success: boolean; error?: string }>
  onReplaceVideo?: (oldItem: GiftMediaItem, newFile: File) => Promise<{ success: boolean; error?: string }>
  content?: VideoSectionContent
  onChangeContent?: (updates: Partial<VideoSectionContent>) => void
  availablePhotos?: Array<{ id: string; url?: string; title?: string }>
  occasionSlug?: string
  theme?: GiftThemeConfig
  onUploadBackgroundPhoto?: (file: File) => Promise<{ mediaId: string; url: string } | null>
}

export default function VideoEditor({
  videoItems,
  loading,
  uploading,
  uploadProgress,
  error: serverError,
  onUpload,
  onReorder,
  onDelete,
  onReplaceVideo,
  content = {},
  onChangeContent,
  availablePhotos = [],
  occasionSlug,
  theme,
  onUploadBackgroundPhoto,
}: VideoEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const replaceInputRef = useRef<HTMLInputElement | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<GiftMediaItem | null>(null)
  const [itemToReplace, setItemToReplace] = useState<GiftMediaItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const activeError = localError || serverError

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
    setLocalError(null)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null)
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files)
      e.target.value = ''
    }
  }

  // Replace Video Selection
  const handleTriggerReplace = (item: GiftMediaItem) => {
    setItemToReplace(item)
    setLocalError(null)
    if (replaceInputRef.current) {
      replaceInputRef.current.value = ''
      replaceInputRef.current.click()
    }
  }

  const handleReplaceInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!itemToReplace || !e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    e.target.value = ''

    // Validate
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      setLocalError(validation.error || 'Invalid video file.')
      return
    }

    setReplacing(true)
    setLocalError(null)

    if (onReplaceVideo) {
      const res = await onReplaceVideo(itemToReplace, file)
      if (!res.success && res.error) {
        setLocalError(res.error)
      }
    } else {
      // Fallback: upload then delete
      const uploadRes = await onUpload([file])
      if (uploadRes.successfulCount > 0) {
        await onDelete(itemToReplace)
      }
    }

    setReplacing(false)
    setItemToReplace(null)
  }

  // Delete Video Handlers
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setDeleting(true)
    await onDelete(itemToDelete)
    setDeleting(false)
    setItemToDelete(null)
  }

  // Slide Background Change Handler
  const handleBackgroundChange = (newBg: SlideBackgroundConfig) => {
    if (onChangeContent) {
      onChangeContent({ background: newBg })
    }
  }

  const canAddMore = videoItems.length < MAX_VIDEOS_PER_GIFT

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            <VideoIcon className="w-4 h-4 text-rose-500" />
            <span>Video Message Section</span>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-neutral-800">
            Recorded Video Messages
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Upload short video greetings or recorded moments to give your surprise a personal voice.
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
            <span>{videoItems.length} / {MAX_VIDEOS_PER_GIFT}</span>
            <span className="hidden sm:inline">Videos</span>
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {activeError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm animate-shake"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">{activeError}</div>
          <button
            type="button"
            onClick={() => setLocalError(null)}
            className="text-rose-400 hover:text-rose-700 p-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Progress Banner */}
      {(uploading || replacing) && uploadProgress && (
        <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
              <span>
                {replacing
                  ? 'Replacing video clip…'
                  : `Uploading video ${uploadProgress.current} of ${uploadProgress.total}…`}
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

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm"
        onChange={handleFileInputChange}
        className="hidden"
        id="videoFileInput"
      />

      <input
        ref={replaceInputRef}
        type="file"
        accept="video/mp4,video/webm"
        onChange={handleReplaceInputChange}
        className="hidden"
        id="videoReplaceInput"
      />

      {/* Heading & Subtitle Customization */}
      {onChangeContent && (
        <div className="bg-cream-50/60 border border-warm-200 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Page Title & Subtitle</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="videoHeadingInput"
                className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1"
              >
                Heading
              </label>
              <input
                id="videoHeadingInput"
                type="text"
                value={content.heading || ''}
                onChange={(e) => onChangeContent({ heading: e.target.value })}
                placeholder="e.g. Video Message"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-neutral-800 placeholder:text-neutral-400"
              />
            </div>

            <div>
              <label
                htmlFor="videoSubtitleInput"
                className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1"
              >
                Subtitle / Note
              </label>
              <input
                id="videoSubtitleInput"
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => onChangeContent({ subtitle: e.target.value })}
                placeholder="e.g. Take a moment to watch this clip"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-neutral-800 placeholder:text-neutral-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Dropzone */}
      {canAddMore ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && !replacing && fileInputRef.current?.click()}
          className={cn(
            'group relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer min-h-[160px] flex flex-col items-center justify-center',
            isDragging
              ? 'border-rose-500 bg-rose-50/70 scale-[0.99]'
              : 'border-warm-300 hover:border-rose-400 bg-cream-50/60 hover:bg-rose-50/30'
          )}
        >
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-warm-200 flex items-center justify-center mx-auto mb-3 text-rose-500 group-hover:scale-110 group-hover:text-rose-600 transition-all">
            <VideoIcon className="w-5 h-5" />
          </div>

          <h3 className="font-serif text-base font-semibold text-neutral-800 mb-1">
            Choose video clips or drag & drop
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
            Supports MP4 and WebM video files up to 50 MB each.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || replacing}
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select Video</span>
          </Button>
        </div>
      ) : (
        <div className="bg-warm-100/70 rounded-2xl p-4 text-center text-xs text-neutral-500">
          You have reached the maximum limit of {MAX_VIDEOS_PER_GIFT} videos for this gift.
        </div>
      )}

      {/* Uploaded Videos List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-xs">Loading videos…</span>
        </div>
      ) : videoItems.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 px-1">
            <span>Uploaded Videos ({videoItems.length})</span>
            <span className="text-[11px] text-neutral-400">Reorder with ↑ / ↓</span>
          </div>

          <div className="space-y-4">
            {videoItems.map((item, index) => {
              const isFirst = index === 0
              const isLast = index === videoItems.length - 1
              const sizeMB = (item.file_size / (1024 * 1024)).toFixed(1)

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-warm-200 shadow-xs hover:shadow-card p-4 space-y-3 transition-all"
                >
                  {/* Video Player Preview (NO autoplay, seek, controls) */}
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 shadow-inner">
                    {item.signedUrl ? (
                      <video
                        src={item.signedUrl}
                        controls
                        preload="metadata"
                        playsInline
                        className="w-full h-full object-contain"
                        aria-label={`Preview video: ${item.file_name}`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-2">
                        <PlayCircle className="w-8 h-8 opacity-40" />
                        <span className="text-xs">Video stream loading…</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata and Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-warm-100 text-neutral-700 text-[10px] font-bold">
                          #{index + 1}
                        </span>
                        <h4 className="text-xs font-semibold text-neutral-800 truncate" title={item.file_name}>
                          {item.file_name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{sizeMB} MB</p>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                      {/* Replace */}
                      <button
                        type="button"
                        disabled={uploading || replacing}
                        onClick={() => handleTriggerReplace(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-warm-200 text-xs font-semibold text-neutral-700 hover:text-rose-600 hover:bg-warm-50 transition-colors disabled:opacity-40 min-h-[36px]"
                        title="Replace video"
                        aria-label="Replace this video"
                      >
                        <RefreshCw className={cn('w-3.5 h-3.5', replacing && itemToReplace?.id === item.id && 'animate-spin')} />
                        <span>Replace</span>
                      </button>

                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={isFirst || uploading || replacing}
                        onClick={() => onReorder(item.id, 'up')}
                        className="p-2 rounded-lg border border-warm-200 text-neutral-600 hover:bg-warm-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Move up"
                        aria-label="Move video up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={isLast || uploading || replacing}
                        onClick={() => onReorder(item.id, 'down')}
                        className="p-2 rounded-lg border border-warm-200 text-neutral-600 hover:bg-warm-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Move down"
                        aria-label="Move video down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        disabled={uploading || replacing}
                        onClick={() => setItemToDelete(item)}
                        className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Delete video"
                        aria-label="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center border border-dashed border-warm-200 rounded-3xl p-6 text-neutral-400 text-xs">
          No videos added yet. Upload a heartfelt recorded video message or memory clip!
        </div>
      )}

      {/* ── Slide Background Customization (Part 14D & 14E) ── */}
      {onChangeContent && (
        <div className="pt-2 border-t border-warm-200">
          <SlideBackgroundControl
            background={content.background}
            onChange={handleBackgroundChange}
            availablePhotos={availablePhotos}
            occasionSlug={occasionSlug}
            theme={theme}
            onUploadPhoto={onUploadBackgroundPhoto}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deleteVideoModalTitle"
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
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 id="deleteVideoModalTitle" className="font-serif text-lg font-semibold text-neutral-800">
                Delete this video?
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                This video will be removed from your gift. This action cannot be undone.
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
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-60 min-h-[44px]"
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
