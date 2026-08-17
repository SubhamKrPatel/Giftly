import { LayoutDashboard } from 'lucide-react'
import PlaceholderPage from '@/components/ui/PlaceholderPage'

export default function DashboardPage() {
  return (
    <PlaceholderPage
      icon={LayoutDashboard}
      emoji="📊"
      title="Your dashboard is coming."
      subtitle="All your gifts, in one beautiful place."
      description="The dashboard will show all your created gifts, let you track who opened them and manage your account. It's coming in a future version."
      badge="Coming soon"
      ctaLabel="Create your first gift"
      ctaHref="/create"
    />
  )
}
