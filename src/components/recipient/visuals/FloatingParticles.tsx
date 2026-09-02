import { useMemo } from 'react'
import type { ParticleType, VisualIntensity } from '@/lib/occasionThemes'

interface FloatingParticlesProps {
  particleType: ParticleType
  intensity: VisualIntensity
  palette: string[]
  isCompact?: boolean
}

interface ParticleConfig {
  id: number
  x: number // percentage
  y: number // percentage
  size: number
  color: string
  duration: number
  delay: number
  opacity: number
  rotation: number
}

export default function FloatingParticles({
  particleType,
  intensity,
  palette,
  isCompact = false,
}: FloatingParticlesProps) {
  // If intensity is minimal or particleType is none, render nothing
  if (intensity === 'minimal' || particleType === 'none') {
    return null
  }

  // Determine count based on intensity & compact mode
  const count = useMemo(() => {
    let base = 6
    if (intensity === 'subtle') base = isCompact ? 3 : 5
    if (intensity === 'medium') base = isCompact ? 5 : 8
    if (intensity === 'strong') base = isCompact ? 7 : 11
    return base
  }, [intensity, isCompact])

  // Deterministic seed-based particle generation to avoid re-render layout thrashing
  const particles: ParticleConfig[] = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const colorIndex = i % palette.length
      return {
        id: i,
        x: 8 + ((i * 37 + 13) % 84), // spread horizontally across 8% - 92%
        y: 10 + ((i * 43 + 19) % 80), // spread vertically
        size: isCompact ? 8 + (i % 3) * 3 : 12 + (i % 4) * 4,
        color: palette[colorIndex],
        duration: 7 + (i % 5) * 2, // 7s to 15s gentle float
        delay: (i % 4) * 1.5,
        opacity: intensity === 'subtle' ? 0.25 : intensity === 'medium' ? 0.35 : 0.45,
        rotation: (i * 45) % 360,
      }
    })
  }, [count, palette, intensity, isCompact])

  // Render specific SVG symbol based on particleType
  const renderParticleIcon = (type: ParticleType, color: string, size: number) => {
    switch (type) {
      case 'hearts':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        )

      case 'stars':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z" />
          </svg>
        )

      case 'petals':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C8 6 6 10 6 14a6 6 0 0012 0c0-4-2-8-6-12z" />
          </svg>
        )

      case 'confetti':
        // Alternate between rectangles and circles
        return (
          <div
            style={{
              width: size * 0.8,
              height: size * 0.8,
              backgroundColor: color,
              borderRadius: size % 2 === 0 ? '2px' : '9999px',
            }}
          />
        )

      case 'gold-dust':
      case 'lights':
      case 'sparkles':
      default:
        return (
          <div
            style={{
              width: size * 0.6,
              height: size * 0.6,
              backgroundColor: color,
              borderRadius: '9999px',
              boxShadow: `0 0 ${size * 0.8}px ${color}`,
            }}
          />
        )
    }
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute transition-opacity duration-700 motion-safe:animate-pulse-subtle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            transform: `rotate(${p.rotation}deg)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {renderParticleIcon(particleType, p.color, p.size)}
        </div>
      ))}
    </div>
  )
}
