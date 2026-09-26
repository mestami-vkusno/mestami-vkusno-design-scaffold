<script setup lang="ts">
/*
  E2 «Событие» (§11, `/event/:id`). Хлебные крошки → hero с датой/ценой/статусом → вкладки-якоря
  (О событии, Программа, Что включено, Фото, Заведение, Информация) → боковая карточка с действиями.
  Неизвестный `:id` показывает 404 внутри оболочки продукта, адрес при этом не меняется.
*/
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  UiBadge,
  UiBanner,
  UiBreadcrumbs,
  UiButton,
  UiCluster,
  UiInfoList,
  UiStack,
  UiSurface,
  UiText,
} from '@/design-system'
import { EVENT_ACTION_LABEL, EVENT_CATEGORY_LABEL, CUISINE_LABEL, VENUE_TYPE_LABEL } from '@/mocks/dictionaries'
import { formatDateFull, formatDateTime, formatTime, formatWeekdayLong } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import {
  getEvent,
  getVenue,
  moreEventsAtVenue,
  moreEventsOnSameDay,
  nextOccurrence,
  occurrencesOf,
  openState,
  openStatusLabel,
  resolveEventLink,
  filterEvents,
  venueLocationLabel,
} from '@/mocks/selectors'
import { EventRow, HorizontalRail, PriceLabel, RatingLabel, SectionHeader, ShareButton, StatusBadge, isRoutineEventStatus } from '@/features'
import { AiTeaserAsync, SaveButtonAsync } from '@/features/lazy'
import { SaveButton } from '@/features/actions'
import ReportDataLink from '@/overlays/ReportDataLink.vue'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { useCity } from '@/shell/composables/useCity'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import NotFoundPage from '@/pages/system/NotFoundPage.vue'
import { useLibrary } from '@/state/useLibrary'
import { actionDisabledReason as disabledReasonFor, formatDurationLabel, isActionEnabled } from './eventHelpers'
import EventGalleryGrid from './components/EventGalleryGrid.vue'
import EventMapPlaceholder from './components/EventMapPlaceholder.vue'
import EventOccurrenceChips from './components/EventOccurrenceChips.vue'

const route = useRoute()
const { city, setCity } = useCity()
const library = useLibrary()

const eventId = computed(() => String(route.params.id ?? ''))
const event = computed(() => getEvent(eventId.value))
const venue = computed(() => (event.value ? getVenue(event.value.venueId) : undefined))

useDocumentTitle(() => event.value?.title)

// ── Прямая ссылка на событие другого города (§6.3): открывается без смены активного города ────────
const directLink = computed(() => resolveEventLink(eventId.value, city.value.id))

// ── Дата проведения ─────────────────────────────────────────────────────────
const occurrences = computed(() => (event.value ? occurrencesOf(event.value) : []))
const selectedOccurrenceId = ref('')
watch(
  event,
  (value) => {
    selectedOccurrenceId.value = value ? (nextOccurrence(value)?.id ?? value.occurrences[0]?.id ?? '') : ''
  },
  { immediate: true },
)
const occurrence = computed(() => occurrences.value.find((item) => item.id === selectedOccurrenceId.value) ?? occurrences.value[0])
const durationLabel = computed(() => (occurrence.value ? formatDurationLabel(occurrence.value) : undefined))
const wasWhen = computed(() => (occurrence.value?.rescheduledFrom !== undefined ? formatDateTime(occurrence.value.rescheduledFrom) : ''))

const venueLocation = computed(() => (venue.value ? venueLocationLabel(venue.value) : ''))
const venueOpen = computed(() => (venue.value ? { state: openState(venue.value), label: openStatusLabel(venue.value) } : undefined))

// ── Сохранённое событие: уведомление об отмене/переносе (§11.4, §19) ───────
const isSaved = computed(() => (event.value ? library.isEventSaved(event.value.id) : false))
const showSavedStatusNotice = computed(() => isSaved.value && event.value !== undefined && (event.value.status === 'cancelled' || event.value.status === 'rescheduled'))

// ── Разделы-якоря ────────────────────────────────────────────────────────
interface TabSection {
  id: string
  label: string
}
const sections = computed<TabSection[]>(() => {
  if (!event.value) return []
  const list: TabSection[] = [{ id: 'about', label: 'О событии' }]
  if (event.value.program && event.value.program.length > 0) list.push({ id: 'program', label: 'Программа' })
  if (event.value.included && event.value.included.length > 0) list.push({ id: 'included', label: 'Что включено' })
  list.push({ id: 'photos', label: 'Фото' }, { id: 'venue', label: 'Заведение' }, { id: 'info', label: 'Информация' })
  return list
})

