import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Heart, LogOut, User, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { brand } from '@/config/brand'
import { useAuth } from '@/context/AuthContext'

const publicNavLinks = [
  { label: 'Occasions', href: '/occasions' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Wedding Cards', href: '/wedding' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  // Determine where "Create Gift" should route
  const createHref = user ? '/create' : '/login'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-warm-200'
          : 'bg-transparent'
      )}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          aria-label={`${brand.name} home`}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-glow transition-shadow duration-300">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-serif text-xl font-semibold text-neutral-800 tracking-tight">
            {brand.name}
          </span>
        </Link>

        {/* Desktop nav — public links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {publicNavLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                  location.pathname === link.href
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-neutral-600 hover:text-rose-600 hover:bg-rose-50'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions — auth-aware */}
        <div className="hidden md:flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                // ── Authenticated ──
                <>
                  <Link
                    to="/dashboard"
                    className={cn(
                      'flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200',
                      location.pathname === '/dashboard'
                        ? 'text-rose-600 bg-rose-50'
                        : 'text-neutral-600 hover:text-rose-600 hover:bg-rose-50'
                    )}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/create"
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-glow"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    Create Gift
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors duration-200"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                // ── Not authenticated ──
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-neutral-600 hover:text-rose-600 transition-colors duration-200 px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to={createHref}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-glow"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    Create Your Gift
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-200"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!isOpen}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-warm-200 px-4 py-4 space-y-1">
          {publicNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'block px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200',
                location.pathname === link.href
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-neutral-600 hover:text-rose-600 hover:bg-rose-50'
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-warm-200 flex flex-col gap-2">
            {!loading && (
              <>
                {user ? (
                  // ── Authenticated mobile ──
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-neutral-600 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors duration-200"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/create"
                      className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold px-5 py-3 rounded-full"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      Create Gift
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-neutral-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  // ── Not authenticated mobile ──
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-neutral-600 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      Login
                    </Link>
                    <Link
                      to={createHref}
                      className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold px-5 py-3 rounded-full"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      Create Your Gift
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
