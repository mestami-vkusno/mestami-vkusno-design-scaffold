<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  UiBanner,
  UiButton,
  UiChip,
  UiCluster,
  UiEmptyState,
  UiGrid,
  UiIcon,
  UiSegmented,
  UiSelect,
  UiSheet,
  UiStack,
  UiSwitch,
  UiText,
  useMediaQuery,
  useToast,
} from '@/design-system'
import { AuthorRow, CardSkeleton, CollectionCard, EventRow, SectionHeader, VenueCard, VenueRow } from '@/features'
import { AiTeaserAsync, FavoriteButtonAsync } from '@/features/lazy'
import { CUISINE_LABEL, DISH_NOT_FOUND_LABEL, VENUE_TAG_LABEL, VENUE_TYPE_PLURAL } from '@/mocks/dictionaries'
import { collectionByline } from '@/mocks/selectors/collections'
import { getArea, getDistrict, getMetroStation, venueLocationLabel } from '@/mocks/selectors/places'
import { homeQuickFilters } from '@/mocks/selectors/home'
import { filterVenues, type VenueFilters, type VenueSort } from '@/mocks/selectors/places'
import { searchAll, suggest, type Suggestion } from '@/mocks/selectors/search'
import type { CityId, CuisineId, VenueTag, VenueType } from '@/mocks/types'
import { useCity } from '@/shell/composables/useCity'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import DishResultCard from './components/DishResultCard.vue'
import FiltersPanel from './components/FiltersPanel.vue'
import CatalogMap from './components/CatalogMap.vue'
import GeoConsentSheet from './components/GeoConsentSheet.vue'
import {
  activeFilterCount,
  DEFAULT_STATE,
  PAGE_SIZE,
  PRICE_TIERS,
  readSearchState,
  writeSearchQuery,
  type SearchState,
} from './searchState'

/*
  S1 · Поиск / Каталог / Карта в одном контексте (§4.5, §8). Корневая вкладка (`keepAlive`): состояние (запрос,
  режим, фильтры, область карты) снимается из query маршрута при монтировании и активации, а не читается
  реактивно из `useRoute()` — иначе, пока вкладка в фоне, страница отрисовывалась бы под чужой адрес (README
  «Оболочка»). Изменения пишутся обратно через `router.replace`, поэтому «Назад» с заведения или события
  возвращает тот же запрос, фильтры и область карты (§26.3).
*/
const route = useRoute()
const router = useRouter()
const { cityId } = useCity()
const { show: showToast } = useToast()
const isDesktop = useMediaQuery('(min-width: 900px)')

const state = ref<SearchState>(DEFAULT_STATE)
const queryDraft = ref('')
const loading = ref(true)
const filtersOpen = ref(false)
const geoOpen = ref(false)
const mapSelectedId = ref<string | null>(null)
const suggestOpen = ref(false)
const debugState = ref<'ok' | 'error'>('ok')

function syncFromRoute(): void {
  state.value = readSearchState(route.query)
  queryDraft.value = state.value.q
  debugState.value = route.query['debug'] === 'error' ? 'error' : 'ok'
}

onMounted(() => {
  syncFromRoute()
  window.setTimeout(() => (loading.value = false), 350)
})
onActivated(syncFromRoute)

function updateState(patch: Partial<SearchState>): void {
  const next: SearchState = { ...state.value, ...patch, count: 'count' in patch ? (patch.count ?? state.value.count) : PAGE_SIZE }
  state.value = next
  void router.replace({ path: '/search', query: writeSearchQuery(next) })
}

const MODE_ITEMS = [
  { id: 'search', label: 'Поиск' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'map', label: 'Карта' },
]

const SORT_OPTIONS: readonly { value: VenueSort; label: string }[] = [
  { value: 'popularity', label: 'По популярности' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'distance', label: 'Сначала ближе' },
  { value: 'check_asc', label: 'Сначала дешевле' },
  { value: 'check_desc', label: 'Сначала дороже' },
]

