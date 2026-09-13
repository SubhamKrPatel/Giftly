import React, { useState, useRef } from 'react'
import {
  BookOpen,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Calendar,
  Type,
  Loader2,
  AlertCircle,
  Check,
  ArrowLeft,
  X,
  Wallpaper,
} from 'lucide-react'
import type { StorySectionContent, StoryMemoryItem } from '@/lib/database.types'
import {
  validateImageFile,
  generateMediaStoragePath,
  uploadMediaToStorage,
  deleteMediaFromStorage,
} from '@/lib/storage'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface StoryEditorProps {
  content: StorySectionContent
  onChange: (updates: Partial<StorySectionContent>) => void
  giftId: string
  sectionId?: string
}

export default function StoryEditor({
  content,
  onChange,
  giftId,
  sectionId,
}: StoryEditorProps) {
  const { user } = useAuth()

  const heading = content?.heading ?? 'Our Story'
  const subtitle = content?.subtitle ?? 'Special moments and memories'
  const items: StoryMemoryItem[] = content?.items ?? []
  const backgroundImageUrl = content?.backgroundImageUrl
  const backgroundMediaId = content?.backgroundMediaId

  // Editing Sub-View State
  const [editingMemory, setEditingMemory] = useState<StoryMemoryItem | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  // Memory Form Fields State
  const [formTitle, setFormTitle] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formImageUrl, setFormImageUrl] = useState<string | undefined>(undefined)
  const [formMediaId, setFormMediaId] = useState<string | undefined>(undefined)

  // Upload State
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete Confirmation State
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null)

  // ── Open Editor for New Memory ──
  const handleOpenAdd = () => {
    setFormTitle('')
    setFormDate('')
    setFormDescription('')
    setFormImageUrl(undefined)
    setFormMediaId(undefined)
    setUploadError(null)
    setEditingMemory(null)
    setIsCreatingNew(true)
  }

  // ── Open Editor for Existing Memory ──
  const handleOpenEdit = (memory: StoryMemoryItem) => {
    setFormTitle(memory.title)
    setFormDate(memory.date || '')
    setFormDescription(memory.description || '')
    setFormImageUrl(memory.imageUrl)
    setFormMediaId(memory.mediaId)
    setUploadError(null)
    setEditingMemory(memory)
    setIsCreatingNew(false)
  }

  // ── Close Sub-View Editor ──
  const handleCloseEditor = () => {
    setEditingMemory(null)
    setIsCreatingNew(false)
    setUploadError(null)
  }

  // ── Save Memory (Create / Update) ──
  const handleSaveMemory = () => {
    if (!formTitle.trim()) {
      return
    }

    if (isCreatingNew) {
      const newMemory: StoryMemoryItem = {
        id: crypto.randomUUID(),
        title: formTitle.trim(),
        date: formDate.trim() || undefined,
        description: formDescription.trim() || undefined,
        imageUrl: formImageUrl,
        mediaId: formMediaId,
      }
      onChange({ items: [...items, newMemory] })
    } else if (editingMemory) {
      const updatedItems = items.map((item) => {
        if (item.id === editingMemory.id) {
          return {
            ...item,
            title: formTitle.trim(),
            date: formDate.trim() || undefined,
            description: formDescription.trim() || undefined,
            imageUrl: formImageUrl,
            mediaId: formMediaId,
          }
        }
        return item
      })
      onChange({ items: updatedItems })
    }

    handleCloseEditor()
  }

  // ── Photo Upload Handler ──
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    // 1. Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image file.')
      return
    }

    // Demo/offline mode handling
    if (giftId === 'demo' || !user) {
      const objectUrl = URL.createObjectURL(file)
      setFormImageUrl(objectUrl)
      setFormMediaId(`demo-media-${Date.now()}`)
      return
    }

    setUploading(true)

    try {
      const mediaId = crypto.randomUUID()
      const storagePath = generateMediaStoragePath(user.id, giftId, mediaId, file.name)

      // 2. Upload to Supabase Storage
      const { error: storageError } = await uploadMediaToStorage(storagePath, file)
      if (storageError) {
        throw new Error(storageError.message)
      }

      // 3. Create gift_media record
      const { data: dbData, error: dbError } = await supabase
        .from('gift_media')
        .insert({
          id: mediaId,
          gift_id: giftId,
          section_id: sectionId || null,
          media_type: 'image',
          storage_path: storagePath,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
          position: items.length,
        })
        .select()
        .single()

      if (dbError) {
        await deleteMediaFromStorage(storagePath)
        throw dbError
      }

      // 4. Resolve signed URL for immediate preview
      const { data: signedData } = await supabase.storage
        .from('gift-media')
        .createSignedUrl(storagePath, 60 * 60 * 24 * 7) // 7 days

      setFormImageUrl(signedData?.signedUrl || URL.createObjectURL(file))
      setFormMediaId(dbData?.id || mediaId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setUploadError(msg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // ── Remove Photo from Memory ──
  const handleRemovePhoto = async () => {
    if (formMediaId && giftId !== 'demo' && user) {
      try {
        const { data: mediaRow } = await supabase
          .from('gift_media')
          .select('storage_path')
          .eq('id', formMediaId)
          .single()

        if (mediaRow?.storage_path) {
          await deleteMediaFromStorage(mediaRow.storage_path)
        }
        await supabase.from('gift_media').delete().eq('id', formMediaId)
      } catch (err) {
        console.error('[StoryEditor] Photo cleanup error:', err)
      }
    }

    setFormImageUrl(undefined)
    setFormMediaId(undefined)
  }

  // ── Confirm Delete Memory ──
  const handleConfirmDelete = async (memoryId: string) => {
    const memoryToDelete = items.find((m) => m.id === memoryId)

    // Clean up storage if memory had a photo
    if (memoryToDelete?.mediaId && giftId !== 'demo' && user) {
      try {
        const { data: mediaRow } = await supabase
          .from('gift_media')
          .select('storage_path')
          .eq('id', memoryToDelete.mediaId)
          .single()

        if (mediaRow?.storage_path) {
          await deleteMediaFromStorage(mediaRow.storage_path)
        }
        await supabase.from('gift_media').delete().eq('id', memoryToDelete.mediaId)
      } catch (err) {
        console.error('[StoryEditor] Delete cleanup error:', err)
      }
    }

    // If deleted memory was set as background, clear background
    const isBackground =
      backgroundMediaId === memoryToDelete?.mediaId ||
      backgroundImageUrl === memoryToDelete?.imageUrl

    const updatedItems = items.filter((m) => m.id !== memoryId)
    onChange({
      items: updatedItems,
      ...(isBackground ? { backgroundImageUrl: undefined, backgroundMediaId: undefined } : {}),
    })

    setDeletingMemoryId(null)
  }

  // ── Reorder Memory Up / Down ──
  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    onChange({ items: newItems })
  }

  // ── Set Story Background Photo ──
  const handleSetBackground = (imageUrl: string, mediaId?: string) => {
    onChange({ backgroundImageUrl: imageUrl, backgroundMediaId: mediaId })
  }

  // ── Remove Story Background Photo ──
  const handleRemoveBackground = () => {
    onChange({ backgroundImageUrl: undefined, backgroundMediaId: undefined })
  }

  // Photos available across all memories for background selection
  const memoryPhotos = items.filter((m) => Boolean(m.imageUrl))

  // ─────────────────────────────────────────────────────────────────────────────
  // SUB-VIEW: FOCUSED MEMORY CREATION / EDITING FORM
  // ─────────────────────────────────────────────────────────────────────────────
  if (isCreatingNew || editingMemory) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-warm-200">
          <button
            type="button"
            onClick={handleCloseEditor}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-warm-100 hover:bg-warm-200 transition-colors min-h-[44px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Story</span>
          </button>

          <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900 truncate">
            {isCreatingNew ? 'Add a New Memory' : 'Edit Memory'}
          </h3>

          <button
            type="button"
            onClick={handleSaveMemory}
            disabled={!formTitle.trim() || uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-xs active:scale-95 disabled:opacity-50 transition-all min-h-[44px] cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Memory</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-5">
          {/* 1. Optional Memory Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Memory Photo <span className="text-neutral-400 font-normal lowercase">(optional)</span>
            </label>

            {formImageUrl ? (
              <div className="relative rounded-2xl overflow-hidden bg-warm-100 border border-warm-200 max-h-56 group">
                <img
                  src={formImageUrl}
                  alt={formTitle || 'Memory photo preview'}
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors cursor-pointer min-h-[44px] inline-flex items-center"
                  >
                    Replace Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-200 bg-rose-950/40 backdrop-blur-md hover:bg-rose-900/60 transition-colors cursor-pointer min-h-[44px] inline-flex items-center"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-8 px-4 rounded-2xl border-2 border-dashed border-warm-300 hover:border-rose-400 bg-warm-50/50 hover:bg-rose-50/30 flex flex-col items-center justify-center gap-2 text-neutral-600 transition-all cursor-pointer min-h-[110px]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                      <span className="text-xs font-semibold text-rose-600">Uploading photo…</span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-rose-500 border border-warm-200">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-800">
                        + Add a photo for this memory
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        JPEG, PNG, or WebP up to 10 MB
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploadError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* 2. Memory Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="memoryTitleInput"
                className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
              >
                Memory Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-neutral-400">
                {formTitle.length} / 80
              </span>
            </div>
            <div className="relative">
              <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                id="memoryTitleInput"
                type="text"
                maxLength={80}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Our First Trip, The Day We Met, Laughing Till 3 AM"
                className="w-full pl-10 pr-4 py-3 text-sm sm:text-base border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50 text-neutral-800 min-h-[44px]"
              />
            </div>
          </div>

          {/* 3. Optional Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="memoryDateInput"
                className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
              >
                Date <span className="text-neutral-400 font-normal lowercase">(optional)</span>
              </label>
              <span className="text-[11px] font-mono text-neutral-400">
                {formDate.length} / 40
              </span>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                id="memoryDateInput"
                type="text"
                maxLength={40}
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                placeholder="e.g. 12 May 2025, Summer 2024, or That Special Evening"
                className="w-full pl-10 pr-4 py-3 text-sm sm:text-base border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50 text-neutral-800 min-h-[44px]"
              />
            </div>
          </div>

          {/* 4. Story Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="memoryDescInput"
                className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
              >
                What Happened? <span className="text-neutral-400 font-normal lowercase">(optional)</span>
              </label>
              <span className="text-[11px] font-mono text-neutral-400">
                {formDescription.length} / 500
              </span>
            </div>
            <div className="relative">
              <textarea
                id="memoryDescInput"
                rows={5}
                maxLength={500}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Tell what happened and why this moment is special to you both..."
                className="w-full p-4 text-sm sm:text-base border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50 leading-relaxed resize-y min-h-[130px] text-neutral-800"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCloseEditor}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-neutral-700 bg-warm-100 hover:bg-warm-200 transition-colors min-h-[44px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveMemory}
            disabled={!formTitle.trim() || uploading}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-sm active:scale-95 disabled:opacity-50 transition-all min-h-[44px] cursor-pointer"
          >
            Save Memory
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN VIEW: MEMORIES LIST & STORY BACKGROUND SETTINGS
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          <BookOpen className="w-4 h-4 text-rose-500" />
          <span>Story & Memories</span>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-neutral-800">
            Our Story
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Tell your story, one memory at a time.
          </p>
        </div>
      </div>

      {/* ── Story Page Title & Subtitle ── */}
      <div className="p-4 rounded-2xl bg-warm-50/70 border border-warm-200/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Story Page Header</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="storyHeadingInput"
              className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider mb-1"
            >
              Story Heading
            </label>
            <input
              id="storyHeadingInput"
              type="text"
              maxLength={80}
              value={heading}
              onChange={(e) => onChange({ heading: e.target.value })}
              placeholder="Our Story"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-warm-300 rounded-xl bg-white focus:outline-none focus:border-rose-400 min-h-[40px]"
            />
          </div>
          <div>
            <label
              htmlFor="storySubtitleInput"
              className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider mb-1"
            >
              Subtitle
            </label>
            <input
              id="storySubtitleInput"
              type="text"
              maxLength={120}
              value={subtitle}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="Special moments and memories"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-warm-300 rounded-xl bg-white focus:outline-none focus:border-rose-400 min-h-[40px]"
            />
          </div>
        </div>
      </div>

      {/* ── Story Background Photo Setting (Part K, L, M) ── */}
      {memoryPhotos.length > 0 && (
        <div className="p-4 rounded-2xl bg-warm-50/70 border border-warm-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
              <Wallpaper className="w-3.5 h-3.5 text-rose-500" />
              <span>Story Background</span>
            </div>
            {backgroundImageUrl && (
              <button
                type="button"
                onClick={handleRemoveBackground}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
              >
                Remove Background
              </button>
            )}
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed">
            Select one of your memory photos as a soft background backdrop for the Story page.
          </p>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* None option */}
            <button
              type="button"
              onClick={handleRemoveBackground}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all cursor-pointer min-h-[40px] border',
                !backgroundImageUrl
                  ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                  : 'bg-white text-neutral-700 border-warm-200 hover:bg-warm-100'
              )}
            >
              None
            </button>

            {/* Photo options */}
            {memoryPhotos.map((m, idx) => {
              const isSelected = backgroundImageUrl === m.imageUrl || backgroundMediaId === m.mediaId
              return (
                <button
                  key={m.id || idx}
                  type="button"
                  onClick={() => m.imageUrl && handleSetBackground(m.imageUrl, m.mediaId)}
                  className={cn(
                    'flex items-center gap-2 p-1.5 pr-3 rounded-xl text-xs font-medium flex-shrink-0 transition-all cursor-pointer min-h-[40px] border',
                    isSelected
                      ? 'bg-rose-50 text-rose-700 border-rose-400 ring-2 ring-rose-200 shadow-xs font-semibold'
                      : 'bg-white text-neutral-700 border-warm-200 hover:bg-warm-100'
                  )}
                >
                  <img
                    src={m.imageUrl}
                    alt={m.title}
                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0 bg-warm-100"
                  />
                  <span className="truncate max-w-[110px]">{m.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Memories List ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Memories ({items.length})
          </h3>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-xs transition-all cursor-pointer min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </button>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="py-10 px-4 rounded-3xl border-2 border-dashed border-warm-300 text-center space-y-3 bg-warm-50/40">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-neutral-800">
                Your story is made of little moments.
              </h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Add your first memory to make this gift truly yours.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-sm transition-all cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Memory</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((memory, index) => {
              const isFirst = index === 0
              const isLast = index === items.length - 1

              return (
                <div
                  key={memory.id || index}
                  className="p-4 rounded-2xl bg-white border border-warm-200 shadow-xs hover:border-warm-300 transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Memory Info & Thumbnail */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {memory.imageUrl ? (
                        <img
                          src={memory.imageUrl}
                          alt={memory.title}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-warm-100 border border-warm-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-warm-100 flex items-center justify-center text-rose-500 flex-shrink-0 border border-warm-200">
                          <Sparkles className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-neutral-900 truncate">
                            {memory.title}
                          </h4>
                          {memory.date && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warm-100 text-[10px] font-medium text-neutral-600 flex-shrink-0">
                              <Calendar className="w-2.5 h-2.5 text-neutral-400" />
                              <span>{memory.date}</span>
                            </span>
                          )}
                        </div>

                        {memory.description && (
                          <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                            {memory.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Reorder & Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Reorder Up */}
                      <button
                        type="button"
                        onClick={() => handleReorder(index, 'up')}
                        disabled={isFirst}
                        className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-warm-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        title="Move up"
                        aria-label="Move memory up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      {/* Reorder Down */}
                      <button
                        type="button"
                        onClick={() => handleReorder(index, 'down')}
                        disabled={isLast}
                        className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-warm-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        title="Move down"
                        aria-label="Move memory down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(memory)}
                        className="p-2 rounded-lg text-neutral-600 hover:text-rose-600 hover:bg-rose-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                        title="Edit memory"
                        aria-label={`Edit memory: ${memory.title}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeletingMemoryId(memory.id)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                        title="Delete memory"
                        aria-label={`Delete memory: ${memory.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deletingMemoryId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-card border border-warm-200 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setDeletingMemoryId(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-neutral-900">
                Delete this memory?
              </h4>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Your story text and its attached photo will be removed.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMemoryId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-700 bg-warm-100 hover:bg-warm-200 transition-colors min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(deletingMemoryId)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors min-h-[44px] cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
