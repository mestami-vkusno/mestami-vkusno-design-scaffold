<script setup lang="ts">
import UiIcon from '../UiIcon/UiIcon.vue'
import type { UiBadgeProps } from './types'

withDefaults(defineProps<UiBadgeProps>(), { variant: 'accent' })
</script>

<template>
  <span v-if="dot" class="ui-badge ui-badge--dot" :class="`ui-badge--${variant}`" :role="label ? 'img' : undefined" :aria-label="label" :aria-hidden="label ? undefined : true" />
  <span v-else class="ui-badge" :class="[`ui-badge--${variant}`, { 'ui-badge--pill': pill }]">
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

.ui-badge--danger {
  color: var(--danger);
  border-color: color-mix(in srgb, var(--danger) 55%, transparent);
  background: var(--badge-bg);
}

.ui-badge--neutral {
  color: var(--text-2);
  border-color: var(--border-strong);
  background: var(--badge-bg);
}

/* Точка: заливка цветом варианта, кольцо цвета фона отделяет её от иконки под ней.
   Лаймовая в светлой теме получает тёмный контур: лайм на белом не читается. */
.ui-badge--dot {
  --dot: var(--text-3);
  --dot-line: var(--bg);
  display: inline-block;
  flex: none;
  width: 10px;
  height: 10px;
  padding: 0;
  gap: 0;
  border: 0;
  border-radius: 50%;
  background: var(--dot);
  box-shadow: 0 0 0 2px var(--dot-line);
}

.ui-badge--dot.ui-badge--new,
.ui-badge--dot.ui-badge--accent {
  --dot: var(--lime);
  border: 1px solid var(--accent-fg);
}

.ui-badge--dot.ui-badge--warning {
  --dot: var(--warning);
}

.ui-badge--dot.ui-badge--success {
  --dot: var(--success);
}

.ui-badge--dot.ui-badge--danger {
  --dot: var(--danger);
}
</style>
