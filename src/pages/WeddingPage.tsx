
import WeddingShowcase from '@/components/sections/WeddingShowcase'
import CTASection from '@/components/sections/CTASection'
import SectionHeading from '@/components/ui/SectionHeading'

export default function WeddingPage() {
  return (
    <>
      <div
        className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-center"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #fdf4f5 100%)',
        }}
      >
        <SectionHeading
          eyebrow="Wedding Cards"
          title="Beautiful wedding invitations. Reimagined."
          subtitle="Create a modern digital wedding invitation with your story, photos, date, venue and personalized message."
          titleClassName="text-emerald-900"
        />
      </div>

      <WeddingShowcase />

      <CTASection
        title="Create your wedding invitation."
        subtitle="Beautiful, personal, and ready to share in minutes."
        primaryCTA="Get Started"
        primaryHref="/create"
      />
    </>
  )
}
