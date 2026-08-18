import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getAuthErrorMessage } from '@/lib/authErrors'
import { brand } from '@/config/brand'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)

  // Listen to Supabase recovery auth event or verify existing recovery session
  useEffect(() => {
    let isMounted = true

    async function checkRecoverySession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (isMounted) {
          if (session) {
            setHasValidSession(true)
          }
          setCheckingSession(false)
        }
      } catch {
        if (isMounted) {
          setCheckingSession(false)
        }
      }
    }

    checkRecoverySession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        if (isMounted) {
          setHasValidSession(true)
          setCheckingSession(false)
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  function validate(): string | null {
    if (!password) return 'Please enter a new password.'
    if (password.length < 6) return 'Your password must be at least 6 characters long.'
    if (!confirmPassword) return 'Please confirm your new password.'
    if (password !== confirmPassword) return 'Passwords do not match. Please try again.'
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
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      })

      if (updateError) {
        setError(getAuthErrorMessage(updateError))
        return
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2500)
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
            Set a new password
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Choose a strong password to secure your account.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-card">
          {checkingSession ? (
            <div className="text-center py-8 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-rose-500 mx-auto" />
              <p className="text-xs text-neutral-500">Verifying recovery link…</p>
            </div>
          ) : !hasValidSession && !success ? (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-neutral-800">
                  Recovery link invalid or expired
                </h2>
                <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                  The password reset link may have already been used or expired. Please request a new recovery link.
                </p>
              </div>

              <div className="pt-3 border-t border-warm-100">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-xs transition-all"
                >
                  Request new reset link
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-neutral-800">
                  Password updated!
                </h2>
                <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                  Your password has been changed successfully. Redirecting you to sign in…
                </p>
              </div>

              <div className="pt-3 border-t border-warm-100">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  Go to Sign In
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

              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-new-password"
                  className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="confirm-new-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError(null)
                    }}
                    placeholder="Re-enter your new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                    <span>Updating password…</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
