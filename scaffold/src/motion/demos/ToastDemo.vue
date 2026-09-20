<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { UiButton, UiIcon } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

interface Toast {
  id: number
  text: string
}

const MESSAGES = ['Место сохранено в подборку', 'Ссылка скопирована', 'Отзыв опубликован', 'Напоминание включено'] as const
const MAX_TOASTS = 3
const LIFETIME_MS = 3200

const toasts = ref<Toast[]>([])
let counter = 0
const timers = new Map<number, ReturnType<typeof setTimeout>>()

function dismiss(id: number): void {
  clearTimeout(timers.get(id))
  timers.delete(id)
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function push(): void {
  const id = ++counter
  toasts.value = [...toasts.value, { id, text: MESSAGES[id % MESSAGES.length]! }].slice(-MAX_TOASTS)
  timers.set(id, setTimeout(() => dismiss(id), LIFETIME_MS))
}

onBeforeUnmount(() => timers.forEach((timer) => clearTimeout(timer)))
</script>

<template>
  <MotionDemo
    title="Уведомления"
    tier="occasional"
    purpose="feedback"
    description="Уведомление приходит снизу и уходит вниз тем же путём. Нажмите несколько раз подряд: остальные плавно сдвигаются, а анимация не перезапускается."
    :specs="[
      { label: 'Инструмент', value: 'Vue <TransitionGroup> + CSS transition' },
      { label: 'Свойства', value: 'opacity, transform: translateY(100% → 0)' },
      { label: 'Кривая', value: 'ease, 400 мс (--dur-toast) — по характеру компонента' },
      { label: 'Сдвиг соседей', value: '300 мс, var(--ease-out)' },
    ]"
  >
    <template #note>Именно transition, а не keyframes: при быстрых повторах он продолжает с текущего положения, keyframes начинал бы заново.</template>
    <div class="toasts-stage">
      <UiButton size="sm" @click="push">Показать уведомление</UiButton>
      <TransitionGroup name="toast" tag="div" class="toasts" role="status" aria-live="polite">
        <div v-for="toast in toasts" :key="toast.id" class="toast">
          <UiIcon name="check" class="toast__icon" />
          <span class="toast__text">{{ toast.text }}</span>
          <button class="toast__close" type="button" aria-label="Закрыть" @click="dismiss(toast.id)"><UiIcon name="close" :size="16" /></button>
        </div>
      </TransitionGroup>
    </div>
  </MotionDemo>
</template>

<style scoped>
.toasts-stage {
  position: relative;
  display: grid;
  align-content: start;
  justify-items: start;
  min-height: 210px;
}

.toasts {
  position: absolute;
  inset: auto 0 0 0;
  display: grid;
  gap: 8px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  font-size: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.toast__icon {
  color: var(--success);
}

.toast__text {
  flex: 1;
}

.toast__close {
  display: grid;
  place-items: center;
  padding: 4px;
  border: 0;
  background: none;
  color: var(--text-3);
  cursor: pointer;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity var(--dur-toast) ease,
    transform var(--dur-toast) ease;
}

.toast-leave-active {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(calc(100% * var(--motion-distance)));
}

.toast-move {
  transition: transform calc(300ms * var(--motion-scale)) var(--ease-out);
}
</style>
