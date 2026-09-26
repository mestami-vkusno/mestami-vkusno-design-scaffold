<script setup lang="ts">
import UiIcon from '../UiIcon/UiIcon.vue'
import type { UiIconButtonProps } from './types'

withDefaults(defineProps<UiIconButtonProps>(), { variant: 'overlay', size: 'md', pressed: undefined })

const emit = defineEmits<{ 'update:pressed': [value: boolean] }>()
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="ui-icon-button"
    :class="[`ui-icon-button--${variant}`, `ui-icon-button--${size}`, { 'ui-icon-button--on': pressed }]"
    :type="href ? undefined : 'button'"
    :href="href"
    :aria-label="label"
    :aria-pressed="pressed"
    @click="pressed !== undefined && emit('update:pressed', !pressed)"
  >
    <UiIcon :name="icon" :filled="pressed" />
  </component>
</template>

<style scoped>
.ui-icon-button {
  --h: 44px;
  display: inline-grid;
  place-items: center;
  flex: none;
  width: var(--h);
  height: var(--h);
  padding: 0;
  border-radius: var(--r-pill);
  cursor: pointer;
  color: var(--text);
  text-decoration: none;
  transition: background var(--dur-hover) ease, color var(--dur-hover) ease, transform var(--dur-press) var(--ease-out);
}

.ui-icon-button:active {
  transform: scale(calc(1 - 0.06 * var(--motion-distance)));
}

.ui-icon-button--sm {
  --h: 34px;
}

.ui-icon-button--overlay {
  background: var(--overlay-btn-bg);
  border: 1px solid var(--border-strong);
}

.ui-icon-button--plain {
  background: none;
  border: 0;
}

.ui-icon-button--on {
  color: var(--accent-fg);
}

.ui-icon-button--overlay.ui-icon-button--on {
  border-color: var(--lime-line);
}

@media (pointer: coarse) {
  .ui-icon-button--sm {
    --h: 44px;
  }
}

/* Наведение только там,
где есть настоящий указатель: на тач-экранах :hover срабатывает ложно. */
@media (hover: hover) and (pointer: fine) {
  .ui-icon-button--overlay:hover {
    background: var(--surface);
  }

  .ui-icon-button--plain:hover {
    background: var(--surface);
  }
}
</style>
