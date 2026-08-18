import { useState, type FormEvent, useEffect } from 'react'
import { X, User, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface ProfileModalProps {
  onClose: () => void
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { user, profile, refreshProfile } = useAuth()

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Keep form in sync if profile loads after modal opens
  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name)
  }, [profile?.full_name])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    const trimmed = fullName.trim()
    if (!trimmed) {
      setError('Full name cannot be empty.')
      return
    }
    if (trimmed.length < 2) {
      setError('Your name must be at least 2 characters.')
      return
    }

    setSaving(true)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: trimmed })
        .eq('user_id', user!.id)

      if (updateError) {
        setError('Could not save changes. Please try again.')
        return
      }

      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
    >
      {/* Click outside to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-warm-200 p-8 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-semibold text-neutral-800">Your Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5" noValidate>
          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success banner */}
          {saved && (
            <div
              role="status"
              className="flex items-start gap-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm"
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Profile updated successfully.</span>
            </div>
          )}

          {/* Full name */}
          <div>
            <label
              htmlFor="profile-name"
              className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError(null); setSaved(false) }}
                className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-200 bg-cream-50"
                autoComplete="name"
                disabled={saving}
                required
              />
            </div>
          </div>

          {/* Email — read-only */}
          <div>
            <label
              htmlFor="profile-email"
              className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5"
            >
              Email
              <span className="ml-2 text-neutral-400 normal-case font-normal">(cannot be changed here)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="profile-email"
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full pl-10 pr-4 py-3 text-sm border border-warm-200 rounded-xl bg-neutral-50 text-neutral-400 cursor-not-allowed"
                aria-readonly="true"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold py-3 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-sm font-medium text-neutral-600 hover:text-neutral-800 rounded-xl border border-warm-300 hover:bg-neutral-50 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