const TYPE_IDS = Object.keys(VENUE_TYPE_PLURAL) as VenueType[]
const QUICK_FILTERS = homeQuickFilters()

function submitQuery(): void {
  const next = queryDraft.value.trim()
  suggestOpen.value = false
  updateState({ q: next, mode: next === '' ? 'catalog' : 'search' })
}

function onDraftInput(): void {
  suggestOpen.value = queryDraft.value.trim() !== ''
}

const suggestions = computed<readonly Suggestion[]>(() => (suggestOpen.value ? suggest(queryDraft.value, cityId.value, 4) : []))

function pickSuggestion(item: Suggestion): void {
  suggestOpen.value = false
  switch (item.kind) {
    case 'venue':
      void router.push(`/venue/${item.id}`)
      return
    case 'dish':
      queryDraft.value = item.label
      updateState({ q: item.label, mode: 'search' })
      return
    case 'cuisine':
      updateState({ mode: 'catalog', cuisines: [item.id as CuisineId] })
      return
    case 'venue_type':
      updateState({ mode: 'catalog', type: item.id as VenueType })
      return
    case 'author':
      void router.push(`/u/${item.id}`)
      return
    case 'collection':
      void router.push(`/collection/${item.id}`)
      return
    case 'event':
      void router.push(`/event/${item.id}`)
      return
  }
}

// ── Быстрые фильтры (§7.1, О4): «tag» переключает признак, «open_now» и «nearby» — свои флаги. ──────────────
function toggleQuickFilter(filter: (typeof QUICK_FILTERS)[number]): void {
  if (filter.kind === 'open_now') {
    updateState({ openNow: !state.value.openNow })
    return
  }
  if (filter.kind === 'nearby') {
    if (state.value.near) {
      updateState({ near: false })
      return
    }
    geoOpen.value = true
    return
  }
  const tag = filter.value as VenueTag
  const tags = state.value.tags.includes(tag) ? state.value.tags.filter((item) => item !== tag) : [...state.value.tags, tag]
  updateState({ tags })
}

// Отладочная имитация ошибки для QA: адрес с `?debug=error` (см. README «Модель состояний», §26.1); реальный
// мок никогда не падает сам, а без этого крючка `recoverable_error` было бы нечем показать на живой странице.
function retryAfterError(): void {
  debugState.value = 'ok'
  void router.replace({ path: '/search', query: writeSearchQuery(state.value) })
}

function onGeoResolved(anchorLabel: string): void {
  updateState({ near: true })
  showToast({ text: `Опорная точка: ${anchorLabel}`, variant: 'success' })
}

// ── Каталог: фильтры → список заведений (§8.5). Закрытые навсегда исключены по умолчанию (`filterVenues`). ──
const catalogFilters = computed<VenueFilters>(() => {
  const s = state.value
  const price = s.price === null ? undefined : PRICE_TIERS[s.price]
  return {
    cityId: cityId.value,
    query: s.q,
    types: s.type === null ? undefined : [s.type],
    cuisines: s.cuisines.length > 0 ? s.cuisines : undefined,
    districtIds: s.geoScope === 'district' && s.geoIds.length > 0 ? s.geoIds : undefined,
    areaIds: s.geoScope === 'area' && s.geoIds.length > 0 ? s.geoIds : undefined,
    metroIds: s.geoScope === 'metro' && s.geoIds.length > 0 ? s.geoIds : undefined,
    minCheckRub: price?.min,
    maxCheckRub: price?.max,
    tags: s.tags.length > 0 ? s.tags : undefined,
    openNow: s.openNow || undefined,
  }
})

const catalogVenues = computed(() => filterVenues(catalogFilters.value, state.value.near ? 'distance' : state.value.sort))
const catalogVisible = computed(() => catalogVenues.value.slice(0, state.value.count))
const catalogHasMore = computed(() => catalogVenues.value.length > state.value.count)

