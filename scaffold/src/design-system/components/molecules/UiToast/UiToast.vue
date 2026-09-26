<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { claimToastHost, releaseToastHost, useToast } from '../../../composables/useToast'
import UiToastItem from './UiToastItem.vue'
import type { UiToastProps } from './types'

const props = withDefaults(defineProps<UiToastProps>(), { label: 'Уведомления', max: 3, closeLabel: 'Закрыть' })

const { toasts, dismiss } = useToast()
const region = useTemplateRef<HTMLElement>('region')

// Регион с aria-live должен быть на странице до первого тоста и один: второй экземпляр молчит.
const hostId = Symbol('UiToast')
const isHost = claimToastHost(hostId)

// Верхний слой (popover) держит тосты над открытой шторкой: обычный z-index под <dialog> не пробьёт.
function raise(): void {
  const element = region.value
  if (!element || typeof element.showPopover !== 'function') return
  try {
    if (element.matches(':popover-open')) element.hidePopover()
    element.showPopover()
  } catch {
    // Верхний слой не поддерживается: регион остаётся обычным блоком с z-index.
  }
}

onMounted(raise)
onBeforeUnmount(() => releaseToastHost(hostId))

watch(
  () => toasts.length,
  (length, previous) => {
    // Лишние старые тосты уходят: на экране не больше `max`.
    if (isHost) toasts.slice(0, Math.max(0, length - props.max)).forEach((toast) => dismiss(toast.id))
    // Под открытой шторкой регион поднимается заново, иначе тост окажется под ней.
    if (isHost && length > previous && document.querySelector('dialog[open]')) raise()
  },
)
</script>

<!-- Монтируется один раз в оболочке приложения; тосты показываются через useToast().show(). Нижний отступ — токен `--toast-bottom` (над нижней навигацией его задаёт оболочка). -->
<template>
  <div v-if="isHost" ref="region" class="ui-toast" popover="manual" role="region" :aria-label="label" aria-live="polite" aria-atomic="false" aria-relevant="additions text">
    <TransitionGroup name="ui-toast" tag="div" class="ui-toast__list">
      <UiToastItem v-for="toast in toasts" :key="toast.id" :toast="toast" :close-label="closeLabel" @dismiss="dismiss(toast.id)" />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.ui-toast {
  position: fixed;
  inset: auto 0 var(--toast-bottom, calc(var(--s-4) + env(safe-area-inset-bottom))) 0;
  z-index: 60;
  display: flex;
  justify-content: center;
  width: auto;
  height: auto;
  max-width: none;
  margin: 0;
  padding: 0 var(--s-4);
  overflow: visible;
  border: 0;
  background: transparent;
  color: var(--text);
  pointer-events: none;
}

/* Браузер прячет закрытый popover, а регион с aria-live должен оставаться на странице всегда. */
.ui-toast:not(:popover-open) {
  display: flex;
}

.ui-toast__list {
  position: relative;
  display: grid;
  gap: var(--s-2);
  width: min(100%, 420px);
}

/* Приходит снизу и уходит вниз тем же путём (как «Уведомления» на /motion). Соседи сдвигаются transform-переходом. */
.ui-toast-enter-active,
.ui-toast-leave-active {
  transition:
    opacity var(--dur-toast) var(--ease-out),
    transform var(--dur-toast) var(--ease-out);
}

.ui-toast-leave-active {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
}

.ui-toast-enter-from,
.ui-toast-leave-to {
  opacity: 0;
  transform: translateY(calc(100% * var(--motion-distance)));
}

.ui-toast-move {
  transition: transform var(--dur-reflow) var(--ease-out);
}
</style>
