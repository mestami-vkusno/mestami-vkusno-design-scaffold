/*
  Селекторы личной библиотеки (Профиль → Мое, §18) и текущего пользователя.
  Функции принимают `userId`; данные есть только у тестового пользователя «Мария», у остальных (и у гостя) библиотека пуста.
  Избранное ≠ подписка ≠ Посещение (§3.4).
*/
import { collections } from '../collections'
import { MOCK_LIBRARY, MOCK_USER } from '../library'
import { userPosts } from '../posts'
import { ratings, reviews } from '../reviews'
import type {
  AuthorId,
  Collection,
  Rating,
  RecentlyViewed,
  Review,
  UserAccount,
  UserLibrary,
  UserPost,
  Venue,
  VenueEvent,
  Visit,
} from '../types'
import { getEvent } from './events'
import { getCollection } from './collections'
import { getVenue } from './places'
import { getPost } from './social'

const EMPTY_LIBRARY = (userId: AuthorId): UserLibrary => ({
  userId,
  favorites: [],
  followedAuthorIds: [],
  followedVenueIds: [],
  savedPosts: [],
  savedCollections: [],
  savedEvents: [],
  likedPostIds: [],
  visits: [],
  recentlyViewed: [],
})

/** Учётная запись по идентификатору пользователя; для гостя и неизвестных — `undefined`. */
export function getAccount(userId: AuthorId | null): UserAccount | undefined {
  return userId === MOCK_USER.id ? MOCK_USER : undefined
}

export function libraryOf(userId: AuthorId | null): UserLibrary {
  return userId === MOCK_LIBRARY.userId ? MOCK_LIBRARY : EMPTY_LIBRARY(userId ?? 'guest')
}

/** Право на Премиум: у гостя и без покупки — нет (§24.1). */
export function hasActivePremium(userId: AuthorId | null): boolean {
  return getAccount(userId)?.premium.status === 'active'
}

export function isFavorite(userId: AuthorId | null, venueId: string): boolean {
  return libraryOf(userId).favorites.some((favorite) => favorite.venueId === venueId)
}

/** Избранные заведения, последние добавленные сверху. */
export function favoriteVenues(userId: AuthorId | null): readonly Venue[] {
  return [...libraryOf(userId).favorites]
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    .flatMap((favorite) => {
      const venue = getVenue(favorite.venueId)
      return venue === undefined ? [] : [venue]
    })
}

export interface VisitEntry {
  readonly visit: Visit
  readonly venue: Venue
  readonly event?: VenueEvent
  /** Что можно предложить после Посещения: всё необязательно (§16.4). */
  readonly rating?: Rating
  readonly review?: Review
  readonly post?: UserPost
}

/** Посещения, свежие сверху. Приватны, ресторану и подписчикам не показываются (§16.3). */
export function visitsOf(userId: AuthorId | null): readonly VisitEntry[] {
  return [...libraryOf(userId).visits]
    .sort((a, b) => b.visitedOn.localeCompare(a.visitedOn))
    .flatMap((visit): VisitEntry[] => {
      const venue = getVenue(visit.venueId)
      if (venue === undefined || userId === null) return []
      const event = visit.eventId === undefined ? undefined : getEvent(visit.eventId)
      const rating = ratings.find((entry) => entry.userId === userId && entry.venueId === visit.venueId && entry.active)
      const review = reviews.find((entry) => entry.userId === userId && entry.venueId === visit.venueId)
      const post = userPosts.find((entry) => entry.visitId === visit.id)
      return [
        {
          visit,
          venue,
          ...(event === undefined ? {} : { event }),
          ...(rating === undefined ? {} : { rating }),
          ...(review === undefined ? {} : { review }),
          ...(post === undefined ? {} : { post }),
        },
      ]
    })
}

/** Все публикации пользователя, кроме удалённых им самим. */
export function myPosts(userId: AuthorId | null): readonly UserPost[] {
  if (userId === null) return []
  return userPosts.filter((post) => post.authorId === userId && post.status !== 'removed_by_author').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

/** Дневник: приватные записи, заведение необязательно (§13.1). */
export function diaryOf(userId: AuthorId | null): readonly UserPost[] {
  return myPosts(userId).filter((post) => post.visibility === 'private')
}

export interface Drafts {
  readonly posts: readonly UserPost[]
  readonly collections: readonly Collection[]
}

/** Черновики и публикации, ожидающие действия автора: черновик, на модерации, запрошены изменения, отклонено (§13.4). */
export function draftsOf(userId: AuthorId | null): Drafts {
  if (userId === null) return { posts: [], collections: [] }
  return {
    posts: myPosts(userId).filter((post) => post.visibility === 'public' && post.status !== 'published'),
    collections: collections.filter((collection) => collection.ownerId === userId && collection.status === 'draft'),
  }
}

export function savedPostsOf(userId: AuthorId | null): readonly UserPost[] {
  return libraryOf(userId).savedPosts.flatMap((saved) => {
    const post = getPost(saved.id)
    return post === undefined ? [] : [post]
  })
}

export function savedCollectionsOf(userId: AuthorId | null): readonly Collection[] {
  return libraryOf(userId).savedCollections.flatMap((saved) => {
    const collection = getCollection(saved.id)
    return collection === undefined ? [] : [collection]
  })
}

/** Сохранённые события: и перенесённые, и отменённые остаются в списке с явным статусом. Сохранено ≠ Посещение. */
export function savedEventsOf(userId: AuthorId | null): readonly VenueEvent[] {
  return libraryOf(userId).savedEvents.flatMap((saved) => {
    const event = getEvent(saved.id)
    return event === undefined ? [] : [event]
  })
}

export interface RatingEntry {
  readonly venue: Venue
  readonly rating: Rating
  readonly review?: Review
}

/** «Оценки и отзывы» пользователя: одна активная оценка и не более одного отзыва на заведение. */
export function ratingsOf(userId: AuthorId | null): readonly RatingEntry[] {
  if (userId === null) return []
  return ratings
    .filter((rating) => rating.userId === userId && rating.active)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .flatMap((rating): RatingEntry[] => {
      const venue = getVenue(rating.venueId)
      if (venue === undefined) return []
      const review = reviews.find((entry) => entry.ratingId === rating.id)
      return [{ venue, rating, ...(review === undefined ? {} : { review }) }]
    })
}

/** Недавно просмотренное, свежее сверху. */
export function recentlyViewedOf(userId: AuthorId | null): readonly RecentlyViewed[] {
  return [...libraryOf(userId).recentlyViewed].sort((a, b) => b.viewedAt.localeCompare(a.viewedAt))
}
