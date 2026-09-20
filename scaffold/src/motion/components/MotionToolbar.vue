<script setup lang="ts">
import { computed } from 'vue'
import { UiSegmented, useMotion } from '@/design-system'
import type { MotionScale, ReducedMotionMode } from '@/design-system'
import type { OptionItem } from '@/design-system'

const { scale, setScale, reducedMode, setReducedMode, isReduced } = useMotion()

const SCALE_ITEMS: readonly OptionItem[] = [
  { id: '1', label: '×1' },
  { id: '2', label: '×2' },
  { id: '5', label: '×5' },
]
const REDUCED_ITEMS: readonly OptionItem[] = [
  { id: 'auto', label: 'Авто' },
  { id: 'on', label: 'Меньше' },
  { id: 'off', label: 'Полное' },
]

const scaleModel = computed({
  get: () => String(scale.value),
  set: (value: string) => setScale(Number(value) as MotionScale),
})
const reducedModel = computed({
  get: () => reducedMode.value,
  set: (value: string) => setReducedMode(value as ReducedMotionMode),
})
</script>

<template>
  <div class="motion-toolbar" role="region" aria-label="Проверка анимаций">
    <div class="motion-toolbar__group">
      <span class="motion-toolbar__label">Замедление</span>
      <UiSegmented v-model="scaleModel" :items="SCALE_ITEMS" label="Замедление анимаций" />
    </div>
    <div class="motion-toolbar__group">
      <span class="motion-toolbar__label">Движение{{ isReduced ? ': уменьшено' : '' }}</span>
      <UiSegmented v-model="reducedModel" :items="REDUCED_ITEMS" label="Режим уменьшенного движения" />
    </div>
  </div>
</template>

<style scoped>
.motion-toolbar {
  position: fixed;
  left: 50%;
  bottom: max(12px, env(safe-area-inset-bottom));
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--s-2) var(--s-4);
  width: max-content;
  max-width: calc(100vw - 24px);
  padding: 8px 12px;
  transform: translateX(-50%);
  background: var(--topbar-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.motion-toolbar__group {
  display: flex;
  align-items: center;
  gap: var(--s-2);
}

.motion-toolbar__label {
  color: var(--text-2);
  font-size: 12.5px;
  white-space: nowrap;
}

.motion-toolbar :deep(.ui-segmented__item) {
  height: 30px;
  padding: 0 12px;
  font-size: 13px;
}
</style>
