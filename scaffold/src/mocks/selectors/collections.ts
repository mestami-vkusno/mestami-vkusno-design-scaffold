/* Селекторы подборок: хаб, разделы по поводам, подпись, элементы с заведениями. */
import { collections } from '../collections'
import { EDITORIAL_SIGNATURE } from '../dictionaries'
import { MOCK_LIBRARY } from '../library'
import type { AuthorId, CityId, Collection, CollectionId, CollectionItem, CollectionTopic, Venue } from '../types'
import { getVenue } from './places'
import { matchesQuery } from './text'
import { getAuthor } from './social'

const collectionById = new Map<CollectionId, Collection>(collections.map((collection) => [collection.id, collection]))

/**
 * Подборки пользователя, созданные и изменённые в моке, лежат не в данных, а в его библиотеке (`state/library-state.ts`).
 * Она подключает сюда функцию-«надстройку»: `Collection` — своя версия подборки, `null` — удалена пользователем,
 * `undefined` — надстройка про неё ничего не знает, значит читаем данные мока.
 */
type CollectionOverlay = (id: CollectionId) => Collection | null | undefined
let overlay: CollectionOverlay | null = null

export function setCollectionOverlay(next: CollectionOverlay | null): void {
  overlay = next
}

export function getCollection(id: CollectionId): Collection | undefined {
  const own = overlay?.(id)
  return own === undefined ? collectionById.get(id) : (own ?? undefined)
}

/** Публичная опубликованная подборка: видна гостю, в хабе и в Ленте. */
export function isCollectionPublic(collection: Collection): boolean {
  return collection.visibility === 'public' && collection.status === 'published'
}

/** Подпись: «Редакция «Местами вкусно»» у редакционной, имя автора у пользовательской (§17.2). */
export function collectionByline(collection: Collection): string {
  if (collection.kind === 'editorial') return EDITORIAL_SIGNATURE
  return (collection.ownerId === null ? undefined : getAuthor(collection.ownerId)?.displayName) ?? ''
}

export interface CollectionEntry {
  readonly item: CollectionItem
  readonly venue: Venue
}

/** Элементы подборки в авторском порядке с найденными заведениями. */
export function collectionEntries(collection: Collection): readonly CollectionEntry[] {
  return collection.items.flatMap((item): CollectionEntry[] => {
    const venue = getVenue(item.venueId)
    return venue === undefined ? [] : [{ item, venue }]
  })
}

export function publicCollections(cityId?: CityId): readonly Collection[] {
  return collections.filter((collection) => isCollectionPublic(collection) && (cityId === undefined || collection.cityId === cityId))
}

export function editorialCollections(cityId?: CityId): readonly Collection[] {
  return publicCollections(cityId).filter((collection) => collection.kind === 'editorial')
}

/** Главная редакционная подборка хаба: самая сохраняемая. */
export function featuredCollection(cityId: CityId): Collection | undefined {
  return [...editorialCollections(cityId)].sort((a, b) => b.savesCount - a.savesCount)[0]
}

export function collectionsByTopic(cityId: CityId, topic: CollectionTopic): readonly Collection[] {
  return publicCollections(cityId).filter((collection) => collection.topics.includes(topic))
}

/** Поиск по названию и описанию подборок (§8.1). */
export function searchCollections(query: string, cityId?: CityId): readonly Collection[] {
  return publicCollections(cityId).filter((collection) => matchesQuery(query, collection.title, collection.description))
}

/** Популярное сейчас: по числу сохранений. */
export function popularCollections(cityId: CityId, limit = 6): readonly Collection[] {
  return [...publicCollections(cityId)].sort((a, b) => b.savesCount - a.savesCount).slice(0, limit)
}

/** Подборки автора; приватные и черновики видит только сам владелец. */
export function collectionsOwnedBy(ownerId: AuthorId, viewerId: AuthorId | null = null): readonly Collection[] {
  return collections.filter((collection) => collection.ownerId === ownerId && (isCollectionPublic(collection) || viewerId === ownerId))
}

/** Сохранена ли подборка пользователем: закладка на оригинал, а не копия (§17.3). */
export function isCollectionSavedBy(userId: AuthorId | null, collectionId: CollectionId): boolean {
  return userId !== null && userId === MOCK_LIBRARY.userId && MOCK_LIBRARY.savedCollections.some((saved) => saved.id === collectionId)
}
