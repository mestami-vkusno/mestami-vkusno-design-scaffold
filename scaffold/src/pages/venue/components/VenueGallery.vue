<script setup lang="ts">
import { computed } from 'vue'
import { UiPhotoPlaceholder } from '@/mocks/media'
import type { Photo } from '@/mocks/types'

const props = defineProps<{
  gallery: readonly Photo[]
  /** Всего фото у заведения, включая от посетителей («+24 фото»). */
  photosTotal: number
}>()

/** Главное фото (блок 1, §9.1) + до четырёх дополнительных снимков для десктопной сетки. */
const main = computed(() => props.gallery[0])
const rest = computed(() => props.gallery.slice(1, 5))
const extraCount = computed(() => Math.max(props.photosTotal - props.gallery.length, 0))
</script>

<template>
  <section class="venue-gallery" aria-label="Фотографии заведения">
    <div class="venue-gallery__grid">
      <div class="venue-gallery__main">
        <UiPhotoPlaceholder v-if="main" :photo="main" ratio="fill" show-caption />
      </div>
      <div v-for="(photo, index) in rest" :key="index" class="venue-gallery__thumb" :class="{ 'venue-gallery__thumb--last': index === rest.length - 1 }">
        <UiPhotoPlaceholder :photo="photo" ratio="fill" decorative />
        <span v-if="index === rest.length - 1 && extraCount > 0" class="venue-gallery__more" aria-hidden="true">+{{ extraCount }} фото</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.venue-gallery__grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 78%;
  gap: var(--s-2);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  border-radius: var(--r-lg);
  scrollbar-width: none;
}

.venue-gallery__main,
.venue-gallery__thumb {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--r-lg);
  scroll-snap-align: start;
}

.venue-gallery__more {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: var(--scrim);
  color: var(--on-scrim);
  font-size: 14px;
  font-weight: 600;
}

@media (min-width: 720px) {
  .venue-gallery__grid {
    display: grid;
    grid-auto-flow: unset;
    grid-template-columns: 2fr repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    overflow: visible;
    aspect-ratio: 16 / 7;
  }

  .venue-gallery__main {
    grid-row: 1 / span 2;
    aspect-ratio: auto;
    height: 100%;
  }

  .venue-gallery__thumb {
    aspect-ratio: auto;
    height: 100%;
  }
}
</style>
