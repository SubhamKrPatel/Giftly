import { Link } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
import DecorativeElements from './DecorativeElements'

interface CTASectionProps {
  title?: string
  subtitle?: string
  primaryCTA?: string
  primaryHref?: string
}

export default function CTASection({
  title = 'Your next surprise starts here.',
  subtitle = 'Create something they can open, experience and remember.',
  primaryCTA = 'Create Your Gift',
  primaryHref = '/create',
}: CTASectionProps) {
  return (
    <section
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #fff1f2 0%, #fdf4f5 40%, #fdf8ef 100%)',
      }}
      aria-label="Call to action"
    >
      <DecorativeElements />

      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, #fda4af 0%, transparent 50%), radial-gradient(circle at 80% 50%, #f9a8d4 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-glow animate-pulse-soft">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-neutral-800 leading-tight text-balance mb-6">
          {title}
        </h2>

        <p className="text-lg sm:text-xl text-neutral-500 leading-relaxed mb-10 max-w-xl mx-auto">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={primaryHref}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-lg px-10 py-4 rounded-full hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-glow w-full sm:w-auto justify-center"
          >
            <Heart className="w-5 h-5 fill-white" />
            {primaryCTA}
          </Link>
          <Link
            to="/occasions"
            className="inline-flex items-center gap-2 text-neutral-600 font-semibold text-base hover:text-rose-600 transition-colors duration-200 px-4 py-2"
          >
            See all occasions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