// ── Важно знать (§11.1: возраст; условия отмены в данных мока не описаны — нейтральный текст, см. 0017) ──
const importantInfo = computed(() => {
  if (!event.value || !occurrence.value) return []
  const items: { icon: 'clock' | 'user' | 'calendar' | 'info'; title: string; subtitle?: string }[] = [
    { icon: 'clock', title: `Начало в ${formatTime(occurrence.value.startsAt)}`, subtitle: durationLabel.value ? `Продолжительность ${durationLabel.value.replace('≈ ', '')}` : 'Продолжительность не указана' },
    { icon: 'user', title: event.value.ageLimit ? `${event.value.ageLimit}+` : 'Возрастное ограничение не указано' },
  ]
  if (event.value.price.kind === 'registration_required') items.push({ icon: 'info', title: 'Предварительная регистрация обязательна' })
  items.push({ icon: 'info', title: 'Условия отмены и переноса', subtitle: 'Уточняйте у заведения при бронировании (assumption)' })
  return items
})

/*
  Вынесено в computed: внутри замыкания `.some()`/mustache-выражения `event.value` (computed-геттер) не
  наследует сужение типа `VenueEvent | undefined → VenueEvent` — нужен локальный `const` (vue-tsc TS2345).
*/
const hasDisabledAction = computed(() => {
  const current = event.value
  return current ? current.actions.some((action) => !isActionEnabled(current, action.kind)) : false
})
const disabledActionNote = computed(() => (event.value ? disabledReasonFor(event.value) : ''))

// ── Связанные события ───────────────────────────────────────────────────
const moreAtVenue = computed(() => (event.value ? moreEventsAtVenue(event.value.id) : []))
const youMightLike = computed(() => {
  if (!event.value) return []
  return filterEvents({ cityId: city.value.id, categories: [event.value.category] })
    .filter((item) => item.event.id !== event.value?.id && item.event.venueId !== event.value?.venueId)
    .slice(0, 3)
})
const sameDayEvents = computed(() => (event.value ? moreEventsOnSameDay(event.value.id) : []))

function relatedVenueName(venueId: string): string {
  return getVenue(venueId)?.name ?? ''
}
function relatedVenueLocation(venueId: string): string {
  const found = getVenue(venueId)
  return found ? venueLocationLabel(found) : ''
}

function switchToEventCity(): void {
  if (directLink.value) setCity(directLink.value.objectCityId)
}
</script>

