export default function DecorativeElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Hearts */}
      <div className="absolute top-24 left-8 sm:left-16 text-rose-300 animate-float text-2xl opacity-60">
        ♥
      </div>
      <div className="absolute top-40 right-8 sm:right-24 text-rose-200 animate-float-delayed text-lg opacity-50">
        ♥
      </div>
      <div className="absolute bottom-32 left-12 text-rose-200 animate-float-slow text-xl opacity-40">
        ♥
      </div>
      <div className="absolute bottom-48 right-16 sm:right-32 text-rose-300 animate-float text-sm opacity-50">
        ♥
      </div>

      {/* Sparkle stars */}
      <div className="absolute top-36 left-1/4 animate-sparkle">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z"
            fill="#fda4af"
            opacity="0.5"
          />
        </svg>
      </div>
      <div
        className="absolute top-60 right-1/3 animate-sparkle"
        style={{ animationDelay: '0.8s' }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z"
            fill="#f9a8d4"
            opacity="0.4"
          />
        </svg>
      </div>
      <div
        className="absolute bottom-40 left-1/3 animate-sparkle"
        style={{ animationDelay: '1.4s' }}
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z"
            fill="#fecdd3"
            opacity="0.5"
          />
        </svg>
      </div>
      <div
        className="absolute top-1/2 right-12 animate-sparkle hidden sm:block"
        style={{ animationDelay: '0.4s' }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z"
            fill="#fda4af"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Floating dots */}
      <div className="absolute top-1/3 left-6 w-2 h-2 rounded-full bg-rose-200 animate-pulse-soft opacity-50" />
      <div
        className="absolute top-2/3 right-8 w-3 h-3 rounded-full bg-pink-200 animate-pulse-soft opacity-40"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute top-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse-soft opacity-60"
        style={{ animationDelay: '0.5s' }}
      />
    </div>
  )
}