function showMore(): void {
  updateState({ count: state.value.count + PAGE_SIZE })
}

function resetFilters(): void {
  updateState({ type: null, cuisines: [], geoIds: [], price: null, openNow: false, tags: [] })
}

// ── Поиск: единый контекст по §8.1 — заведения, блюда, кухни, типы, авторы, подборки, события. ──────────────
const searchResults = computed(() => (state.value.q.trim() === '' ? null : searchAll(state.value.q, cityId.value)))

function locationLabel(districtId: string): string {
  return getDistrict(districtId)?.name ?? ''
}

function geoIdLabel(id: string): string {
  if (state.value.geoScope === 'area') return getArea(id)?.name ?? id
  if (state.value.geoScope === 'metro') return getMetroStation(id)?.name ?? id
  return getDistrict(id)?.name ?? id
}

const filterCount = computed(() => activeFilterCount(state.value))
</script>

<template>
  <main class="search-page">
    <ShellContainer>
      <UiStack :gap="4" class="search-page__head">
        <UiText as="h1" variant="h2">Поиск</UiText>
        <div class="search-page__field">
          <input
            v-model="queryDraft"
            class="search-page__input"
            type="search"
            placeholder="Найти ресторан, кухню или блюдо…"
            aria-label="Поиск заведений, блюд, кухонь, авторов и событий"
            role="combobox"
            :aria-expanded="suggestOpen && suggestions.length > 0"
            @input="onDraftInput"
            @focus="onDraftInput"
            @keydown.enter.prevent="submitQuery"
            @keydown.esc="suggestOpen = false"
          />
          <button class="search-page__submit" type="button" aria-label="Искать" @click="submitQuery"><UiIcon name="search" /></button>
          <ul v-if="suggestOpen && suggestions.length > 0" class="search-page__suggestions" role="listbox" aria-label="Подсказки">
            <li v-for="item in suggestions" :key="`${item.kind}-${item.id}`" role="option" :aria-selected="false">
              <button type="button" class="search-page__suggestion" @mousedown.prevent="pickSuggestion(item)">
                <span>{{ item.label }}</span>
                <span v-if="item.hint" class="search-page__suggestion-hint">{{ item.hint }}</span>
              </button>
            </li>
          </ul>
        </div>

        <UiSegmented :items="MODE_ITEMS" label="Режим поиска" :model-value="state.mode" @update:model-value="(value) => updateState({ mode: value as SearchState['mode'] })" />

        <div class="search-page__quick">
          <UiChip
            v-for="filter in QUICK_FILTERS"
            :key="filter.id"
            size="sm"
            :icon="filter.kind === 'nearby' ? 'pin' : filter.kind === 'open_now' ? 'clock' : undefined"
            :selected="filter.kind === 'open_now' ? state.openNow : filter.kind === 'nearby' ? state.near : state.tags.includes(filter.value as VenueTag)"
            @click="toggleQuickFilter(filter)"
          >
            {{ filter.label }}
          </UiChip>
        </div>
      </UiStack>

      <UiBanner v-if="debugState === 'error'" variant="danger" title="Не удалось загрузить результаты" class="search-page__error">
        Проверьте соединение и попробуйте снова.
        <template #action><UiButton size="sm" @click="retryAfterError">Повторить</UiButton></template>
      </UiBanner>

      <!-- ── Режим «Поиск»: единый контекст результатов (§8.1) ─────────────────────────────────────────── -->
      <section v-if="state.mode === 'search' && debugState === 'ok'" class="search-page__section" aria-label="Результаты поиска">
        <div v-if="loading" class="search-page__loading"><CardSkeleton kind="dish" :count="3" label="Ищем" /></div>
        <template v-else-if="searchResults === null">
          <UiEmptyState title="Что будем искать?" description="Ресторан, кухня, блюдо, автор, подборка или событие — попробуйте начать вводить запрос выше." />
        </template>
        <template v-else-if="searchResults.isEmpty">
          <UiEmptyState :title="DISH_NOT_FOUND_LABEL" description="Попробуйте другой запрос, снимите часть фильтров или откройте каталог заведений города.">
            <template #actions>
              <UiButton variant="primary" @click="updateState({ mode: 'catalog', q: '' })">Открыть каталог</UiButton>
              <UiButton variant="ghost" href="/">На главную</UiButton>
            </template>
          </UiEmptyState>
          <AiTeaserAsync context="search_empty" source-surface="search" class="search-page__ai" />
        </template>
        <template v-else>
          <section v-if="searchResults.dishes.length > 0" aria-labelledby="search-dishes">
            <SectionHeader id="search-dishes" title="Блюда" :count="String(searchResults.dishes.length)" :heading-level="2" />
            <div class="search-page__dishes">
              <DishResultCard v-for="result in searchResults.dishes" :key="result.item.id" :result="result" :location="locationLabel(result.venue.districtId)" deferred />
            </div>
          </section>
          <section v-if="searchResults.venues.length > 0" aria-labelledby="search-venues">
            <SectionHeader id="search-venues" title="Заведения" :count="String(searchResults.venues.length)" :heading-level="2" />
            <div class="search-page__list">
              <VenueRow v-for="venue in searchResults.venues" :key="venue.id" :venue="venue" :location="venueLocationLabel(venue)" deferred />
            </div>
          </section>
          <section v-if="searchResults.events.length > 0" aria-labelledby="search-events">
            <SectionHeader id="search-events" title="События" :count="String(searchResults.events.length)" :heading-level="2" />
            <div class="search-page__list">
              <EventRow v-for="item in searchResults.events" :key="item.event.id" :event="item.event" :occurrence="item.occurrence" deferred />
            </div>
          </section>
          <section v-if="searchResults.collections.length > 0" aria-labelledby="search-collections">
            <SectionHeader id="search-collections" title="Подборки" :count="String(searchResults.collections.length)" :heading-level="2" />
            <UiStack :gap="3">
              <CollectionCard v-for="collection in searchResults.collections" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="row" />
            </UiStack>
          </section>
          <section v-if="searchResults.authors.length > 0" aria-labelledby="search-authors">
            <SectionHeader id="search-authors" title="Авторы" :count="String(searchResults.authors.length)" :heading-level="2" />
            <UiStack :gap="3">
              <AuthorRow v-for="author in searchResults.authors" :key="author.id" :author="author" subtitle="Автор" />
            </UiStack>
          </section>
        </template>
      </section>

      <!-- ── Режимы «Каталог» и «Карта»: общие фильтры и список (§8.5, §8.6) ───────────────────────────── -->
      <template v-else-if="debugState === 'ok'">
        <div class="search-page__catalog-head">
          <div class="search-page__types">
            <UiChip size="sm" :selected="state.type === null" @click="updateState({ type: null })">Все</UiChip>
            <UiChip v-for="type in TYPE_IDS" :key="type" size="sm" :selected="state.type === type" @click="updateState({ type })">{{ VENUE_TYPE_PLURAL[type] }}</UiChip>
          </div>

          <UiCluster justify="between" class="search-page__toolbar">
            <UiCluster :gap="2">
              <UiButton v-if="!isDesktop" variant="outline" size="sm" icon-left="filter" @click="filtersOpen = true">
                Фильтры<span v-if="filterCount > 0" class="fx-sr-only">: выбрано {{ filterCount }}</span>
              </UiButton>
              <UiText variant="caption" class="search-page__count">Найдено {{ catalogVenues.length }} мест</UiText>
            </UiCluster>
            <UiSelect
              class="search-page__sort"
              aria-label="Сортировка результатов"
              :options="SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))"
              :model-value="state.sort"
              @update:model-value="(value) => updateState({ sort: value as VenueSort })"
            />
          </UiCluster>

          <UiCluster v-if="filterCount > 0" :gap="2" class="search-page__selected">
            <UiChip v-if="state.price !== null" variant="tag" removable @remove="updateState({ price: null })">{{ PRICE_TIERS[state.price].label }}</UiChip>
            <UiChip v-if="state.openNow" variant="tag" removable @remove="updateState({ openNow: false })">Открыто сейчас</UiChip>
            <UiChip v-for="id in state.cuisines" :key="id" variant="tag" removable @remove="updateState({ cuisines: state.cuisines.filter((item) => item !== id) })">{{ CUISINE_LABEL[id] }}</UiChip>
            <UiChip v-for="id in state.geoIds" :key="id" variant="tag" removable @remove="updateState({ geoIds: state.geoIds.filter((item) => item !== id) })">{{ geoIdLabel(id) }}</UiChip>
            <UiChip v-for="tag in state.tags" :key="tag" variant="tag" removable @remove="updateState({ tags: state.tags.filter((item) => item !== tag) })">{{ VENUE_TAG_LABEL[tag] }}</UiChip>
            <UiButton variant="ghost" size="sm" @click="resetFilters">Сбросить все</UiButton>
          </UiCluster>
        </div>

        <div class="search-page__body" :class="{ 'search-page__body--with-aside': isDesktop }">
          <aside v-if="isDesktop" class="search-page__aside">
            <FiltersPanel
              :city-id="cityId as CityId"
              :cuisines="state.cuisines"
              :geo-scope="state.geoScope"
              :geo-ids="state.geoIds"
              :price="state.price"
              :open-now="state.openNow"
              :tags="state.tags"
              @change="updateState"
            />
          </aside>

          <div class="search-page__results">
            <div v-if="loading"><CardSkeleton kind="venue" :count="6" label="Загружаем заведения" /></div>

            <template v-else-if="catalogVenues.length === 0">
              <UiEmptyState title="По этим фильтрам ничего нет" description="Попробуйте снять часть фильтров — например, цену или район.">
                <template #actions>
                  <UiButton variant="primary" @click="resetFilters">Сбросить фильтры</UiButton>
                </template>
              </UiEmptyState>
              <AiTeaserAsync context="search_empty" source-surface="search" class="search-page__ai" />
            </template>

            <template v-else-if="state.mode === 'catalog'">
              <UiGrid :min="240" :gap="4">
                <VenueCard v-for="venue in catalogVisible" :key="venue.id" :venue="venue" :location="venueLocationLabel(venue)" deferred>
                  <template #action><FavoriteButtonAsync :venue-id="venue.id" :subject="venue.name" /></template>
                </VenueCard>
              </UiGrid>
              <div v-if="catalogHasMore" class="search-page__more">
                <UiButton variant="outline" icon-left="refresh" @click="showMore">Показать ещё</UiButton>
              </div>
            </template>

            <template v-else>
              <div class="search-page__map-layout">
                <CatalogMap :venues="catalogVenues.slice(0, 60)" :selected-id="mapSelectedId" @select="mapSelectedId = $event" @search-area="updateState({ areaSearched: true })" />
                <div class="search-page__map-list">
                  <VenueRow v-for="venue in catalogVenues.slice(0, 30)" :key="venue.id" :venue="venue" :location="venueLocationLabel(venue)" deferred />
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </ShellContainer>

    <UiSheet v-if="!isDesktop" v-model:open="filtersOpen" title="Фильтры">
      <FiltersPanel
        :city-id="cityId as CityId"
        :cuisines="state.cuisines"
        :geo-scope="state.geoScope"
        :geo-ids="state.geoIds"
        :price="state.price"
        :open-now="state.openNow"
        :tags="state.tags"
        @change="updateState"
      />
      <UiCluster justify="between" class="search-page__filters-footer">
        <UiButton variant="ghost" @click="resetFilters">Сбросить</UiButton>
        <UiButton variant="primary" @click="filtersOpen = false">Показать {{ catalogVenues.length }} мест</UiButton>
      </UiCluster>
    </UiSheet>

    <GeoConsentSheet v-model:open="geoOpen" :city-id="cityId as CityId" @resolved="onGeoResolved" />
  </main>
