<script setup lang="ts">
import { computed } from 'vue'
import UiIcon from '../UiIcon/UiIcon.vue'
import type { UiButtonProps } from './types'

const props = withDefaults(defineProps<UiButtonProps>(), { variant: 'primary', size: 'md', type: 'button' })

const inactive = computed(() => props.disabled || props.loading)
const iconSize = computed(() => (props.size === 'sm' ? 16 : 20))
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="ui-button"
    :class="[`ui-button--${variant}`, `ui-button--${size}`, { 'ui-button--block': block, 'ui-button--loading': loading }]"
    :href="href && !disabled ? href : undefined"
    :type="href ? undefined : type"
    :disabled="href ? undefined : inactive"
    :aria-disabled="href && inactive ? true : undefined"
    :aria-busy="loading || undefined"
    :data-preview="previewState"
  >
    <span v-if="loading" class="ui-button__spinner" aria-hidden="true" />
    <UiIcon v-if="iconLeft" :name="iconLeft" :size="iconSize" />
    <slot />
    <UiIcon v-if="iconRight" :name="iconRight" :size="iconSize" />
  </component>
</template>

<style scoped>
.ui-button {
  --h: 44px;
  --px: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-2);
  height: var(--h);
  padding: 0 var(--px);
  border-radius: var(--r-md);
  font: 600 15px/1 var(--font);
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--dur-hover) ease, border-color var(--dur-hover) ease, color var(--dur-hover) ease, transform var(--dur-press) var(--ease-out);
}

.ui-button:active:not(:disabled),
.ui-button[data-preview='pressed'] {
  transform: scale(calc(1 - 0.03 * var(--motion-distance)));
}

.ui-button[data-preview='focus'] {
  box-shadow: var(--ring);
}

.ui-button--sm {
  --h: 34px;
  --px: 14px;
  font-size: 13px;
  border-radius: var(--r-sm);
}

.ui-button--lg {
  --h: 52px;
  --px: 28px;
  font-size: 16px;
}

.ui-button--block {
  display: flex;
  width: 100%;
}

.ui-button--primary {
  background: var(--lime);
  color: var(--on-accent);
}

.ui-button--primary[data-preview='hover'] {
  background: var(--lime-hover);
}

.ui-button--primary:active,
.ui-button--primary[data-preview='pressed'] {
  background: var(--lime-press);
}

.ui-button--outline {
  background: transparent;
  color: var(--accent-fg);
  border-color: var(--outline-border);
}

.ui-button--outline[data-preview='hover'],
.ui-button--outline[data-preview='pressed'] {
  background: var(--outline-hover);
}

.ui-button--neutral {
  background: transparent;
  color: var(--text);
  border-color: var(--border-strong);
}

.ui-button--neutral[data-preview='hover'],
.ui-button--neutral[data-preview='pressed'] {
  background: var(--surface);
  border-color: #555;
}

.ui-button--secondary {
  background: var(--btn2-bg);
  color: var(--btn2-text);
}

.ui-button--secondary[data-preview='hover'],
.ui-button--secondary[data-preview='pressed'] {
  background: var(--btn2-hover);
}

.ui-button--ghost {
  background: transparent;
  color: var(--text-2);
}

.ui-button--ghost[data-preview='hover'],
.ui-button--ghost[data-preview='pressed'] {
  color: var(--text);
  background: var(--surface);
}

.ui-button:disabled,
.ui-button[aria-disabled='true'] {
  background: var(--surface-2);
  color: var(--text-3);
  border-color: transparent;
  cursor: not-allowed;
}

.ui-button--loading {
  pointer-events: none;
}

.ui-button__spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: ui-button-spin 0.7s linear infinite;
}

@keyframes ui-button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (pointer: coarse) {
  .ui-button--sm {
    --h: 40px;
  }
}

/* Наведение только там,
где есть настоящий указатель: на тач-экранах :hover срабатывает ложно. */
@media (hover: hover) and (pointer: fine) {
  .ui-button--primary:hover {
    background: var(--lime-hover);
  }

  .ui-button--outline:hover {
    background: var(--outline-hover);
  }

  .ui-button--neutral:hover {
    background: var(--surface);
    border-color: #555;
  }

  .ui-button--secondary:hover {
    background: var(--btn2-hover);
  }

  .ui-button--ghost:hover {
    color: var(--text);
    background: var(--surface);
  }
}
</style>
