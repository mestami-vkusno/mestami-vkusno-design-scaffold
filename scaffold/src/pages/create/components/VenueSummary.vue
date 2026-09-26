<script setup lang="ts">
import { computed } from 'vue'
import { UiIconButton, UiSurface } from '@/design-system'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { getVenue, venueLocationLabel } from '@/mocks/selectors/places'

/* Выбранное заведение в редакторах: миниатюра, название, район. `removable` — крестик «Убрать» (CR1). */
const props = defineProps<{ venueId: string; removable?: boolean; note?: string }>()
const emit = defineEmits<{ remove: [] }>()

const venue = computed(() => getVenue(props.venueId))
</script>

<template>
  <UiSurface v-if="venue" variant="panel" class="venue-summary">
    <span class="venue-summary__thumb">
      <UiPhotoPlaceholder v-if="venue.gallery[0]" :photo="venue.gallery[0]" ratio="fill" decorative />
    </span>
    <span class="venue-summary__text">
      <b class="venue-summary__name">{{ venue.name }}</b>
      <span class="venue-summary__meta">{{ venueLocationLabel(venue) }}</span>
      <span v-if="note" class="venue-summary__note">{{ note }}</span>
    </span>
    <UiIconButton v-if="removable" icon="close" variant="plain" size="sm" :label="`Убрать заведение: ${venue.name}`" @click="emit('remove')" />
  </UiSurface>
</template>

<style scoped>
.venue-summary {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3);
}

.venue-summary__thumb {
  position: relative;
  flex: none;
  width: 56px;
  height: 56px;
  overflow: hidden;
  border-radius: var(--r-md);
}

.venue-summary__text {
  display: grid;
  flex: 1;
  gap: 2px;
  min-width: 0;
}

.venue-summary__name {
  overflow: hidden;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.venue-summary__meta,
.venue-summary__note {
  overflow: hidden;
  color: var(--text-2);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.venue-summary__note {
  color: var(--text-3);
  font-size: 12px;
}
</style>
