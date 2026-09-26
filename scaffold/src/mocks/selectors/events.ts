/* Селекторы афиши: события по дням («Сегодня», «Завтра», «Выходные», «Скоро», дата), фильтры, другие даты, события заведения. */
import { events } from '../events'
import { EVENT_CATEGORY_LABEL } from '../dictionaries'
import { MOCK_TODAY, addDays, dateAt, dayPart, weekendDates } from '../time'
import type {
  CityId,
  EventCategory,
  EventId,
  EventOccurrence,
  EventPriceKind,
  EventStatus,
  IsoDate,
  VenueEvent,
  VenueId,
} from '../types'
import { type DirectLink, getVenue } from './places'
import { matchesQuery } from './text'

const eventById = new Map<EventId, VenueEvent>(events.map((event) => [event.id, event]))

/** Быстрые периоды Афиши (§11.2). «Скоро» — всё, что после выходных, на месяц вперёд. */
export type EventDay = 'today' | 'tomorrow' | 'weekend' | 'soon'

const SOON_HORIZON_DAYS = 30

export function allEvents(): readonly VenueEvent[] {
  return events
}

export function getEvent(id: EventId): VenueEvent | undefined {
  return eventById.get(id)
}

export function eventCityId(event: VenueEvent): CityId | undefined {
  return getVenue(event.venueId)?.cityId
}

/** Открытие события прямой ссылкой: событие другого города открывается без смены активного города (§6.3). */
export function resolveEventLink(id: EventId, activeCityId: CityId): DirectLink<VenueEvent> | undefined {
  const event = getEvent(id)
  const cityId = event === undefined ? undefined : eventCityId(event)
  return event === undefined || cityId === undefined ? undefined : { object: event, objectCityId: cityId, isOtherCity: cityId !== activeCityId }
}

export function eventsByVenue(venueId: VenueId): readonly VenueEvent[] {
  return events.filter((event) => event.venueId === venueId)
}