<template>
  <NotFoundPage v-if="event === undefined || venue === undefined" />
  <main v-else class="event-page">
    <ShellContainer>
      <UiBanner v-if="directLink?.isOtherCity" variant="info" title="Событие в другом городе" class="event-page__city-banner">
        Это событие проходит не в {{ city.name }}. Переключите город, чтобы видеть остальную афишу рядом с ним.
        <template #action>
          <UiButton size="sm" variant="outline" @click="switchToEventCity">Переключить на «{{ EVENT_CATEGORY_LABEL[event.category] }}»</UiButton>
        </template>
      </UiBanner>

      <UiBreadcrumbs :items="[{ label: 'Главная', href: '/' }, { label: 'Афиша', href: '/events' }, { label: event.title }]" class="event-page__crumbs" />

      <div class="event-page__layout">
        <section class="event-page__hero" aria-labelledby="event-title">
          <div class="event-page__hero-media">
            <UiPhotoPlaceholder :photo="event.photo" ratio="16:9" decorative />
            <div class="event-page__hero-scrim" aria-hidden="true" />
            <div class="event-page__hero-overlay">
              <UiCluster :gap="2">
                <UiBadge variant="accent" pill>{{ EVENT_CATEGORY_LABEL[event.category] }}</UiBadge>
                <StatusBadge v-if="!isRoutineEventStatus(event.status)" :event-status="event.status" />
                <UiBadge v-if="event.editorsPick" variant="new" icon="sparkle">Выбор редакции</UiBadge>
              </UiCluster>
              <UiText id="event-title" as="h1" variant="h2" class="event-page__title">{{ event.title }}</UiText>
              <UiText variant="body-lg" class="event-page__summary">{{ event.summary }}</UiText>
            </div>
          </div>

          <div class="event-page__hero-meta">
            <p v-if="wasWhen" class="event-page__was">Было: {{ wasWhen }}</p>
            <UiCluster :gap="4" class="event-page__facts">
              <span><b>{{ occurrence ? formatDateFull(occurrence.startsAt) : '' }}</b></span>
              <span>{{ occurrence ? formatTime(occurrence.startsAt) : '' }}<template v-if="durationLabel"> · {{ durationLabel }}</template></span>
              <a class="event-page__venue-link" :href="`/venue/${venue.id}`">{{ venue.name }} · {{ venueLocation }}</a>
              <PriceLabel kind="event" :event="event.price" />
            </UiCluster>

            <EventOccurrenceChips v-if="occurrences.length > 1" v-model="selectedOccurrenceId" :occurrences="occurrences" />

            <UiBanner v-if="showSavedStatusNotice" :variant="event.status === 'cancelled' ? 'danger' : 'warning'" title="Вы сохранили это событие">
              {{ event.status === 'cancelled' ? 'Событие отменено организатором.' : 'Дата изменена — см. новую дату выше.' }}
            </UiBanner>

            <UiCluster :gap="2" class="event-page__actions">
              <UiButton
                v-for="action in event.actions"
                :key="action.kind"
                :href="isActionEnabled(event, action.kind) ? action.url : undefined"
                :disabled="!isActionEnabled(event, action.kind)"
                target="_blank"
                rel="noopener noreferrer"
                :variant="action.kind === event.actions[0]?.kind ? 'primary' : 'outline'"
                :icon-right="action.kind === 'details' ? 'arrow-r' : 'external'"
              >
                {{ EVENT_ACTION_LABEL[action.kind] }}
              </UiButton>
              <SaveButton kind="event" :id="event.id" :subject="event.title" variant="action" />
              <ShareButton :target="{ kind: 'event', id: event.id, title: event.title }" variant="action" />
            </UiCluster>
            <p v-if="hasDisabledAction" class="event-page__action-note">{{ disabledActionNote }}</p>
            <p v-if="isSaved && isActionEnabled(event, 'register')" class="event-page__reminder">Мы напомним о событии за день до начала.</p>
          </div>
        </section>

        <aside class="event-page__aside" aria-label="Кратко о событии">
          <UiSurface variant="panel" class="event-page__sidebar-card">
            <UiInfoList
              :items="[
                { icon: 'calendar', title: occurrence ? formatDateFull(occurrence.startsAt) : '', subtitle: occurrence ? formatWeekdayLong(occurrence.startsAt) : undefined },
                { icon: 'clock', title: occurrence ? formatTime(occurrence.startsAt) : '', subtitle: durationLabel },
                { icon: 'pin', title: venue.name, subtitle: venue.address },
                { icon: 'list', title: 'Формат', subtitle: EVENT_CATEGORY_LABEL[event.category] },
              ]"
            />
            <PriceLabel kind="event" :event="event.price" class="event-page__sidebar-price" />
            <p v-if="event.price.kind === 'deposit' && event.price.note" class="event-page__sidebar-note">{{ event.price.note }}</p>
          </UiSurface>

          <section aria-label="Спросить AI о событии">
            <AiTeaserAsync context="event" source-surface="event" :heading-level="3" />
          </section>

          <UiSurface variant="panel" as="section" aria-labelledby="event-important-heading">
            <UiText id="event-important-heading" as="h3" variant="h3">Важно знать</UiText>
            <UiInfoList :items="importantInfo" />
          </UiSurface>

          <UiSurface variant="panel" as="section" aria-labelledby="event-organizer-heading">
            <UiText id="event-organizer-heading" as="h3" variant="h3">Организатор</UiText>
            <UiCluster :gap="3" align="center" class="event-page__organizer">
              <UiPhotoPlaceholder :photo="venue.gallery[0] ?? event.photo" ratio="1:1" decorative class="event-page__organizer-photo" />
              <div>
                <a class="event-page__organizer-name" :href="`/venue/${venue.id}`">{{ venue.name }}</a>
                <p class="event-page__organizer-meta">{{ VENUE_TYPE_LABEL[venue.type] }}</p>
              </div>
            </UiCluster>
          </UiSurface>

          <section v-if="moreAtVenue.length > 0" aria-labelledby="event-more-venue-heading">
            <SectionHeader id="event-more-venue-heading" title="Ещё в этом заведении" size="md" :href="`/venue/${venue.id}`" />
            <UiStack :gap="2">
              <EventRow v-for="item in moreAtVenue" :key="item.event.id" :event="item.event" :occurrence="item.occurrence" :venue-name="venue.name" :location="venueLocation">
                <template #action>
                  <SaveButtonAsync kind="event" :id="item.event.id" :subject="item.event.title" variant="overlay" />
                </template>
              </EventRow>
            </UiStack>
          </section>

          <section v-if="youMightLike.length > 0" aria-labelledby="event-similar-heading">
            <SectionHeader id="event-similar-heading" title="Вам может понравиться" size="md" />
            <UiStack :gap="2">
              <EventRow
                v-for="item in youMightLike"
                :key="item.event.id"
                :event="item.event"
                :occurrence="item.occurrence"
                :venue-name="relatedVenueName(item.event.venueId)"
                :location="relatedVenueLocation(item.event.venueId)"
              >
                <template #action>
                  <SaveButtonAsync kind="event" :id="item.event.id" :subject="item.event.title" variant="overlay" />
                </template>
              </EventRow>
            </UiStack>
          </section>
        </aside>

        <div class="event-page__main">
          <nav class="event-anchor-nav" aria-label="Разделы события">
            <a v-for="section in sections" :key="section.id" class="event-anchor-nav__link" :href="`#${section.id}`">{{ section.label }}</a>
          </nav>

          <section id="about" class="event-page__section" aria-labelledby="about-heading">
            <UiText id="about-heading" as="h2" variant="h3">О событии</UiText>
            <UiText variant="body-lg">{{ event.description }}</UiText>
          </section>

          <section v-if="event.program && event.program.length > 0" id="program" class="event-page__section" aria-labelledby="program-heading">
            <UiText id="program-heading" as="h2" variant="h3">Программа</UiText>
            <ol class="event-page__timeline">
              <li v-for="(step, index) in event.program" :key="index">{{ step }}</li>
            </ol>
          </section>

          <section v-if="event.included && event.included.length > 0" id="included" class="event-page__section" aria-labelledby="included-heading">
            <UiText id="included-heading" as="h2" variant="h3">Что включено</UiText>
            <ul class="event-page__included">
              <li v-for="(item, index) in event.included" :key="index"><UiBadge variant="success" icon="check" pill>{{ item }}</UiBadge></li>
            </ul>
          </section>

          <section id="photos" class="event-page__section" aria-labelledby="photos-heading">
            <UiText id="photos-heading" as="h2" variant="h3">Фото</UiText>
            <EventGalleryGrid :event-photo="event.photo" :venue-photos="venue.gallery" :venue-photos-total="venue.photosTotal" :venue-href="`/venue/${venue.id}`" />
          </section>

          <section id="venue" class="event-page__section" aria-labelledby="venue-heading">
            <UiText id="venue-heading" as="h2" variant="h3">Заведение</UiText>
            <UiSurface class="event-page__venue-card">
              <UiPhotoPlaceholder :photo="venue.gallery[0] ?? event.photo" ratio="4:3" decorative class="event-page__venue-photo" />
              <div class="event-page__venue-body">
                <UiText as="p" variant="body-lg"><b>{{ venue.name }}</b></UiText>
                <p class="event-page__venue-meta">{{ VENUE_TYPE_LABEL[venue.type] }} · {{ venue.cuisines.map((c) => CUISINE_LABEL[c]).join(', ') }} · {{ venueLocation }}</p>
                <UiCluster :gap="3">
                  <RatingLabel :rating="venue.rating" show-count />
                  <PriceLabel kind="check" :amount-rub="venue.averageCheckRub" />
                </UiCluster>
                <p v-if="venueOpen" class="event-page__venue-meta">{{ venueOpen.label }}</p>
                <UiButton :href="`/venue/${venue.id}`" variant="outline" icon-right="arrow-r">Открыть заведение</UiButton>
              </div>
            </UiSurface>
          </section>

          <section id="info" class="event-page__section" aria-labelledby="info-heading">
            <UiText id="info-heading" as="h2" variant="h3">Информация</UiText>
            <UiInfoList :items="importantInfo" />
            <UiText as="h3" variant="h3" class="event-page__howto-heading">Как добраться</UiText>
            <EventMapPlaceholder :address="venue.address" :district="venueLocation" />
          </section>
        </div>
      </div>

      <section v-if="sameDayEvents.length > 0" class="event-page__same-day" aria-labelledby="event-same-day-heading">
        <SectionHeader id="event-same-day-heading" :title="occurrence ? `Ещё ${formatDateFull(occurrence.startsAt)}` : 'Ещё в этот день'" :href="occurrence ? `/events?date=${occurrence.startsAt.slice(0, 10)}` : '/events'" />
        <HorizontalRail label="Ещё в этот день">
          <EventRow
            v-for="item in sameDayEvents"
            :key="item.event.id"
            :event="item.event"
            :occurrence="item.occurrence"
            :venue-name="relatedVenueName(item.event.venueId)"
            :location="relatedVenueLocation(item.event.venueId)"
          >
            <template #action>
              <SaveButtonAsync kind="event" :id="item.event.id" :subject="item.event.title" variant="overlay" />
            </template>
          </EventRow>
        </HorizontalRail>
      </section>

      <ReportDataLink class="event-page__report" kind="event" :id="event.id" :title="event.title" />
    </ShellContainer>
  </main>
