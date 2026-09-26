/* Модули Главной (§7.1): «Куда сходить», «Рекомендуем вам», «Афиша», «Что нового», «От посетителей», «Новые места» и другие. */
import { QUICK_FILTERS, type QuickFilter } from '../dictionaries'
import type { Author, AuthorId, CityId, Collection, RecentlyViewed, UserPost, Venue, VenuePost } from '../types'
import { type EventListItem, eventsByDay } from './events'
import { recentlyViewedOf, favoriteVenues } from './library'
import { filterVenues } from './places'
import { venuePosts } from '../posts'
import { allPublicPosts, featuredAuthors } from './social'
import { popularCollections } from './collections'
import { getVenue } from './places'

export interface HomeModules {
  readonly quickFilters: readonly QuickFilter[]
  /** Куда сходить: лучшие по оценке в городе. */
  readonly whereToGo: readonly Venue[]
  /** Рекомендуем вам: по кухням Избранного; у гостя и при выключенной персонализации пусто (Главная остаётся рабочей, §20.3). */
  readonly recommended: readonly Venue[]
  readonly authors: readonly Author[]
  readonly collections: readonly Collection[]
  readonly venueNews: readonly VenuePost[]
  readonly afisha: Readonly<Record<'today' | 'tomorrow' | 'weekend', readonly EventListItem[]>>
  readonly fromVisitors: readonly UserPost[]
  readonly newPlaces: readonly Venue[]
  readonly recentlyViewed: readonly RecentlyViewed[]
}

export function homeQuickFilters(): readonly QuickFilter[] {
  return QUICK_FILTERS
}

export function homeModules(cityId: CityId, viewerId: AuthorId | null = null, options: { readonly personalization?: boolean } = {}): HomeModules {
  const personalization = options.personalization ?? true
  const favorites = viewerId !== null && personalization ? favoriteVenues(viewerId) : []
  const favoriteCuisines = new Set(favorites.flatMap((venue) => venue.cuisines))
  const favoriteIds = new Set(favorites.map((venue) => venue.id))
  const recommended = favorites.length === 0
    ? []
    : filterVenues({ cityId, statuses: ['published'] }).filter((venue) => !favoriteIds.has(venue.id) && venue.cuisines.some((cuisine) => favoriteCuisines.has(cuisine))).slice(0, 6)
  const afisha: HomeModules['afisha'] = {
    today: eventsByDay(cityId, 'today'),
    tomorrow: eventsByDay(cityId, 'tomorrow'),
    weekend: eventsByDay(cityId, 'weekend'),
  }
  return {
    quickFilters: QUICK_FILTERS,
    whereToGo: filterVenues({ cityId, statuses: ['published'] }, 'rating').slice(0, 8),
    recommended,
    authors: featuredAuthors(cityId, 6, viewerId),
    collections: popularCollections(cityId, 6),
    venueNews: venuePosts.filter((post) => getVenue(post.venueId)?.cityId === cityId).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 4),
    afisha,
    fromVisitors: allPublicPosts().filter((post) => post.venueId !== null && getVenue(post.venueId)?.cityId === cityId).slice(0, 6),
    newPlaces: filterVenues({ cityId, statuses: ['published', 'opening_soon'] }).filter((venue) => venue.isNew === true || venue.status === 'opening_soon'),
    recentlyViewed: viewerId === null ? [] : recentlyViewedOf(viewerId),
  }
}

