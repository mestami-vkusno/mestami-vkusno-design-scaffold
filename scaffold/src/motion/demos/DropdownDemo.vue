<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { UiButton } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

const OPTIONS = ['По рейтингу', 'По расстоянию', 'По цене', 'По новизне'] as const

const opened = ref(false)
const chosen = ref<(typeof OPTIONS)[number]>(OPTIONS[0])
const root = useTemplateRef<HTMLElement>('root')
const items = useTemplateRef<HTMLButtonElement[]>('items')

async function toggle(): Promise<void> {
  opened.value = !opened.value
  if (opened.value) {
    await nextTick()
    items.value?.[0]?.focus()
  }
}

function choose(option: (typeof OPTIONS)[number]): void {
  chosen.value = option
  opened.value = false
}

function onMenuKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    opened.value = false
    return
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  const list = items.value ?? []
  const index = list.indexOf(document.activeElement as HTMLButtonElement)
  const step = event.key === 'ArrowDown' ? 1 : -1
  list[(index + step + list.length) % list.length]?.focus()
}

function onOutsidePointer(event: PointerEvent): void {
  if (opened.value && !root.value?.contains(event.target as Node)) opened.value = false
}

onMounted(() => document.addEventListener('pointerdown', onOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutsidePointer))
</script>

<template>
  <MotionDemo
    title="Выпадающий список"
    tier="occasional"
    purpose="spatial"
    tall
    description="Список вырастает из кнопки, а не из пустоты: точка роста совпадает с левым верхним углом триггера."
    :specs="[
      { label: 'Инструмент', value: 'Vue <Transition> + CSS' },
      { label: 'Свойства', value: 'opacity, transform: scale(0.95 → 1)' },
      { label: 'Начало', value: 'transform-origin: top left (у триггера)' },
      { label: 'Кривая', value: 'var(--ease-out), 200 мс (--dur-dropdown)' },
    ]"
  >
    <template #note>Быстрое открытие и закрытие несколько раз подряд не ломает анимацию: это transition, он подхватывает текущее значение.</template>
    <div ref="root" class="dropdown">
      <UiButton variant="neutral" icon-right="chev-d" aria-haspopup="menu" :aria-expanded="opened" @click="toggle">{{ chosen }}</UiButton>
      <Transition name="dropdown">
        <div v-if="opened" class="dropdown__menu" role="menu" @keydown="onMenuKeydown">
          <button v-for="option in OPTIONS" :key="option" ref="items" class="dropdown__item" type="button" role="menuitemradio" :aria-checked="option === chosen" @click="choose(option)">
            {{ option }}
          </button>
        </div>
      </Transition>
    </div>
  </MotionDemo>
</template>

<style scoped>
.dropdown {
  position: relative;
  justify-self: start;
  align-self: start;
}

.dropdown__menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 3;
  display: grid;
  min-width: 190px;
  padding: 6px;
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  transform-origin: top left;
}

.dropdown__item {
  padding: 10px 12px;
  border: 0;
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--text);
  font: 400 14px var(--font);
  text-align: left;
  cursor: pointer;
}

.dropdown__item[aria-checked='true'] {
  color: var(--accent-fg);
  font-weight: 600;
}

.dropdown__item:focus-visible {
  background: var(--surface);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity var(--dur-dropdown) var(--ease-out),
    transform var(--dur-dropdown) var(--ease-out);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(calc(1 - 0.05 * var(--motion-distance)));
}

@media (hover: hover) and (pointer: fine) {
  .dropdown__item:hover {
    background: var(--surface);
  }
}
</style>
