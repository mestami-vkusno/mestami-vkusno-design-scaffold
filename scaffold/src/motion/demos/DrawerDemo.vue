<script setup lang="ts">
import { UiButton, UiText, useMotion } from '@/design-system'
import { useAnimatedDialog } from '../composables/useAnimatedDialog'
import MotionDemo from '../components/MotionDemo.vue'

const { duration } = useMotion()
const { state, open, close, onBackdropClick } = useAnimatedDialog('dialog', () => duration(0.5) * 1000)
</script>

<template>
  <MotionDemo
    title="Шторка"
    tier="occasional"
    purpose="spatial"
    description="Шторка приходит снизу и уходит туда же: путь симметричен, поэтому понятно, как её закрыть. Кривая в духе iOS — резкий старт и мягкая посадка."
    :specs="[
      { label: 'Инструмент', value: 'нативный <dialog> + CSS transition' },
      { label: 'Свойство', value: 'transform: translateY(100% → 0)' },
      { label: 'Кривая', value: 'var(--ease-drawer)' },
      { label: 'Длительность', value: '500 мс (--dur-drawer)' },
    ]"
  >
    <template #note>При уменьшенном движении шторка не едет, а проявляется. Жест смахивания вниз — в разделе «Жесты».</template>
    <UiButton variant="neutral" icon-left="filter" @click="open">Фильтры</UiButton>
    <dialog ref="dialog" class="drawer" :data-state="state" aria-labelledby="drawer-demo-title" @cancel.prevent="close" @click="onBackdropClick">
      <div class="drawer__sheet">
        <span class="drawer__grip" aria-hidden="true" />
        <h4 id="drawer-demo-title" class="drawer__title">Фильтры</h4>
        <UiText>Здесь могли бы быть кухня, цена и район.</UiText>
        <UiButton block @click="close">Показать результаты</UiButton>
      </div>
    </dialog>
  </MotionDemo>
</template>

<style scoped>
.drawer {
  inset: auto 0 0 0;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  overflow: visible;
  transition:
    transform var(--dur-drawer) var(--ease-drawer),
    opacity var(--dur-drawer) var(--ease-drawer);
}

.drawer[data-state='closed'] {
  transform: translateY(calc(100% * var(--motion-distance)));
  opacity: var(--motion-distance);
}

.drawer::backdrop {
  background: rgba(0, 0, 0, 0.6);
  transition: opacity var(--dur-drawer) var(--ease-drawer);
}

.drawer[data-state='closed']::backdrop {
  opacity: 0;
}

.drawer__sheet {
  display: grid;
  gap: var(--s-4);
  padding: var(--s-3) var(--s-6) var(--s-6);
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-bottom: 0;
  border-radius: var(--r-xl) var(--r-xl) 0 0;
}

.drawer__grip {
  justify-self: center;
  width: 40px;
  height: 4px;
  border-radius: var(--r-pill);
  background: var(--border-strong);
}

.drawer__title {
  margin: 0;
  font-size: 20px;
}
</style>
