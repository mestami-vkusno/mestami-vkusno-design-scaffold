/* Общий поиск и автодополнение (§8.1): заведения, блюда, кухни, типы, авторы, подборки, события. Алкоголя в выдаче нет (§8.4). */
import { CUISINE_LABEL, VENUE_TYPE_LABEL } from '../dictionaries'
import type { Author, Collection, CityId, CuisineId, VenueType } from '../types'
import { type DishResult, searchDishes, suggestDishNames } from './menu'
import { type EventListItem, filterEvents } from './events'
import { filterVenues } from './places'
import { allAuthors, isAuthorClosed } from './social'
import { searchCollections } from './collections'
import { matchesQuery } from './text'
import type { Venue } from '../types'

export interface SearchResults {
  readonly venues: readonly Venue[]
  readonly dishes: readonly DishResult[]
  readonly events: readonly EventListItem[]
  readonly authors: readonly Author[]
  readonly collections: readonly Collection[]
  readonly cuisines: readonly CuisineId[]
  readonly types: readonly VenueType[]
  /** Пусто — по всем разделам ничего не найдено (в отличие от ошибки, §8.8). */
  readonly isEmpty: boolean
}

export function searchAuthors(query: string): readonly Author[] {
  return allAuthors()
    .filter((author) => !isAuthorClosed(author) && matchesQuery(query, author.displayName, author.username))
    .sort((a, b) => b.followersCount - a.followersCount)
}

export function searchAll(query: string, cityId: CityId): SearchResults {
  const venues = filterVenues({ cityId, query })
  const dishes = searchDishes(query, { cityId })
  const events = filterEvents({ cityId, query })
  const authors = searchAuthors(query)
  const collections = searchCollections(query, cityId)
  const cuisines = (Object.keys(CUISINE_LABEL) as CuisineId[]).filter((id) => query.trim() !== '' && matchesQuery(query, CUISINE_LABEL[id]))
  const types = (Object.keys(VENUE_TYPE_LABEL) as VenueType[]).filter((id) => query.trim() !== '' && matchesQuery(query, VENUE_TYPE_LABEL[id]))
  return {
    venues,
    dishes,
    events,
    authors,
    collections,
    cuisines,
    types,
    isEmpty: venues.length + dishes.length + events.length + authors.length + collections.length + cuisines.length + types.length === 0,
  }
}

export type SuggestionKind = 'venue' | 'dish' | 'cuisine' | 'venue_type' | 'author' | 'collection' | 'event'

export interface Suggestion {
  readonly kind: SuggestionKind
  readonly id: string
  readonly label: string
  readonly hint?: string
}

/** Автодополнение: до нескольких вариантов на раздел; блюда — только публичные позиции меню. */
export function suggest(query: string, cityId: CityId, perKind = 3): readonly Suggestion[] {
  if (query.trim() === '') return []
  const result: Suggestion[] = []
  for (const venue of filterVenues({ cityId, query }).slice(0, perKind)) result.push({ kind: 'venue', id: venue.id, label: venue.name, hint: VENUE_TYPE_LABEL[venue.type] })
  for (const name of suggestDishNames(query, cityId, perKind)) result.push({ kind: 'dish', id: name, label: name, hint: 'Блюдо' })
  for (const id of (Object.keys(CUISINE_LABEL) as CuisineId[]).filter((entry) => matchesQuery(query, CUISINE_LABEL[entry])).slice(0, perKind)) {
    result.push({ kind: 'cuisine', id, label: CUISINE_LABEL[id], hint: 'Кухня' })
  }
  for (const id of (Object.keys(VENUE_TYPE_LABEL) as VenueType[]).filter((entry) => matchesQuery(query, VENUE_TYPE_LABEL[entry])).slice(0, perKind)) {
    result.push({ kind: 'venue_type', id, label: VENUE_TYPE_LABEL[id], hint: 'Тип заведения' })
  }
  for (const author of searchAuthors(query).slice(0, perKind)) result.push({ kind: 'author', id: author.username, label: author.displayName, hint: `@${author.username}` })
  for (const collection of searchCollections(query, cityId).slice(0, perKind)) result.push({ kind: 'collection', id: collection.id, label: collection.title, hint: 'Подборка' })
  for (const item of filterEvents({ cityId, query }).slice(0, perKind)) result.push({ kind: 'event', id: item.event.id, label: item.event.title, hint: 'Событие' })
  return result
}
