<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue'
import { EASE, UiIcon, cubicBezierCss, useMotion } from '@/design-system'
import type { ActionButtonProps } from './types'

const props = withDefaults(defineProps<ActionButtonProps>(), { pressed: undefined })

const iconElement = useTemplateRef<HTMLElement>('icon-element')
const { duration, isReduced } = useMotion()

// «Подпрыгивание» — только при включении и только если движение не уменьшено (как в каталоге анимаций).
watch(
  () => props.pressed,
  (on) => {
    const element = iconElement.value
    if (!props.bounce || on !== true || element === null || isReduced.value) return
    element.animate({ transform: ['scale(1)', 'scale(1.3)', 'scale(1)'] }, { duration: duration(0.35) * 1000, easing: cubicBezierCss(EASE.out) })
  },
)

const accessibleName = computed(() => (props.count === undefined ? props.label : `${props.label}: ${props.count}`))
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="action-button"
    :class="{ 'action-button--on': pressed }"
    :href="href"
    :type="href ? undefined : 'button'"
    :aria-label="accessibleName"
    :aria-pressed="pressed"
  >
    <span ref="icon-element" class="action-button__icon"><UiIcon :name="icon" :size="22" :filled="pressed" /></span>
    <span v-if="count !== undefined" class="action-button__count" aria-hidden="true">{{ count }}</span>
  </component>
</template>

<style scoped>
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-2);
  min-width: 40px;
  min-height: 40px;
  padding: 0 var(--s-2);
  border: 0;
  border-radius: var(--r-pill);
  background: none;
  color: var(--text-2);
  font: 500 14px/1 var(--font);
  font-variant-numeric: tabular-nums;
  text-decoration: none;
  cursor: pointer;
  transition: background var(--dur-hover) ease, color var(--dur-hover) ease, transform var(--dur-press) var(--ease-out);
}

.action-button:active {
  transform: scale(calc(1 - 0.06 * var(--motion-distance)));
}

.action-button__icon {
  display: inline-grid;
  place-items: center;
}

.action-button--on {
  color: var(--accent-fg);
}

@media (pointer: coarse) {
  .action-button {
    min-width: 44px;
    min-height: 44px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .action-button:hover {
    background: var(--surface-2);
    color: var(--text);
  }

  .action-button--on:hover {
    color: var(--accent-fg);
  }
}
</style>
