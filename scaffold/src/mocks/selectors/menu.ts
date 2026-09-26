/*
  Селекторы меню и поиска по блюдам. Публичный вид меню строится из исходных данных так:
  позиции с `isAlcohol: true` исключаются целиком (§8.4), удалённые позиции (`removed`) не участвуют в текущем меню и поиске (§10.3).
*/
import { menusRaw, dishConcepts } from '../menus'
import type { DishConcept, DishConceptId, Menu, MenuItem, MenuItemId, MenuSection, Venue, VenueId } from '../types'
import { getVenue, isOperational } from './places'
import { matchesQuery, normalize } from './text'

const rawItems: readonly MenuItem[] = menusRaw.flatMap((menu) => menu.sections.flatMap((section) => section.items))
const rawItemById = new Map<MenuItemId, MenuItem>(rawItems.map((item) => [item.id, item]))
const conceptById = new Map<DishConceptId, DishConcept>(dishConcepts.map((concept) => [concept.id, concept]))

/** Публичная позиция: не алкоголь. Удалённые — по отдельному правилу в каждом селекторе. */
function isPublic(item: MenuItem): boolean {
  return !item.isAlcohol
}

function isInCurrentMenu(item: MenuItem): boolean {
  return isPublic(item) && item.availability !== 'removed'
}

/** Есть ли у заведения опубликованное структурированное меню (с публичными позициями). */
export function hasMenu(venueId: VenueId): boolean {
  return getPublicMenu(venueId) !== undefined
}

/** Текущее опубликованное меню заведения для пользователя: без алкоголя и без удалённых позиций; пустые разделы скрыты. */
export function getPublicMenu(venueId: VenueId): Menu | undefined {
  const menu = menusRaw.find((entry) => entry.venueId === venueId)
  if (menu === undefined) return undefined
  const sections: MenuSection[] = menu.sections
    .map((section) => ({ ...section, items: section.items.filter(isInCurrentMenu) }))
    .filter((section) => section.items.length > 0)
  return sections.length === 0 ? undefined : { ...menu, sections }
}

/** Плоский список публичных позиций текущего меню. */
export function publicMenuItems(venueId?: VenueId): readonly MenuItem[] {
  return rawItems.filter((item) => isInCurrentMenu(item) && (venueId === undefined || item.venueId === venueId))
}

/**
 * Позиция по идентификатору. Удалённая позиция возвращается (историческая ссылка в публикации с пометкой «позиции больше нет»),
 * алкогольная — никогда.
 */
export function getMenuItem(id: MenuItemId): MenuItem | undefined {
  const item = rawItemById.get(id)
  return item !== undefined && isPublic(item) ? item : undefined
}

export function getMenuSection(sectionId: string): MenuSection | undefined {
  for (const menu of menusRaw) {
    const section = menu.sections.find((entry) => entry.id === sectionId)
    if (section !== undefined) return { ...section, items: section.items.filter(isPublic) }
  }
  return undefined
}

export function getDishConcept(id: DishConceptId): DishConcept | undefined {
  return conceptById.get(id)
}

export interface DishResult {
  readonly item: MenuItem
  readonly venue: Venue
  readonly sectionTitle: string
}

const sectionTitleById = new Map<string, string>(
  menusRaw.flatMap((menu) => menu.sections.map((section): [string, string] => [section.id, section.title])),
)

function dishHaystack(item: MenuItem): readonly string[] {
  const concept = item.dishConceptId === undefined ? undefined : conceptById.get(item.dishConceptId)
  return [item.name, item.description, ...(concept === undefined ? [] : [concept.name, ...concept.synonyms])]
}

/**
 * Поиск по блюдам (§8.3): источник — текущая опубликованная позиция меню. Алкоголя и удалённых позиций в выдаче нет.
 * Позиции закрытых навсегда заведений не показываются. Точное совпадение названия идёт первым.
 */
export function searchDishes(query: string, options: { readonly cityId?: string; readonly limit?: number } = {}): readonly DishResult[] {
  if (normalize(query) === '') return []
  const results = publicMenuItems()
    .map((item): DishResult | undefined => {
      const venue = getVenue(item.venueId)
      if (venue === undefined || venue.status === 'closed_permanently') return undefined
      if (options.cityId !== undefined && venue.cityId !== options.cityId) return undefined
      if (!matchesQuery(query, ...dishHaystack(item))) return undefined
      return { item, venue, sectionTitle: sectionTitleById.get(item.sectionId) ?? '' }
    })
    .filter((result): result is DishResult => result !== undefined)
  const rank = (result: DishResult): number => {
    const name = normalize(result.item.name)
    const q = normalize(query)
    return (name === q ? 4 : 0) + (name.startsWith(q) ? 2 : 0) + (result.item.availability === 'available' ? 1 : 0) + (isOperational(result.venue) ? 1 : 0)
  }
  const ranked = [...results].sort((a, b) => rank(b) - rank(a) || (b.venue.rating?.count ?? 0) - (a.venue.rating?.count ?? 0))
  return options.limit === undefined ? ranked : ranked.slice(0, options.limit)
}

/** Названия для автодополнения: только публичные позиции, без повторов (алкоголь исключён, §8.4). */
export function suggestDishNames(query: string, cityId?: string, limit = 5): readonly string[] {
  const names = searchDishes(query, cityId === undefined ? {} : { cityId }).map((result) => result.item.name)
  return [...new Set(names)].slice(0, limit)
}

/** «Похожие блюда и где ещё есть» (§10.4): те же `DishConcept` в других заведениях; сопоставление консервативное. */
export function similarDishes(itemId: MenuItemId, limit = 4): readonly DishResult[] {
  const base = getMenuItem(itemId)
  if (base === undefined || base.dishConceptId === undefined) return []
  return publicMenuItems()
    .filter((item) => item.dishConceptId === base.dishConceptId && item.venueId !== base.venueId)
    .flatMap((item): DishResult[] => {
      const venue = getVenue(item.venueId)
      return venue === undefined || venue.status === 'closed_permanently' ? [] : [{ item, venue, sectionTitle: sectionTitleById.get(item.sectionId) ?? '' }]
    })
    .slice(0, limit)
}

/** Популярные позиции для превью меню на карточке заведения: с фото и в наличии. */
export function featuredDishes(venueId: VenueId, limit = 4): readonly MenuItem[] {
  const items = publicMenuItems(venueId).filter((item) => item.availability === 'available')
  return [...items.filter((item) => item.photo !== undefined), ...items.filter((item) => item.photo === undefined)].slice(0, limit)
}

/** Сколько алкогольных позиций отфильтровано у заведения. Нужно только проверкам сценария J2, интерфейс это число не показывает. */
export function hiddenAlcoholItemsCount(venueId?: VenueId): number {
  return rawItems.filter((item) => item.isAlcohol && (venueId === undefined || item.venueId === venueId)).length
}