</template>

<style scoped>
.search-page {
  padding-block: var(--s-6) var(--s-12);
}

.search-page__head {
  margin-bottom: var(--s-6);
}

.search-page__field {
  position: relative;
  display: flex;
  height: 48px;
  border-radius: var(--r-sm);
  overflow: visible;
  background: var(--search-bg);
  border: 1px solid var(--search-border);
}

.search-page__input {
  flex: 1;
  min-width: 0;
  padding: 0 16px;
  border: 0;
  border-radius: var(--r-sm) 0 0 var(--r-sm);
  background: transparent;
  font: 400 15px var(--font);
  color: var(--search-text);
}

.search-page__input:focus {
  outline: none;
}

.search-page__field:focus-within {
  box-shadow: 0 0 0 3px var(--lime-soft);
}

.search-page__submit {
  display: grid;
  place-items: center;
  width: 52px;
  border: 0;
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
  background: var(--lime);
  color: var(--on-accent);
  cursor: pointer;
}

.search-page__suggestions {
  position: absolute;
  z-index: 5;
  top: calc(100% + var(--s-2));
  left: 0;
  right: 0;
  margin: 0;
  padding: var(--s-2);
  list-style: none;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  background: var(--surface);
  box-shadow: var(--shadow-float);
}

.search-page__suggestion {
  display: flex;
  width: 100%;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-2);
  padding: var(--s-2) var(--s-3);
  border: 0;
  border-radius: var(--r-sm);
  background: none;
  color: var(--text);
  font: 400 14px var(--font);
  text-align: left;
  cursor: pointer;
}

