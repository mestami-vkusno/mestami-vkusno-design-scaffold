<script setup lang="ts">
/*
  O13 · Выбор объекта в редакторах: заведение, блюдо, событие, Посещение. Шторка снизу на телефоне, окно по центру на широком экране
  (это `UiSheet`). Для заведения — последние просмотренные и избранное сверху, затем поиск по каталогу (только опубликованные, §13.5);
  для блюда — меню выбранного заведения без алкоголя (§8.4, §13Б); для события — события этого заведения; для Посещения — свои
  Посещения этого заведения и «Добавить новое» (CR4).
*/
import { computed, ref, watch } from 'vue'
import { UiButton, UiEmptyState, UiListRow, UiSearchInput, UiSheet, UiText } from '@/design-system'
import { formatDate, formatMenuPrice } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { publicMenuItems } from '@/mocks/selectors/menu'
import { eventsByVenue, nextOccurrence } from '@/mocks/selectors/events'
import { allVenues, getVenue, venueLocationLabel } from '@/mocks/selectors/places'
import { matchesQuery } from '@/mocks/selectors/text'
import type { Venue, VenueEvent } from '@/mocks/types'
import { useLibrary } from '@/state/useLibrary'

export type PickerKind = 'venue' | 'dish' | 'event' | 'visit'

const props = defineProps<{
  kind: PickerKind
  /** Для блюда, события и Посещения: заведение, внутри которого выбираем. */
  venueId?: string | null
  /** Заведения, которые уже выбраны (подборка): помечаются, но остаются доступными — дубль отклонит сам редактор. */
  taken?: readonly string[]
}>()
const emit = defineEmits<{ pick: [id: string]; 'add-visit': [] }>()
const open = defineModel<boolean>('open', { required: true })

const library = useLibrary()
const query = ref('')
watch(open, (value) => {
  if (value) query.value = ''
})

const TITLES: Readonly<Record<PickerKind, string>> = {
  venue: 'Выбрать заведение',
  dish: 'Выбрать блюдо',
  event: 'Выбрать событие',
  visit: 'Выбрать Посещение',
}

const SEARCH_LABELS: Readonly<Record<'venue' | 'dish' | 'event', string>> = {
  venue: 'Найти заведение',
  dish: 'Найти блюдо',
  event: 'Найти событие',
}

const isPublished = (venue: Venue): boolean => venue.status === 'published'

/** Последние просмотренные и избранное — наверху, без повторов. */
const suggested = computed<readonly Venue[]>(() => {
  const ids = [...library.recentlyViewed.value.filter((item) => item.kind === 'venue').map((item) => item.id), ...library.favorites.value.map((venue) => venue.id)]
  const seen = new Set<string>()
  const result: Venue[] = []
  for (const id of ids) {
    const venue = getVenue(id)
    if (venue !== undefined && isPublished(venue) && !seen.has(id)) {
      seen.add(id)
      result.push(venue)
    }
  }
  return result.slice(0, 8)
})

const venueRows = computed<readonly Venue[]>(() => {
  const text = query.value.trim()
  if (text === '') return suggested.value
  return allVenues()
    .filter((venue) => isPublished(venue) && matchesQuery(text, venue.name, venue.address))
    .slice(0, 30)
})

const dishRows = computed(() => {
  const text = query.value.trim()
  return publicMenuItems(props.venueId ?? undefined).filter((item) => item.availability !== 'removed' && (text === '' || matchesQuery(text, item.name)))
})

const eventRows = computed(() => {
  const text = query.value.trim()
  return eventsByVenue(props.venueId ?? '').filter((event) => text === '' || matchesQuery(text, event.title))
})

const visitRows = computed(() => library.visits.value.filter((entry) => entry.venue.id === props.venueId))

function eventDate(event: VenueEvent): string {
  const occurrence = nextOccurrence(event) ?? event.occurrences[0]
  return occurrence === undefined ? '' : formatDate(occurrence.startsAt)
}

function pick(id: string): void {
  emit('pick', id)
  open.value = false
}

function addVisit(): void {
  emit('add-visit')
  open.value = false
}
</script>

<template>
  <UiSheet v-model:open="open" :title="TITLES[kind]">
    <div class="picker">
      <UiSearchInput v-if="kind !== 'visit'" v-model="query" :label="SEARCH_LABELS[kind]" :placeholder="SEARCH_LABELS[kind]" />

      <template v-if="kind === 'venue'">
        <UiText variant="caption" class="picker__title">{{ query.trim() === '' ? 'Недавнее и избранное' : 'Найдено в каталоге' }}</UiText>
        <ul v-if="venueRows.length > 0" class="picker__list">
          <li v-for="venue in venueRows" :key="venue.id">
            <UiListRow :title="venue.name" :description="venueLocationLabel(venue)" :value="taken?.includes(venue.id) ? 'В подборке' : undefined" divider @click="pick(venue.id)">
              <template #leading>
                <span class="picker__thumb"><UiPhotoPlaceholder v-if="venue.gallery[0]" :photo="venue.gallery[0]" ratio="fill" decorative /></span>
              </template>
            </UiListRow>
          </li>
        </ul>
        <UiEmptyState v-else mode="empty" title="Ничего не нашли" description="Публиковать можно о заведениях из каталога: предложить новое пока нельзя." :heading-level="3" />
      </template>

      <template v-else-if="kind === 'dish'">
        <ul v-if="dishRows.length > 0" class="picker__list">
          <li v-for="item in dishRows" :key="item.id">
            <UiListRow :title="item.name" :description="item.availability === 'temporarily_unavailable' ? 'Временно недоступно' : item.description" :value="formatMenuPrice(item.priceRub)" divider @click="pick(item.id)" />
          </li>
        </ul>
        <UiEmptyState v-else mode="empty" title="В меню ничего не нашли" :heading-level="3" />
      </template>

      <template v-else-if="kind === 'event'">
        <ul v-if="eventRows.length > 0" class="picker__list">
          <li v-for="event in eventRows" :key="event.id">
            <UiListRow :title="event.title" :description="eventDate(event)" divider @click="pick(event.id)" />
          </li>
        </ul>
        <UiEmptyState v-else mode="empty" title="У этого заведения нет событий" :heading-level="3" />
      </template>

      <template v-else>
        <ul v-if="visitRows.length > 0" class="picker__list">
          <li v-for="entry in visitRows" :key="entry.visit.id">
            <UiListRow :title="formatDate(entry.visit.visitedOn)" :description="entry.event?.title ?? entry.visit.note" divider @click="pick(entry.visit.id)" />
          </li>
        </ul>
        <UiText v-else variant="body">У вас нет Посещений этого заведения.</UiText>
        <UiButton variant="outline" icon-left="plus" block @click="addVisit">Добавить новое</UiButton>
      </template>
    </div>
  </UiSheet>
</template>

<style scoped>
.picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
}

.picker__title {
  color: var(--text-3);
}

.picker__list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
}

.picker__thumb {
  position: relative;
  display: block;
  width: 44px;
  height: 44px;
  overflow: hidden;
  border-radius: var(--r-sm);
}
</style>
