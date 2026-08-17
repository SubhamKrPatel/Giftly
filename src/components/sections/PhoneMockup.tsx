import { Heart, Music, Image, MessageCircle } from 'lucide-react'

export default function PhoneMockup() {
  return (
    <div
      className="relative animate-float"
      aria-label="Preview of a digital gift on a smartphone"
      role="img"
    >
      {/* Glow behind phone */}
      <div
        className="absolute inset-0 -z-10 blur-3xl opacity-30 scale-90"
        style={{
          background:
            'radial-gradient(ellipse at center, #fda4af 0%, #f9a8d4 50%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      {/* Phone frame */}
      <div
        className="relative w-64 sm:w-72 lg:w-80 bg-neutral-900 rounded-[3rem] shadow-phone overflow-hidden"
        style={{
          boxShadow:
            '0 30px 60px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Status bar */}
        <div className="bg-neutral-900 px-6 pt-4 pb-2 flex items-center justify-between">
          <span className="text-white text-xs font-medium">9:41</span>
          <div className="w-20 h-5 bg-neutral-800 rounded-full" aria-hidden="true" />
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="text-white text-xs">●●●</span>
          </div>
        </div>

        {/* Gift screen content */}
        <div
          className="mx-2 mb-2 rounded-[2.25rem] overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #fff1f2 0%, #fdf4f5 40%, #fdf8ef 100%)',
          }}
        >
          {/* Gift header */}
          <div className="px-5 pt-6 pb-4 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-glow">
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
            </div>
            <p className="text-xs text-rose-500 font-semibold uppercase tracking-widest mb-1">
              A gift for you
            </p>
            <h3 className="font-serif text-xl font-semibold text-neutral-800">
              Happy Birthday,
            </h3>
            <h3 className="font-serif text-xl font-semibold text-rose-600 italic">
              Priya ✨
            </h3>
          </div>

          {/* Photo memories strip */}
          <div className="px-4 mb-4">
            <div className="flex gap-2 overflow-hidden">
              {/* Memory card 1 */}
              <div className="flex-1 h-20 rounded-xl overflow-hidden relative flex-shrink-0">
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #fda4af 0%, #f9a8d4 100%)',
                  }}
                >
                  <div className="text-center">
                    <Image className="w-5 h-5 text-white mx-auto mb-0.5" />
                    <span className="text-white text-xs font-medium">Memory 1</span>
                  </div>
                </div>
              </div>
              {/* Memory card 2 */}
              <div className="flex-1 h-20 rounded-xl overflow-hidden relative flex-shrink-0">
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)',
                  }}
                >
                  <div className="text-center">
                    <Image className="w-5 h-5 text-white mx-auto mb-0.5" />
                    <span className="text-white text-xs font-medium">Memory 2</span>
                  </div>
                </div>
              </div>
              {/* Memory card 3 */}
              <div className="flex-1 h-20 rounded-xl overflow-hidden relative flex-shrink-0">
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)',
                  }}
                >
                  <div className="text-center">
                    <Image className="w-5 h-5 text-white mx-auto mb-0.5" />
                    <span className="text-white text-xs font-medium">Memory 3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message card */}
          <div className="mx-4 mb-4 bg-white rounded-2xl p-4 shadow-card border border-warm-200">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-600 mb-1">Message</p>
                <p className="text-xs text-neutral-500 leading-relaxed italic font-serif">
                  "You make every ordinary day feel like a celebration. Wishing you all the joy you deserve..."
                </p>
              </div>
            </div>
          </div>

          {/* Music indicator */}
          <div className="mx-4 mb-5 flex items-center gap-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl px-4 py-3 border border-rose-100">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-700 truncate">Tum Hi Ho</p>
              <div className="mt-1.5 h-1 bg-rose-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full" />
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
              <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div
        className="absolute -bottom-4 -left-6 bg-white rounded-2xl px-4 py-3 shadow-card border border-warm-200 animate-float-delayed"
        aria-hidden="true"
      >
        <p className="text-xs font-semibold text-neutral-600">✨ Gift delivered!</p>
        <p className="text-xs text-neutral-400">Opened just now</p>
      </div>

      {/* Floating hearts */}
      <div
        className="absolute -top-4 -right-4 text-2xl animate-float-slow"
        aria-hidden="true"
      >
        💝
      </div>
    </div>
  )
}