@media (hover: hover) and (pointer: fine) {
  .search-page__suggestion:hover {
    background: var(--surface-2);
  }
}

.search-page__suggestion-hint {
  flex: none;
  color: var(--text-3);
  font-size: 12.5px;
}

.search-page__quick {
  display: flex;
  flex-wrap: nowrap;
  gap: var(--s-2);
  overflow-x: auto;
  margin-inline: calc(var(--s-4) * -1);
  padding-inline: var(--s-4);
  scrollbar-width: none;
}

.search-page__quick::-webkit-scrollbar {
  display: none;
}

.search-page__error {
  margin-bottom: var(--s-4);
}

.search-page__section {
  display: grid;
  gap: var(--s-8);
}

.search-page__dishes,
.search-page__list {
  display: grid;
}

.search-page__ai {
  margin-top: var(--s-6);
}

.search-page__catalog-head {
  display: grid;
  gap: var(--s-3);
  margin-bottom: var(--s-4);
}

.search-page__types {
  display: flex;
  flex-wrap: nowrap;
  gap: var(--s-2);
  overflow-x: auto;
  scrollbar-width: none;
}

.search-page__types::-webkit-scrollbar {
  display: none;
}

.search-page__toolbar {
  flex-wrap: wrap;
}

.search-page__count {
  color: var(--text-3);
}

.search-page__sort {
  max-width: 220px;
}

.search-page__selected {
  flex-wrap: wrap;
}

.search-page__body--with-aside {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: var(--s-8);
  align-items: start;
}

.search-page__aside {
  position: sticky;
  top: calc(56px + var(--s-4));
}

.search-page__more {
  display: flex;
  justify-content: center;
  margin-top: var(--s-6);
}

.search-page__map-layout {
  display: grid;
  gap: var(--s-4);
}

.search-page__map-list {
  content-visibility: auto;
}

.search-page__filters-footer {
  margin-top: var(--s-4);
}

@media (min-width: 900px) {
  .search-page__map-layout {
    grid-template-columns: 320px minmax(0, 1fr);
    align-items: start;
  }

  .search-page__map-list {
    max-height: 520px;
    overflow-y: auto;
  }
}
</style>
