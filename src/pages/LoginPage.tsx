import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getAuthErrorMessage } from '@/lib/authErrors'
import { brand } from '@/config/brand'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect to the page the user was trying to visit, or dashboard by default
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!email.trim()) return 'Please enter your email address.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.'
    if (!password) return 'Please enter your password.'
    return null
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        setError(getAuthErrorMessage(authError))
        return
      }

      navigate(from, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center pt-16 px-4"
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
          <h1 className="font-serif text-2xl font-semibold text-neutral-800 mt-4">Welcome back</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to continue creating beautiful gifts.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null) }}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-200 bg-cream-50"
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-200 bg-cream-50"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold py-3.5 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-neutral-500 mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          <Link to="/" className="hover:text-rose-500 transition-colors">
            ← Back to {brand.name}
          </Link>
        </p>
      </div>
    </div>
  )
}
