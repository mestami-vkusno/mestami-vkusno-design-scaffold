import type { UiBadgeVariant } from '@/design-system'
import type { EventStatus, VenueStatus } from '@/mocks/types'

export interface StatusBadgeProps {
  /** Публичный статус заведения (§9.3). Передаётся либо он, либо `eventStatus`. */
  venueStatus?: VenueStatus
  /** Статус события (§11.1). */
  eventStatus?: EventStatus
  /** Подставить другую подпись. */
  label?: string
  pill?: boolean
}

/** Цвет метки по статусу: тревожные — тёплые, «скоро открытие» — акцент, обычные — нейтральные. */
export const VENUE_STATUS_VARIANT: Readonly<Record<VenueStatus, UiBadgeVariant>> = {
  published: 'success',
  opening_soon: 'accent',
  temporarily_closed: 'warning',
  closed_permanently: 'danger',
  suspended: 'warning',
}

export const EVENT_STATUS_VARIANT: Readonly<Record<EventStatus, UiBadgeVariant>> = {
  scheduled: 'neutral',
  sold_out: 'warning',
  rescheduled: 'warning',
  cancelled: 'danger',
  completed: 'neutral',
}

/** Обычное состояние: на карточке метку не рисуем, чтобы она не превращалась в шум (заведение работает, событие запланировано). */
export function isRoutineVenueStatus(status: VenueStatus): boolean {
  return status === 'published'
}

export function isRoutineEventStatus(status: EventStatus): boolean {
  return status === 'scheduled'
}
