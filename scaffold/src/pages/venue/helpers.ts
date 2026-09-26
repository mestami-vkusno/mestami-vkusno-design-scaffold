/*
  Общие мелочи для страниц заведения (V1 «Заведение», V2 «Меню заведения», V3 «Позиция меню»):
  подписи дней недели, строка расписания, внешние ссылки (маршрут, телефон).
  Локально для группы страниц venue/ — в `features/` не выносим, пока не нужно больше чем здесь.
*/
import type { DayHours, Venue, WeekdayKey } from '@/mocks/types'

/** Понедельник — первый день недели в расписании (ТЗ §9.4), в порядке отображения. */
export const WEEKDAY_ORDER: readonly WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const WEEKDAY_LABEL: Readonly<Record<WeekdayKey, string>> = {
  mon: 'Понедельник',
  tue: 'Вторник',
  wed: 'Среда',
  thu: 'Четверг',
  fri: 'Пятница',
  sat: 'Суббота',
  sun: 'Воскресенье',
}

/** «12:00–00:00, 18:00–02:00», «Круглосуточно», «Выходной». Часы за полночь показываются как есть (`to` меньше `from`). */
export function formatDayHours(hours: DayHours | null): string {
  if (hours === null) return 'Не указано'
  if (hours.kind === 'closed') return 'Выходной'
  if (hours.kind === 'round_the_clock') return 'Круглосуточно'
  return hours.intervals.map((interval) => `${interval.from}–${interval.to}`).join(', ')
}

/** Внешняя ссылка на карту с точкой заведения: клик — не факт Посещения (§9.5). */
export function routeUrl(venue: Venue): string {
  return `https://yandex.ru/maps/?pt=${venue.geo.lng},${venue.geo.lat}&z=16&text=${encodeURIComponent(venue.name + ', ' + venue.address)}`
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}
