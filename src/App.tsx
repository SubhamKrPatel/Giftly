import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { RequireAuth, RequireGuest } from '@/components/auth/RouteGuards'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Pages — eagerly load homepage; lazy-load everything else
import HomePage from '@/pages/HomePage'

const CreatePage      = lazy(() => import('@/pages/CreatePage'))
const OccasionsPage   = lazy(() => import('@/pages/OccasionsPage'))
const WeddingPage     = lazy(() => import('@/pages/WeddingPage'))
const HowItWorksPage  = lazy(() => import('@/pages/HowItWorksPage'))
const LoginPage       = lazy(() => import('@/pages/LoginPage'))
const SignupPage      = lazy(() => import('@/pages/SignupPage'))
const DashboardPage   = lazy(() => import('@/pages/DashboardPage'))

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps everything so useAuth() works in Navbar, pages, etc. */}
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* ── Public routes (with shared Navbar + Footer) ── */}
            <Route
              element={
                <div className="min-h-screen flex flex-col bg-cream-50">
                  <Navbar />
                  <main className="flex-1">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/occasions" element={<OccasionsPage />} />
                        <Route path="/wedding" element={<WeddingPage />} />
                        <Route path="/how-it-works" element={<HowItWorksPage />} />

                        {/* Create — accessible publicly but prompts login if not authed */}
                        <Route path="/create" element={<CreatePage />} />

                        {/* Guest-only routes — redirect to /dashboard if already logged in */}
                        <Route
                          path="/login"
                          element={
                            <RequireGuest>
                              <LoginPage />
                            </RequireGuest>
                          }
                        />
                        <Route
                          path="/signup"
                          element={
                            <RequireGuest>
                              <SignupPage />
                            </RequireGuest>
                          }
                        />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                </div>
              }
              path="/*"
            />

            {/* ── Protected dashboard — no public Navbar/Footer ── */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
