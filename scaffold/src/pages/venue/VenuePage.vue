<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { UiButton, UiEmptyState } from '@/design-system'
import { AiTeaserAsync } from '@/features/lazy'
import type { StarValue } from '@/mocks/types'
import { filterEvents } from '@/mocks/selectors/events'
import { featuredDishes } from '@/mocks/selectors/menu'
import { getCity, nearbyVenues, openState, openStatusLabel, resolveVenueLink, similarVenues, venueLocationLabel } from '@/mocks/selectors/places'
import { postsByVenue, ratingForReview, venuePostsByVenue, visitorPhotos } from '@/mocks/selectors/social'
import ReportDataLink from '@/overlays/ReportDataLink.vue'
import { useCity } from '@/shell/composables/useCity'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { useViewer } from '@/shell/composables/useViewer'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { useLibrary } from '@/state/useLibrary'
import OtherCityBanner from './components/OtherCityBanner.vue'
import VenueAboutSection from './components/VenueAboutSection.vue'
import VenueActionsBar from './components/VenueActionsBar.vue'
import VenueClaimPanel from './components/VenueClaimPanel.vue'
import VenueContactsPanel from './components/VenueContactsPanel.vue'
import VenueContentSection from './components/VenueContentSection.vue'
import VenueEventsSection from './components/VenueEventsSection.vue'
import VenueGallery from './components/VenueGallery.vue'
import VenueHeadline from './components/VenueHeadline.vue'
import VenueMenuPreview from './components/VenueMenuPreview.vue'
import VenuePhotosSection from './components/VenuePhotosSection.vue'
import VenuePostsSection from './components/VenuePostsSection.vue'
import VenueReviewsSection from './components/VenueReviewsSection.vue'
import VenueSimilarSection from './components/VenueSimilarSection.vue'
import VenueStatusBanner from './components/VenueStatusBanner.vue'
import VenueVisitPanel from './components/VenueVisitPanel.vue'

const ANCHOR_TABS = [
  { id: 'about', label: 'О месте' },
  { id: 'menu', label: 'Меню' },
  { id: 'events', label: 'Афиша' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'photos', label: 'Фото' },
  { id: 'contacts', label: 'Информация' },
] as const

const route = useRoute()
const { cityId } = useCity()
const { viewer } = useViewer()
const library = useLibrary()

const idParam = computed(() => String(route.params.id ?? ''))
const link = computed(() => resolveVenueLink(idParam.value, cityId.value))
const venue = computed(() => link.value?.object)

useDocumentTitle(() => venue.value?.name)

const location = computed(() => (venue.value ? venueLocationLabel(venue.value) : ''))
const openLabel = computed(() => (venue.value ? openStatusLabel(venue.value) : ''))
const openStateValue = computed(() => (venue.value ? openState(venue.value) : 'unknown'))
const hasEventToday = computed(() => (venue.value ? filterEvents({ venueIds: [venue.value.id], day: 'today' }).length > 0 : false))
const events = computed(() => (venue.value ? filterEvents({ venueIds: [venue.value.id] }) : []))
const menuPreview = computed(() => (venue.value ? featuredDishes(venue.value.id, 4) : []))
const officialPosts = computed(() => (venue.value ? venuePostsByVenue(venue.value.id) : []))
const photos = computed(() => (venue.value ? visitorPhotos(venue.value.id) : []))
const userPosts = computed(() => (venue.value ? postsByVenue(venue.value.id) : []))
const similar = computed(() => (venue.value ? similarVenues(venue.value.id) : []))
const nearby = computed(() => (venue.value ? nearbyVenues(venue.value.id) : []))

const reviews = computed(() => (venue.value ? library.reviewsForVenue(venue.value.id) : []))
const ratingByReview = computed<ReadonlyMap<string, StarValue>>(() => {
  const map = new Map<string, StarValue>()
  const myRating = venue.value ? library.ratingOf(venue.value.id) : undefined
  for (const review of reviews.value) {
    if (review.userId === viewer.value?.id && myRating) map.set(review.id, myRating.value)
    else {
      const rating = ratingForReview(review)
      if (rating) map.set(review.id, rating.value)
    }
  }
  return map
})

