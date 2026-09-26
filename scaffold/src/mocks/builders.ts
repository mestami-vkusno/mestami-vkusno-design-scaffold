/* Мелкие конструкторы для файлов данных: короче запись, единый вид. Без логики предметной области. */
import type { DayHours, Photo, PhotoRatio, PhotoTone, TimeInterval, TimeOfDay, WeeklyHours } from './types'

export function photo(ratio: PhotoRatio, tone: PhotoTone, caption?: string): Photo {
  return caption === undefined ? { ratio, tone } : { ratio, tone, caption }
}

export function open(from: TimeOfDay, to: TimeOfDay): DayHours {
  return { kind: 'open', intervals: [{ from, to }] }
}

export function openIntervals(...intervals: readonly TimeInterval[]): DayHours {
  return { kind: 'open', intervals }
}

export const CLOSED: DayHours = { kind: 'closed' }
export const ROUND_THE_CLOCK: DayHours = { kind: 'round_the_clock' }

/** Один и тот же режим каждый день. */
export function everyDay(hours: DayHours): WeeklyHours {
  return { mon: hours, tue: hours, wed: hours, thu: hours, fri: hours, sat: hours, sun: hours }
}

/** Будни, пятница–суббота (обычно позже) и воскресенье. */
export function weekly(weekdays: DayHours, fridaySaturday: DayHours, sunday: DayHours = weekdays): WeeklyHours {
  return { mon: weekdays, tue: weekdays, wed: weekdays, thu: weekdays, fri: fridaySaturday, sat: fridaySaturday, sun: sunday }
}
