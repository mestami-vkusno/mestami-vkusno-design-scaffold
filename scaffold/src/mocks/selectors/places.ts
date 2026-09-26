/* Селекторы слоя мест: города, районы, заведения, часы работы, фильтры каталога. Чистые функции, без сети и реактивности. */
import { areas, cities, districts, metroStations } from '../cities'
import { CUISINE_LABEL, VENUE_TAG_LABEL, VENUE_TYPE_LABEL } from '../dictionaries'
import { MOCK_NOW_TIME, MOCK_TODAY, addDays, toMinutes, weekdayOf } from '../time'
import type {
  Area,
  City,
  CityId,
  DayHours,
  District,
  IsoDate,
  MetroStation,
  TimeInterval,
  TimeOfDay,
  Venue,
  VenueId,
  VenueStatus,
  VenueTag,
  VenueType,
  CuisineId,
} from '../types'
import { venues } from '../venues'
import { isExactMatch, matchesQuery, startsWithQuery } from './text'
import { isRatingPublic } from '../format'

const venueById = new Map<VenueId, Venue>(venues.map((venue) => [venue.id, venue]))
const cityById = new Map<CityId, City>(cities.map((city) => [city.id, city]))
const districtById = new Map(districts.map((district) => [district.id, district]))
const areaById = new Map(areas.map((area) => [area.id, area]))
const metroById = new Map(metroStations.map((station) => [station.id, station]))

// ── География ─────────────────────────────────────────────────────────────

export function getCities(): readonly City[] {
  return cities
}

export function getCity(id: CityId): City | undefined {
  return cityById.get(id)
}

export function districtsByCity(cityId: CityId): readonly District[] {
  return districts.filter((district) => district.cityId === cityId)
}

export function areasByCity(cityId: CityId): readonly Area[] {
  return areas.filter((area) => area.cityId === cityId)
}

export function metroByCity(cityId: CityId): readonly MetroStation[] {
  return metroStations.filter((station) => station.cityId === cityId)
}

export function getDistrict(id: string): District | undefined {
  return districtById.get(id)
}

export function getArea(id: string): Area | undefined {
  return areaById.get(id)
}

export function getMetroStation(id: string): MetroStation | undefined {
  return metroById.get(id)
}

/** Название района для подписи в карточке. */
export function venueLocationLabel(venue: Venue): string {
  return getDistrict(venue.districtId)?.name ?? ''
}

// ── Заведения ─────────────────────────────────────────────────────────────

/** Все заведения без учёта города (для проверок и прямых ссылок). */
export function allVenues(): readonly Venue[] {
  return venues
}

export function getVenue(id: VenueId): Venue | undefined {
  return venueById.get(id)
}

/** Заведение по `slug` или `id` (в моке они совпадают). */
export function getVenueBySlugOrId(slugOrId: string): Venue | undefined {
  return venueById.get(slugOrId) ?? venues.find((venue) => venue.slug === slugOrId)
}

export function venuesByCity(cityId: CityId): readonly Venue[] {
  return venues.filter((venue) => venue.cityId === cityId)
}

export interface DirectLink<T> {
  readonly object: T
  readonly objectCityId: CityId
  /** Объект другого города открывается без смены активного города (§6.3). */
  readonly isOtherCity: boolean
}

/** Открытие заведения прямой ссылкой: сообщает, что оно из другого города, но ничего не переключает. */
export function resolveVenueLink(slugOrId: string, activeCityId: CityId): DirectLink<Venue> | undefined {
  const venue = getVenueBySlugOrId(slugOrId)
  return venue === undefined ? undefined : { object: venue, objectCityId: venue.cityId, isOtherCity: venue.cityId !== activeCityId }
}

/** Заведение принимает гостей и на его карточке доступны операционные действия (§9.3, §9.5). */
export function isOperational(venue: Venue): boolean {
  return venue.status === 'published'
}

// ── Часы работы ───────────────────────────────────────────────────────────

export type OpenState = 'open' | 'closed' | 'unknown'

export interface HoursMoment {
  readonly date: IsoDate
  readonly time: TimeOfDay
}

export const MOCK_MOMENT: HoursMoment = { date: MOCK_TODAY, time: MOCK_NOW_TIME }

function hoursForDate(venue: Venue, date: IsoDate): DayHours | null {
  const special = venue.specialHours?.find((entry) => entry.date === date)
  if (special !== undefined) return special.hours
  return venue.hours === null ? null : venue.hours[weekdayOf(date)]
}

