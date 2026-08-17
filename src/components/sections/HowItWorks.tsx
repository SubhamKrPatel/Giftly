import SectionHeading from '@/components/ui/SectionHeading'
import StepCard from './StepCard'

const steps = [
  {
    number: '01',
    title: 'Choose',
    description: 'Pick an occasion and a beautiful template that matches the mood.',
    emoji: '🎨',
  },
  {
    number: '02',
    title: 'Personalize',
    description: 'Add photos, words, music, videos and memories. Make it uniquely yours.',
    emoji: '✍️',
  },
  {
    number: '03',
    title: 'Surprise',
    description: 'Share your creation with a private link or QR code. Watch them smile.',
    emoji: '🎁',
  },
]

export default function HowItWorks() {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(180deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
      }}
      aria-label="How it works"
    >
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          eyebrow="Simple process"
          title="From memory to surprise in minutes."
          subtitle="Creating a heartfelt digital gift has never been easier."
          className="mb-14 lg:mb-20"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 relative">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              {...step}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
