interface StepCardProps {
  number: string
  title: string
  description: string
  emoji: string
  isLast?: boolean
}

export default function StepCard({ number, title, description, emoji, isLast }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center relative">
      {/* Connector line (hidden on last) */}
      {!isLast && (
        <div
          className="hidden lg:block absolute top-12 left-[calc(50%+3rem)] right-0 h-px"
          style={{
            background: 'linear-gradient(to right, #fda4af, transparent)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Step number + emoji circle */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl flex items-center justify-center border border-rose-100 shadow-card group-hover:shadow-card-hover transition-shadow duration-300">
          <span className="text-4xl" role="img" aria-hidden="true">
            {emoji}
          </span>
        </div>
        {/* Step number badge */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-white text-xs font-bold">{number}</span>
        </div>
      </div>

      <h3 className="font-serif text-xl font-semibold text-neutral-800 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  )
}
