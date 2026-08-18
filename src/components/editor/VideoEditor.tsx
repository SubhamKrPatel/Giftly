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
} from 'lucide-react'
import type { GiftMediaItem } from '@/lib/database.types'
import { MAX_VIDEOS_PER_GIFT } from '@/lib/storage'
import Button from '@/components/ui/Button'
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
}

export default function VideoEditor({
  videoItems,
  loading,
  uploading,
  uploadProgress,
  error,
  onUpload,
  onReorder,
  onDelete,
}: VideoEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<GiftMediaItem | null>(null)
  const [deleting, setDeleting] = useState(false)

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
      onUpload(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files)
      e.target.value = ''
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setDeleting(true)
    await onDelete(itemToDelete)
    setDeleting(false)
    setItemToDelete(null)
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
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm animate-shake"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Upload Progress Banner */}
      {uploading && uploadProgress && (
        <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
              <span>
                Uploading video {uploadProgress.current} of {uploadProgress.total}…
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

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm"
        onChange={handleFileInputChange}
        className="hidden"
        id="videoFileInput"
      />

      {/* Drag & Drop Dropzone */}
      {canAddMore ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            'group relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200 cursor-pointer',
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
            disabled={uploading}
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

          <div className="space-y-3">
            {videoItems.map((item, index) => {
              const isFirst = index === 0
              const isLast = index === videoItems.length - 1
              const sizeMB = (item.file_size / (1024 * 1024)).toFixed(1)

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-warm-200 shadow-xs hover:shadow-card p-4 space-y-3 transition-all"
                >
                  {/* Video Player */}
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 shadow-inner">
                    {item.signedUrl ? (
                      <video
                        src={item.signedUrl}
                        controls
                        preload="metadata"
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-2">
                        <PlayCircle className="w-8 h-8 opacity-40" />
                        <span className="text-xs">Video stream loading…</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata and Controls */}
                  <div className="flex items-center justify-between gap-3 pt-1">
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

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => onReorder(item.id, 'up')}
                        className="p-1.5 rounded-lg border border-warm-200 text-neutral-600 hover:bg-warm-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                        aria-label="Move video up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => onReorder(item.id, 'down')}
                        className="p-1.5 rounded-lg border border-warm-200 text-neutral-600 hover:bg-warm-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                        aria-label="Move video down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
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
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
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
                Are you sure you want to remove &quot;{itemToDelete.file_name}&quot; from your gift? This action cannot be undone.
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
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-60"
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
