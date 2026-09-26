/*
  Опорная дата мока. Все даты событий, публикаций и уведомлений считаются от неё смещением в днях,
  поэтому «Сегодня», «Завтра», «Выходные» и «Скоро» заполнены всегда, а данные детерминированы.
  Обе столицы живут в одном часовом поясе (UTC+3), поэтому смещение зашито в строку.
*/
import type { IsoDate, IsoDateTime, TimeOfDay, WeekdayKey } from './types'

/** «Сегодня» в моке: четверг. От него до выходных два дня, до конца недели есть «Завтра» и «Скоро». */
export const MOCK_TODAY: IsoDate = '2026-09-24'
/** Текущее время в моке (для «Открыто сейчас» и «Сегодня, в 19:00»). */
export const MOCK_NOW_TIME: TimeOfDay = '14:30'
export const MOCK_UTC_OFFSET = '+03:00'
export const MOCK_NOW: IsoDateTime = `${MOCK_TODAY}T${MOCK_NOW_TIME}:00${MOCK_UTC_OFFSET}`

const MS_IN_DAY = 86_400_000
const WEEKDAYS: readonly WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function toUtcMs(date: IsoDate): number {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const next = new Date(toUtcMs(date) + days * MS_IN_DAY)
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`
}

/** Дата со смещением в днях от `MOCK_TODAY`: `dateAt(0)` — сегодня, `dateAt(-3)` — три дня назад. */
export function dateAt(offsetDays: number): IsoDate {
  return addDays(MOCK_TODAY, offsetDays)
}

/** Дата и время со смещением от `MOCK_TODAY`: `dateTimeAt(1, '19:30')` — завтра в 19:30. */
export function dateTimeAt(offsetDays: number, time: TimeOfDay): IsoDateTime {
  return `${dateAt(offsetDays)}T${time}:00${MOCK_UTC_OFFSET}`
}

/** Число дней от `MOCK_TODAY` до даты (отрицательное — в прошлом). */
export function daysFromToday(date: IsoDate): number {
  return Math.round((toUtcMs(date) - toUtcMs(MOCK_TODAY)) / MS_IN_DAY)
}

/** День недели: `mon` … `sun`. */
export function weekdayOf(date: IsoDate): WeekdayKey {
  const dayOfWeek = new Date(toUtcMs(date)).getUTCDay() // 0 — воскресенье
  return WEEKDAYS[(dayOfWeek + 6) % 7] ?? 'mon'
}

export function dayPart(dateTime: IsoDateTime): IsoDate {
  return dateTime.slice(0, 10)
}

export function timePart(dateTime: IsoDateTime): TimeOfDay {
  return dateTime.slice(11, 16)
}

/** Ближайшие выходные, включая сегодня, если сегодня суббота или воскресенье. */
export function weekendDates(): readonly IsoDate[] {
  const weekday = WEEKDAYS.indexOf(weekdayOf(MOCK_TODAY))
  if (weekday === 6) return [MOCK_TODAY]
  if (weekday === 5) return [MOCK_TODAY, addDays(MOCK_TODAY, 1)]
  const saturday = addDays(MOCK_TODAY, 5 - weekday)
  return [saturday, addDays(saturday, 1)]
}

/** Минуты от полуночи для `HH:MM`. */
export function toMinutes(time: TimeOfDay): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  return hours * 60 + minutes
}
