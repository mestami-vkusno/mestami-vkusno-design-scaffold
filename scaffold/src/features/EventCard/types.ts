import type { EventOccurrence, VenueEvent } from '@/mocks/types'
import type { HeadingLevel } from '../shared/types'

export interface EventCardProps {
  event: VenueEvent
  /** Дата проведения, по которой событие попало в выдачу (`EventListItem.occurrence`); по умолчанию — первая. */
  occurrence?: EventOccurrence
  /** Название заведения: у события оно ровно одно (§11.1), но данные хранят только идентификатор. */
  venueName?: string
  /** Название района. */
  location?: string
  href?: string
  headingLevel?: HeadingLevel
  deferred?: boolean
}
