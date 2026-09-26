<script setup lang="ts">
import { UiText } from '@/design-system'
import { SectionHeader } from '@/features'
import { UiPhotoPlaceholder } from '@/mocks/media'
import type { VisitorPhoto } from '@/mocks/selectors/social'

defineProps<{ photos: readonly VisitorPhoto[] }>()
</script>

<template>
  <section v-if="photos.length > 0" class="venue-photos" aria-labelledby="venue-photos-title">
    <SectionHeader id="venue-photos-title" title="Фото посетителей" :count="`${photos.length}`" />
    <ul class="venue-photos__grid" :aria-label="`Фото посетителей: ${photos.length}`">
      <li v-for="(item, index) in photos.slice(0, 12)" :key="index" class="venue-photos__tile">
        <UiPhotoPlaceholder :photo="item.photo" ratio="1:1" />
      </li>
    </ul>
    <UiText v-if="photos.length > 12" variant="caption">и ещё {{ photos.length - 12 }}</UiText>
  </section>
</template>

<style scoped>
.venue-photos {
  content-visibility: auto;
  contain-intrinsic-size: auto 320px;
}

.venue-photos__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--s-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.venue-photos__tile {
  overflow: hidden;
  border-radius: var(--r-md);
}

@media (min-width: 720px) {
  .venue-photos__grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