const myVisit = computed(() => (venue.value ? library.visits.value.find((entry) => entry.venue.id === venue.value?.id) : undefined))
const myReview = computed(() => (venue.value ? library.reviewOf(venue.value.id) : undefined))
</script>

<template>
  <main class="venue-page">
    <ShellContainer v-if="!venue">
      <UiEmptyState mode="empty" title="Такого заведения нет" description="Возможно, ссылка устарела или адрес введён неверно." page>
        <template #actions>
          <UiButton href="/search" size="lg">Открыть поиск</UiButton>
          <UiButton href="/" variant="outline" size="lg">На главную</UiButton>
        </template>
      </UiEmptyState>
    </ShellContainer>

    <template v-else>
      <VenueGallery :gallery="venue.gallery" :photos-total="venue.photosTotal" />

      <ShellContainer class="venue-page__body">
        <OtherCityBanner v-if="link?.isOtherCity" :city-name="getCity(venue.cityId)?.name ?? ''" />

        <nav class="venue-page__tabs" aria-label="Разделы заведения">
          <a v-for="tab in ANCHOR_TABS" :key="tab.id" :href="`#${tab.id}`">{{ tab.label }}</a>
        </nav>

        <div class="venue-page__layout">
          <VenueHeadline
            :venue="venue"
            :location="location"
            :open-state="openStateValue"
            :open-label="openLabel"
            :has-event-today="hasEventToday"
          />

          <VenueStatusBanner :venue="venue" />
          <VenueActionsBar :venue="venue" />

          <VenueContactsPanel id="contacts" class="venue-page__contacts" :venue="venue" :location="location" />

          <VenueAboutSection id="about" :venue="venue" :location="location" />
          <VenueMenuPreview id="menu" :venue-id="venue.id" :items="menuPreview" />
          <VenueContentSection :venue="venue" :posts="officialPosts" />
          <VenueEventsSection id="events" :venue-id="venue.id" :items="events" />

          <div id="reviews" class="venue-page__reviews">
            <VenueReviewsSection :venue="venue" :reviews="reviews" :rating-by-review="ratingByReview" :viewer-id="viewer?.id ?? null" />
            <VenueVisitPanel :venue-id="venue.id" :visit="myVisit" :review="myReview" />
          </div>

          <VenuePhotosSection id="photos" :photos="photos" />
          <VenuePostsSection :posts="userPosts" :viewer-id="viewer?.id ?? null" />

          <VenueSimilarSection :similar="similar" :nearby="nearby" />

          <AiTeaserAsync context="venue" source-surface="venue" />

          <VenueClaimPanel v-if="!venue.managementConfirmed" :venue-id="venue.id" />
          <ReportDataLink kind="venue" :id="venue.id" :title="venue.name" />
        </div>
      </ShellContainer>
    </template>
  </main>
</template>

<style scoped>
.venue-page {
  padding-bottom: var(--s-12);
}

.venue-page__body {
  padding-top: var(--s-5);
}

.venue-page__tabs {
  display: flex;
  gap: var(--s-5);
  overflow-x: auto;
  margin-bottom: var(--s-6);
  padding-bottom: var(--s-2);
  border-bottom: 1px solid var(--border);
  scrollbar-width: none;
}

.venue-page__tabs a {
  flex: none;
  padding-bottom: var(--s-2);
  color: var(--text-2);
  font-size: 14px;
  text-decoration: none;
  white-space: nowrap;
}

.venue-page__tabs a:hover {
  color: var(--text);
}

.venue-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-8);
}

.venue-page__layout > * {
  grid-column: 1;
  scroll-margin-top: 76px;
}

.venue-page__reviews {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-6);
}

@media (min-width: 900px) {
  .venue-page__layout {
    grid-template-columns: minmax(0, 1fr) 340px;
    align-items: start;
  }

  .venue-page__contacts {
    grid-column: 2;
    grid-row: 1 / -1;
    position: sticky;
    /* Ниже шапки продукта (64 px на десктопе) с отступом. */
    top: calc(64px + var(--s-4));
    max-height: calc(100dvh - 64px - var(--s-8));
    overflow-y: auto;
  }
}
</style>
