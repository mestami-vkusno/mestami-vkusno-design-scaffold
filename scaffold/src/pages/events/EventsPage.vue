<script setup lang="ts">
/*
  E1 «Афиша» (§11.2, `/events`). Без фильтров — витрина по разделам (Сегодня в городе, Выбор редакции,
  На выходных, Скоро, события в любимых местах вошедшего); стоит фильтр, поиск или конкретная дата —
  единый список результатов с «Показать ещё» (без нумерации страниц). Фильтры и активная дата живут в
  адресной строке (`?day=…&date=…&category=…&location=…&price=…&status=…&q=…`), поэтому «Смотреть все»
  из раздела и обратная ссылка работают как обычная навигация.
*/
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiBadge, UiButton, UiChip, UiCluster, UiEmptyState, UiGrid, UiRouteMotif, UiSearchInput, UiStack, UiText } from '@/design-system'
import { EVENT_CATEGORY_LABEL, EVENT_PRICE_KIND_LABEL, EVENT_STATUS_LABEL } from '@/mocks/dictionaries'
import { formatCount, formatDate } from '@/mocks/format'
import { districtsByCity, eventsByDay, eventsInVenues, filterEvents, getCity, getVenue, venueLocationLabel } from '@/mocks/selectors'
import type { EventCategory, EventPriceKind, EventStatus, VenueId } from '@/mocks/types'
import { CardSkeleton, EventCard, HorizontalRail, SectionHeader } from '@/features'
import { AiTeaserAsync, SaveButtonAsync } from '@/features/lazy'
import { useCity } from '@/shell/composables/useCity'
import { useViewer } from '@/shell/composables/useViewer'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { useLibrary } from '@/state/useLibrary'
import { EVENT_CATEGORIES, EVENT_PRICE_KINDS, EVENT_STATUSES, QUICK_DAYS, queryList, queryString, type QuickDay } from './eventHelpers'
import EventsDateSheet from './components/EventsDateSheet.vue'
import EventsFiltersSheet from './components/EventsFiltersSheet.vue'

const PAGE_SIZE = 12
const QUICK_DAY_LABEL: Record<QuickDay, string> = { today: 'Сегодня', tomorrow: 'Завтра', weekend: 'Выходные' }

const route = useRoute()
const router = useRouter()
const { city } = useCity()
const { isSignedIn } = useViewer()
const library = useLibrary()

const districts = computed(() => districtsByCity(city.value.id))
/* `useCity()` отдаёт облегчённый тип оболочки (id, name); родительный падеж («Афиша Петербурга») — из справочника моков. */
const cityGenitive = computed(() => getCity(city.value.id)?.genitive ?? city.value.name)

// ── Фильтры: источник истины — адресная строка ────────────────────────────
const selectedDay = ref<QuickDay | null>(null)
const selectedDate = ref<string | null>(null)
const categories = ref<Set<EventCategory>>(new Set())
const locationId = ref('')
const priceKinds = ref<Set<EventPriceKind>>(new Set())
const statuses = ref<Set<EventStatus>>(new Set())
const searchText = ref('')

function applyFromQuery(): void {
  const day = queryString(route.query.day)
  selectedDay.value = (QUICK_DAYS as readonly string[]).includes(day) ? (day as QuickDay) : null
  const date = queryString(route.query.date)
  selectedDate.value = date === '' ? null : date
  categories.value = new Set(queryList(route.query.category, EVENT_CATEGORIES))
  locationId.value = queryString(route.query.location)
  priceKinds.value = new Set(queryList(route.query.price, EVENT_PRICE_KINDS))
  statuses.value = new Set(queryList(route.query.status, EVENT_STATUSES))
  searchText.value = queryString(route.query.q)
}
watch(() => route.query, applyFromQuery, { immediate: true })

