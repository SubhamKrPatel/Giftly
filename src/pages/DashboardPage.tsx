import { Link } from 'react-router-dom'
import { Plus, Gift, LogOut, User, Heart, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { brand } from '@/config/brand'
import { useGifts } from '@/lib/hooks/useGifts'
import type { GiftWithDetails } from '@/lib/database.types'
import ProfileModal from '@/components/dashboard/ProfileModal'
import GiftCard from '@/components/dashboard/GiftCard'
import DeleteGiftDialog from '@/components/dashboard/DeleteGiftDialog'

export default function DashboardPage() {
  const { user, profile, profileLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Gift deletion state
  const [giftToDelete, setGiftToDelete] = useState<GiftWithDetails | null>(null)

  // Data hook
  const { gifts, loading: giftsLoading, error: giftsError, refetch: refetchGifts, deleteGift } = useGifts()

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there'

  async function handleSignOut() {
    setLoggingOut(true)
    await signOut()
    navigate('/', { replace: true })
  }

  async function handleConfirmDelete() {
    if (!giftToDelete) return
    await deleteGift(giftToDelete.id)
    setGiftToDelete(null)
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 60%, #fdf4f5 100%)',
      }}
    >
      {/* Dashboard header — replaces the public Navbar on this page */}
      <header className="bg-white/80 backdrop-blur-md border-b border-warm-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-serif text-xl font-semibold text-neutral-800 tracking-tight">
              {brand.name}
            </span>
          </Link>

          {/* Right — user controls */}
          <div className="flex items-center gap-2">
            {profileLoading ? (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <>
                {/* Profile button */}
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-rose-50 transition-all duration-200"
                  aria-label="Open profile"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{displayName}</span>
                </button>

                {/* Logout button */}
                <button
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-rose-50 transition-all duration-200 disabled:opacity-50"
                  aria-label="Sign out"
                >
                  {loggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Page heading & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-800">
              Your Gifts
            </h1>
            <p className="text-neutral-500 mt-1 text-sm sm:text-base">
              Create something special for someone you love.
            </p>
          </div>

          <Link
            to="/create"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-sm px-6 py-3 rounded-full hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-glow self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Gift</span>
          </Link>
        </div>

        {/* Loading state */}
        {giftsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-white/60 border border-warm-200 animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="h-20 bg-warm-100 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-warm-200 rounded-full w-3/4" />
                  <div className="h-3 bg-warm-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!giftsLoading && giftsError && (
          <div className="bg-white rounded-3xl p-8 border border-rose-200 text-center max-w-md mx-auto my-8 shadow-card">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-neutral-800 mb-1">
              Unable to load your gifts
            </h3>
            <p className="text-sm text-neutral-500 mb-6">{giftsError}</p>
            <button
              onClick={refetchGifts}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try again</span>
            </button>
          </div>
        )}

        {/* Gifts Grid */}
        {!giftsLoading && !giftsError && gifts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                onDeleteClick={(selectedGift) => setGiftToDelete(selectedGift)}
              />
            ))}
          </div>
        )}

        {/* Empty state (when 0 gifts exist) */}
        {!giftsLoading && !giftsError && gifts.length === 0 && (
          <div
            className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-3xl border-2 border-dashed border-warm-300 bg-white/60"
            aria-label="No gifts yet"
          >
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-5">
              <Gift className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-neutral-800 mb-2">
              You haven't created a gift yet.
            </h2>
            <p className="text-sm text-neutral-500 max-w-xs leading-relaxed mb-6">
              Your first surprise is only a few minutes away.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-glow"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Create Your First Gift</span>
            </Link>
          </div>
        )}
      </main>

      {/* Delete confirmation dialog */}
      <DeleteGiftDialog
        isOpen={Boolean(giftToDelete)}
        giftTitle={giftToDelete?.title || `Gift for ${giftToDelete?.recipient_name}`}
        onClose={() => setGiftToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Profile modal */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  )
}
