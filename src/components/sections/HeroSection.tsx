import { Link } from 'react-router-dom'
import { Heart, Sparkles, ArrowRight } from 'lucide-react'
import PhoneMockup from './PhoneMockup'
import DecorativeElements from './DecorativeElements'

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={{
        background:
          'linear-gradient(145deg, #fdf8ef 0%, #fff1f2 45%, #fdf4f5 75%, #fefdf9 100%)',
      }}
      aria-label="Hero section"
    >
      {/* Decorative background blobs */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fda4af, transparent)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f9a8d4, transparent)' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fecdd3, transparent)' }}
        aria-hidden="true"
      />

      {/* Floating decorative elements */}
      <DecorativeElements />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-rose-100 rounded-full px-4 py-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-xs font-semibold text-rose-600 tracking-wide">
                Digital gifting, reimagined
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-neutral-800 leading-[1.1] text-balance">
                Create a surprise{' '}
                <span
                  className="italic"
                  style={{
                    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  they'll never
                </span>{' '}
                forget.
              </h1>
              <p className="text-lg sm:text-xl text-neutral-500 leading-relaxed max-w-lg mx-auto lg:mx-0 text-balance">
                Turn your favorite memories, heartfelt words and special moments into a beautiful digital gift.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link
                to="/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-base px-8 py-4 rounded-full hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-glow w-full sm:w-auto justify-center"
              >
                <Heart className="w-4 h-4 fill-white" />
                Create Your Gift
              </Link>
              <Link
                to="/occasions"
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-neutral-700 font-semibold text-base px-8 py-4 rounded-full border border-warm-300 hover:border-rose-300 hover:text-rose-600 hover:bg-white transition-all duration-200 w-full sm:w-auto justify-center"
              >
                Explore Occasions
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center lg:justify-start text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Free to create
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                Private by default
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Share with one link
              </span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center order-1 lg:order-2">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
