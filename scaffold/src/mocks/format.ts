/* Форматирование для интерфейса: рубли, даты, время, склонения. Чистые функции на `Intl` с локалью `ru-RU`. */
import { MOCK_NOW, MOCK_TODAY, dayPart, daysFromToday, timePart } from './time'
import type { EventPrice, IsoDate, IsoDateTime, VenueRating } from './types'
import { MIN_PUBLIC_RATING_COUNT, PRICE_NOT_SPECIFIED_LABEL } from './dictionaries'

const LOCALE = 'ru-RU'
const TIME_ZONE = 'Europe/Moscow'

const rubles = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
const decimal1 = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })
const dayMonth = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', timeZone: TIME_ZONE })
const dayMonthShort = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', timeZone: TIME_ZONE })
const weekdayShort = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', timeZone: TIME_ZONE })
const weekdayLong = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', timeZone: TIME_ZONE })
const monthYear = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric', timeZone: TIME_ZONE })
const fullDate = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric', timeZone: TIME_ZONE })

/** Дата без времени считается полуднем по Москве, чтобы часовой пояс не сдвигал день. */
function toDate(value: IsoDate | IsoDateTime): Date {
  return new Date(value.length <= 10 ? `${value}T12:00:00+03:00` : value)
}

/** «Склонение»: `pluralRu(3, 'отзыв', 'отзыва', 'отзывов')` → «отзыва». */
export function pluralRu(count: number, one: string, few: string, many: string): string {
  const n = Math.abs(count) % 100
  const last = n % 10
  if (n > 10 && n < 20) return many
  if (last === 1) return one
  if (last >= 2 && last <= 4) return few
  return many
}

export function formatCount(count: number, one: string, few: string, many: string): string {
  return `${integer.format(count)} ${pluralRu(count, one, few, many)}`
}

/** «3 000 ₽». */
export function formatRub(amount: number): string {
  return rubles.format(amount)
}

/** Цена позиции меню: число или «Цена не указана» (§8.3). */
export function formatMenuPrice(priceRub: number | null): string {
  return priceRub === null ? PRICE_NOT_SPECIFIED_LABEL : formatRub(priceRub)
}

/** «≈ 3 000 ₽ / чел.» или «Чек не указан». */
export function formatAverageCheck(averageCheckRub: number | null): string {
  return averageCheckRub === null ? 'Чек не указан' : `≈ ${formatRub(averageCheckRub)} / чел.`
}

/** Стоимость события по видам (§11.3). */
export function formatEventPrice(price: EventPrice): string {
  switch (price.kind) {
    case 'free':
      return 'Бесплатно'
    case 'fixed':
      return formatRub(price.amountRub)
    case 'from':
      return `от ${formatRub(price.amountRub)}`
    case 'deposit':
      return `Депозит ${formatRub(price.amountRub)}`
    case 'registration_required':
      return 'Нужна регистрация'
    case 'not_specified':
      return 'Стоимость не указана'
  }
}

/** «4,7». */
export function formatRatingValue(value: number): string {
  return decimal1.format(value)
}

/** Оценка можно показывать публично, когда отзывов не меньше минимальной выборки (§16.1). */
export function isRatingPublic(rating: VenueRating | null): rating is VenueRating {
  return rating !== null && rating.count >= MIN_PUBLIC_RATING_COUNT
}

/** «4,7 (1 287 отзывов)» или «Мало оценок» / «Нет оценок». */
export function formatRating(rating: VenueRating | null): string {
  if (rating === null) return 'Нет оценок'
  if (!isRatingPublic(rating)) return 'Мало оценок'
  return `${formatRatingValue(rating.value)} (${formatCount(rating.count, 'отзыв', 'отзыва', 'отзывов')})`
}

/** «1,8 км» или «300 м». */
export function formatDistance(km: number): string {
  return km < 1 ? `${integer.format(Math.round(km * 1000))} м` : `${decimal1.format(km)} км`
}

/** «12 480» → «12,5 тыс.». */
export function formatFollowers(count: number): string {
  if (count >= 1000) return `${decimal1.format(count / 1000)} тыс.`
  return integer.format(count)
}

/** «24 сентября». */
export function formatDate(value: IsoDate | IsoDateTime): string {
  return dayMonth.format(toDate(value))
}

/** «24 сент.». */
export function formatDateShort(value: IsoDate | IsoDateTime): string {
  return dayMonthShort.format(toDate(value))
}

/** «24 сентября 2026 г.». */
export function formatDateFull(value: IsoDate | IsoDateTime): string {
  return fullDate.format(toDate(value))
}

/** «чт». */
export function formatWeekdayShort(value: IsoDate | IsoDateTime): string {
  return weekdayShort.format(toDate(value))
}

/** «четверг». */
export function formatWeekdayLong(value: IsoDate | IsoDateTime): string {
  return weekdayLong.format(toDate(value))
}

/** «сентябрь 2026 г.». */
export function formatMonthYear(value: IsoDate | IsoDateTime): string {
  return monthYear.format(toDate(value))
}

/** «19:00». */
export function formatTime(value: IsoDateTime): string {
  return timePart(value)
}

/** «Сегодня», «Завтра» или «25 сентября» — для заголовков дат. */
export function formatRelativeDay(value: IsoDate | IsoDateTime): string {
  const diff = daysFromToday(dayPart(value))
  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Завтра'
  if (diff === -1) return 'Вчера'
  return formatDate(value)
}

/** «Сегодня · 19:00», «сб, 26 сентября · 19:00». */
export function formatDateTime(value: IsoDateTime): string {
  const diff = daysFromToday(dayPart(value))
  const day = diff === 0 || diff === 1 ? formatRelativeDay(value) : `${formatWeekdayShort(value)}, ${formatDate(value)}`
  return `${day} · ${formatTime(value)}`
}

/** «1 час назад», «вчера», «3 дня назад» относительно `MOCK_NOW`. */
export function formatAgo(value: IsoDateTime): string {
  const minutes = Math.round((new Date(MOCK_NOW).getTime() - new Date(value).getTime()) / 60000)
  if (minutes < 1) return 'только что'
  if (minutes < 60) return `${minutes} ${pluralRu(minutes, 'минуту', 'минуты', 'минут')} назад`
  const hours = Math.floor(minutes / 60)
  if (hours < 24 && dayPart(value) === MOCK_TODAY) return `${hours} ${pluralRu(hours, 'час', 'часа', 'часов')} назад`
  const days = -daysFromToday(dayPart(value))
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} ${pluralRu(days, 'день', 'дня', 'дней')} назад`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks} ${pluralRu(weeks, 'неделю', 'недели', 'недель')} назад`
  }
  return formatDate(value)
}