function pushQuery(): void {
  const query: Record<string, string> = {}
  if (selectedDay.value) query.day = selectedDay.value
  if (selectedDate.value) query.date = selectedDate.value
  if (categories.value.size > 0) query.category = [...categories.value].join(',')
  if (locationId.value) query.location = locationId.value
  if (priceKinds.value.size > 0) query.price = [...priceKinds.value].join(',')
  if (statuses.value.size > 0) query.status = [...statuses.value].join(',')
  if (searchText.value.trim()) query.q = searchText.value.trim()
  void router.replace({ query })
}

function pickDay(day: QuickDay): void {
  selectedDay.value = selectedDay.value === day ? null : day
  selectedDate.value = null
  pushQuery()
}

const dateSheetOpen = ref(false)
function applyDate(date: string | null): void {
  selectedDate.value = date
  if (date) selectedDay.value = null
  pushQuery()
}

function toggleCategory(category: EventCategory): void {
  const next = new Set(categories.value)
  if (next.has(category)) next.delete(category)
  else next.add(category)
  categories.value = next
  pushQuery()
}
function clearCategories(): void {
  categories.value = new Set()
  pushQuery()
}

const filtersSheetOpen = ref(false)
function applyFilters(value: { locationId: string; priceKinds: EventPriceKind[]; statuses: EventStatus[] }): void {
  locationId.value = value.locationId
  priceKinds.value = new Set(value.priceKinds)
  statuses.value = new Set(value.statuses)
  pushQuery()
}

function submitSearch(): void {
  pushQuery()
}

function resetAllFilters(): void {
  selectedDay.value = null
  selectedDate.value = null
  categories.value = new Set()
  locationId.value = ''
  priceKinds.value = new Set()
  statuses.value = new Set()
  searchText.value = ''
  pushQuery()
}

const hasActiveFilters = computed(
  () =>
    selectedDay.value !== null ||
    selectedDate.value !== null ||
    categories.value.size > 0 ||
    locationId.value !== '' ||
    priceKinds.value.size > 0 ||
    statuses.value.size > 0 ||
    searchText.value.trim() !== '',
)

interface ActiveChip {
  key: string
  label: string
  remove: () => void
}

const activeChips = computed<ActiveChip[]>(() => {
  const chips: ActiveChip[] = []
  if (selectedDay.value) chips.push({ key: 'day', label: QUICK_DAY_LABEL[selectedDay.value], remove: () => pickDay(selectedDay.value as QuickDay) })
  if (selectedDate.value) chips.push({ key: 'date', label: formatDate(selectedDate.value), remove: () => applyDate(null) })
  for (const category of categories.value) chips.push({ key: `c-${category}`, label: EVENT_CATEGORY_LABEL[category], remove: () => toggleCategory(category) })
  if (locationId.value) {
    const district = districts.value.find((item) => item.id === locationId.value)
    if (district) chips.push({ key: 'location', label: district.name, remove: () => applyFilters({ locationId: '', priceKinds: [...priceKinds.value], statuses: [...statuses.value] }) })
  }
  for (const kind of priceKinds.value)
    chips.push({ key: `p-${kind}`, label: EVENT_PRICE_KIND_LABEL[kind], remove: () => applyFilters({ locationId: locationId.value, priceKinds: [...priceKinds.value].filter((k) => k !== kind), statuses: [...statuses.value] }) })
  for (const status of statuses.value)
    chips.push({ key: `s-${status}`, label: EVENT_STATUS_LABEL[status], remove: () => applyFilters({ locationId: locationId.value, priceKinds: [...priceKinds.value], statuses: [...statuses.value].filter((s) => s !== status) }) })
  if (searchText.value.trim())
    chips.push({
      key: 'q',
      label: `«${searchText.value.trim()}»`,
      remove: () => {
        searchText.value = ''
        pushQuery()
      },
    })
  return chips
})

// ── Единый список результатов (фильтр/поиск/дата активны) ─────────────────
/**
 * Событие не хранит район напрямую (§11.1: у него только заведение), поэтому фильтр «местоположение»
 * сначала находит заведения выбранного района, а потом сужает афишу до их `venueId`.
 */
