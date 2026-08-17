import { Sparkles } from 'lucide-react'

export default function SocialProof() {
  return (
    <section
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #fdf4f5 50%, #fdf8ef 100%)',
      }}
      aria-label="Emotional statement"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-glow">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Emotional headline */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-neutral-800 leading-tight text-balance mb-6">
          Some moments deserve{' '}
          <span className="italic text-rose-500">more than a message.</span>
        </h2>

        <p className="text-lg sm:text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto mb-10">
          Create something personal, beautiful and unforgettable.
        </p>

        {/* Visual storytelling cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-10">
          {[
            {
              emoji: '📸',
              title: 'Your memories',
              description: 'Photos and moments only you two share.',
            },
            {
              emoji: '💌',
              title: 'Your words',
              description: 'Heartfelt messages that stay forever.',
            },
            {
              emoji: '🎵',
              title: 'Your soundtrack',
              description: 'The song that always reminds you of them.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-warm-200 shadow-card text-left"
            >
              <div className="text-3xl mb-3" role="img" aria-label={item.title}>
                {item.emoji}
              </div>
              <h3 className="font-serif text-lg font-semibold text-neutral-800 mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