/** Даты проведения события по возрастанию. */
export function occurrencesOf(event: VenueEvent): readonly EventOccurrence[] {
  return [...event.occurrences].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

/** Ближайшая дата проведения, начиная с `from`; если будущих нет — последняя прошедшая. */
export function nextOccurrence(event: VenueEvent, from: IsoDate = MOCK_TODAY): EventOccurrence | undefined {
  const sorted = occurrencesOf(event)
  return sorted.find((occurrence) => dayPart(occurrence.startsAt) >= from) ?? sorted[sorted.length - 1]
}

/** «Другие даты» события — все, кроме выбранной. */
export function otherOccurrences(event: VenueEvent, occurrenceId: string): readonly EventOccurrence[] {
  return occurrencesOf(event).filter((occurrence) => occurrence.id !== occurrenceId)
}

/** Диапазон дат для быстрого периода: `[от, до]` включительно. */
export function dayRange(day: EventDay): readonly [from: IsoDate, to: IsoDate] {
  switch (day) {
    case 'today':
      return [MOCK_TODAY, MOCK_TODAY]
    case 'tomorrow':
      return [dateAt(1), dateAt(1)]
    case 'weekend': {
      const weekend = weekendDates()
      return [weekend[0] ?? MOCK_TODAY, weekend[weekend.length - 1] ?? MOCK_TODAY]
    }
    case 'soon': {
      const weekend = weekendDates()
      const afterWeekend = addDays(weekend[weekend.length - 1] ?? MOCK_TODAY, 1)
      const earliest = dateAt(2)
      return [afterWeekend > earliest ? afterWeekend : earliest, dateAt(SOON_HORIZON_DAYS)]
    }
  }
}

export interface EventFilters {
  readonly cityId?: CityId
  readonly day?: EventDay
  /** Конкретная дата (календарь «Выбрать дату»); приоритетнее `day`. */
  readonly date?: IsoDate
  readonly categories?: readonly EventCategory[]
  readonly venueIds?: readonly VenueId[]
  readonly priceKinds?: readonly EventPriceKind[]
  readonly statuses?: readonly EventStatus[]
  readonly query?: string
  /** Только события, дата которых уже позади. По умолчанию завершённые скрыты. */
  readonly includeCompleted?: boolean
  readonly editorsPickOnly?: boolean
}

/** Событие в списке: сама запись и та дата проведения, по которой оно попало в выдачу. */
export interface EventListItem {
  readonly event: VenueEvent
  readonly occurrence: EventOccurrence
}

/**
 * Афиша (§11.2). Отменённые и перенесённые события остаются в выдаче со статусом; завершённые скрыты, пока не запрошены.
 * Одно событие с несколькими датами в периоде показывается один раз — по ближайшей дате.
 */
export function filterEvents(filters: EventFilters = {}): readonly EventListItem[] {
  const range: readonly [IsoDate, IsoDate] | undefined =
    filters.date !== undefined ? [filters.date, filters.date] : filters.day !== undefined ? dayRange(filters.day) : undefined
  const items: EventListItem[] = []
  for (const event of events) {
    if (filters.cityId !== undefined && eventCityId(event) !== filters.cityId) continue
    if (event.status === 'completed' && filters.includeCompleted !== true && !(filters.statuses?.includes('completed') ?? false)) continue
    if (filters.statuses !== undefined && filters.statuses.length > 0 && !filters.statuses.includes(event.status)) continue
    if (filters.categories !== undefined && filters.categories.length > 0 && !filters.categories.includes(event.category)) continue
    if (filters.venueIds !== undefined && filters.venueIds.length > 0 && !filters.venueIds.includes(event.venueId)) continue
    if (filters.priceKinds !== undefined && filters.priceKinds.length > 0 && !filters.priceKinds.includes(event.price.kind)) continue
    if (filters.editorsPickOnly === true && event.editorsPick !== true) continue
    const venue = getVenue(event.venueId)
    if (!matchesQuery(filters.query ?? '', event.title, event.summary, EVENT_CATEGORY_LABEL[event.category], venue?.name ?? '')) continue
    const inRange = occurrencesOf(event).filter((occurrence) => {
      const day = dayPart(occurrence.startsAt)
      if (range === undefined) return day >= MOCK_TODAY || event.status === 'completed'
      return day >= range[0] && day <= range[1]
    })
    const occurrence = inRange[0]
    if (occurrence !== undefined) items.push({ event, occurrence })
  }
  return items.sort((a, b) => a.occurrence.startsAt.localeCompare(b.occurrence.startsAt))
}

export function eventsByDay(cityId: CityId, day: EventDay, filters: Omit<EventFilters, 'cityId' | 'day' | 'date'> = {}): readonly EventListItem[] {
  return filterEvents({ ...filters, cityId, day })
}

export function eventsOnDate(cityId: CityId, date: IsoDate, filters: Omit<EventFilters, 'cityId' | 'day' | 'date'> = {}): readonly EventListItem[] {
  return filterEvents({ ...filters, cityId, date })
}

/** Даты, на которые есть события: для точек в календаре Афиши. */
export function datesWithEvents(cityId: CityId): readonly IsoDate[] {
  const days = new Set<IsoDate>()
  for (const event of events) {
    if (eventCityId(event) !== cityId || event.status === 'completed') continue
    for (const occurrence of event.occurrences) days.add(dayPart(occurrence.startsAt))
  }
  return [...days].sort()
}

/** «События в ваших любимых местах»: события заведений из Избранного самого пользователя (§7.5). */
export function eventsInVenues(venueIds: readonly VenueId[], limit = 6): readonly EventListItem[] {
  return venueIds.length === 0 ? [] : filterEvents({ venueIds }).slice(0, limit)
}

/** Блок «Ещё в этом заведении». */
export function moreEventsAtVenue(eventId: EventId, limit = 3): readonly EventListItem[] {
  const event = getEvent(eventId)
  if (event === undefined) return []
  return filterEvents({ venueIds: [event.venueId], includeCompleted: false }).filter((item) => item.event.id !== eventId).slice(0, limit)
}

/** Блок «Ещё в этот день». */
export function moreEventsOnSameDay(eventId: EventId, limit = 3): readonly EventListItem[] {
  const event = getEvent(eventId)
  const occurrence = event === undefined ? undefined : nextOccurrence(event)
  const cityId = event === undefined ? undefined : eventCityId(event)
  if (event === undefined || occurrence === undefined || cityId === undefined) return []
  return eventsOnDate(cityId, dayPart(occurrence.startsAt)).filter((item) => item.event.id !== eventId).slice(0, limit)
}

/** Событие принимает регистрацию и покупку: только запланированное; перенесённое — по новой дате (§11.1). */
export function isEventActionable(event: VenueEvent): boolean {
  return event.status === 'scheduled' || event.status === 'rescheduled'
}
