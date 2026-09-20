<script setup lang="ts">
import type { ThemeName } from '../../../types'
import type { UiThemeSwitchProps } from './types'

withDefaults(defineProps<UiThemeSwitchProps>(), { label: 'Тема оформления', darkLabel: 'Тёмная', lightLabel: 'Светлая' })

const theme = defineModel<ThemeName>({ required: true })
</script>

<template>
  <div class="ui-theme-switch" role="group" :aria-label="label">
    <button type="button" :aria-pressed="theme === 'dark'" @click="theme = 'dark'">{{ darkLabel }}</button>
    <button type="button" :aria-pressed="theme === 'light'" @click="theme = 'light'">{{ lightLabel }}</button>
  </div>
</template>

<style scoped>
.ui-theme-switch {
  display: inline-flex;
  flex: none;
  padding: 3px;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-pill);
}

.ui-theme-switch button {
  height: 30px;
  padding: 0 14px;
  border: 0;
  background: transparent;
  color: var(--text-2);
  font: 500 13px var(--font);
  border-radius: var(--r-pill);
  cursor: pointer;
  white-space: nowrap;
}

.ui-theme-switch button[aria-pressed='true'] {
  background: var(--lime);
  color: var(--on-accent);
  font-weight: 600;
}

@media (pointer: coarse) {
  .ui-theme-switch button {
    height: 36px;
  }
}

@media (max-width: 380px) {
  .ui-theme-switch button {
    padding: 0 11px;
  }
}
</style>
