import { Cake, Heart, Infinity, Users, Diamond, Star } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import OccasionCard from '@/components/sections/OccasionCard'
import CTASection from '@/components/sections/CTASection'

const occasions = [
  {
    icon: Cake,
    emoji: '🎂',
    title: 'Birthday',
    description: 'Make their day feel extra special.',
    gradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
    iconColor: 'bg-gradient-to-br from-amber-400 to-orange-500',
  },
  {
    icon: Heart,
    emoji: '🌹',
    title: "Valentine's",
    description: 'Turn your feelings into a surprise.',
    gradient: 'bg-gradient-to-br from-rose-50 to-pink-50',
    iconColor: 'bg-gradient-to-br from-rose-400 to-rose-600',
  },
  {
    icon: Infinity,
    emoji: '💑',
    title: 'Anniversary',
    description: "Celebrate the story you've built together.",
    gradient: 'bg-gradient-to-br from-purple-50 to-violet-50',
    iconColor: 'bg-gradient-to-br from-purple-400 to-violet-500',
  },
  {
    icon: Users,
    emoji: '🤝',
    title: 'Friendship',
    description: 'For the person who makes life better.',
    gradient: 'bg-gradient-to-br from-sky-50 to-blue-50',
    iconColor: 'bg-gradient-to-br from-sky-400 to-blue-500',
  },
  {
    icon: Diamond,
    emoji: '💍',
    title: 'Wedding',
    description: "Create an invitation they'll remember.",
    gradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    iconColor: 'bg-gradient-to-br from-emerald-400 to-teal-500',
  },
  {
    icon: Star,
    emoji: '🪔',
    title: 'Festival',
    description: 'Send something more personal than a greeting.',
    gradient: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    iconColor: 'bg-gradient-to-br from-yellow-400 to-amber-500',
  },
]

export default function OccasionsPage() {
  return (
    <>
      <div
        className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-center"
        style={{ background: 'linear-gradient(135deg, #fdf8ef 0%, #fff1f2 100%)' }}
      >
        <SectionHeading
          eyebrow="Occasions"
          title="Made for every special moment."
          subtitle="Choose the occasion that matters most. Each one is crafted to help you express exactly how you feel."
        />
      </div>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {occasions.map((occasion) => (
              <OccasionCard key={occasion.title} {...occasion} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to create something special?"
        subtitle="Pick your occasion and start building your gift."
      />
    </>
  )
}
