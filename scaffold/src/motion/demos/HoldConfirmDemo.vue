<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useMotion } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

const HOLD_MS = 2000

const holding = ref(false)
const done = ref(false)
const { scale } = useMotion()
let holdTimer: ReturnType<typeof setTimeout> | undefined
let resetTimer: ReturnType<typeof setTimeout> | undefined

function start(): void {
  if (holding.value || done.value) return
  holding.value = true
  holdTimer = setTimeout(() => {
    holding.value = false
    done.value = true
    resetTimer = setTimeout(() => {
      done.value = false
    }, 1800)
  }, HOLD_MS * scale.value)
}

function cancel(): void {
  clearTimeout(holdTimer)
  holding.value = false
}

function onKeydown(event: KeyboardEvent): void {
  if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
    event.preventDefault()
    start()
  }
}

function onKeyup(event: KeyboardEvent): void {
  if (event.key === ' ' || event.key === 'Enter') cancel()
}

onBeforeUnmount(() => {
  clearTimeout(holdTimer)
  clearTimeout(resetTimer)
})
</script>

<template>
  <MotionDemo
    title="Удержание для подтверждения"
    tier="rare"
    purpose="state"
    description="Для необратимых действий обычного клика мало. Заливка идёт медленно и равномерно, пока пользователь решает; отпустил — откат за 200 мс."
    :specs="[
      { label: 'Инструмент', value: 'CSS transition + таймер' },
      { label: 'Свойство', value: 'clip-path: inset(0 100% 0 0) → inset(0)' },
      { label: 'Удержание', value: '2 с, linear — это индикатор прогресса' },
      { label: 'Отпускание', value: '200 мс, var(--ease-out)' },
    ]"
  >
    <template #note>Работает и с клавиатуры: удерживайте Пробел или Enter. Отпустили раньше — действие не выполняется.</template>
    <div class="hold-wrap">
      <button
        class="hold"
        :class="{ 'hold--holding': holding, 'hold--done': done }"
        type="button"
        :aria-label="done ? 'Удалено' : 'Удалить: удерживайте две секунды'"
        @pointerdown="start"
        @pointerup="cancel"
        @pointerleave="cancel"
        @pointercancel="cancel"
        @contextmenu.prevent
        @keydown="onKeydown"
        @keyup="onKeyup"
        @blur="cancel"
      >
        <span class="hold__label">{{ done ? 'Удалено' : 'Удерживайте, чтобы удалить' }}</span>
        <span class="hold__fill" aria-hidden="true">
          <span class="hold__label hold__label--on">{{ done ? 'Удалено' : 'Удерживайте, чтобы удалить' }}</span>
        </span>
      </button>
    </div>
  </MotionDemo>
</template>

<style scoped>
.hold-wrap {
  display: grid;
  place-items: center;
}

.hold {
  position: relative;
  min-width: 250px;
  height: 48px;
  padding: 0 var(--s-5);
  overflow: hidden;
  border: 1px solid var(--danger);
  border-radius: var(--r-md);
  background: transparent;
  color: var(--text);
  font: 600 15px var(--font);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  -webkit-touch-callout: none;
  transition: transform var(--dur-press) var(--ease-out);
}

.hold__fill {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: var(--danger);
  clip-path: inset(0 100% 0 0);
  transition: clip-path calc(200ms * var(--motion-scale)) var(--ease-out);
}

.hold__label {
  position: relative;
}

/* Копия подписи лежит внутри заливки и обрезается вместе с ней: цвет текста меняется ровно там, где он на красном. */
.hold__label--on {
  color: #0d0d0d;
}

.hold--holding {
  transform: scale(calc(1 - 0.03 * var(--motion-distance)));
}

.hold--holding .hold__fill {
  clip-path: inset(0);
  transition: clip-path calc(2s * var(--motion-scale)) linear;
}

.hold--done .hold__fill {
  clip-path: inset(0);
  transition: none;
}
</style>
