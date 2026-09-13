import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Gift,
  Loader2,
  ArrowLeft,
  User,
  PenTool,
  Type,
  FileText,
  Sparkles,
  Edit3,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useGiftEditor } from '@/lib/hooks/useGiftEditor'
import { useGiftMedia } from '@/lib/hooks/useGiftMedia'
import { useGiftVideos } from '@/lib/hooks/useGiftVideos'
import { useGiftAudio } from '@/lib/hooks/useGiftAudio'
import type {
  CoverSectionContent,
  MessageSectionContent,
  StorySectionContent,
  FinalMessageSectionContent,
} from '@/lib/database.types'
import type { GeneratedFullGiftResult } from '@/lib/services/aiService'
import Button from '@/components/ui/Button'
import EditorHeader from '@/components/editor/EditorHeader'
import EditorSectionList from '@/components/editor/EditorSectionList'
import CoverEditor from '@/components/editor/CoverEditor'
import MessageEditor from '@/components/editor/MessageEditor'
import StoryEditor from '@/components/editor/StoryEditor'
import GalleryEditor from '@/components/editor/GalleryEditor'
import VideoEditor from '@/components/editor/VideoEditor'
import VoiceEditor from '@/components/editor/VoiceEditor'
import MusicEditor from '@/components/editor/MusicEditor'
import FinalMessageEditor from '@/components/editor/FinalMessageEditor'
import ThemePicker from '@/components/editor/ThemePicker'
import GiftPreview from '@/components/editor/GiftPreview'
import MobilePageNav from '@/components/editor/MobilePageNav'
import MobileEditDrawer from '@/components/editor/MobileEditDrawer'
import AIAssistantModal from '@/components/ai/AIAssistantModal'
import PublishModal from '@/components/publishing/PublishModal'
import UnpublishModal from '@/components/publishing/UnpublishModal'
import ShareModal from '@/components/publishing/ShareModal'
import { cn } from '@/lib/utils'

const SECTION_TITLES: Record<string, string> = {
  details: 'Basic Details',
  theme: 'Theme & Palette',
  cover: 'Cover & Opening',
  message: 'Heartfelt Message',
  story: 'Our Story',
  gallery: 'Photo Memories',
  video: 'Video Message',
  voice: 'Voice Note',
  music: 'Background Music',
  final_message: 'Final Wish',
}

