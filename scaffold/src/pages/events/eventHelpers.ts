/*
  Вспомогательные чистые функции только для страниц Афиши и события. Общие для нескольких страниц продукта
  вещи живут в `@/features` или `@/mocks`; здесь — то, что нужно только `EventsPage` и `EventPage`.
*/
import { pluralRu } from '@/mocks/format'
import { isEventActionable } from '@/mocks/selectors/events'
import type { EventActionKind, EventCategory, EventOccurrence, EventPriceKind, EventStatus, VenueEvent } from '@/mocks/types'

export const EVENT_CATEGORIES: readonly EventCategory[] = ['dinner', 'tasting', 'brunch', 'music', 'guest_chef', 'masterclass']
export const EVENT_PRICE_KINDS: readonly EventPriceKind[] = ['free', 'fixed', 'from', 'deposit', 'registration_required', 'not_specified']
export const EVENT_STATUSES: readonly EventStatus[] = ['scheduled', 'sold_out', 'rescheduled', 'cancelled', 'completed']
export const QUICK_DAYS = ['today', 'tomorrow', 'weekend'] as const
export type QuickDay = (typeof QUICK_DAYS)[number]

/** Продолжительность даты проведения: «≈ 3,5 часа» / «≈ 2 часа». `undefined`, если время окончания не указано (§11.1). */
export function formatDurationLabel(occurrence: EventOccurrence): string | undefined {
  if (occurrence.endsAt === undefined) return undefined
  const minutes = Math.round((new Date(occurrence.endsAt).getTime() - new Date(occurrence.startsAt).getTime()) / 60_000)
  if (minutes <= 0) return undefined
  const hours = minutes / 60
  return Number.isInteger(hours) ? `≈ ${hours} ${pluralRu(hours, 'час', 'часа', 'часов')}` : `≈ ${hours.toFixed(1).replace('.', ',')} часа`
}

/**
 * Разрешено ли внешнее действие сейчас (§11.5). «Подробнее» доступно всегда — это просто ссылка на данные.
 * Остальные действия — только у запланированного и перенесённого события (§11.1, селектор `isEventActionable`).
 */
export function isActionEnabled(event: VenueEvent, kind: EventActionKind): boolean {
  return kind === 'details' || isEventActionable(event)
}

/** Почему действие недоступно — короткая причина рядом с отключённой кнопкой. */
export function actionDisabledReason(event: VenueEvent): string {
  switch (event.status) {
    case 'sold_out':
      return 'Места на эту дату закончились'
    case 'cancelled':
      return 'Событие отменено'
    case 'completed':
      return 'Событие завершилось'
    default:
      return ''
  }
}

function parseList<T extends string>(raw: string, allowed: readonly T[]): T[] {
  if (raw === '') return []
  const set = new Set<string>(allowed)
  return raw.split(',').filter((value): value is T => set.has(value))
}

/** Один параметр запроса Vue Router (`string | string[] | null`) как обычная строка. */
export function queryString(value: unknown): string {
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' ? first : ''
}

export function queryList<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  return parseList(queryString(value), allowed)
}
