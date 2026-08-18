import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Gift,
  Loader2,
  AlertCircle,
  ArrowLeft,
  User,
  PenTool,
  Type,
  Heart,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { GiftWithDetails } from '@/lib/database.types'
import Button from '@/components/ui/Button'
import EditorHeader from '@/components/editor/EditorHeader'
import EditorSectionList from '@/components/editor/EditorSectionList'

export default function GiftEditorPage() {
  const { giftId } = useParams<{ giftId: string }>()
  const { user } = useAuth()

  const [gift, setGift] = useState<GiftWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeSection, setActiveSection] = useState('details')

  // Form editable state
  const [title, setTitle] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [saveError, setSaveError] = useState<string | null>(null)

  const isInitialLoad = useRef(true)

  // Fetch gift by ID
  const fetchGift = useCallback(async () => {
    if (!giftId || !user) return

    setLoading(true)
    setNotFound(false)
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select(`
          *,
          occasion:occasions(*),
          template:templates(*)
        `)
        .eq('id', giftId)
        .single()

      if (error || !data) {
        setNotFound(true)
        return
      }

      const loadedGift = data as unknown as GiftWithDetails
      setGift(loadedGift)
      setTitle(loadedGift.title || '')
      setRecipientName(loadedGift.recipient_name || '')
      setSenderName(loadedGift.sender_name || '')
      setSaveStatus('saved')
    } catch (err) {
      console.error('[GiftEditorPage] Error fetching gift:', err)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [giftId, user])

  useEffect(() => {
    fetchGift()
  }, [fetchGift])

  // Save changes to database
  const handleSave = useCallback(async () => {
    if (!giftId || !gift || !recipientName.trim()) return

    setSaveStatus('saving')
    setSaveError(null)

    try {
      const { error } = await supabase
        .from('gifts')
        .update({
          title: title.trim() || null,
          recipient_name: recipientName.trim(),
          sender_name: senderName.trim() || null,
        })
        .eq('id', giftId)

      if (error) throw error

      setSaveStatus('saved')
      setGift((prev) =>
        prev
          ? {
              ...prev,
              title: title.trim() || null,
              recipient_name: recipientName.trim(),
              sender_name: senderName.trim() || null,
            }
          : null
      )
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || 'Failed to save changes.'
      console.error('[GiftEditorPage] Save error:', msg)
      setSaveError(msg)
      setSaveStatus('unsaved')
    }
  }, [giftId, gift, title, recipientName, senderName])

  // Track unsaved state when fields change
  const handleFieldChange = (
    updater: () => void
  ) => {
    updater()
    if (!isInitialLoad.current) {
      setSaveStatus('unsaved')
    }
  }

  useEffect(() => {
    if (!loading && gift) {
      isInitialLoad.current = false
    }
  }, [loading, gift])

  if (loading) {
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

  const primaryColor = gift.template?.theme_config?.primaryColor || '#f43f5e'
  const secondaryColor = gift.template?.theme_config?.secondaryColor || '#fda4af'

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
      }}
    >
      {/* Top Bar Header */}
      <EditorHeader
        giftTitle={title || `${gift.occasion?.name || 'Gift'} for ${recipientName || 'Someone'}`}
        status={gift.status}
        saveStatus={saveStatus}
        onSave={handleSave}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar: Section Navigation */}
          <aside className="lg:col-span-4 space-y-6">
            <EditorSectionList
              activeSection={activeSection}
              onSectionSelect={setActiveSection}
            />

            {/* Gift Info Card */}
            <div className="bg-white rounded-3xl p-5 border border-warm-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Gift Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Occasion:</span>
                  <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <span>{gift.occasion?.icon}</span>
                    <span>{gift.occasion?.name}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Template:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-800">
                      {gift.template?.name}
                    </span>
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Created:</span>
                  <span className="text-neutral-700">
                    {new Date(gift.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area: Active Section Editor */}
          <div className="lg:col-span-8 space-y-6">
            {activeSection === 'details' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-card space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-neutral-800">
                    Gift Information
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    Manage the primary details and presentation info for your gift.
                  </p>
                </div>

                {saveError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Gift Title */}
                  <div>
                    <label
                      htmlFor="editTitle"
                      className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
                    >
                      Gift Title
                    </label>
                    <div className="relative">
                      <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        id="editTitle"
                        type="text"
                        value={title}
                        onChange={(e) =>
                          handleFieldChange(() => setTitle(e.target.value))
                        }
                        placeholder="e.g. Happy 25th Birthday Sarah!"
                        className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50"
                      />
                    </div>
                  </div>

                  {/* Recipient Name */}
                  <div>
                    <label
                      htmlFor="editRecipient"
                      className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
                    >
                      Recipient Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        id="editRecipient"
                        type="text"
                        value={recipientName}
                        onChange={(e) =>
                          handleFieldChange(() => setRecipientName(e.target.value))
                        }
                        placeholder="e.g. Sarah"
                        className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50"
                        required
                      />
                    </div>
                  </div>

                  {/* Sender Name */}
                  <div>
                    <label
                      htmlFor="editSender"
                      className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
                    >
                      Sender Name <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                    </label>
                    <div className="relative">
                      <PenTool className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        id="editSender"
                        type="text"
                        value={senderName}
                        onChange={(e) =>
                          handleFieldChange(() => setSenderName(e.target.value))
                        }
                        placeholder="e.g. Alex"
                        className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Visual Preview Box */}
                <div className="pt-6 border-t border-warm-200">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                    Card Preview Card
                  </h4>
                  <div
                    className="p-6 rounded-2xl relative overflow-hidden shadow-card text-white flex flex-col justify-between min-h-[160px]"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl drop-shadow-sm">{gift.occasion?.icon || '🎁'}</span>
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium">
                        {gift.occasion?.name}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight drop-shadow-sm">
                        {title || `A special gift for ${recipientName || 'someone special'}`}
                      </h3>
                      {senderName && (
                        <p className="text-xs sm:text-sm text-white/90 mt-1">
                          With love from {senderName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save button footer */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving' || !recipientName.trim()}
                    size="lg"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes…</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 fill-white" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
