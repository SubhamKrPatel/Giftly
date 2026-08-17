import { Gift } from 'lucide-react'
import PlaceholderPage from '@/components/ui/PlaceholderPage'

export default function CreatePage() {
  return (
    <PlaceholderPage
      icon={Gift}
      emoji="🎁"
      title="Gift creation is coming next."
      subtitle="Something beautiful is being built."
      description="The gift editor is coming in the next version. You'll be able to add photos, messages, music, videos and more — and share it all with one link."
      badge="Coming soon"
      ctaLabel="Explore occasions"
      ctaHref="/occasions"
    />
  )
}
