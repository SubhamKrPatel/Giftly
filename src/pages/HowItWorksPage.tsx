import HowItWorks from '@/components/sections/HowItWorks'
import CTASection from '@/components/sections/CTASection'
import SectionHeading from '@/components/ui/SectionHeading'
import { brand } from '@/config/brand'

export default function HowItWorksPage() {
  const faqs = [
    {
      q: `Is ${brand.name} free to use?`,
      a: 'You can create and preview your gift for free. Sharing with a private link is available on our free and premium plans.',
    },
    {
      q: 'What can I add to a gift?',
      a: 'Photos, heartfelt messages, videos, voice notes, music and more. Every element can be personalized to tell your story.',
    },
    {
      q: 'How does the recipient open the gift?',
      a: 'You share a private link or QR code. They simply tap or scan to open a beautiful, interactive experience on any device.',
    },
    {
      q: `Can I use ${brand.name} for wedding invitations?`,
      a: `Yes! ${brand.name} has a dedicated Wedding Cards feature for creating elegant digital invitations you can share instantly.`,
    },
  ]

  return (
    <>
      <div
        className="pt-28 pb-8 px-4 sm:px-6 lg:px-8 text-center"
        style={{
          background: 'linear-gradient(180deg, #fdf8ef 0%, #fff1f2 100%)',
        }}
      >
        <SectionHeading
          eyebrow="How it works"
          title="From memory to surprise in minutes."
          subtitle="Creating a heartfelt digital gift has never been easier. Three simple steps is all it takes."
        />
      </div>

      <HowItWorks />

      {/* FAQ-style extra content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-cream-50">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-serif text-2xl font-semibold text-neutral-800 text-center mb-8">
            Frequently asked questions
          </h2>
          {faqs.map((item) => (
            <div
              key={item.q}
              className="bg-white rounded-2xl p-6 border border-warm-200 shadow-card"
            >
              <h3 className="font-serif text-lg font-semibold text-neutral-800 mb-2">
                {item.q}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  )
}
