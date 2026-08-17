import { Cake, Heart, Infinity, Users, Diamond, Star } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import OccasionCard from './OccasionCard'
import { brand } from '@/config/brand'

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

export default function OccasionGrid() {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-cream-50"
      aria-label="Occasions"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Every occasion"
          title="Made for every special moment."
          subtitle={`Whether it's a birthday surprise or a wedding invitation, ${brand.name} helps you create something beautiful for every important day.`}
          className="mb-12 lg:mb-16"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {occasions.map((occasion) => (
            <OccasionCard key={occasion.title} {...occasion} />
          ))}
        </div>
      </div>
    </section>
  )
}
