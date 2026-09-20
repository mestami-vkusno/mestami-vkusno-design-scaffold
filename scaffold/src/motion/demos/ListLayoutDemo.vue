<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import { UiButton, UiIcon, useMotion } from '@/design-system'
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
const { duration } = useMotion()

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
      { label: 'Инструмент', value: 'Motion: AnimatePresence popLayout + layout' },
      { label: 'Свойства', value: 'opacity, transform, layout' },
      { label: 'Пружина', value: 'duration 0.35, bounce 0' },
    ]"
  >
    <template #actions><UiButton size="sm" icon-left="bookmark" @click="add">Добавить</UiButton></template>
    <ul class="layout-list">
      <AnimatePresence mode="popLayout">
        <Motion
          v-for="item in items"
          :key="item.id"
          as="li"
          layout
          class="layout-list__item"
          :initial="{ opacity: 0, transform: 'translateY(-8px) scale(0.98)' }"
          :animate="{ opacity: 1, transform: 'translateY(0px) scale(1)' }"
          :exit="{ opacity: 0, transform: 'translateY(0px) scale(0.96)' }"
          :transition="{ type: 'spring', duration: duration(0.35), bounce: 0 }"
        >
          <span>{{ item.title }}</span>
          <button class="layout-list__remove" type="button" :aria-label="`Убрать: ${item.title}`" @click="remove(item.id)"><UiIcon name="close" :size="16" /></button>
        </Motion>
      </AnimatePresence>
    </ul>
  </MotionDemo>
</template>

<style scoped>
.layout-list {
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

@media (hover: hover) and (pointer: fine) {
  .layout-list__remove:hover {
    background: var(--surface-2);
    color: var(--text);
  }
}
</style>