export default function GiftEditorPage() {
  const { giftId } = useParams<{ giftId: string }>()
  const [isMobileEditOpen, setIsMobileEditOpen] = useState(false)

  // AI Assistant Modal State (Part 5)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [aiModalMode, setAiModalMode] = useState<'generate' | 'improve' | 'full_gift'>('generate')

  // Publishing Modals State (Part 7)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const {
    gift,
    sections,
    selectedSectionType,
    setSelectedSectionType,
    loading: loadingGift,
    notFound,
    saveStatus,
    updateGiftDetails,
    updateTheme,
    updateSectionContent,
    reorderSection,
    toggleVisibility,
    saveAll,
    publish,
    unpublish,
  } = useGiftEditor(giftId)

  // Find active section content
  const coverSection = sections.find((s) => s.section_type === 'cover')
  const messageSection = sections.find((s) => s.section_type === 'message')
  const gallerySection = sections.find((s) => s.section_type === 'gallery')
  const videoSection = sections.find((s) => s.section_type === 'video')
  const voiceSection = sections.find((s) => s.section_type === 'voice')
  const musicSection = sections.find((s) => s.section_type === 'music')
  const finalMessageSection = sections.find((s) => s.section_type === 'final_message')
  const storySection = sections.find((s) => s.section_type === 'story')

  // Media hook for gallery photos (Part 4B)
  const {
    mediaItems,
    loading: loadingMedia,
    uploading: uploadingPhotos,
    uploadProgress: photoUploadProgress,
    error: photoError,
    uploadFiles: uploadPhotos,
    reorderMedia: reorderPhotos,
    deleteMedia: deletePhoto,
  } = useGiftMedia(giftId, gallerySection?.id)

  // Video hook for video messages (Part 4C)
  const {
    videoItems,
    loading: loadingVideos,
    uploading: uploadingVideos,
    uploadProgress: videoUploadProgress,
    error: videoError,
    uploadVideoFiles,
    reorderVideos,
    deleteVideo,
  } = useGiftVideos(giftId, videoSection?.id)

  // Audio hooks for Voice Note & Background Music (Part 4D)
  const {
    audioItem: voiceItem,
    loading: loadingVoice,
    uploading: uploadingVoice,
    error: voiceError,
    saveVoiceRecording,
    deleteAudio: deleteVoiceRecording,
  } = useGiftAudio(giftId, voiceSection?.id, 'voice')

  const {
    audioItem: musicItem,
    loading: loadingMusic,
    uploading: uploadingMusic,
    error: musicError,
    uploadMusic,
    deleteAudio: deleteMusicTrack,
  } = useGiftAudio(giftId, musicSection?.id, 'music')

  // AI Modal openers & appliers
  const handleOpenAI = (mode: 'generate' | 'improve' | 'full_gift' = 'generate') => {
    setAiModalMode(mode)
    setIsAIModalOpen(true)
  }

  const handleApplyAIMessage = (heading: string, body: string) => {
    updateSectionContent('message', { heading, body })
  }

  const handleApplyAIFullGift = (content: GeneratedFullGiftResult) => {
    updateSectionContent('cover', content.cover)
    updateSectionContent('message', content.message)
    updateSectionContent('final_message', content.final_message)
  }

  // Ordered navigation list for pagination & mobile nav
  const orderedNavIds = useMemo(() => {
    const list = ['details', 'theme']
    const sorted = [...sections].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    sorted.forEach((s) => list.push(s.section_type))
    return list
  }, [sections])

  const currentNavIndex = orderedNavIds.indexOf(selectedSectionType)
  const prevNavId = currentNavIndex > 0 ? orderedNavIds[currentNavIndex - 1] : undefined
  const nextNavId = currentNavIndex < orderedNavIds.length - 1 ? orderedNavIds[currentNavIndex + 1] : undefined
  const prevNavTitle = prevNavId ? SECTION_TITLES[prevNavId] || prevNavId : undefined
  const nextNavTitle = nextNavId ? SECTION_TITLES[nextNavId] || nextNavId : undefined

  // Active section for optional toggling
  const activeDbSection = sections.find((s) => s.section_type === selectedSectionType)
  const isCurrentSectionOptional = Boolean(
    activeDbSection &&
    ['gallery', 'video', 'voice', 'music', 'story'].includes(activeDbSection.section_type)
  )
  const isCurrentSectionVisible = activeDbSection ? activeDbSection.is_visible !== false : true

  if (loadingGift) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{
          background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
        }}
      >
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
        <p className="font-serif text-lg font-medium text-neutral-700">Loading your gift editor…</p>
      </div>
    )
  }

  if (notFound || !gift) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
        }}
      >
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-warm-200 shadow-card text-center max-w-md w-full animate-fade-in-up">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-neutral-800 mb-2">
            Gift Not Found
          </h2>
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
            The gift you are looking for does not exist or you do not have permission to view it.
          </p>
          <Button href="/dashboard" fullWidth size="lg">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Button>
        </div>
      </div>
    )
  }

  const messageContent = (messageSection?.content as MessageSectionContent) || {}

  // Centralized section editor renderer
  const renderActiveSectionEditor = () => {
    return (
      <div className="space-y-6">
        {/* 1. Basic Gift Details Tab */}
        {selectedSectionType === 'details' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>Gift Information</span>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-neutral-800">
                Primary Details
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Recipient, sender name, and overall gift title.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="giftTitleInput"
                  className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
                >
                  Gift Title
                </label>
                <div className="relative">
                  <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="giftTitleInput"
                    type="text"
                    value={gift.title || ''}
                    onChange={(e) => updateGiftDetails({ title: e.target.value })}
                    placeholder={`e.g. Happy ${gift.occasion?.name || 'Birthday'}!`}
                    className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="recipientInput"
                  className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
                >
                  Recipient Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="recipientInput"
                    type="text"
                    value={gift.recipient_name || ''}
                    onChange={(e) => updateGiftDetails({ recipient_name: e.target.value })}
                    placeholder="e.g. Chahat"
                    className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="senderInput"
                  className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
                >
                  Sender Name
                </label>
                <div className="relative">
                  <PenTool className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="senderInput"
                    type="text"
                    value={gift.sender_name || ''}
                    onChange={(e) => updateGiftDetails({ sender_name: e.target.value })}
                    placeholder="e.g. Ayushi"
                    className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Theme Customization Tab */}
        {selectedSectionType === 'theme' && (
          <ThemePicker
            currentTheme={gift.theme_config}
            onSelectTheme={updateTheme}
          />
        )}

        {/* 3. Cover Section Editor */}
        {selectedSectionType === 'cover' && coverSection && (
          <CoverEditor
            content={coverSection.content as CoverSectionContent}
            onChange={(updates) => updateSectionContent('cover', updates)}
            recipientName={gift.recipient_name}
            occasionName={gift.occasion?.name}
            onOpenAI={() => handleOpenAI('full_gift')}
          />
        )}

        {/* 4. Message Section Editor */}
        {selectedSectionType === 'message' && messageSection && (
          <MessageEditor
            content={messageSection.content as MessageSectionContent}
            onChange={(updates) => updateSectionContent('message', updates)}
            recipientName={gift.recipient_name}
            onOpenAI={(aiMode) => handleOpenAI(aiMode)}
          />
        )}

        {/* 5. Story Section Editor */}
        {selectedSectionType === 'story' && storySection && (
          <StoryEditor
            content={storySection.content as StorySectionContent}
            onChange={(updates) => updateSectionContent('story', updates)}
            giftId={gift.id}
            sectionId={storySection.id}
          />
        )}

        {/* 6. Gallery / Photo Memories Editor (Part 4B) */}
        {selectedSectionType === 'gallery' && (
          <GalleryEditor
            mediaItems={mediaItems}
            loading={loadingMedia}
            uploading={uploadingPhotos}
            uploadProgress={photoUploadProgress}
            error={photoError}
            onUpload={uploadPhotos}
            onReorder={reorderPhotos}
            onDelete={deletePhoto}
          />
        )}

        {/* 7. Video Message Editor (Part 4C) */}
        {selectedSectionType === 'video' && (
          <VideoEditor
            videoItems={videoItems}
            loading={loadingVideos}
            uploading={uploadingVideos}
            uploadProgress={videoUploadProgress}
            error={videoError}
            onUpload={uploadVideoFiles}
            onReorder={reorderVideos}
            onDelete={deleteVideo}
          />
        )}

        {/* 8. Voice Message Editor (Part 4D) */}
        {selectedSectionType === 'voice' && (
          <VoiceEditor
            audioItem={voiceItem}
            loading={loadingVoice}
            uploading={uploadingVoice}
            error={voiceError}
            onSaveRecording={saveVoiceRecording}
            onDeleteRecording={deleteVoiceRecording}
          />
        )}

        {/* 9. Background Music Editor (Part 4D) */}
        {selectedSectionType === 'music' && (
          <MusicEditor
            audioItem={musicItem}
            loading={loadingMusic}
            uploading={uploadingMusic}
            error={musicError}
            onUploadMusic={uploadMusic}
            onDeleteMusic={deleteMusicTrack}
          />
        )}

        {/* 10. Final Message Section Editor */}
        {selectedSectionType === 'final_message' && finalMessageSection && (
          <FinalMessageEditor
            content={finalMessageSection.content as FinalMessageSectionContent}
            onChange={(updates) => updateSectionContent('final_message', updates)}
            senderName={gift.sender_name || undefined}
            onOpenAI={() => handleOpenAI('full_gift')}
          />
        )}
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
      }}
    >
      {/* ── 1. Top Bar Header (Desktop & Mobile) ── */}
      <EditorHeader
        giftId={gift.id}
        giftTitle={gift.title || `${gift.occasion?.name || 'Gift'} for ${gift.recipient_name}`}
        status={gift.status}
        saveStatus={saveStatus}
        onSave={saveAll}
        onPublishClick={() => setIsPublishModalOpen(true)}
        onShareClick={() => setIsShareModalOpen(true)}
        onUnpublishClick={() => setIsUnpublishModalOpen(true)}
      />

      {/* ── 2. DESKTOP WORKSPACE LAYOUT (Visible on lg+) ── */}
      <main className="hidden lg:block flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Column: Section List & AI launcher (3 cols) */}
          <aside className="col-span-3 space-y-4 sticky top-24">
            <EditorSectionList
              sections={sections}
              activeSection={selectedSectionType}
              onSectionSelect={setSelectedSectionType}
              onReorder={reorderSection}
              onToggleVisibility={toggleVisibility}
              mediaItems={mediaItems}
              videoItems={videoItems}
              voiceItem={voiceItem}
              musicItem={musicItem}
            />

            {/* AI Assistant Quick Launcher Card */}
            <div className="p-4 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-amber-400/10 border border-rose-200/80 rounded-3xl space-y-2.5">
              <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>AI Gift Assistant</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Need inspiration? Generate messages, refine your tone, or craft a complete gift story.
              </p>
              <button
                type="button"
                onClick={() => handleOpenAI('full_gift')}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Full Story</span>
              </button>
            </div>
          </aside>

          {/* Center Column: Active Controls Panel (5 cols) */}
          <div className="col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-card">
              {renderActiveSectionEditor()}
            </div>
          </div>

          {/* Right Column: Live Device Mockup Preview (4 cols) */}
          <aside className="col-span-4 sticky top-24">
            <GiftPreview
              gift={gift}
              sections={sections}
              activeSectionType={selectedSectionType}
              mediaItems={mediaItems}
              videoItems={videoItems}
              voiceItem={voiceItem}
              musicItem={musicItem}
            />
          </aside>
        </div>
      </main>

      {/* ── 3. MOBILE-FIRST WORKSPACE LAYOUT (Visible on <lg screens) ── */}
      <div className="block lg:hidden flex-1 flex flex-col">
        {/* Horizontally scrollable page selector bar */}
        <MobilePageNav
          sections={sections}
          activeSection={selectedSectionType}
          onSectionSelect={setSelectedSectionType}
          mediaItems={mediaItems}
          videoItems={videoItems}
          voiceItem={voiceItem}
        />

        {/* Live Device Preview Canvas */}
        <main className="flex-1 px-4 py-4 sm:py-6 flex flex-col items-center justify-start space-y-4">
          <div className="w-full max-w-sm">
            <GiftPreview
              gift={gift}
              sections={sections}
              activeSectionType={selectedSectionType}
              mediaItems={mediaItems}
              videoItems={videoItems}
              voiceItem={voiceItem}
              musicItem={musicItem}
            />
          </div>

          {/* Mobile Action Controls */}
          <div className="w-full max-w-sm space-y-2.5 pt-1 pb-6">
            {/* Primary Action: Edit Current Page */}
            <button
              type="button"
              onClick={() => setIsMobileEditOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-pink-600 shadow-md hover:shadow-glow active:scale-[0.98] transition-all min-h-[48px] touch-manipulation cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit {SECTION_TITLES[selectedSectionType] || 'Page'}</span>
            </button>

            {/* Secondary Controls: Optional Visibility Toggle + AI Assistant */}
            <div className="flex items-center gap-2">
              {isCurrentSectionOptional && activeDbSection && (
                <button
                  type="button"
                  onClick={() => toggleVisibility(activeDbSection.id)}
                  className={cn(
                    'flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all min-h-[44px] cursor-pointer touch-manipulation',
                    isCurrentSectionVisible
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-warm-100 text-neutral-500 border-warm-200 hover:bg-warm-200'
                  )}
                  title={isCurrentSectionVisible ? 'Hide this page from gift' : 'Show this page in gift'}
                >
                  {isCurrentSectionVisible ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Page Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Page Hidden</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => handleOpenAI('generate')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all min-h-[44px] cursor-pointer touch-manipulation"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>AI Assistant</span>
              </button>
            </div>
          </div>
        </main>

        {/* Focused Mobile Edit Drawer / Full-Screen Mode */}
        <MobileEditDrawer
          isOpen={isMobileEditOpen}
          onClose={() => setIsMobileEditOpen(false)}
          title={SECTION_TITLES[selectedSectionType] || 'Page Content'}
          sectionType={selectedSectionType}
          saveStatus={saveStatus}
          onSave={saveAll}
          onPrevSection={prevNavId ? () => setSelectedSectionType(prevNavId) : undefined}
          onNextSection={nextNavId ? () => setSelectedSectionType(nextNavId) : undefined}
          prevTitle={prevNavTitle}
          nextTitle={nextNavTitle}
        >
          {renderActiveSectionEditor()}
        </MobileEditDrawer>
      </div>

      {/* ── 4. Modals ── */}
      {/* AI Assistant Modal (Part 5) */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        initialMode={aiModalMode}
        giftId={gift.id}
        occasionName={gift.occasion?.name}
        recipientName={gift.recipient_name}
        senderName={gift.sender_name || undefined}
        currentHeading={messageContent.heading}
        currentBody={messageContent.body}
        onApplyMessage={handleApplyAIMessage}
        onApplyFullGift={handleApplyAIFullGift}
      />

      {/* Publish Modal (Part 7) */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        recipientName={gift.recipient_name}
        onPublish={publish}
      />

      {/* Unpublish Modal (Part 7) */}
      <UnpublishModal
        isOpen={isUnpublishModalOpen}
        onClose={() => setIsUnpublishModalOpen(false)}
        onConfirm={unpublish}
      />

      {/* Share Modal (Part 7) */}
      {gift.public_slug && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          publicSlug={gift.public_slug}
          recipientName={gift.recipient_name}
          onUnpublishClick={() => setIsUnpublishModalOpen(true)}
        />
      )}
    </div>
  )
}
