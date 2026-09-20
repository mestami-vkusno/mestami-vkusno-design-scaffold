<script setup lang="ts">
import type { UiSurfaceProps } from './types'

withDefaults(defineProps<UiSurfaceProps>(), { variant: 'card', as: 'div' })
</script>

<template>
  <component :is="as" class="ui-surface" :class="`ui-surface--${variant}`"><slot /></component>
</template>

<style scoped>
.ui-surface {
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
}

.ui-surface--card {
  background: var(--surface);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.ui-surface--panel {
  background: var(--panel-bg);
  padding: var(--s-5);
}
</style>
