<script setup lang="ts">
import { EventCard, HorizontalRail, SectionHeader } from '@/features'
import type { EventListItem } from '@/mocks/selectors/events'
import type { VenueId } from '@/mocks/types'

defineProps<{ venueId: VenueId; items: readonly EventListItem[] }>()
</script>

<template>
  <section v-if="items.length > 0" class="venue-events" aria-labelledby="venue-events-title">
    <SectionHeader id="venue-events-title" title="Афиша заведения" :href="`/events?venue=${venueId}`" link-label="Вся афиша заведения" />
    <HorizontalRail label="Афиша заведения" :item-width="240">
      <EventCard
        v-for="item in items"
        :key="item.event.id"
        :event="item.event"
        :occurrence="item.occurrence"
        deferred
      />
    </HorizontalRail>
  </section>
</template>

<style scoped>
.venue-events {
  content-visibility: auto;
  contain-intrinsic-size: auto 420px;
}
</style>