function intervalsOf(hours: DayHours | null): readonly TimeInterval[] {
  if (hours === null || hours.kind === 'closed') return []
  if (hours.kind === 'round_the_clock') return [{ from: '00:00', to: '24:00' }]
  return hours.intervals
}

/** Интервал в минутах от начала своего дня; переход за полночь даёт конец больше 1440. */
function toRange(interval: TimeInterval): readonly [start: number, end: number] {
  const start = toMinutes(interval.from)
  const end = toMinutes(interval.to)
  return [start, end <= start ? end + 1440 : end]
}

/** Текущее состояние в часовом поясе заведения. Неизвестные часы — `unknown`, а не «закрыто» (§9.4). */
export function openState(venue: Venue, moment: HoursMoment = MOCK_MOMENT): OpenState {
  if (venue.status === 'closed_permanently' || venue.status === 'temporarily_closed' || venue.status === 'suspended') return 'closed'
  if (venue.status === 'opening_soon' || venue.hours === null) return 'unknown'
  const now = toMinutes(moment.time)
  const today = intervalsOf(hoursForDate(venue, moment.date)).map(toRange)
  if (today.some(([start, end]) => now >= start && now < end)) return 'open'
  const yesterday = intervalsOf(hoursForDate(venue, addDays(moment.date, -1))).map(toRange)
  return yesterday.some(([, end]) => end > 1440 && now < end - 1440) ? 'open' : 'closed'
}

