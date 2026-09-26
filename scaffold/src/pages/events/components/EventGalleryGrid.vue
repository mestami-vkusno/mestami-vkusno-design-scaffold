<script setup lang="ts">
/*
  «Фото» события: своего снимка у события ровно один (`VenueEvent.photo`), поэтому ряд дополняем
  снимками заведения — это фотографии того же места, где идёт событие, не выдуманные данные.
  Ссылка «+N фото» ведёт в галерею заведения, где остальные снимки уже есть.
*/
import { computed } from 'vue'
import { UiLink } from '@/design-system'
import { UiPhotoPlaceholder } from '@/mocks/media'
import type { Photo } from '@/mocks/types'

const props = defineProps<{ eventPhoto: Photo; venuePhotos: readonly Photo[]; venuePhotosTotal: number; venueHref: string }>()

const MAX_SHOWN = 5
const shown = computed<readonly Photo[]>(() => [props.eventPhoto, ...props.venuePhotos].slice(0, MAX_SHOWN))
const remaining = computed(() => Math.max(props.venuePhotosTotal - shown.value.length, 0))
</script>

<template>
  <div class="event-gallery">
    <UiPhotoPlaceholder v-for="(photo, index) in shown" :key="index" :photo="photo" ratio="4:3" class="event-gallery__item" />
    <UiLink v-if="remaining > 0" class="event-gallery__more" :href="venueHref" icon-right="arrow-r">Ещё {{ remaining }} фото в заведении</UiLink>
  </div>
</template>

<style scoped>
.event-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--s-2);
}

.event-gallery__item {
  border-radius: var(--r-md);
  overflow: hidden;
}

.event-gallery__more {
  grid-column: 1 / -1;
  justify-self: start;
}
</style>
