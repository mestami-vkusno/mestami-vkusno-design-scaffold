<script setup lang="ts">
import UiIconButton from '../../atoms/UiIconButton/UiIconButton.vue'
import UiImage from '../../atoms/UiImage/UiImage.vue'
import UiSurface from '../../atoms/UiSurface/UiSurface.vue'
import type { UiMediaCardProps } from './types'

withDefaults(defineProps<UiMediaCardProps>(), { favoriteLabel: 'В избранное' })
defineSlots<{
  /** Метки в левом верхнем углу изображения. */
  badges?(): unknown
  /** Строка над заголовком (например, дата и время события). */
  eyebrow?(): unknown
  /** Строки под подзаголовком: цена, рейтинг, метка. */
  default?(): unknown
}>()

const favorite = defineModel<boolean>('favorite', { default: false })
</script>

<template>
  <UiSurface as="article" class="ui-media-card">
    <UiImage :src="src" :alt="title" :tone="tone">
      <template v-if="$slots.badges" #top-start><slot name="badges" /></template>
      <template v-if="showFavorite" #top-end>
        <UiIconButton v-model:pressed="favorite" icon="heart" size="sm" :label="favoriteLabel" />
      </template>
    </UiImage>
    <div class="ui-media-card__body">
      <div v-if="$slots.eyebrow" class="ui-media-card__eyebrow"><slot name="eyebrow" /></div>
      <h4 class="ui-media-card__title">{{ title }}</h4>
      <span v-if="subtitle" class="ui-media-card__subtitle">{{ subtitle }}</span>
      <slot />
    </div>
  </UiSurface>
</template>

<style scoped>
.ui-media-card__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: var(--s-3) var(--s-4) var(--s-4);
}

.ui-media-card__eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.ui-media-card__title {
  margin: 0;
  font-size: 17px;
  line-height: 1.25;
  font-weight: 600;
}

.ui-media-card__subtitle {
  font-size: 12.5px;
  color: var(--text-3);
}
</style>
