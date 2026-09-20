<script setup lang="ts">
import { useArrowNavigation } from '../../../composables'
import type { UiSegmentedProps } from './types'

defineProps<UiSegmentedProps>()

const model = defineModel<string>({ required: true })
const { onKeydown } = useArrowNavigation('[role="radio"]')
</script>

<template>
  <div class="ui-segmented" role="radiogroup" :aria-label="label" @keydown="onKeydown">
    <button
      v-for="item in items"
      :key="item.id"
      class="ui-segmented__item"
      :class="{ 'ui-segmented__item--active': model === item.id }"
      type="button"
      role="radio"
      :aria-checked="model === item.id"
      :tabindex="model === item.id ? 0 : -1"
      @click="model = item.id"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<style scoped>
.ui-segmented {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
}

.ui-segmented__item {
  height: 34px;
  padding: 0 16px;
  border: 0;
  background: transparent;
  color: var(--text);
  font: 500 14px var(--font);
  border-radius: 8px;
  cursor: pointer;
}

.ui-segmented__item--active {
  background: var(--lime);
  color: var(--on-accent);
  font-weight: 600;
}
</style>
