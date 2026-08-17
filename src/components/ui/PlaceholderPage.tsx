import { Link } from 'react-router-dom'
import { type LucideIcon, ArrowLeft, Heart } from 'lucide-react'

interface PlaceholderPageProps {
  icon: LucideIcon
  emoji: string
  title: string
  subtitle: string
  description: string
  badge?: string
  ctaLabel?: string
  ctaHref?: string
}

export default function PlaceholderPage({
  icon: Icon,
  emoji,
  title,
  subtitle,
  description,
  badge,
  ctaLabel = 'Go back home',
  ctaHref = '/',
}: PlaceholderPageProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center pt-16 px-4"
      style={{
        background: 'linear-gradient(145deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
      }}
    >
      <div className="max-w-lg w-full text-center py-20">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-rose-600 rounded-3xl flex items-center justify-center shadow-glow">
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 text-2xl">{emoji}</div>
          </div>
        </div>

        {/* Badge */}
        {badge && (
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-1.5 mb-4">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              {badge}
            </span>
          </div>
        )}

        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-800 mb-3 text-balance">
          {title}
        </h1>
        <p className="font-serif text-lg italic text-rose-500 mb-4">{subtitle}</p>
        <p className="text-neutral-500 leading-relaxed mb-8 max-w-sm mx-auto">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={ctaHref}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-glow"
          >
            <Heart className="w-4 h-4 fill-white" />
            {ctaLabel}
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-rose-600 font-medium text-sm transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
