<script setup lang="ts">
import { ref } from 'vue'
import { UiButton } from '@/design-system'
import { DURATION_ROWS } from '../data/tokens'
import MotionDemo from '../components/MotionDemo.vue'

const run = ref(0)
</script>

<template>
  <MotionDemo
    title="Шкала длительностей"
    tier="occasional"
    purpose="explanation"
    description="Интерфейсные анимации держатся ниже 300 мс. Дольше — только шторки и уведомления, у которых есть причина."
    :specs="[
      { label: 'Инструмент', value: 'CSS transition (токены --dur-*)' },
      { label: 'Свойство', value: 'transform: scaleX — заполнение шкалы' },
      { label: 'Кривая', value: 'var(--ease-out)' },
    ]"
  >
    <template #actions><UiButton size="sm" icon-left="refresh" @click="run += 1">Запустить</UiButton></template>
    <ul class="scale">
      <li v-for="row in DURATION_ROWS" :key="row.name" class="scale__row">
        <div class="scale__caption">
          <b>{{ row.label }}</b>
          <code>{{ row.token }} · {{ row.ms }} мс</code>
        </div>
        <div class="scale__track">
          <i :key="run" class="scale__fill" :style="{ '--ms': `${row.ms}` } as never" />
        </div>
        <span class="scale__use">{{ row.use }}</span>
      </li>
    </ul>
  </MotionDemo>
</template>

<style scoped>
.scale {
  display: grid;
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.scale__row {
  display: grid;
  gap: 4px;
}

.scale__caption {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2px var(--s-3);
  font-size: 13px;
}

.scale__track {
  height: 8px;
  overflow: hidden;
  border-radius: var(--r-pill);
  background: var(--surface-2);
}

.scale__fill {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: var(--lime);
  transform-origin: left center;
  animation: scale-fill calc(var(--ms) * 1ms * var(--motion-scale)) var(--ease-out) both;
}

.scale__use {
  color: var(--text-3);
  font-size: 12px;
}

/* При уменьшенном движении шкала не растёт, а проявляется. */
@keyframes scale-fill {
  from {
    transform: scaleX(calc(1 - var(--motion-distance)));
    opacity: calc(1 - 0.7 * (1 - var(--motion-distance)));
  }
}
</style>
