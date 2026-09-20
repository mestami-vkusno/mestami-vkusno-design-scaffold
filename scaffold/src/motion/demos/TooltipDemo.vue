<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { UiCluster, UiIconButton } from '@/design-system'
import type { IconName } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

interface Action {
  id: string
  icon: IconName
  label: string
}

const ACTIONS: readonly Action[] = [
  { id: 'share', icon: 'share', label: 'Поделиться' },
  { id: 'bookmark', icon: 'bookmark', label: 'Сохранить в подборку' },
  { id: 'external', icon: 'external', label: 'Открыть на сайте' },
]

const SHOW_DELAY_MS = 350
const WARM_MS = 400

const visibleId = ref<string | null>(null)
const instant = ref(false)
let showTimer: ReturnType<typeof setTimeout> | undefined
let warmTimer: ReturnType<typeof setTimeout> | undefined

// Первый показ идёт с задержкой, чтобы не срабатывать случайно. Пока панель «прогрета», соседние подсказки открываются сразу и без анимации.
function show(id: string): void {
  clearTimeout(showTimer)
  clearTimeout(warmTimer)
  if (instant.value) {
    visibleId.value = id
    return
  }
  showTimer = setTimeout(() => {
    visibleId.value = id
    instant.value = false
  }, SHOW_DELAY_MS)
}

function hide(): void {
  clearTimeout(showTimer)
  if (visibleId.value !== null) {
    instant.value = true
    warmTimer = setTimeout(() => {
      instant.value = false
    }, WARM_MS)
  }
  visibleId.value = null
}

function onEnter(id: string, event: PointerEvent): void {
  if (event.pointerType === 'mouse') show(id)
}

onBeforeUnmount(() => {
  clearTimeout(showTimer)
  clearTimeout(warmTimer)
})
</script>

<template>
  <MotionDemo
    title="Подсказка"
    tier="often"
    purpose="state"
    tall
    description="Первая подсказка появляется с задержкой, чтобы не мешать. Стоит открыться одной — соседние показываются мгновенно, и вся панель ощущается быстрее."
    :specs="[
      { label: 'Инструмент', value: 'Vue <Transition> + CSS' },
      { label: 'Свойства', value: 'opacity, transform: scale(0.97 → 1)' },
      { label: 'Кривая', value: 'var(--ease-out), 125 мс (--dur-tooltip)' },
      { label: 'Задержка', value: '350 мс, затем 0 для соседних' },
    ]"
  >
    <template #note>Только для мыши и клавиатуры: на тач-экране подсказок по наведению нет, поэтому у иконок есть подписи для скринридера.</template>
    <UiCluster class="tips">
      <span v-for="action in ACTIONS" :key="action.id" class="tip">
        <UiIconButton
          :icon="action.icon"
          :label="action.label"
          :aria-describedby="visibleId === action.id ? `tip-${action.id}` : undefined"
          @pointerenter="onEnter(action.id, $event)"
          @pointerleave="hide"
          @focus="show(action.id)"
          @blur="hide"
        />
        <Transition name="tip">
          <span v-if="visibleId === action.id" :id="`tip-${action.id}`" class="tip__bubble" :class="{ 'tip__bubble--instant': instant }" role="tooltip">{{ action.label }}</span>
        </Transition>
      </span>
    </UiCluster>
  </MotionDemo>
</template>

<style scoped>
.tips {
  align-self: center;
  justify-self: start;
  padding-left: 32px;
}

.tip {
  position: relative;
  display: inline-flex;
}

.tip__bubble {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  z-index: 3;
  padding: 6px 10px;
  border-radius: var(--r-sm);
  background: var(--inverse-bg);
  color: var(--inverse-text);
  font-size: 12.5px;
  white-space: nowrap;
  pointer-events: none;
  translate: -50% 0;
  transform-origin: bottom center;
}

.tip-enter-active,
.tip-leave-active {
  transition:
    opacity var(--dur-tooltip) var(--ease-out),
    transform var(--dur-tooltip) var(--ease-out);
}

.tip__bubble--instant.tip-enter-active {
  transition-duration: 0ms;
}

.tip-enter-from,
.tip-leave-to {
  opacity: 0;
  transform: scale(calc(1 - 0.03 * var(--motion-distance)));
}
</style>
