import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  external?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-sm hover:shadow-glow active:scale-95',
  secondary:
    'bg-cream-100 text-rose-700 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 active:scale-95',
  outline:
    'bg-transparent text-rose-600 border border-rose-400 hover:bg-rose-50 active:scale-95',
  ghost:
    'bg-transparent text-neutral-600 hover:text-rose-600 hover:bg-rose-50 active:scale-95',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm px-4 py-2 gap-1.5',
  md: 'text-sm px-5 py-2.5 gap-2',
  lg: 'text-base px-7 py-3.5 gap-2.5',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      href,
      external,
      fullWidth,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      className
    )

    if (href) {
      if (external) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className={baseStyles}>
            {children}
          </a>
        )
      }
      return (
        <Link to={href} className={baseStyles}>
          {children}
        </Link>
      )
    }

    return (
      <button ref={ref} className={baseStyles} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
