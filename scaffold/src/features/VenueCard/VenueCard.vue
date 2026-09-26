<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiIcon, UiSurface } from '@/design-system'
import { CUISINE_LABEL } from '@/mocks/dictionaries'
import { formatDate, formatDistance } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { FEATURE_LABELS } from '../labels'
import OpenNowLabel from '../OpenNowLabel/OpenNowLabel.vue'
import PriceLabel from '../PriceLabel/PriceLabel.vue'
import RatingLabel from '../RatingLabel/RatingLabel.vue'
import { firstPhoto } from '../shared/photo'
import StatusBadge from '../StatusBadge/StatusBadge.vue'
import { isRoutineVenueStatus } from '../StatusBadge/types'
import type { VenueCardProps } from './types'

const props = withDefaults(defineProps<VenueCardProps>(), { headingLevel: 3 })
defineSlots<{ /** Кнопка в правом верхнем углу фото: `FavoriteButton`. */ action?(): unknown }>()

const link = computed(() => props.href ?? `/venue/${props.venue.id}`)
const cuisines = computed(() => props.venue.cuisines.slice(0, 2).map((id) => CUISINE_LABEL[id]).join(' · '))
const subtitle = computed(() => [cuisines.value, props.location].filter(Boolean).join(' · '))
const showStatus = computed(() => !isRoutineVenueStatus(props.venue.status))
// Закрытое, приостановленное и «скоро открытие» выглядят приглушённо: гость сразу видит, что прийти сейчас нельзя.
const inactive = computed(() => props.venue.status !== 'published')
</script>

<template>
  <UiSurface as="article" class="venue-card" :class="{ 'venue-card--inactive': inactive, 'venue-card--deferred': deferred }">
    <div class="venue-card__media">
      <UiPhotoPlaceholder :photo="firstPhoto(venue.gallery)" ratio="4:3" decorative />
      <div v-if="venue.isNew || showStatus" class="venue-card__badges">
        <UiBadge v-if="venue.isNew" variant="new">{{ FEATURE_LABELS.newBadge }}</UiBadge>
        <StatusBadge v-if="showStatus" :venue-status="venue.status" />
      </div>
      <div v-if="$slots.action" class="venue-card__action"><slot name="action" /></div>
    </div>
    <div class="venue-card__body">
      <component :is="`h${headingLevel}`" class="venue-card__title">
        <a class="venue-card__link" :href="link">{{ venue.name }}</a>
      </component>
      <p v-if="subtitle" class="venue-card__meta">{{ subtitle }}</p>
      <p v-if="venue.status === 'opening_soon' && venue.opensOn" class="venue-card__meta">Откроется {{ formatDate(venue.opensOn) }}</p>
      <p v-else-if="venue.statusNote && inactive" class="venue-card__meta">{{ venue.statusNote }}</p>
      <PriceLabel v-else-if="venue.averageCheckRub !== null" kind="check" :amount-rub="venue.averageCheckRub" class="venue-card__check" />
      <div class="venue-card__facts">
        <RatingLabel :rating="venue.rating" />
        <span class="venue-card__distance">
          <UiIcon name="pin" :size="14" />
          <span class="fx-sr-only">Расстояние: </span>{{ formatDistance(venue.distanceKm) }}
        </span>
      </div>
      <OpenNowLabel v-if="open && !inactive" v-bind="open" />
      <UiBadge v-if="hasEventToday" variant="accent" pill icon="calendar" class="venue-card__event">{{ FEATURE_LABELS.eventToday }}</UiBadge>
    </div>
  </UiSurface>
</template>

<style scoped>
.venue-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: border-color var(--dur-hover) ease;
}

.venue-card--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 360px;
}

.venue-card__media {
  position: relative;
}

.venue-card--inactive .venue-card__media > :deep(.photo-placeholder) {
  filter: saturate(0.3);
  opacity: 0.85;
}

.venue-card__badges {
  position: absolute;
  top: var(--s-2);
  left: var(--s-2);
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
  max-width: calc(100% - 56px);
  pointer-events: none;
}

.venue-card__action {
  position: absolute;
  top: var(--s-2);
  right: var(--s-2);
  z-index: 1;
}

.venue-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-1);
  padding: var(--s-3) var(--s-4) var(--s-4);
}

.venue-card__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.25;
}

/* Вся карточка — одна цель нажатия: ссылка на названии растянута на карточку, кнопка избранного лежит выше. */
.venue-card__link {
  color: inherit;
  text-decoration: none;
}

.venue-card__link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.venue-card__link:focus-visible {
  box-shadow: none;
}

.venue-card:has(.venue-card__link:focus-visible) {
  box-shadow: var(--ring);
}

.venue-card__meta {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--text-3);
}

.venue-card__check {
  color: var(--text-2);
  font-size: 13px;
  font-weight: 500;
}

.venue-card__facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-1) var(--s-3);
  margin-top: var(--s-1);
}

.venue-card__distance {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  font-size: 13px;
  color: var(--text-3);
}

.venue-card__event {
  margin-top: var(--s-1);
}

@media (hover: hover) and (pointer: fine) {
  .venue-card:hover {
    border-color: var(--border-hover);
  }
}
</style>
