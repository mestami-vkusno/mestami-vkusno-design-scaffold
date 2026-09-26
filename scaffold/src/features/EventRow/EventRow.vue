<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiDateBox, UiSurface } from '@/design-system'
import { dayPart } from '@/mocks/time'
import { formatDateShort, formatTime } from '@/mocks/format'
import { FEATURE_LABELS } from '../labels'
import PriceLabel from '../PriceLabel/PriceLabel.vue'
import StatusBadge from '../StatusBadge/StatusBadge.vue'
import { isRoutineEventStatus } from '../StatusBadge/types'
import type { EventRowProps } from './types'

const props = withDefaults(defineProps<EventRowProps>(), { headingLevel: 3, deferred: true })
defineSlots<{ /** Действие справа: `SaveButton` для события. */ action?(): unknown }>()

const link = computed(() => props.href ?? `/event/${props.event.id}`)
const at = computed(() => props.occurrence ?? props.event.occurrences[0])
const day = computed(() => (at.value === undefined ? '' : Number(dayPart(at.value.startsAt).slice(8))))
// «24 сент.» → «сент.»: число уже стоит в плашке, месяц под ним.
const month = computed(() => (at.value === undefined ? '' : formatDateShort(at.value.startsAt).replace(/^\d+\s*/, '')))
const time = computed(() => (at.value === undefined ? '' : formatTime(at.value.startsAt)))
const place = computed(() => [props.venueName, props.location].filter(Boolean).join(' · '))
const inactive = computed(() => props.event.status === 'cancelled' || props.event.status === 'completed')
</script>

<template>
  <UiSurface as="article" class="event-row" :class="{ 'event-row--inactive': inactive, 'event-row--deferred': deferred }">
    <div class="event-row__date" :aria-hidden="true"><UiDateBox :day="day" :month="month" /></div>
    <div class="event-row__body">
      <div v-if="event.isNew || !isRoutineEventStatus(event.status)" class="event-row__badges">
        <UiBadge v-if="event.isNew" variant="new">{{ FEATURE_LABELS.newBadge }}</UiBadge>
        <StatusBadge v-if="!isRoutineEventStatus(event.status)" :event-status="event.status" />
      </div>
      <component :is="`h${headingLevel}`" class="event-row__title">
        <a class="event-row__link" :href="link">{{ event.title }}</a>
      </component>
      <p class="event-row__meta">
        <time :datetime="at?.startsAt">{{ at ? `${formatDateShort(at.startsAt)}, ${time}` : '' }}</time>
        <template v-if="place"> · {{ place }}</template>
      </p>
      <PriceLabel kind="event" :event="event.price" />
    </div>
    <div v-if="$slots.action" class="event-row__action"><slot name="action" /></div>
  </UiSurface>
</template>

<style scoped>
.event-row {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  transition: border-color var(--dur-hover) ease;
}

.event-row--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 104px;
}

.event-row--inactive .event-row__date {
  opacity: 0.5;
  filter: grayscale(1);
}

.event-row__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-1);
  min-width: 0;
}

.event-row__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
}

.event-row__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.event-row--inactive .event-row__title {
  color: var(--text-2);
}

.event-row__link {
  color: inherit;
  text-decoration: none;
}

.event-row__link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.event-row__link:focus-visible {
  box-shadow: none;
}

.event-row:has(.event-row__link:focus-visible) {
  box-shadow: var(--ring);
}

.event-row__meta {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--text-3);
}

.event-row__action {
  position: relative;
  z-index: 1;
}

@media (hover: hover) and (pointer: fine) {
  .event-row:hover {
    border-color: var(--border-hover);
  }
}
</style>
