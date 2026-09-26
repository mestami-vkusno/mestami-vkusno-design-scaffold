<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiIcon, UiText } from '@/design-system'
import { CUISINE_LABEL, VENUE_TYPE_LABEL } from '@/mocks/dictionaries'
import { formatDate, formatDistance } from '@/mocks/format'
import type { OpenState } from '@/mocks/selectors/places'
import type { Venue } from '@/mocks/types'
import { OpenNowLabel, PriceLabel, RatingLabel, StatusBadge, isRoutineVenueStatus } from '@/features'

const props = defineProps<{
  venue: Venue
  location: string
  openState: OpenState
  openLabel: string
  hasEventToday: boolean
}>()

const cuisines = computed(() => props.venue.cuisines.map((id) => CUISINE_LABEL[id]).join(' · '))
const showStatus = computed(() => !isRoutineVenueStatus(props.venue.status))
</script>

<template>
  <div class="venue-headline">
    <UiText as="h1" variant="h1" class="venue-headline__name">{{ venue.name }}</UiText>
    <p class="venue-headline__type">
      {{ VENUE_TYPE_LABEL[venue.type] }}<template v-if="cuisines"> · {{ cuisines }}</template><template v-if="location"> · {{ location }}</template>
    </p>

    <div class="venue-headline__badges">
      <StatusBadge v-if="showStatus" :venue-status="venue.status" pill />
      <UiBadge v-if="hasEventToday" variant="accent" pill icon="calendar">Сегодня событие</UiBadge>
      <p v-if="venue.status === 'opening_soon' && venue.opensOn" class="venue-headline__note">Откроется {{ formatDate(venue.opensOn) }}</p>
      <p v-else-if="venue.statusNote" class="venue-headline__note">{{ venue.statusNote }}</p>
    </div>

    <div class="venue-headline__facts">
      <PriceLabel kind="check" :amount-rub="venue.averageCheckRub" />
      <OpenNowLabel v-if="venue.status === 'published'" :state="openState" :label="openLabel" />
      <RatingLabel :rating="venue.rating" />
      <span class="venue-headline__distance">
        <UiIcon name="pin" :size="14" />
        <span class="fx-sr-only">Расстояние: </span>{{ formatDistance(venue.distanceKm) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.venue-headline {
  display: grid;
  gap: var(--s-2);
}

.venue-headline__name {
  overflow-wrap: anywhere;
}

.venue-headline__type {
  margin: 0;
  color: var(--text-2);
  font-size: 15px;
}

.venue-headline__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2);
}

.venue-headline__note {
  margin: 0;
  font-size: 13px;
  color: var(--text-3);
}

.venue-headline__facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-1) var(--s-4);
  margin-top: var(--s-1);
  font-size: 14px;
}

.venue-headline__distance {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  color: var(--text-3);
  font-size: 13px;
}
</style>
