<script setup lang="ts">
import { ref } from 'vue'
import { UiButton, UiIcon } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

interface Item {
  id: number
  title: string
}

const TITLES = ['Тыквенный суп', 'Хачапури по-аджарски', 'Тирамису', 'Утка с яблоками', 'Крем-брюле', 'Долма'] as const

let counter = 3
const items = ref<Item[]>([
  { id: 1, title: 'Борщ с пампушками' },
  { id: 2, title: 'Пельмени' },
  { id: 3, title: 'Оливье' },
])

function add(): void {
  counter += 1
  items.value = [{ id: counter, title: TITLES[counter % TITLES.length]! }, ...items.value].slice(0, 5)
}

function remove(id: number): void {
  items.value = items.value.filter((item) => item.id !== id)
}
</script>

<template>
  <MotionDemo
    title="Добавление и удаление в списке"
    tier="occasional"
    purpose="state"
    description="Новый элемент появляется сверху, удаляемый уходит, а соседи плавно сдвигаются, а не прыгают. Всё прерываемо: нажимайте быстрее, чем идёт анимация."
    :specs="[
      { label: 'Инструмент', value: 'Vue <TransitionGroup> + CSS (FLIP через -move)' },
      { label: 'Свойства', value: 'opacity, transform' },
      { label: 'Кривая', value: 'var(--ease-out), 250 мс; сдвиг соседей 300 мс' },
    ]"
  >
    <template #actions><UiButton size="sm" icon-left="bookmark" @click="add">Добавить</UiButton></template>
    <TransitionGroup name="layout-item" tag="ul" class="layout-list">
      <li v-for="item in items" :key="item.id" class="layout-list__item">
        <span>{{ item.title }}</span>
        <button class="layout-list__remove" type="button" :aria-label="`Убрать: ${item.title}`" @click="remove(item.id)"><UiIcon name="close" :size="16" /></button>
      </li>
    </TransitionGroup>
  </MotionDemo>
</template>

<style scoped>
.layout-list {
  position: relative;
  display: grid;
  align-content: start;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.layout-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 8px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  font-size: 14px;
}

.layout-list__remove {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--r-pill);
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
}

.layout-item-enter-active,
.layout-item-leave-active {
  transition:
    opacity calc(250ms * var(--motion-scale)) var(--ease-out),
    transform calc(250ms * var(--motion-scale)) var(--ease-out);
}

.layout-item-leave-active {
  position: absolute;
  inset-inline: 0;
}

.layout-item-enter-from {
  opacity: 0;
  transform: translateY(calc(-8px * var(--motion-distance))) scale(calc(1 - 0.02 * var(--motion-distance)));
}

.layout-item-leave-to {
  opacity: 0;
  transform: scale(calc(1 - 0.04 * var(--motion-distance)));
}

.layout-item-move {
  transition: transform calc(300ms * var(--motion-scale)) var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .layout-list__remove:hover {
    background: var(--surface-2);
    color: var(--text);
  }
}
</style>
