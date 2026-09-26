import type { Venue } from '@/mocks/types'
import type { OpenNowLabelProps } from '../OpenNowLabel/types'
import type { HeadingLevel } from '../shared/types'

export interface VenueCardProps {
  venue: Venue
  /** Название района: `venueLocationLabel(venue)` из селекторов. Заведение хранит только идентификатор района. */
  location?: string
  /** Адрес карточки; по умолчанию `/venue/<id>`. */
  href?: string
  headingLevel?: HeadingLevel
  /** «Открыто до 00:00» и цвет точки; строку не рисуем, если не передана. */
  open?: OpenNowLabelProps
  /** «Сегодня событие»: у заведения есть событие сегодня (считает страница по афише). */
  hasEventToday?: boolean
  /** Длинные сетки и списки: карточки вне экрана не считаются и не рисуются. */
  deferred?: boolean
}
