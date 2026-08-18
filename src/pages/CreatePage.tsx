import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { brand } from '@/config/brand'
import type { Occasion, Template } from '@/lib/database.types'
import { useOccasions } from '@/lib/hooks/useOccasions'
import { useTemplates } from '@/lib/hooks/useTemplates'
import StepHeader from '@/components/create/StepHeader'
import OccasionPicker from '@/components/create/OccasionPicker'
import TemplatePicker from '@/components/create/TemplatePicker'
import GiftDetailsForm from '@/components/create/GiftDetailsForm'

export default function CreatePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Initialize sender name from user's profile if available
  useEffect(() => {
    if (!senderName && profile?.full_name) {
      setSenderName(profile.full_name)
    }
  }, [profile, senderName])

  // Data hooks
  const {
    occasions,
    loading: loadingOccasions,
    error: occasionsError,
    refetch: refetchOccasions,
  } = useOccasions()

  const {
    templates,
    loading: loadingTemplates,
    error: templatesError,
    refetch: refetchTemplates,
  } = useTemplates(selectedOccasion?.id)

  // Auto-select first template when templates load if none selected
  useEffect(() => {
    if (templates.length > 0 && (!selectedTemplate || selectedTemplate.occasion_id !== selectedOccasion?.id)) {
      setSelectedTemplate(templates[0])
    }
  }, [templates, selectedTemplate, selectedOccasion])

  // Occasion selection handler
  function handleSelectOccasion(occasion: Occasion) {
    if (selectedOccasion?.id !== occasion.id) {
      setSelectedOccasion(occasion)
      setSelectedTemplate(null)
    }
  }

  // Final gift submission handler
  async function handleCreateGift() {
    if (!user || !selectedOccasion || !selectedTemplate || !recipientName.trim()) {
      return
    }

    setSubmitting(true)
    setCreateError(null)

    try {
      const giftTitle =
        title.trim() || `${selectedOccasion.name} Gift for ${recipientName.trim()}`

      const { data: newGift, error } = await supabase
        .from('gifts')
        .insert({
          user_id: user.id,
          occasion_id: selectedOccasion.id,
          template_id: selectedTemplate.id,
          recipient_name: recipientName.trim(),
          sender_name: senderName.trim() || null,
          title: giftTitle,
          status: 'draft',
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      if (newGift) {
        navigate(`/create/${newGift.id}`)
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || 'Failed to create gift. Please try again.'
      console.error('[CreatePage] Error creating gift:', msg)
      setCreateError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
      }}
    >
      {/* Creation Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-warm-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-serif text-xl font-semibold text-neutral-800 tracking-tight">
              {brand.name}
            </span>
          </Link>

          {/* Exit CTA */}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <span>Exit to Dashboard</span>
            <X className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main wizard content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Step Progress Indicator */}
        <div className="mb-10 sm:mb-12">
          <StepHeader
            currentStep={step}
            onStepClick={(targetStep) => {
              if (targetStep === 1) setStep(1)
              else if (targetStep === 2 && selectedOccasion) setStep(2)
            }}
          />
        </div>

        {/* Step 1: Choose Occasion */}
        {step === 1 && (
          <OccasionPicker
            occasions={occasions}
            selectedOccasion={selectedOccasion}
            onSelect={handleSelectOccasion}
            onContinue={() => setStep(2)}
            loading={loadingOccasions}
            error={occasionsError}
            onRetry={refetchOccasions}
          />
        )}

        {/* Step 2: Select Template */}
        {step === 2 && (
          <TemplatePicker
            templates={templates}
            selectedTemplate={selectedTemplate}
            occasion={selectedOccasion}
            onSelect={(tmpl) => setSelectedTemplate(tmpl)}
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
            loading={loadingTemplates}
            error={templatesError}
            onRetry={refetchTemplates}
          />
        )}

        {/* Step 3: Gift Details */}
        {step === 3 && (
          <GiftDetailsForm
            occasion={selectedOccasion}
            template={selectedTemplate}
            recipientName={recipientName}
            senderName={senderName}
            title={title}
            onRecipientNameChange={setRecipientName}
            onSenderNameChange={setSenderName}
            onTitleChange={setTitle}
            onSubmit={handleCreateGift}
            onBack={() => setStep(2)}
            submitting={submitting}
            error={createError}
          />
        )}
      </main>
    </div>
  )
}
