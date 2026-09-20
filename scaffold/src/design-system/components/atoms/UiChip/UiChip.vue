<script setup lang="ts">
import UiIcon from '../UiIcon/UiIcon.vue'
import type { UiChipProps } from './types'

withDefaults(defineProps<UiChipProps>(), { variant: 'default', size: 'md', removeLabel: 'Убрать', selected: undefined })

const emit = defineEmits<{ remove: [] }>()
</script>

<template>
  <span v-if="removable" class="ui-chip" :class="[`ui-chip--${variant}`, `ui-chip--${size}`]">
    <UiIcon v-if="icon" :name="icon" :size="18" class="ui-chip__icon" />
    <slot />
    <button class="ui-chip__remove" type="button" :aria-label="removeLabel" @click="emit('remove')">
      <UiIcon name="close" :size="14" />
    </button>
  </span>
  <button
    v-else
    class="ui-chip"
    :class="[`ui-chip--${variant}`, `ui-chip--${size}`, { 'ui-chip--selected': selected }]"
    type="button"
    :aria-pressed="selected"
  >
    <UiIcon v-if="icon" :name="icon" :size="18" class="ui-chip__icon" />
    <slot />
    <UiIcon v-if="trailingIcon" :name="trailingIcon" :size="18" class="ui-chip__trailing" />
  </button>
</template>

<style scoped>
.ui-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: var(--r-pill);
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text);
  font: 500 14px var(--font);
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--dur-hover) ease, border-color var(--dur-hover) ease, color var(--dur-hover) ease, transform var(--dur-press) var(--ease-out);
}

.ui-chip:active {
  transform: scale(calc(1 - 0.03 * var(--motion-distance)));
}

.ui-chip__icon {
  color: var(--accent-fg);
}

.ui-chip__trailing {
  color: var(--text-2);
}

.ui-chip--sm {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

.ui-chip--selected {
  background: var(--lime);
  border-color: var(--lime);
  color: var(--on-accent);
  font-weight: 600;
}

.ui-chip--selected .ui-chip__icon {
  color: var(--on-accent);
}

.ui-chip--inverse {
  background: var(--inverse-bg);
  color: var(--inverse-text);
  border-color: transparent;
}

.ui-chip--tag {
  background: var(--surface);
  border-color: var(--border);
  font-size: 13px;
  cursor: default;
}

.ui-chip__remove {
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: none;
  color: var(--text-3);
  cursor: pointer;
}

@media (pointer: coarse) {
  .ui-chip {
    min-height: 40px;
  }

  .ui-chip--sm {
    height: 40px;
  }
}

/* Наведение только там,
где есть настоящий указатель: на тач-экранах :hover срабатывает ложно. */
@media (hover: hover) and (pointer: fine) {
  .ui-chip:hover {
    background: var(--surface);
  }

  .ui-chip--selected:hover {
    background: var(--lime-hover);
  }

  .ui-chip--inverse:hover {
    background: var(--inverse-bg);
  }

  .ui-chip__remove:hover {
    color: var(--text);
  }
}
</style>
