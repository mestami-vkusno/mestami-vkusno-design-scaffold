<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiIcon, UiSurface } from '@/design-system'
import { CUISINE_LABEL } from '@/mocks/dictionaries'
import { formatDate, formatDistance } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { FEATURE_LABELS } from '../labels'
import PriceLabel from '../PriceLabel/PriceLabel.vue'
import RatingLabel from '../RatingLabel/RatingLabel.vue'
import { firstPhoto } from '../shared/photo'
import StatusBadge from '../StatusBadge/StatusBadge.vue'
import { isRoutineVenueStatus } from '../StatusBadge/types'
import type { VenueRowProps } from './types'

const props = withDefaults(defineProps<VenueRowProps>(), { headingLevel: 3, deferred: true })
defineSlots<{ /** Действие справа: `FavoriteButton`, «Убрать». */ action?(): unknown }>()

const link = computed(() => props.href ?? `/venue/${props.venue.id}`)
const subtitle = computed(() =>
  [props.venue.cuisines.slice(0, 1).map((id) => CUISINE_LABEL[id]).join(''), props.location].filter(Boolean).join(' · '),
)
const inactive = computed(() => props.venue.status !== 'published')
</script>

<template>
  <UiSurface as="article" class="venue-row" :class="{ 'venue-row--inactive': inactive, 'venue-row--deferred': deferred }">
    <div class="venue-row__media">
      <UiPhotoPlaceholder :photo="firstPhoto(venue.gallery)" ratio="fill" decorative />
    </div>
    <div class="venue-row__body">
      <div v-if="venue.isNew || !isRoutineVenueStatus(venue.status) || hasEventToday" class="venue-row__badges">
        <UiBadge v-if="venue.isNew" variant="new">{{ FEATURE_LABELS.newBadge }}</UiBadge>
        <StatusBadge v-if="!isRoutineVenueStatus(venue.status)" :venue-status="venue.status" />
        <UiBadge v-if="hasEventToday" variant="accent" pill icon="calendar">{{ FEATURE_LABELS.eventToday }}</UiBadge>
      </div>
      <component :is="`h${headingLevel}`" class="venue-row__title">
        <a class="venue-row__link" :href="link">{{ venue.name }}</a>
      </component>
      <p v-if="subtitle" class="venue-row__meta">{{ subtitle }}</p>
      <p v-if="venue.status === 'opening_soon' && venue.opensOn" class="venue-row__meta">Откроется {{ formatDate(venue.opensOn) }}</p>
      <div class="venue-row__facts">
        <RatingLabel :rating="venue.rating" />
        <PriceLabel v-if="venue.averageCheckRub !== null" kind="check" :amount-rub="venue.averageCheckRub" class="venue-row__check" />
        <span class="venue-row__distance">
          <UiIcon name="pin" :size="14" />
          <span class="fx-sr-only">Расстояние: </span>{{ formatDistance(venue.distanceKm) }}
        </span>
      </div>
    </div>
    <div v-if="$slots.action" class="venue-row__action"><slot name="action" /></div>
  </UiSurface>
</template>

<style scoped>
.venue-row {
  position: relative;
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) auto;
  min-height: 104px;
  transition: border-color var(--dur-hover) ease;
}

.venue-row--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 106px;
}

.venue-row__media {
  position: relative;
  min-height: 104px;
}

.venue-row--inactive .venue-row__media > :deep(.photo-placeholder) {
  filter: saturate(0.3);
  opacity: 0.85;
}

.venue-row__body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: var(--s-1);
  min-width: 0;
  padding: var(--s-3);
}

.venue-row__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
}

.venue-row__title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
}

.venue-row__link {
  color: inherit;
  text-decoration: none;
}

.venue-row__link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.venue-row__link:focus-visible {
  box-shadow: none;
}

.venue-row:has(.venue-row__link:focus-visible) {
  box-shadow: var(--ring);
}

.venue-row__meta {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.35;
  color: var(--text-3);
}

.venue-row__facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 var(--s-3);
}

.venue-row__check {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
}

.venue-row__distance {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  font-size: 13px;
  color: var(--text-3);
}

.venue-row__action {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  padding: var(--s-2);
}

@media (hover: hover) and (pointer: fine) {
  .venue-row:hover {
    border-color: var(--border-hover);
  }
}
</style>
