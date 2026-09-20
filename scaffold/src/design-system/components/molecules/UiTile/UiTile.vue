<script setup lang="ts">
import UiImage from '../../atoms/UiImage/UiImage.vue'
import type { UiTileProps } from './types'

defineProps<UiTileProps>()
defineSlots<{ /** Метка над заголовком. */ badge?(): unknown }>()
</script>

<template>
  <article class="ui-tile">
    <UiImage class="ui-tile__image" :src="src" :tone="tone" ratio="fill" />
    <div class="ui-tile__text">
      <slot name="badge" />
      <b class="ui-tile__title">{{ title }}</b>
      <span v-if="caption" class="ui-tile__caption">{{ caption }}</span>
    </div>
  </article>
</template>

<style scoped>
.ui-tile {
  position: relative;
  display: flex;
  align-items: flex-end;
  aspect-ratio: 5 / 4;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  color: #fff;
}

.ui-tile__image {
  position: absolute;
  inset: 0;
}

.ui-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.05) 60%);
}

.ui-tile__text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: var(--s-3) var(--s-4);
}

.ui-tile__title {
  font-size: 17px;
  font-weight: 600;
}

.ui-tile__caption {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.78);
}
</style>
