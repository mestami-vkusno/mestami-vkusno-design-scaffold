/*
  Состояние страницы Поиска (S1) в query-параметрах маршрута (§26.3): запрос, режим, фильтры и область карты
  переживают «Назад» и возврат на вкладку. Страница читает их снимком при активации (`onActivated`), а не
  реактивно через `useRoute()`, чтобы не перерисовываться, пока вкладка держится в фоне `<KeepAlive>` (README «Оболочка»).
*/
import type { LocationQuery, LocationQueryRaw, LocationQueryValue } from 'vue-router'
import type { VenueSort } from '@/mocks/selectors/places'
import type { CuisineId, VenueTag, VenueType } from '@/mocks/types'

export type SearchMode = 'search' | 'catalog' | 'map'
export type GeoScope = 'district' | 'area' | 'metro'
export type PriceTier = 'low' | 'mid' | 'high'

export const PRICE_TIERS: Readonly<Record<PriceTier, { readonly label: string; readonly min?: number; readonly max?: number }>> = {
  low: { label: 'до 1500 ₽', max: 1500 },
  mid: { label: '1500–3000 ₽', min: 1500, max: 3000 },
  high: { label: 'от 3000 ₽', min: 3000 },
}

export const PAGE_SIZE = 8

export interface SearchState {
  readonly mode: SearchMode
  readonly q: string
  /** Категория каталога: одна активная (венчур принадлежит одному типу), «Все» — `null`. */
  readonly type: VenueType | null
  readonly cuisines: readonly CuisineId[]
  readonly geoScope: GeoScope
  readonly geoIds: readonly string[]
  readonly price: PriceTier | null
  readonly openNow: boolean
  readonly tags: readonly VenueTag[]
  /** «Рядом со мной»: сортирует по расстоянию, требует опорной точки или геолокации (§8.7). */
  readonly near: boolean
  readonly sort: VenueSort
  /** Сколько карточек каталога показано («Показать ещё» увеличивает). */
  readonly count: number
  /** Нажата ли «Искать в этой области» на текущей (фиктивной) области карты. */
  readonly areaSearched: boolean
}

export const DEFAULT_STATE: SearchState = {
  mode: 'catalog',
  q: '',
  type: null,
  cuisines: [],
  geoScope: 'district',
  geoIds: [],
  price: null,
  openNow: false,
  tags: [],
  near: false,
  sort: 'popularity',
  count: PAGE_SIZE,
  areaSearched: false,
}

const MODES: readonly SearchMode[] = ['search', 'catalog', 'map']
const GEO_SCOPES: readonly GeoScope[] = ['district', 'area', 'metro']
const PRICES: readonly PriceTier[] = ['low', 'mid', 'high']
const SORTS: readonly VenueSort[] = ['popularity', 'rating', 'distance', 'check_asc', 'check_desc']

function first(value: LocationQueryValue | LocationQueryValue[] | undefined): string {
  return typeof value === 'string' ? value : Array.isArray(value) && typeof value[0] === 'string' ? value[0] : ''
}

function csv(value: LocationQueryValue | LocationQueryValue[] | undefined): readonly string[] {
  const raw = first(value)
  return raw === '' ? [] : raw.split(',')
}

/** Снимок состояния из query маршрута; неизвестные и повреждённые значения тихо откатываются на дефолт. */
export function readSearchState(query: LocationQuery): SearchState {
  const modeRaw = first(query['mode']) as SearchMode
  const q = first(query['q'])
  return {
    mode: MODES.includes(modeRaw) ? modeRaw : q !== '' ? 'search' : DEFAULT_STATE.mode,
    q,
    type: (first(query['type']) || null) as VenueType | null,
    cuisines: csv(query['cuisines']) as CuisineId[],
    geoScope: (GEO_SCOPES.includes(first(query['geoScope']) as GeoScope) ? first(query['geoScope']) : DEFAULT_STATE.geoScope) as GeoScope,
    geoIds: csv(query['geoIds']),
    price: (PRICES.includes(first(query['price']) as PriceTier) ? first(query['price']) : null) as PriceTier | null,
    openNow: first(query['open']) === '1',
    tags: csv(query['tags']) as VenueTag[],
    near: first(query['near']) === '1',
    sort: (SORTS.includes(first(query['sort']) as VenueSort) ? first(query['sort']) : DEFAULT_STATE.sort) as VenueSort,
    count: Math.max(PAGE_SIZE, Number.parseInt(first(query['count']), 10) || PAGE_SIZE),
    areaSearched: first(query['area']) === '1',
  }
}

/** Обратно в query: только непустые/нестандартные значения, чтобы адрес оставался коротким и читаемым. */
export function writeSearchQuery(state: SearchState): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (state.mode !== DEFAULT_STATE.mode) query['mode'] = state.mode
  if (state.q !== '') query['q'] = state.q
  if (state.type !== null) query['type'] = state.type
  if (state.cuisines.length > 0) query['cuisines'] = state.cuisines.join(',')
  if (state.geoIds.length > 0) {
    query['geoScope'] = state.geoScope
    query['geoIds'] = state.geoIds.join(',')
  }
  if (state.price !== null) query['price'] = state.price
  if (state.openNow) query['open'] = '1'
  if (state.tags.length > 0) query['tags'] = state.tags.join(',')
  if (state.near) query['near'] = '1'
  if (state.sort !== DEFAULT_STATE.sort) query['sort'] = state.sort
  if (state.count !== PAGE_SIZE) query['count'] = String(state.count)
  if (state.areaSearched) query['area'] = '1'
  return query
}

export function hasActiveFilters(state: SearchState): boolean {
  return (
    state.type !== null ||
    state.cuisines.length > 0 ||
    state.geoIds.length > 0 ||
    state.price !== null ||
    state.openNow ||
    state.tags.length > 0
  )
}

export function activeFilterCount(state: SearchState): number {
  return (
    (state.type !== null ? 1 : 0) +
    state.cuisines.length +
    state.geoIds.length +
    (state.price !== null ? 1 : 0) +
    (state.openNow ? 1 : 0) +
    state.tags.length
  )
}
