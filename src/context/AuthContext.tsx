import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Supabase Auth user. null while loading or logged out. */
  user: User | null
  /** Active session. null while loading or logged out. */
  session: Session | null
  /** Profile row from public.profiles. null while loading or not found. */
  profile: Profile | null
  /** True while the initial session is being restored from storage. */
  loading: boolean
  /** True while the profile is being fetched from the database. */
  profileLoading: boolean
  /** Re-fetches the profile from Supabase (e.g. after update). */
  refreshProfile: () => Promise<void>
  /** Sign out and clear all auth state. */
  signOut: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // ── Fetch profile for the current user ──
  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (expected for brand-new users whose trigger
        // hasn't fired yet — safe to ignore)
        console.error('[AuthContext] profile fetch error:', error.message)
      }

      setProfile(data ?? null)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  // ── Public refreshProfile ──
  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  // ── Sign out ──
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }, [])

  // ── Session restoration + real-time auth state changes ──
  useEffect(() => {
    // 1. Get existing session from storage (prevents auth flicker on refresh)
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession)
      setUser(existingSession?.user ?? null)
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // 2. Subscribe to future auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        profileLoading,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
