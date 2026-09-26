<script setup lang="ts">
import { HorizontalRail, SectionHeader, VenueCard } from '@/features'
import { venueLocationLabel } from '@/mocks/selectors/places'
import type { Venue } from '@/mocks/types'

defineProps<{ similar: readonly Venue[]; nearby: readonly Venue[] }>()
</script>

<template>
  <section v-if="similar.length > 0 || nearby.length > 0" class="venue-similar" aria-labelledby="venue-similar-title">
    <template v-if="similar.length > 0">
      <SectionHeader id="venue-similar-title" title="Похожие заведения" />
      <HorizontalRail label="Похожие заведения" :item-width="220">
        <VenueCard v-for="venue in similar" :key="venue.id" :venue="venue" :location="venueLocationLabel(venue)" deferred />
      </HorizontalRail>
    </template>

    <template v-if="nearby.length > 0">
      <SectionHeader title="Ещё рядом" />
      <HorizontalRail label="Ещё рядом" :item-width="220">
        <VenueCard v-for="venue in nearby" :key="venue.id" :venue="venue" :location="venueLocationLabel(venue)" deferred />
      </HorizontalRail>
    </template>
  </section>
</template>

<style scoped>
.venue-similar {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-6);
  content-visibility: auto;
  contain-intrinsic-size: auto 420px;
}
</style>
