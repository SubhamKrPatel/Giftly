import React, { useState, useRef } from 'react'
import {
  Mic,
  Square,
  RotateCcw,
  Save,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  Volume2,
  Upload,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import type {
  GiftMediaItem,
  VoiceSectionContent,
  SlideBackgroundConfig,
  GiftThemeConfig,
} from '@/lib/database.types'
import { useVoiceRecorder } from '@/lib/hooks/useVoiceRecorder'
import { validateMusicFile } from '@/lib/storage'
import Button from '@/components/ui/Button'
import SlideBackgroundControl from '@/components/editor/SlideBackgroundControl'

interface VoiceEditorProps {
  audioItem: GiftMediaItem | null
  loading: boolean
  uploading: boolean
  error: string | null
  onSaveRecording: (blob: Blob, mimeType: string) => Promise<{ success: boolean; error?: string }>
  onUploadAudio?: (file: File) => Promise<{ success: boolean; error?: string }>
  onDeleteRecording: () => Promise<{ success: boolean; error?: string }>
  content?: VoiceSectionContent
  onChangeContent?: (updates: Partial<VoiceSectionContent>) => void
  availablePhotos?: Array<{ id: string; url?: string; title?: string }>
  occasionSlug?: string
  theme?: GiftThemeConfig
  onUploadBackgroundPhoto?: (file: File) => Promise<{ mediaId: string; url: string } | null>
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function VoiceEditor({
  audioItem,
  loading,
  uploading,
  error: serverError,
  onSaveRecording,
  onUploadAudio,
  onDeleteRecording,
  content = {},
  onChangeContent,
  availablePhotos = [],
  occasionSlug,
  theme,
  onUploadBackgroundPhoto,
}: VoiceEditorProps) {
  const audioFileInputRef = useRef<HTMLInputElement | null>(null)
  const replaceAudioInputRef = useRef<HTMLInputElement | null>(null)

  const {
    isRecording,
    recordingDuration,
    recordedBlob,
    recordedUrl,
    mimeType,
    error: recorderError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder()

  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const activeError = localError || recorderError || serverError

  // Handle Save Recorded Voice
  const handleSave = async () => {
    if (!recordedBlob) return
    setLocalError(null)
    const res = await onSaveRecording(recordedBlob, mimeType)
    if (res.success) {
      resetRecording()
      setShowReplaceModal(false)
    } else if (res.error) {
      setLocalError(res.error)
    }
  }

  // Handle Audio File Upload
  const handleAudioFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    e.target.value = ''

    // Validate
    const validation = validateMusicFile(file)
    if (!validation.valid) {
      setLocalError(validation.error || 'Invalid audio file.')
      return
    }

    setLocalError(null)
    setUploadingFile(true)

    if (onUploadAudio) {
      const res = await onUploadAudio(file)
      if (!res.success && res.error) {
        setLocalError(res.error)
      } else {
        setShowReplaceModal(false)
        resetRecording()
      }
    }

    setUploadingFile(false)
  }

  // Handle Delete
  const handleConfirmDelete = async () => {
    setDeleting(true)
    setLocalError(null)
    const res = await onDeleteRecording()
    if (!res.success && res.error) {
      setLocalError(res.error)
    }
    setDeleting(false)
    setShowDeleteModal(false)
  }

  // Slide Background Change Handler
  const handleBackgroundChange = (newBg: SlideBackgroundConfig) => {
    if (onChangeContent) {
      onChangeContent({ background: newBg })
    }
  }

  const isBusy = uploading || uploadingFile

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          <Mic className="w-4 h-4 text-rose-500" />
          <span>Voice Message Section</span>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-neutral-800">
          Personal Voice Note
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Record your voice directly in your browser or upload an audio file. Say what words alone cannot express (up to 3 minutes).
        </p>
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

      {/* Hidden File Inputs */}
      <input
        ref={audioFileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleAudioFileInputChange}
        className="hidden"
        id="voiceAudioFileInput"
      />
      <input
        ref={replaceAudioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleAudioFileInputChange}
        className="hidden"
        id="voiceReplaceAudioInput"
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
                htmlFor="voiceHeadingInput"
                className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1"
              >
                Heading
              </label>
              <input
                id="voiceHeadingInput"
                type="text"
                value={content.heading || ''}
                onChange={(e) => onChangeContent({ heading: e.target.value })}
                placeholder="e.g. A Voice Note For You"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-neutral-800 placeholder:text-neutral-400"
              />
            </div>

            <div>
              <label
                htmlFor="voiceSubtitleInput"
                className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1"
              >
                Subtitle / Note
              </label>
              <input
                id="voiceSubtitleInput"
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => onChangeContent({ subtitle: e.target.value })}
                placeholder="e.g. Words straight from the heart"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-neutral-800 placeholder:text-neutral-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN WORKFLOW STATES ── */}

      {/* 1. Active Recording Mode */}
      {isRecording ? (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-3xl p-6 sm:p-10 text-center space-y-6 animate-pulse-subtle">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-rose-400/30 rounded-full animate-ping motion-reduce:hidden" />
            <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <Mic className="w-8 h-8 animate-bounce motion-reduce:animate-none" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
              Recording in progress
            </span>
            <div className="font-mono text-3xl font-bold text-neutral-800 mt-1">
              {formatTime(recordingDuration)} <span className="text-neutral-400 text-base font-normal">/ 03:00</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm px-6 py-3.5 rounded-full transition-all shadow-md hover:scale-105 min-h-[48px] touch-manipulation"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Recording</span>
            </button>
          </div>
        </div>
      ) : recordedUrl ? (
        /* 2. Unsaved Recording Preview Mode */
        <div className="bg-white border border-warm-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6 animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-700">
              <Volume2 className="w-5 h-5 text-rose-500" />
              <h3 className="font-serif text-base font-semibold">Review Voice Message</h3>
            </div>
            <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-warm-100 rounded-md text-neutral-600">
              {formatTime(recordingDuration)}
            </span>
          </div>

          {/* Local Audio Player */}
          <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200">
            <audio src={recordedUrl} controls className="w-full" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetRecording}
              disabled={isBusy}
              className="w-full sm:w-auto min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake</span>
            </Button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isBusy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-sm px-6 py-3 rounded-full shadow-sm transition-all disabled:opacity-60 min-h-[44px]"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Gift…</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Voice Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : audioItem ? (
        /* 3. Existing Saved Voice Message */
        <div className="bg-white border border-warm-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-neutral-800">
                  Your Voice Message
                </h3>
                <p className="text-xs text-neutral-400">
                  {audioItem.file_size
                    ? `${(audioItem.file_size / (1024 * 1024)).toFixed(2)} MB`
                    : 'Saved voice message'}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
              Active
            </span>
          </div>

          {/* Audio Player Preview */}
          <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200">
            {audioItem.signedUrl ? (
              <audio
                src={audioItem.signedUrl}
                controls
                preload="metadata"
                className="w-full"
                aria-label="Play saved voice message"
              />
            ) : (
              <div className="text-xs text-neutral-400 text-center py-2">
                Loading voice recording stream…
              </div>
            )}
          </div>

          {/* Actions Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-warm-200 gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 p-2.5 rounded-xl hover:bg-rose-50 transition-colors min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Recording</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReplaceModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-rose-600 p-2.5 rounded-xl hover:bg-warm-100 transition-colors min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Replace</span>
            </button>
          </div>
        </div>
      ) : (
        /* 4. Idle / Not Recorded Yet */
        <div className="bg-cream-50 border-2 border-dashed border-warm-300 rounded-3xl p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-warm-200 flex items-center justify-center mx-auto text-rose-500">
            <Mic className="w-8 h-8" />
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-neutral-800">
              Add a personal voice message
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Record a short audio greeting directly or upload an existing audio file from your device.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            {/* Record Option */}
            <button
              type="button"
              onClick={startRecording}
              disabled={loading || isBusy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-sm px-6 py-3.5 rounded-full shadow-sm hover:shadow-glow transition-all hover:scale-105 min-h-[48px] touch-manipulation cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Record Voice</span>
            </button>

            {/* Upload Option */}
            <button
              type="button"
              onClick={() => audioFileInputRef.current?.click()}
              disabled={loading || isBusy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-warm-50 text-neutral-700 font-semibold text-sm px-6 py-3.5 rounded-full border border-warm-300 shadow-xs transition-all hover:border-warm-400 min-h-[48px] touch-manipulation cursor-pointer"
            >
              {uploadingFile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                  <span>Uploading…</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-neutral-500" />
                  <span>Upload Audio</span>
                </>
              )}
            </button>
          </div>
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

      {/* Replace Choice Modal */}
      {showReplaceModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="replaceVoiceModalTitle"
          className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-warm-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowReplaceModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 id="replaceVoiceModalTitle" className="font-serif text-lg font-semibold text-neutral-800">
                Replace voice message?
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Choose whether to record a new voice message or upload an audio file. Your current voice note will be replaced once the new audio is saved.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option A: Record New */}
              <button
                type="button"
                onClick={() => {
                  setShowReplaceModal(false)
                  startRecording()
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm min-h-[44px]"
              >
                <Mic className="w-4 h-4" />
                <span>Record New Voice</span>
              </button>

              {/* Option B: Upload New Audio File */}
              <button
                type="button"
                onClick={() => {
                  setShowReplaceModal(false)
                  replaceAudioInputRef.current?.click()
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold text-neutral-700 bg-warm-100 hover:bg-warm-200 transition-colors min-h-[44px]"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Audio File</span>
              </button>

              {/* Cancel */}
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setShowReplaceModal(false)}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deleteVoiceModalTitle"
          className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-warm-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 id="deleteVoiceModalTitle" className="font-serif text-lg font-semibold text-neutral-800">
                Delete voice message?
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                This voice message will be removed from your gift. This action cannot be undone.
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
