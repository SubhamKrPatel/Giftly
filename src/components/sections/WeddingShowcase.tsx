import { Link } from 'react-router-dom'
import { MapPin, Calendar, Heart } from 'lucide-react'

// Elegant wedding invitation mockup — demonstrative content only
function WeddingInvitationMockup() {
  return (
    <div className="relative flex justify-center">
      {/* Glow */}
      <div
        className="absolute inset-0 blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, #86efac 0%, #4ade80 50%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      {/* Invitation card */}
      <div
        className="relative w-72 sm:w-80 bg-white rounded-3xl overflow-hidden shadow-phone border border-emerald-100"
        style={{
          boxShadow: '0 25px 50px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)',
        }}
        aria-label="Sample wedding invitation mockup"
        role="img"
      >
        {/* Top decorative band */}
        <div
          className="h-3"
          style={{
            background: 'linear-gradient(90deg, #4ade80, #86efac, #34d399, #6ee7b7)',
          }}
        />

        {/* Invitation content */}
        <div className="px-8 py-8 text-center">
          {/* Floral decoration */}
          <div className="text-4xl mb-4" aria-hidden="true">🌿</div>

          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em] mb-2">
            Together with their families
          </p>

          <h3 className="font-serif text-2xl font-semibold text-neutral-800 mb-1">
            Arjun &amp; Meera
          </h3>

          <p className="font-serif text-sm italic text-neutral-500 mb-6">
            request the pleasure of your company
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6" aria-hidden="true">
            <div className="flex-1 h-px bg-emerald-100" />
            <div className="text-emerald-400 text-xl">❧</div>
            <div className="flex-1 h-px bg-emerald-100" />
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-3">
              <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-emerald-800">Saturday, 21 November 2026</p>
                <p className="text-xs text-emerald-600">6:00 PM onwards</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-3">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-emerald-800">Your Wedding Venue</p>
                <p className="text-xs text-emerald-600">City, State</p>
              </div>
            </div>
          </div>

          {/* View invite button — decorative, not functional */}
          <div className="mt-6 w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 select-none">
            View Invitation ✨
          </div>

          <p className="mt-4 text-xs text-neutral-400 italic font-serif">
            "Two hearts, one beautiful beginning."
          </p>
        </div>

        {/* Bottom decorative band */}
        <div
          className="h-2"
          style={{
            background: 'linear-gradient(90deg, #6ee7b7, #34d399, #86efac, #4ade80)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Floating elements */}
      <div className="absolute -top-3 -right-3 text-2xl animate-float" aria-hidden="true">
        💍
      </div>
      <div className="absolute -bottom-3 -left-3 text-xl animate-float-delayed" aria-hidden="true">
        🌸
      </div>
    </div>
  )
}

export default function WeddingShowcase() {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 30%, #fdf4f5 70%, #fff1f2 100%)',
      }}
      aria-label="Wedding invitation feature"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Mockup */}
          <div className="order-2 lg:order-1">
            <WeddingInvitationMockup />
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 space-y-6 text-center lg:text-left">
            <p className="inline-flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-widest">
              <span className="w-6 h-px bg-emerald-400" />
              Wedding Cards
              <span className="w-6 h-px bg-emerald-400" />
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-neutral-800 leading-tight text-balance">
              Beautiful wedding invitations.{' '}
              <span className="italic text-emerald-600">Reimagined.</span>
            </h2>

            <p className="text-base sm:text-lg text-neutral-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Create a modern digital wedding invitation with your story, photos, date, venue and personalized message. Share it instantly with your guests.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: '📸', text: 'Add your photos' },
                { emoji: '📍', text: 'Venue & directions' },
                { emoji: '💌', text: 'Personal message' },
                { emoji: '🔗', text: 'Easy guest sharing' },
              ].map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-2.5 bg-white/80 rounded-xl px-4 py-3 border border-emerald-100"
                >
                  <span className="text-lg" aria-hidden="true">
                    {feature.emoji}
                  </span>
                  <span className="text-sm font-medium text-neutral-700">{feature.text}</span>
                </div>
              ))}
            </div>

            <Link
              to="/wedding"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-sm"
            >
              <Heart className="w-4 h-4 fill-white" />
              Explore Wedding Cards
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