</template>

<style scoped>
.event-page {
  padding-block: var(--s-6) var(--s-12);
}

.event-page__city-banner {
  margin-bottom: var(--s-4);
}

.event-page__crumbs {
  margin-bottom: var(--s-4);
}

.event-page__layout {
  display: grid;
  gap: var(--s-6) var(--s-8);
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'hero' 'aside' 'main';
}

.event-page__hero {
  grid-area: hero;
}

.event-page__aside {
  grid-area: aside;
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  min-width: 0;
}

.event-page__main {
  grid-area: main;
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
  min-width: 0;
}

.event-page__hero-media {
  position: relative;
  border-radius: var(--r-lg);
  overflow: hidden;
}

.event-page__hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--scrim-strong), transparent 65%);
  pointer-events: none;
}

.event-page__hero-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  gap: var(--s-2);
  padding: var(--s-6) var(--s-5) var(--s-5);
  color: var(--on-scrim);
}

.event-page__title {
  margin: 0;
  color: var(--on-scrim);
}

.event-page__summary {
  max-width: 640px;
  color: var(--on-scrim);
  opacity: 0.92;
}

.event-page__hero-meta {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  margin-top: var(--s-4);
}

.event-page__was {
  margin: 0;
  color: var(--warning);
  font-size: 13px;
}

