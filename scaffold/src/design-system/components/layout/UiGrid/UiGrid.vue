<script setup lang="ts">
import type { UiGridProps } from './types'

withDefaults(defineProps<UiGridProps>(), { as: 'div', min: 240, gap: 4, align: 'stretch' })
</script>

<template>
  <component
    :is="as"
    class="ui-grid"
    :style="{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: `var(--s-${gap})`, alignItems: align }"
  >
    <slot />
  </component>
</template>

<style scoped>
.ui-grid {
  display: grid;
}
</style>
