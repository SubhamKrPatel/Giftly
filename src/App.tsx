import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Pages
import HomePage from '@/pages/HomePage'
const CreatePage = lazy(() => import('@/pages/CreatePage'))
const OccasionsPage = lazy(() => import('@/pages/OccasionsPage'))
const WeddingPage = lazy(() => import('@/pages/WeddingPage'))
const HowItWorksPage = lazy(() => import('@/pages/HowItWorksPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-cream-50">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/occasions" element={<OccasionsPage />} />
              <Route path="/wedding" element={<WeddingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
