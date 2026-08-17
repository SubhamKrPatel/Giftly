import { Link } from 'react-router-dom'
import { Heart, Mail, Lock } from 'lucide-react'
import { brand } from '@/config/brand'

export default function LoginPage() {
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
          <h1 className="font-serif text-2xl font-semibold text-neutral-800 mt-4">
            Welcome back
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to continue creating beautiful gifts.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-card">
          <div className="space-y-4">
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
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-200 bg-cream-50"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-200 bg-cream-50"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 text-center">
                🔐 Authentication is coming soon. This is a preview form.
              </div>
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold py-3.5 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-200 mt-2"
              type="button"
              disabled
              aria-disabled="true"
            >
              <Heart className="w-4 h-4 fill-white" />
              Sign in
            </button>
          </div>

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
