import type { GiftWithDetails, GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'
import OpeningMoment from './pages/OpeningMoment'
import BirthdayOpeningMoment from './pages/BirthdayOpeningMoment'
import ValentinesOpeningMoment from './pages/ValentinesOpeningMoment'
import AnniversaryOpeningMoment from './pages/AnniversaryOpeningMoment'
import FriendshipOpeningMoment from './pages/FriendshipOpeningMoment'
import WeddingOpeningMoment from './pages/WeddingOpeningMoment'
import FestivalOpeningMoment from './pages/FestivalOpeningMoment'
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
    case 'opening': {
      // 1. Birthday Occasion
      const isBirthday =
        gift.occasion?.slug === 'birthday' ||
        gift.occasion?.name?.toLowerCase().includes('birthday') ||
        gift.template?.slug?.includes('birthday')

      if (isBirthday) {
        return (
          <BirthdayOpeningMoment
            page={page}
            gift={gift}
            theme={theme}
            onContinue={onContinue}
          />
        )
      }

      // 2. Valentine's Occasion
      const isValentine =
        gift.occasion?.slug === 'valentines' ||
        gift.occasion?.slug === 'valentine' ||
        gift.occasion?.name?.toLowerCase().includes('valentine') ||
        gift.template?.slug?.includes('valentine')

      if (isValentine) {
        return (
          <ValentinesOpeningMoment
            page={page}
            gift={gift}
            theme={theme}
            onContinue={onContinue}
          />
        )
      }

      // 3. Anniversary Occasion
      const isAnniversary =
        gift.occasion?.slug === 'anniversary' ||
        gift.occasion?.name?.toLowerCase().includes('anniversary') ||
        gift.template?.slug?.includes('anniversary')

      if (isAnniversary) {
        return (
          <AnniversaryOpeningMoment
            page={page}
            gift={gift}
            theme={theme}
            onContinue={onContinue}
          />
        )
      }

      // 4. Friendship Occasion
      const isFriendship =
        gift.occasion?.slug === 'friendship' ||
        gift.occasion?.name?.toLowerCase().includes('friendship') ||
        gift.template?.slug?.includes('friendship')

      if (isFriendship) {
        return (
          <FriendshipOpeningMoment
            page={page}
            gift={gift}
            theme={theme}
            onContinue={onContinue}
          />
        )
      }

      // 5. Wedding Occasion
      const isWedding =
        gift.occasion?.slug === 'wedding' ||
        gift.occasion?.name?.toLowerCase().includes('wedding') ||
        gift.template?.slug?.includes('wedding')

      if (isWedding) {
        return (
          <WeddingOpeningMoment
            page={page}
            gift={gift}
            theme={theme}
            onContinue={onContinue}
          />
        )
      }

      // 6. Festival Occasion
      const isFestival =
        gift.occasion?.slug === 'festival' ||
        gift.occasion?.name?.toLowerCase().includes('festival') ||
        gift.template?.slug?.includes('festival')

      if (isFestival) {
        return (
          <FestivalOpeningMoment
            page={page}
            gift={gift}
            theme={theme}
            onContinue={onContinue}
          />
        )
      }

      // 7. Default / Fallback Opening
      return (
        <OpeningMoment
          page={page}
          gift={gift}
          theme={theme}
          onContinue={onContinue}
        />
      )
    }

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
