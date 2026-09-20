<script setup lang="ts">
import { computed } from 'vue'
import type { UiClusterProps } from './types'

const props = withDefaults(defineProps<UiClusterProps>(), { as: 'div', gap: 3, align: 'center', justify: 'start', wrap: true })

const style = computed(() => ({
  gap: `var(--s-${props.gap})`,
  alignItems: props.align === 'baseline' ? 'baseline' : `flex-${props.align}`,
  justifyContent: props.justify === 'between' ? 'space-between' : `flex-${props.justify}`,
  flexWrap: props.wrap ? ('wrap' as const) : ('nowrap' as const),
}))
</script>

<template>
  <component :is="as" class="ui-cluster" :style="style">
    <slot />
  </component>
</template>

<style scoped>
.ui-cluster {
  display: flex;
}
</style>
