<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import type { OptionItem } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

const TABS: readonly OptionItem[] = [
  { id: 'all', label: 'Все' },
  { id: 'near', label: 'Рядом' },
  { id: 'open', label: 'Открыто' },
  { id: 'saved', label: 'Мои' },
]

const active = ref('all')
const buttons = useTemplateRef<HTMLButtonElement[]>('buttons')
const row = useTemplateRef<HTMLElement>('row')
const box = ref({ left: 0, right: 0 })
let observer: ResizeObserver | undefined

function measure(): void {
  const index = TABS.findIndex((tab) => tab.id === active.value)
  const button = buttons.value?.[index]
  const width = row.value?.offsetWidth ?? 0
  if (!button) return
  box.value = { left: button.offsetLeft, right: width - button.offsetLeft - button.offsetWidth }
}

// Активная копия списка обрезается по активной вкладке: фон и цвет текста меняются вместе, без подбора таймингов.
const clip = computed(() => `inset(0 ${box.value.right}px 0 ${box.value.left}px round 999px)`)

function select(id: string): void {
  active.value = id
  void nextTick(measure)
}

onMounted(() => {
  measure()
  observer = new ResizeObserver(measure)
  if (row.value) observer.observe(row.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <MotionDemo
    title="Индикатор вкладок"
    tier="often"
    purpose="state"
    description="Лаймовая «таблетка» скользит к выбранной вкладке. Цвет текста меняется синхронно с фоном, потому что это один и тот же элемент, открытый через обрезку."
    :specs="[
      { label: 'Инструмент', value: 'CSS transition + копия списка' },
      { label: 'Свойство', value: 'clip-path: inset(0 R 0 L round 999px)' },
      { label: 'Кривая', value: 'var(--ease-in-out), 250 мс — движение по экрану' },
    ]"
  >
    <template #note>Копия списка скрыта от скринридера и не принимает нажатий: управляет нижний слой.</template>
    <div class="tabs" role="tablist" aria-label="Пример вкладок">
      <div ref="row" class="tabs__row">
        <button v-for="tab in TABS" :key="tab.id" ref="buttons" class="tabs__tab" type="button" role="tab" :aria-selected="tab.id === active" @click="select(tab.id)">{{ tab.label }}</button>
      </div>
      <div class="tabs__row tabs__row--active" aria-hidden="true" :style="{ clipPath: clip }">
        <span v-for="tab in TABS" :key="tab.id" class="tabs__tab">{{ tab.label }}</span>
      </div>
    </div>
  </MotionDemo>
</template>

<style scoped>
.tabs {
  position: relative;
  justify-self: start;
  align-self: center;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-pill);
}

.tabs__row {
  display: flex;
  width: max-content;
}

.tabs__row--active {
  position: absolute;
  inset: 0;
  background: var(--lime);
  color: var(--on-accent);
  pointer-events: none;
  transition: clip-path calc(250ms * var(--motion-scale)) var(--ease-in-out);
}

.tabs__tab {
  height: 40px;
  padding: 0 14px;
  border: 0;
  background: transparent;
  color: inherit;
  font: 500 14px/40px var(--font);
  white-space: nowrap;
  cursor: pointer;
}

.tabs__row--active .tabs__tab {
  display: block;
  font-weight: 600;
}
</style>