function locationVenueIds(): readonly VenueId[] | undefined {
  if (!locationId.value || districts.value.every((item) => item.id !== locationId.value)) return undefined
  return filterEvents({ cityId: city.value.id })
    .map((item) => getVenue(item.event.venueId))
    .filter((venue): venue is NonNullable<typeof venue> => venue !== undefined && venue.districtId === locationId.value)
    .map((venue) => venue.id)
}

const filteredResults = computed(() =>
  filterEvents({
    cityId: city.value.id,
    ...(selectedDate.value ? { date: selectedDate.value } : selectedDay.value ? { day: selectedDay.value } : {}),
    ...(categories.value.size > 0 ? { categories: [...categories.value] } : {}),
    ...(locationVenueIds() ? { venueIds: locationVenueIds() } : {}),
    ...(priceKinds.value.size > 0 ? { priceKinds: [...priceKinds.value] } : {}),
    ...(statuses.value.size > 0 ? { statuses: [...statuses.value] } : {}),
    ...(searchText.value.trim() ? { query: searchText.value.trim() } : {}),
  }),
)

const resultsTitle = computed(() => {
  if (selectedDate.value) return `События · ${formatDate(selectedDate.value)}`
  if (selectedDay.value === 'today') return 'Сегодня в городе'
  if (selectedDay.value === 'tomorrow') return 'События завтра'
  if (selectedDay.value === 'weekend') return 'На выходных'
  return 'Результаты поиска'
})

const visibleCount = ref(PAGE_SIZE)
watch(filteredResults, () => (visibleCount.value = PAGE_SIZE))
const visibleResults = computed(() => filteredResults.value.slice(0, visibleCount.value))
const canShowMore = computed(() => visibleCount.value < filteredResults.value.length)
const loadingMore = ref(false)

function showMore(): void {
  loadingMore.value = true
  // Данные мока уже в памяти; короткая пауза только чтобы показать состояние загрузки, а не тянуть с бэкенда.
  window.setTimeout(() => {
    visibleCount.value += PAGE_SIZE
    loadingMore.value = false
  }, 320)
}

// ── Витрина по разделам (без активных фильтров) ────────────────────────────
const todayItems = computed(() => eventsByDay(city.value.id, 'today'))
const editorsPickItems = computed(() => filterEvents({ cityId: city.value.id, editorsPickOnly: true }))
const weekendItems = computed(() => eventsByDay(city.value.id, 'weekend'))
const soonItems = computed(() => eventsByDay(city.value.id, 'soon'))
const favoriteVenueEvents = computed(() => (isSignedIn.value ? eventsInVenues(library.favorites.value.map((venue) => venue.id)) : []))

function venueName(venueId: VenueId): string {
  return getVenue(venueId)?.name ?? ''
}
function venueLocation(venueId: VenueId): string {
  const venue = getVenue(venueId)
  return venue ? venueLocationLabel(venue) : ''
}
</script>

