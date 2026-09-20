<script setup lang="ts">
import UiIcon from '../UiIcon/UiIcon.vue'
import type { UiBadgeProps } from './types'

withDefaults(defineProps<UiBadgeProps>(), { variant: 'accent' })
</script>

<template>
  <span class="ui-badge" :class="[`ui-badge--${variant}`, { 'ui-badge--pill': pill }]">
    <UiIcon v-if="icon" :name="icon" :size="12" />
    <slot />
  </span>
</template>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--r-xs);
  font: 600 11px/1 var(--font);
  letter-spacing: 0.02em;
  border: 1px solid transparent;
  white-space: nowrap;
}

.ui-badge--pill {
  border-radius: var(--r-pill);
}

.ui-badge--new {
  background: var(--lime);
  color: var(--on-accent);
  text-transform: uppercase;
}

.ui-badge--accent {
  color: var(--accent-fg);
  border-color: var(--badge-accent-line);
  background: var(--badge-accent-bg);
}

.ui-badge--warning {
  color: var(--warning);
  border-color: rgba(255, 154, 61, 0.55);
  background: var(--badge-bg);
}

.ui-badge--success {
  color: var(--success);
  border-color: rgba(61, 220, 132, 0.55);
  background: var(--badge-bg);
}

.ui-badge--neutral {
  color: var(--text-2);
  border-color: var(--border-strong);
  background: var(--badge-bg);
}
</style>
