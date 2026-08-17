import HeroSection from '@/components/sections/HeroSection'
import SocialProof from '@/components/sections/SocialProof'
import OccasionGrid from '@/components/sections/OccasionGrid'
import HowItWorks from '@/components/sections/HowItWorks'
import AIShowcase from '@/components/sections/AIShowcase'
import WeddingShowcase from '@/components/sections/WeddingShowcase'
import CTASection from '@/components/sections/CTASection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SocialProof />
      <OccasionGrid />
      <HowItWorks />
      <AIShowcase />
      <WeddingShowcase />
      <CTASection />
    </>
  )
}
