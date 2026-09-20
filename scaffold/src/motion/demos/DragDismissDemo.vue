<script setup lang="ts">
import { ref } from 'vue'
import { m } from 'motion-v'
import type { PanInfo } from 'motion-v'
import { SPRING, UiButton, UiCluster, UiIcon, UiText, useMotion } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

const DISTANCE_THRESHOLD = 110
const VELOCITY_THRESHOLD = 500

const dismissedTo = ref<-1 | 0 | 1>(0)
const { duration } = useMotion()

// Смахивают не только на расстояние: быстрый бросок тоже считается.
function onDragEnd(_event: PointerEvent, info: PanInfo): void {
  const flick = Math.abs(info.velocity.x) > VELOCITY_THRESHOLD
  if (Math.abs(info.offset.x) >= DISTANCE_THRESHOLD || flick) dismissedTo.value = info.offset.x < 0 ? -1 : 1
}

function dismiss(direction: -1 | 1): void {
  dismissedTo.value = direction
}
</script>

<template>
  <MotionDemo
    title="Смахивание"
    tier="occasional"
    purpose="feedback"
    description="Потяните карточку в сторону. Дальше порога или быстрым броском — она уходит, иначе пружиной возвращается. Прерванный жест сохраняет скорость."
    :specs="[
      { label: 'Инструмент', value: 'Motion: drag + spring' },
      { label: 'Порог', value: '110 px или скорость выше 500 px/с' },
      { label: 'Пружина', value: 'duration 0.5, bounce 0.2' },
      { label: 'За краем', value: 'dragElastic 0.6: сопротивление растёт' },
    ]"
  >
    <template #actions><UiButton v-if="dismissedTo !== 0" size="sm" icon-left="refresh" @click="dismissedTo = 0">Вернуть</UiButton></template>
    <template #note>Смахивание — жест, поэтому у него есть кнопочная альтернатива: «Убрать» делает то же самое без перетаскивания.</template>
    <div class="drag">
      <m.div
        class="drag__card"
        drag="x"
        :drag-constraints="{ left: 0, right: 0 }"
        :drag-elastic="0.6"
        :while-drag="{ cursor: 'grabbing' }"
        :animate="dismissedTo === 0 ? { x: 0, opacity: 1 } : { x: dismissedTo * 360, opacity: 0 }"
        :transition="{ ...SPRING.soft, duration: duration(SPRING.soft.duration) }"
        @drag-end="onDragEnd"
      >
        <UiIcon name="bookmark" />
        <div class="drag__text">
          <b>Напоминание о записи</b>
          <UiText variant="caption">Смахните в сторону, чтобы убрать</UiText>
        </div>
      </m.div>
      <UiCluster v-if="dismissedTo === 0" class="drag__actions">
        <UiButton size="sm" variant="ghost" @click="dismiss(-1)">Убрать</UiButton>
      </UiCluster>
    </div>
  </MotionDemo>
</template>

<style scoped>
.drag {
  display: grid;
  align-content: center;
  gap: var(--s-3);
  touch-action: pan-y;
}

.drag__card {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-4);
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-lg);
  cursor: grab;
  user-select: none;
  touch-action: pan-y;
}

.drag__text {
  display: grid;
}

.drag__actions {
  justify-content: flex-end;
}
</style>
