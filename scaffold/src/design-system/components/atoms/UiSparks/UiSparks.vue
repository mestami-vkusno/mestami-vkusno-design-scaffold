<script setup lang="ts">
import type { UiSparksProps } from './types'

withDefaults(defineProps<UiSparksProps>(), { width: 120 })
</script>

<template>
  <svg class="ui-sparks" viewBox="0 0 120 80" :width="width" fill="none" aria-hidden="true">
    <path d="M40 8c2 16 9 23 25 25-16 2-23 9-25 25-2-16-9-23-25-25 16-2 23-9 25-25z" stroke="currentColor" stroke-width="1.5" />
    <path d="M92 40c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12z" fill="currentColor" />
  </svg>
</template>

<style scoped>
.ui-sparks {
  max-width: 100%;
  height: auto;
  color: var(--deco);
}
</style>
