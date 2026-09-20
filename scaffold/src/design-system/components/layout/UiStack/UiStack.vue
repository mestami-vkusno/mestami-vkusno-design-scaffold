<script setup lang="ts">
import type { UiStackProps } from './types'

withDefaults(defineProps<UiStackProps>(), { as: 'div', gap: 4, align: 'stretch' })
</script>

<template>
  <component :is="as" class="ui-stack" :style="{ gap: `var(--s-${gap})`, alignItems: align === 'stretch' ? undefined : `flex-${align}` }">
    <slot />
  </component>
</template>

<style scoped>
.ui-stack {
  display: flex;
  flex-direction: column;
}
</style>
