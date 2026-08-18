import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Gift,
  Loader2,
  ArrowLeft,
  User,
  PenTool,
  Type,
  FileText,
} from 'lucide-react'
import { useGiftEditor } from '@/lib/hooks/useGiftEditor'
import { useGiftMedia } from '@/lib/hooks/useGiftMedia'
import { useGiftVideos } from '@/lib/hooks/useGiftVideos'
import { useGiftAudio } from '@/lib/hooks/useGiftAudio'
import type {
  CoverSectionContent,
  MessageSectionContent,
  FinalMessageSectionContent,
} from '@/lib/database.types'
import Button from '@/components/ui/Button'
import EditorHeader from '@/components/editor/EditorHeader'
import EditorSectionList from '@/components/editor/EditorSectionList'
import CoverEditor from '@/components/editor/CoverEditor'
import MessageEditor from '@/components/editor/MessageEditor'
import GalleryEditor from '@/components/editor/GalleryEditor'
import VideoEditor from '@/components/editor/VideoEditor'
import VoiceEditor from '@/components/editor/VoiceEditor'
import MusicEditor from '@/components/editor/MusicEditor'
import FinalMessageEditor from '@/components/editor/FinalMessageEditor'
import ThemePicker from '@/components/editor/ThemePicker'
import GiftPreview from '@/components/editor/GiftPreview'

export default function GiftEditorPage() {
  const { giftId } = useParams<{ giftId: string }>()
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor')

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
  } = useGiftEditor(giftId)

  // Find active section content
  const coverSection = sections.find((s) => s.section_type === 'cover')
  const messageSection = sections.find((s) => s.section_type === 'message')
  const gallerySection = sections.find((s) => s.section_type === 'gallery')
  const videoSection = sections.find((s) => s.section_type === 'video')
  const voiceSection = sections.find((s) => s.section_type === 'voice')
  const musicSection = sections.find((s) => s.section_type === 'music')
  const finalMessageSection = sections.find((s) => s.section_type === 'final_message')

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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
      }}
    >
      {/* Top Bar Header */}
      <EditorHeader
        giftTitle={gift.title || `${gift.occasion?.name || 'Gift'} for ${gift.recipient_name}`}
        status={gift.status}
        saveStatus={saveStatus}
        onSave={saveAll}
        mobileTab={mobileTab}
        onMobileTabChange={setMobileTab}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Desktop 3-Column Layout (Always visible on lg+) */}
        <div className="hidden lg:grid grid-cols-12 gap-6 items-start">
          {/* Left Column: Section Management (3 cols) */}
          <aside className="col-span-3 space-y-4 sticky top-24">
            <EditorSectionList
              sections={sections}
              activeSection={selectedSectionType}
              onSectionSelect={setSelectedSectionType}
              onReorder={reorderSection}
              onToggleVisibility={toggleVisibility}
            />
          </aside>

          {/* Center Column: Active Controls Panel (5 cols) */}
          <div className="col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-card">
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
                          placeholder="e.g. Sarah"
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
                          placeholder="e.g. Alex"
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
                />
              )}

              {/* 4. Message Section Editor */}
              {selectedSectionType === 'message' && messageSection && (
                <MessageEditor
                  content={messageSection.content as MessageSectionContent}
                  onChange={(updates) => updateSectionContent('message', updates)}
                  recipientName={gift.recipient_name}
                />
              )}

              {/* 5. Gallery / Photo Memories Editor (Part 4B) */}
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

              {/* 6. Video Message Editor (Part 4C) */}
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

              {/* 7. Voice Message Editor (Part 4D) */}
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

              {/* 8. Background Music Editor (Part 4D) */}
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

              {/* 9. Final Message Section Editor */}
              {selectedSectionType === 'final_message' && finalMessageSection && (
                <FinalMessageEditor
                  content={finalMessageSection.content as FinalMessageSectionContent}
                  onChange={(updates) => updateSectionContent('final_message', updates)}
                  senderName={gift.sender_name || undefined}
                />
              )}
            </div>
          </div>

          {/* Right Column: Live Mobile Preview (4 cols) */}
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

        {/* Mobile View (<lg screens) */}
        <div className="block lg:hidden space-y-6">
          {mobileTab === 'preview' ? (
            <div className="py-4">
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
          ) : (
            <div className="space-y-6">
              {/* Section Selector */}
              <EditorSectionList
                sections={sections}
                activeSection={selectedSectionType}
                onSectionSelect={setSelectedSectionType}
                onReorder={reorderSection}
                onToggleVisibility={toggleVisibility}
              />

              {/* Active Control Panel */}
              <div className="bg-white rounded-3xl p-6 border border-warm-200 shadow-card">
                {selectedSectionType === 'details' && (
                  <div className="space-y-4 animate-fade-in-up">
                    <h2 className="font-serif text-xl font-semibold text-neutral-800">
                      Primary Details
                    </h2>
                    <div>
                      <label
                        htmlFor="mGiftTitleInput"
                        className="block text-xs font-semibold text-neutral-700 uppercase mb-1"
                      >
                        Gift Title
                      </label>
                      <input
                        id="mGiftTitleInput"
                        type="text"
                        value={gift.title || ''}
                        onChange={(e) => updateGiftDetails({ title: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm border border-warm-300 rounded-xl bg-cream-50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="mRecipientInput"
                        className="block text-xs font-semibold text-neutral-700 uppercase mb-1"
                      >
                        Recipient Name
                      </label>
                      <input
                        id="mRecipientInput"
                        type="text"
                        value={gift.recipient_name || ''}
                        onChange={(e) => updateGiftDetails({ recipient_name: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm border border-warm-300 rounded-xl bg-cream-50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="mSenderInput"
                        className="block text-xs font-semibold text-neutral-700 uppercase mb-1"
                      >
                        Sender Name
                      </label>
                      <input
                        id="mSenderInput"
                        type="text"
                        value={gift.sender_name || ''}
                        onChange={(e) => updateGiftDetails({ sender_name: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm border border-warm-300 rounded-xl bg-cream-50"
                      />
                    </div>
                  </div>
                )}

                {selectedSectionType === 'theme' && (
                  <ThemePicker
                    currentTheme={gift.theme_config}
                    onSelectTheme={updateTheme}
                  />
                )}

                {selectedSectionType === 'cover' && coverSection && (
                  <CoverEditor
                    content={coverSection.content as CoverSectionContent}
                    onChange={(updates) => updateSectionContent('cover', updates)}
                    recipientName={gift.recipient_name}
                    occasionName={gift.occasion?.name}
                  />
                )}

                {selectedSectionType === 'message' && messageSection && (
                  <MessageEditor
                    content={messageSection.content as MessageSectionContent}
                    onChange={(updates) => updateSectionContent('message', updates)}
                    recipientName={gift.recipient_name}
                  />
                )}

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

                {selectedSectionType === 'final_message' && finalMessageSection && (
                  <FinalMessageEditor
                    content={finalMessageSection.content as FinalMessageSectionContent}
                    onChange={(updates) => updateSectionContent('final_message', updates)}
                    senderName={gift.sender_name || undefined}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
