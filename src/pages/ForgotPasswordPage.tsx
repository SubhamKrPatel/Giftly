import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getAuthErrorMessage } from '@/lib/authErrors'
import { brand } from '@/config/brand'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function validate(): string | null {
    if (!email.trim()) return 'Please enter your email address.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.'
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/reset-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      })

      if (resetError) {
        setError(getAuthErrorMessage(resetError))
        return
      }

      setSuccess(true)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center pt-16 px-4 py-20"
      style={{
        background: 'linear-gradient(145deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center shadow-glow">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-serif text-2xl font-semibold text-neutral-800">{brand.name}</span>
          </Link>
          <h1 className="font-serif text-2xl font-semibold text-neutral-800 mt-4">
            Reset your password
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Enter your email and we&apos;ll send you a recovery link.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-card">
          {success ? (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-neutral-800">
                  Password reset link sent
                </h2>
                <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                  We sent a recovery link to{' '}
                  <strong className="text-neutral-700">{email}</strong>. Check your inbox and follow the link to reset your password.
                </p>
              </div>

              <div className="pt-3 border-t border-warm-100">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Error banner */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm animate-shake"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email field */}
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError(null)
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-sm py-2.5 px-4 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-glow disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending reset link…</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-rose-600 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
