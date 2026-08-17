import { useState } from 'react'
import { Sparkles, ChevronDown, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeading from '@/components/ui/SectionHeading'
import { cn } from '@/lib/utils'

const occasions = ['Birthday', "Valentine's", 'Anniversary', 'Friendship', 'Festival']
const relationships = ['Girlfriend', 'Boyfriend', 'Best Friend', 'Sister', 'Mom']
const moods = ['Romantic', 'Funny', 'Emotional', 'Sweet', 'Nostalgic']

// Pre-written example messages shown in the interactive demo.
// No AI API is called — this is a visual demonstration only.
const sampleMessages: Record<string, string> = {
  'Birthday-Girlfriend-Romantic':
    'Every day with you feels like a celebration, but today is your day to truly shine. You came into my life and turned every ordinary moment into something magical. Here\'s to you — my favorite person, my greatest adventure. Happy Birthday, love. 💕',
  'Birthday-Girlfriend-Sweet':
    'You have no idea how much light you bring into my world. Watching you grow, laugh and dream is the best part of my every single day. Happy Birthday to the person who makes me smile without even trying. 🎂',
  'Birthday-Best Friend-Funny':
    'Happy Birthday to my favorite person to embarrass in public! Joking. (Mostly.) You\'ve been my partner in crime, my 3 AM advice hotline and my favorite kind of chaos. Here\'s to another year of terrible decisions together. 🎉',
  'default':
    'You deserve every beautiful thing this world has to offer — and today is the perfect reminder of that. Wishing you a day filled with joy, love and all the little moments that make life magical. 💫',
}

interface SelectFieldProps {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}

function SelectField({ label, options, value, onChange }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-warm-300 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-700 pr-8 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-200 cursor-pointer"
          aria-label={label}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  )
}

export default function AIShowcase() {
  const [occasion, setOccasion] = useState('Birthday')
  const [relationship, setRelationship] = useState('Girlfriend')
  const [mood, setMood] = useState('Romantic')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResult, setShowResult] = useState(true)

  const key = `${occasion}-${relationship}-${mood}`
  const sampleText = sampleMessages[key] ?? sampleMessages['default']

  // Cycles through the pre-written sample to show the interaction.
  // No AI API is called.
  const handlePreview = () => {
    setIsAnimating(true)
    setShowResult(false)
    setTimeout(() => {
      setIsAnimating(false)
      setShowResult(true)
    }, 1000)
  }

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-cream-50"
      aria-label="AI writing assistant preview"
    >
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          eyebrow="AI-powered"
          title="Don't know what to write?"
          subtitle="Let AI help you find the right words. Just tell us the occasion, relationship and mood."
          className="mb-12 lg:mb-16"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* AI card - controls */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-neutral-800">
                  AI Message Writer
                </h3>
                <p className="text-xs text-neutral-400">Available inside the gift editor</p>
              </div>
            </div>

            <div className="space-y-4">
              <SelectField
                label="Occasion"
                options={occasions}
                value={occasion}
                onChange={setOccasion}
              />
              <SelectField
                label="Relationship"
                options={relationships}
                value={relationship}
                onChange={setRelationship}
              />
              <SelectField
                label="Mood"
                options={moods}
                value={mood}
                onChange={setMood}
              />
            </div>

            {/* Preview button — shows pre-written samples, no real AI */}
            <button
              onClick={handlePreview}
              disabled={isAnimating}
              className={cn(
                'mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
                isAnimating
                  ? 'bg-violet-100 text-violet-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-sm'
              )}
              aria-busy={isAnimating}
              aria-label="Preview a sample AI message (demo only)"
            >
              {isAnimating ? (
                <>
                  <div className="w-4 h-4 border-2 border-violet-300 border-t-violet-500 rounded-full animate-spin" />
                  Loading example...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Preview Sample Message
                </>
              )}
            </button>

            {/* Clear demo disclosure */}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400">
              <Info className="w-3 h-3 flex-shrink-0" />
              Interactive demo — AI writes your message inside the gift editor
            </p>
          </div>

          {/* Sample result */}
          <div className="space-y-4">
            <div
              className={cn(
                'bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-card transition-all duration-500',
                showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-violet-600 uppercase tracking-widest bg-violet-50 px-2.5 py-1 rounded-full">
                  ✨ Sample message
                </span>
              </div>
              <p className="font-serif text-base text-neutral-700 leading-relaxed italic">
                "{sampleText}"
              </p>
              <div className="mt-4 pt-4 border-t border-warm-200 flex items-center gap-2">
                <span className="text-xs text-neutral-400">
                  For: {occasion} · {relationship} · {mood}
                </span>
              </div>
            </div>

            {/* CTA — routes to /create which explains AI is coming */}
            <Link
              to="/create"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm px-6 py-3.5 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
              aria-label="Go to gift creation — AI writing is available inside the editor"
            >
              <Sparkles className="w-4 h-4" />
              Create With AI
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
