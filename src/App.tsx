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
const GiftEditorPage  = lazy(() => import('@/pages/GiftEditorPage'))
const OccasionsPage   = lazy(() => import('@/pages/OccasionsPage'))
const WeddingPage     = lazy(() => import('@/pages/WeddingPage'))
const HowItWorksPage  = lazy(() => import('@/pages/HowItWorksPage'))
const LoginPage       = lazy(() => import('@/pages/LoginPage'))
const SignupPage      = lazy(() => import('@/pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('@/pages/ResetPasswordPage'))
const DashboardPage   = lazy(() => import('@/pages/DashboardPage'))
const RecipientGiftPage = lazy(() => import('@/pages/RecipientGiftPage'))

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps everything so useAuth() works in Navbar, pages, etc. */}
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* ── Protected create wizard & gift editor — standalone full-page flows ── */}
            <Route
              path="/create"
              element={
                <RequireAuth>
                  <CreatePage />
                </RequireAuth>
              }
            />
            <Route
              path="/create/:giftId"
              element={
                <RequireAuth>
                  <GiftEditorPage />
                </RequireAuth>
              }
            />
            <Route
              path="/gift-preview/:giftId"
              element={
                <RequireAuth>
                  <RecipientGiftPage />
                </RequireAuth>
              }
            />

            {/* ── Public anonymous recipient experience route (Part 7) ── */}
            <Route
              path="/g/:publicSlug"
              element={<RecipientGiftPage />}
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
                        <Route
                          path="/forgot-password"
                          element={
                            <RequireGuest>
                              <ForgotPasswordPage />
                            </RequireGuest>
                          }
                        />
                        <Route
                          path="/reset-password"
                          element={<ResetPasswordPage />}
                        />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                </div>
              }
              path="/*"
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
