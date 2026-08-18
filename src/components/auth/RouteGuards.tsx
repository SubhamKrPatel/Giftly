import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { ReactNode } from 'react'

/**
 * Wraps a route that requires authentication.
 * - While session is loading → show spinner (prevents flicker).
 * - Unauthenticated → redirect to /login, preserving the intended path.
 * - Authenticated → render children.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

/**
 * Wraps a route that must NOT be accessed when authenticated (login, signup).
 * - While session is loading → show spinner.
 * - Authenticated → redirect to /dashboard.
 * - Not authenticated → render children.
 */
export function RequireGuest({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
