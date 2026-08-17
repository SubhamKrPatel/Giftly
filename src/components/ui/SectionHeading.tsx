import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
  titleClassName?: string
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  centered = true,
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn(centered && 'text-center', className)}>
      {eyebrow && (
        <p className="inline-flex items-center gap-2 text-rose-500 text-xs font-semibold uppercase tracking-widest mb-3">
          <span className="w-6 h-px bg-rose-400" />
          {eyebrow}
          <span className="w-6 h-px bg-rose-400" />
        </p>
      )}
      <h2
        className={cn(
          'font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-neutral-800 leading-tight text-balance',
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto text-balance">
          {subtitle}
        </p>
      )}
    </div>
  )
}