function clock(minutes: number): TimeOfDay {
  const wrapped = minutes % 1440
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`
}

/** Подпись состояния: «Открыто до 00:00», «Откроется в 18:00», «Закрыто», «Часы работы не указаны». */
export function openStatusLabel(venue: Venue, moment: HoursMoment = MOCK_MOMENT): string {
  switch (venue.status) {
    case 'closed_permanently':
      return 'Закрыто навсегда'
    case 'temporarily_closed':
      return 'Временно закрыто'
    case 'suspended':
      return 'Работа приостановлена'
    case 'opening_soon':
      return 'Скоро открытие'
    case 'published':
      break
  }
  const state = openState(venue, moment)
  if (state === 'unknown') return 'Часы работы не указаны'
  const now = toMinutes(moment.time)
  const today = intervalsOf(hoursForDate(venue, moment.date)).map(toRange)
  if (state === 'open') {
    const current = today.find(([start, end]) => now >= start && now < end)
    if (current !== undefined) return `Открыто до ${clock(current[1])}`
    const overnight = intervalsOf(hoursForDate(venue, addDays(moment.date, -1))).map(toRange).find(([, end]) => end > 1440 && now < end - 1440)
    return overnight === undefined ? 'Открыто' : `Открыто до ${clock(overnight[1])}`
  }
  const upcoming = today.filter(([start]) => start > now).sort((a, b) => a[0] - b[0])[0]
  return upcoming === undefined ? 'Закрыто' : `Откроется в ${clock(upcoming[0])}`
}

// ── Каталог и поиск заведений ─────────────────────────────────────────────

export type VenueSort = 'popularity' | 'rating' | 'distance' | 'check_asc' | 'check_desc'

export interface VenueFilters {
  readonly cityId?: CityId
  readonly query?: string
  readonly types?: readonly VenueType[]
  readonly cuisines?: readonly CuisineId[]
  readonly districtIds?: readonly string[]
  readonly areaIds?: readonly string[]
  readonly metroIds?: readonly string[]
  readonly minCheckRub?: number
  readonly maxCheckRub?: number
  readonly minRating?: number
  readonly tags?: readonly VenueTag[]
  readonly openNow?: boolean
  /** По умолчанию в выдачу не входят заведения «закрыто навсегда» (страница у них остаётся по прямой ссылке). */
  readonly statuses?: readonly VenueStatus[]
}

const DEFAULT_CATALOG_STATUSES: readonly VenueStatus[] = ['published', 'opening_soon', 'temporarily_closed', 'suspended']

function searchableText(venue: Venue): readonly string[] {
  return [
    venue.name,
    VENUE_TYPE_LABEL[venue.type],
    ...venue.cuisines.map((cuisine) => CUISINE_LABEL[cuisine]),
    venueLocationLabel(venue),
    getArea(venue.areaId ?? '')?.name ?? '',
    venue.address,
    ...venue.tags.map((tag) => VENUE_TAG_LABEL[tag]),
  ]
}

function ratingScore(venue: Venue): number {
  return isRatingPublic(venue.rating) ? venue.rating.value : 0
}

function popularityScore(venue: Venue): number {
  return venue.rating === null ? 0 : venue.rating.count
}

/** Фильтры каталога и поиска (§8.5). Точное совпадение названия стоит выше остальных (§8.2). */
export function filterVenues(filters: VenueFilters = {}, sort: VenueSort = 'popularity'): readonly Venue[] {
  const statuses = filters.statuses ?? DEFAULT_CATALOG_STATUSES
  const query = filters.query ?? ''
  const found = venues.filter((venue) => {
    if (filters.cityId !== undefined && venue.cityId !== filters.cityId) return false
    if (!statuses.includes(venue.status)) return false
    if (filters.types !== undefined && filters.types.length > 0 && !filters.types.includes(venue.type)) return false
    if (filters.cuisines !== undefined && filters.cuisines.length > 0 && !venue.cuisines.some((c) => filters.cuisines?.includes(c))) return false
    if (filters.districtIds !== undefined && filters.districtIds.length > 0 && !filters.districtIds.includes(venue.districtId)) return false
    if (filters.areaIds !== undefined && filters.areaIds.length > 0 && !(venue.areaId !== undefined && filters.areaIds.includes(venue.areaId))) return false
    if (filters.metroIds !== undefined && filters.metroIds.length > 0 && !(venue.metroStationId !== undefined && filters.metroIds.includes(venue.metroStationId))) return false
    // Чек не указан — заведение не отсекается ценовым фильтром жёстко, но и не подходит под верхнюю границу.
    if (filters.maxCheckRub !== undefined && (venue.averageCheckRub === null || venue.averageCheckRub > filters.maxCheckRub)) return false
    if (filters.minCheckRub !== undefined && (venue.averageCheckRub === null || venue.averageCheckRub < filters.minCheckRub)) return false
    if (filters.minRating !== undefined && ratingScore(venue) < filters.minRating) return false
    if (filters.tags !== undefined && !filters.tags.every((tag) => venue.tags.includes(tag))) return false
    if (filters.openNow === true && openState(venue) !== 'open') return false
    return matchesQuery(query, ...searchableText(venue))
  })

  const compare = (a: Venue, b: Venue): number => {
    if (query !== '') {
      const byName = Number(isExactMatch(query, b.name)) - Number(isExactMatch(query, a.name))
      if (byName !== 0) return byName
      const byPrefix = Number(startsWithQuery(query, b.name)) - Number(startsWithQuery(query, a.name))
      if (byPrefix !== 0) return byPrefix
    }
    switch (sort) {
      case 'rating':
        return ratingScore(b) - ratingScore(a) || popularityScore(b) - popularityScore(a)
      case 'distance':
        return a.distanceKm - b.distanceKm
      case 'check_asc':
        return (a.averageCheckRub ?? Number.MAX_SAFE_INTEGER) - (b.averageCheckRub ?? Number.MAX_SAFE_INTEGER)
      case 'check_desc':
        return (b.averageCheckRub ?? -1) - (a.averageCheckRub ?? -1)
      case 'popularity':
        return popularityScore(b) - popularityScore(a)
    }
  }
  return [...found].sort(compare)
}

/** Заведения города по типу (чипсы каталога: «Рестораны», «Кафе», «Бары» …). */
export function venuesByType(cityId: CityId, type: VenueType): readonly Venue[] {
  return filterVenues({ cityId, types: [type] })
}

/** Похожие: тот же город, общая кухня или тип, ближе по чеку. Без закрытых и приостановленных. */
export function similarVenues(venueId: VenueId, limit = 3): readonly Venue[] {
  const base = getVenue(venueId)
  if (base === undefined) return []
  return venues
    .filter((venue) => venue.id !== base.id && venue.cityId === base.cityId && venue.status === 'published')
    .map((venue) => {
      const sharedCuisines = venue.cuisines.filter((cuisine) => base.cuisines.includes(cuisine)).length
      const sameType = venue.type === base.type ? 1 : 0
      const checkGap = Math.abs((venue.averageCheckRub ?? 0) - (base.averageCheckRub ?? 0)) / 1000
      return { venue, score: sharedCuisines * 2 + sameType - checkGap }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ venue }) => venue)
}

/** «Ещё рядом»: ближайшие по расстоянию от опорной точки, кроме самого заведения. */
export function nearbyVenues(venueId: VenueId, limit = 3): readonly Venue[] {
  const base = getVenue(venueId)
  if (base === undefined) return []
  return venues
    .filter((venue) => venue.id !== base.id && venue.cityId === base.cityId && venue.status === 'published')
    .sort((a, b) => Math.abs(a.distanceKm - base.distanceKm) - Math.abs(b.distanceKm - base.distanceKm))
    .slice(0, limit)
}
