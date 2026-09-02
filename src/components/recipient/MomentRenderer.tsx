import type { GiftWithDetails, GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'
import OpeningMoment from './pages/OpeningMoment'
import MessageMoment from './pages/MessageMoment'
import StoryMoment from './pages/StoryMoment'
import PhotosMoment from './pages/PhotosMoment'
import VideoMoment from './pages/VideoMoment'
import ClosingMoment from './pages/ClosingMoment'

interface MomentRendererProps {
  page: RecipientPage
  gift: GiftWithDetails
  theme: GiftThemeConfig
  onContinue: () => void
  onSelectPhoto: (index: number) => void
  onReplay?: () => void
  onMediaPlay?: () => void
  onMediaPause?: () => void
}

export default function MomentRenderer({
  page,
  gift,
  theme,
  onContinue,
  onSelectPhoto,
  onReplay,
  onMediaPlay,
  onMediaPause,
}: MomentRendererProps) {
  switch (page.type) {
    case 'opening':
      return (
        <OpeningMoment
          page={page}
          gift={gift}
          theme={theme}
          onContinue={onContinue}
        />
      )

    case 'message':
      return <MessageMoment page={page} gift={gift} theme={theme} />

    case 'story':
      return <StoryMoment page={page} theme={theme} />

    case 'photos':
      return (
        <PhotosMoment
          page={page}
          theme={theme}
          onSelectPhoto={onSelectPhoto}
        />
      )

    case 'video':
    case 'voice':
      return (
        <VideoMoment
          page={page}
          theme={theme}
          onMediaPlay={onMediaPlay}
          onMediaPause={onMediaPause}
        />
      )

    case 'closing':
      return (
        <ClosingMoment
          page={page}
          gift={gift}
          theme={theme}
          onReplay={onReplay}
        />
      )

    default:
      return null
  }
}