<template>
  <main class="events-page">
    <ShellContainer>
      <header class="events-page__hero">
        <div class="events-page__hero-text">
          <UiText as="h1" variant="h2">Что происходит в городе</UiText>
          <UiText variant="body-lg">Ужины с шефами, дегустации, бранчи, музыкальные вечера и другие события в заведениях {{ cityGenitive }}.</UiText>
        </div>
        <UiRouteMotif class="events-page__hero-motif" :width="220" />
      </header>

      <UiSearchInput v-model="searchText" label="Поиск события или заведения" placeholder="Найти событие или заведение…" @submit="submitSearch" />

      <div class="events-page__quick-days" role="group" aria-label="Быстрый выбор даты">
        <UiChip v-for="day in QUICK_DAYS" :key="day" :selected="selectedDay === day" @click="pickDay(day)">{{ QUICK_DAY_LABEL[day] }}</UiChip>
        <UiChip icon="calendar" :selected="selectedDate !== null" @click="dateSheetOpen = true">
          {{ selectedDate ? formatDate(selectedDate) : 'Выбрать дату' }}
        </UiChip>
      </div>

      <div class="events-page__categories" role="group" aria-label="Категория события">
        <UiChip variant="inverse" :selected="categories.size === 0" @click="clearCategories">Все события</UiChip>
        <UiChip v-for="category in EVENT_CATEGORIES" :key="category" :selected="categories.has(category)" @click="toggleCategory(category)">
          {{ EVENT_CATEGORY_LABEL[category] }}
        </UiChip>
        <UiButton size="sm" variant="outline" icon-left="filter" @click="filtersSheetOpen = true">Фильтры</UiButton>
      </div>

      <UiCluster v-if="hasActiveFilters" class="events-page__active-filters" as="div" :gap="2">
        <span class="fx-sr-only">Активные фильтры:</span>
        <UiChip v-for="chip in activeChips" :key="chip.key" variant="tag" removable @remove="chip.remove">{{ chip.label }}</UiChip>
        <UiButton size="sm" variant="ghost" @click="resetAllFilters">Сбросить всё</UiButton>
      </UiCluster>

      <!-- Режим результатов: активен фильтр, поиск или конкретная дата — единый список вместо разделов. -->
      <section v-if="hasActiveFilters" class="events-page__results" aria-labelledby="events-results-heading">
        <SectionHeader id="events-results-heading" :title="resultsTitle" :count="formatCount(filteredResults.length, 'событие', 'события', 'событий')" />
        <UiEmptyState v-if="filteredResults.length === 0" mode="empty" title="Событий не нашлось" description="Попробуйте изменить дату, категорию или другие фильтры.">
          <template #actions>
            <UiButton variant="outline" @click="resetAllFilters">Сбросить фильтры</UiButton>
          </template>
        </UiEmptyState>
        <template v-else>
          <UiGrid :min="260" :gap="4">
            <EventCard
              v-for="item in visibleResults"
              :key="item.event.id"
              :event="item.event"
              :occurrence="item.occurrence"
              :venue-name="venueName(item.event.venueId)"
              :location="venueLocation(item.event.venueId)"
              deferred
            >
              <template #action>
                <SaveButtonAsync kind="event" :id="item.event.id" :subject="item.event.title" variant="overlay" />
              </template>
            </EventCard>
            <CardSkeleton v-if="loadingMore" kind="event" :count="Math.min(PAGE_SIZE, filteredResults.length - visibleCount)" />
          </UiGrid>
          <div v-if="canShowMore" class="events-page__more">
            <UiButton variant="outline" :loading="loadingMore" @click="showMore">Показать ещё</UiButton>
          </div>
        </template>
      </section>

      <!-- Витрина по разделам: показываем, пока пользователь ничего не фильтрует и не ищет. -->
      <template v-else>
        <section v-if="todayItems.length > 0" class="events-page__section" aria-labelledby="events-today-heading">
          <SectionHeader id="events-today-heading" title="Сегодня в городе" size="lg" :count="formatCount(todayItems.length, 'событие', 'события', 'событий')" />
          <HorizontalRail label="Сегодня в городе">
            <EventCard v-for="item in todayItems" :key="item.event.id" :event="item.event" :occurrence="item.occurrence" :venue-name="venueName(item.event.venueId)" :location="venueLocation(item.event.venueId)" deferred>
              <template #action>
                <SaveButtonAsync kind="event" :id="item.event.id" :subject="item.event.title" variant="overlay" />
              </template>
            </EventCard>
          </HorizontalRail>
        </section>

        <section v-if="editorsPickItems.length > 0" class="events-page__section" aria-labelledby="events-editorial-heading">
          <SectionHeader id="events-editorial-heading" title="Выбор редакции" description="События, на которые стоит обратить внимание." />
          <UiGrid :min="260" :gap="4">
            <EventCard
              v-for="item in editorsPickItems"
              :key="item.event.id"
              :event="item.event"
              :occurrence="item.occurrence"
              :venue-name="venueName(item.event.venueId)"
              :location="venueLocation(item.event.venueId)"
              deferred
            >
              <template #action>
                <SaveButtonAsync kind="event" :id="item.event.id" :subject="item.event.title" variant="overlay" />
              </template>
            </EventCard>
          </UiGrid>
        </section>

        <section v-if="weekendItems.length > 0" class="events-page__section" aria-labelledby="events-weekend-heading">
          <SectionHeader id="events-weekend-heading" title="На выходных" href="/events?day=weekend" />
          <HorizontalRail label="На выходных">
            <EventCard v-for="item in weekendItems" :key="item.event.id" :event="item.event" :occurrence="item.occurrence" :venue-name="venueName(item.event.venueId)" :location="venueLocation(item.event.venueId)" deferred>
              <template #action>
                <SaveButtonAsync kind="event" :id="item.event.id" :subject="item.event.title" variant="overlay" />
              </template>
            </EventCard>
          </HorizontalRail>
        </section>

        <section v-if="soonItems.length > 0" class="events-page__section" aria-labelledby="events-soon-heading">
          <SectionHeader id="events-soon-heading" title="Скоро" description="События, которые стоит запланировать заранее." />
          <HorizontalRail label="Скоро">
            <EventCard v-for="item in soonItems" :key="item.event.id" :event="item.event" :occurrence="item.occurrence" :venue-name="venueName(item.event.venueId)" :location="venueLocation(item.event.venueId)" deferred>
              <template #action>
                <SaveButtonAsync kind="event" :id="item.event.id" :subject="item.event.title" variant="overlay" />
              </template>
            </EventCard>
          </HorizontalRail>
        </section>

        <section v-if="isSignedIn && favoriteVenueEvents.length > 0" class="events-page__section" aria-labelledby="events-favorites-heading">
          <SectionHeader id="events-favorites-heading" title="События в ваших любимых местах" description="Новое в заведениях, которые вы сохранили." />
          <HorizontalRail label="События в ваших любимых местах">
            <EventCard
              v-for="item in favoriteVenueEvents"
              :key="item.event.id"
              :event="item.event"
              :occurrence="item.occurrence"
              :venue-name="venueName(item.event.venueId)"
              :location="venueLocation(item.event.venueId)"
              deferred
            >
              <template #action>
                <SaveButtonAsync kind="event" :id="item.event.id" :subject="item.event.title" variant="overlay" />
              </template>
            </EventCard>
          </HorizontalRail>
        </section>
      </template>

      <section class="events-page__ai" aria-label="Подбор события с ИИ">
        <AiTeaserAsync context="event" source-surface="events" />
      </section>
    </ShellContainer>
  </main>

  <EventsDateSheet v-model:open="dateSheetOpen" :date="selectedDate" @apply="applyDate" />
  <EventsFiltersSheet v-model:open="filtersSheetOpen" :districts="districts" :location-id="locationId" :price-kinds="[...priceKinds]" :statuses="[...statuses]" @apply="applyFilters" />
</template>

<style scoped>
.events-page {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
  padding-block: var(--s-6) var(--s-12);
}

.events-page__hero {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s-4);
}

.events-page__hero-text {
  display: grid;
  gap: var(--s-2);
  max-width: 640px;
}

.events-page__hero-motif {
  display: none;
  flex: none;
  color: var(--deco);
  opacity: 0.7;
}

.events-page__quick-days,
.events-page__categories {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.events-page__quick-days::-webkit-scrollbar,
.events-page__categories::-webkit-scrollbar {
  display: none;
}

.events-page__active-filters {
  flex-wrap: wrap;
}

.events-page__section,
.events-page__results {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  /* Ниже сгиба на телефоне: то, что вне экрана, не считается и не рисуется (см. README «Плавность на телефонах»). */
  content-visibility: auto;
  contain-intrinsic-size: auto 420px;
}

.events-page__more {
  display: flex;
  justify-content: center;
  padding-top: var(--s-2);
}

.events-page__ai {
  content-visibility: auto;
  contain-intrinsic-size: auto 220px;
}

@media (min-width: 720px) {
  .events-page__hero-motif {
    display: block;
  }
}
</style>