.event-page__facts {
  color: var(--text-2);
  font-size: 14.5px;
}

.event-page__facts b {
  color: var(--text);
}

.event-page__venue-link {
  color: var(--text-2);
  text-decoration: underline;
  text-decoration-color: var(--border-strong);
  text-underline-offset: 3px;
}

.event-page__action-note,
.event-page__reminder {
  margin: 0;
  font-size: 13px;
  color: var(--text-3);
}

.event-page__sidebar-card,
.event-page__aside > .ui-surface {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.event-page__sidebar-price {
  font-size: 20px;
}

.event-page__sidebar-note {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-3);
}

.event-page__organizer {
  align-items: center;
}

.event-page__organizer-photo {
  width: 56px;
  height: 56px;
  border-radius: var(--r-md);
  flex: none;
}

.event-page__organizer-name {
  color: var(--text);
  font-weight: 600;
  text-decoration: none;
}

.event-page__organizer-name:hover {
  text-decoration: underline;
}

.event-page__organizer-meta {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--text-3);
}

.event-anchor-nav {
  display: flex;
  gap: var(--s-5);
  overflow-x: auto;
  padding-bottom: var(--s-2);
  border-bottom: 1px solid var(--border);
  scrollbar-width: none;
  position: sticky;
  top: 56px;
  z-index: 2;
  background: var(--bg);
}

.event-anchor-nav::-webkit-scrollbar {
  display: none;
}

.event-anchor-nav__link {
  flex: none;
  padding: var(--s-2) 0;
  color: var(--text-2);
  font-size: 14.5px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
}

.event-anchor-nav__link:hover {
  color: var(--text);
}

.event-page__section {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  scroll-margin-top: 108px;
  content-visibility: auto;
  contain-intrinsic-size: auto 360px;
}

.event-page__timeline {
  display: grid;
  gap: var(--s-2);
  margin: 0;
  padding-left: var(--s-5);
  color: var(--text-2);
}

.event-page__included {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.event-page__venue-card {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: var(--s-4);
  padding: var(--s-4);
}

.event-page__venue-photo {
  border-radius: var(--r-md);
  overflow: hidden;
}

.event-page__venue-body {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  align-items: flex-start;
}

.event-page__venue-meta {
  margin: 0;
  color: var(--text-3);
  font-size: 13.5px;
}

.event-page__howto-heading {
  margin-top: var(--s-2);
}

.event-page__same-day {
  margin-top: var(--s-10);
  content-visibility: auto;
  contain-intrinsic-size: auto 320px;
}

@media (max-width: 599px) {
  .event-page__venue-card {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (min-width: 960px) {
  .event-page__layout {
    grid-template-columns: minmax(0, 1fr) 340px;
    grid-template-areas: 'hero hero' 'main aside';
  }

  .event-page__aside {
    position: sticky;
    top: 80px;
    align-self: start;
    max-height: calc(100dvh - 96px);
    overflow-y: auto;
  }
}

.event-page__report {
  display: inline-block;
  margin-top: var(--s-6);
}
</style>
