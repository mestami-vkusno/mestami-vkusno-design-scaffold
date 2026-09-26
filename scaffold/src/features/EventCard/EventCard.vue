<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiSurface } from '@/design-system'
import { formatDateTime } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { FEATURE_LABELS } from '../labels'
import PriceLabel from '../PriceLabel/PriceLabel.vue'
import StatusBadge from '../StatusBadge/StatusBadge.vue'
import { isRoutineEventStatus } from '../StatusBadge/types'
import type { EventCardProps } from './types'

const props = withDefaults(defineProps<EventCardProps>(), { headingLevel: 3 })
defineSlots<{ /** Кнопка в правом верхнем углу фото: `SaveButton` для события. */ action?(): unknown }>()

const link = computed(() => props.href ?? `/event/${props.event.id}`)
const when = computed(() => {
  const at = props.occurrence ?? props.event.occurrences[0]
  return at === undefined ? '' : formatDateTime(at.startsAt)
})
const wasWhen = computed(() => {
  const at = props.occurrence ?? props.event.occurrences[0]
  return props.event.status === 'rescheduled' && at?.rescheduledFrom !== undefined ? formatDateTime(at.rescheduledFrom) : ''
})
const place = computed(() => [props.venueName, props.location].filter(Boolean).join(' · '))
const showStatus = computed(() => !isRoutineEventStatus(props.event.status))
const inactive = computed(() => props.event.status === 'cancelled' || props.event.status === 'completed')
</script>

<template>
  <UiSurface as="article" class="event-card" :class="{ 'event-card--inactive': inactive, 'event-card--deferred': deferred }">
    <div class="event-card__media">
      <UiPhotoPlaceholder :photo="event.photo" ratio="4:3" decorative />
      <div v-if="event.isNew || showStatus" class="event-card__badges">
        <UiBadge v-if="event.isNew" variant="new">{{ FEATURE_LABELS.newBadge }}</UiBadge>
        <StatusBadge v-if="showStatus" :event-status="event.status" />
      </div>
      <div v-if="$slots.action" class="event-card__action"><slot name="action" /></div>
    </div>
    <div class="event-card__body">
      <p class="event-card__when">
        <time>{{ when }}</time>
      </p>
      <p v-if="wasWhen" class="event-card__was">{{ FEATURE_LABELS.rescheduledWas }}: {{ wasWhen }}</p>
      <component :is="`h${headingLevel}`" class="event-card__title">
        <a class="event-card__link" :href="link">{{ event.title }}</a>
      </component>
      <p v-if="place" class="event-card__meta">{{ place }}</p>
      <PriceLabel class="event-card__price" kind="event" :event="event.price" />
    </div>
  </UiSurface>
</template>

<style scoped>
.event-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: border-color var(--dur-hover) ease;
}

.event-card--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 340px;
}

.event-card__media {
  position: relative;
}

.event-card--inactive .event-card__media > :deep(.photo-placeholder) {
  filter: saturate(0.3);
  opacity: 0.8;
}

.event-card__badges {
  position: absolute;
  top: var(--s-2);
  left: var(--s-2);
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
  max-width: calc(100% - 56px);
  pointer-events: none;
}

.event-card__action {
  position: absolute;
  top: var(--s-2);
  right: var(--s-2);
  z-index: 1;
}

.event-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-1);
  padding: var(--s-3) var(--s-4) var(--s-4);
}

.event-card__when {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.3;
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

.event-card__was {
  margin: 0;
  font-size: 12px;
  line-height: 1.3;
  color: var(--warning);
  text-decoration: line-through;
  text-decoration-color: currentColor;
}

.event-card__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.25;
}

.event-card--inactive .event-card__title {
  color: var(--text-2);
}

.event-card__link {
  color: inherit;
  text-decoration: none;
}

.event-card__link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.event-card__link:focus-visible {
  box-shadow: none;
}

.event-card:has(.event-card__link:focus-visible) {
  box-shadow: var(--ring);
}

.event-card__meta {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--text-3);
}

.event-card__price {
  margin-top: auto;
  padding-top: var(--s-1);
}

@media (hover: hover) and (pointer: fine) {
  .event-card:hover {
    border-color: var(--border-hover);
  }
}
</style>
