<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { UiButton, cubicBezierCss, useMotion } from '@/design-system'
import { EASING_ROWS } from '../data/tokens'
import CurvePlot from '../components/CurvePlot.vue'
import MotionDemo from '../components/MotionDemo.vue'

const DOT = 20
const RACE_SECONDS = 0.8

const tracks = useTemplateRef<HTMLElement[]>('tracks')
const dots = useTemplateRef<HTMLElement[]>('dots')
const { duration, isReduced } = useMotion()

function run(): void {
  dots.value?.forEach((dot, index) => {
    const row = EASING_ROWS[index]
    const width = tracks.value?.[index]?.clientWidth ?? 0
    if (!row) return
    dot.getAnimations().forEach((animation) => animation.cancel())
    const reduced = isReduced.value
    dot.animate(
      reduced ? [{ opacity: 0.2 }, { opacity: 1 }] : [{ transform: 'translateX(0)' }, { transform: `translateX(${width - DOT}px)` }],
      { duration: duration(RACE_SECONDS) * 1000, easing: cubicBezierCss(row.curve), fill: 'forwards' },
    )
  })
}
</script>

<template>
  <MotionDemo
    title="Кривые: сильная против встроенной"
    tier="occasional"
    purpose="explanation"
    description="Все точки проходят путь за одно и то же время. Кривая решает, когда пользователь видит результат: у сильного ease-out он уже почти на месте к 30% пути."
    :specs="[
      { label: 'Инструмент', value: 'WAAPI element.animate()' },
      { label: 'Свойство', value: 'transform' },
      { label: 'Длительность', value: '800 мс — только чтобы разглядеть разницу' },
    ]"
  >
    <template #actions><UiButton size="sm" icon-left="refresh" @click="run">Запустить</UiButton></template>
    <div class="race">
      <div v-for="row in EASING_ROWS" :key="row.id" class="race__row">
        <CurvePlot :curve="row.curve" :label="row.label" />
        <div class="race__body">
          <div class="race__caption">
            <b>{{ row.label }}</b>
            <code>{{ row.token }}</code>
            <span v-if="row.avoid" class="race__avoid">не для интерфейса</span>
          </div>
          <div ref="tracks" class="race__track"><i ref="dots" class="race__dot" :class="{ 'race__dot--avoid': row.avoid }" /></div>
        </div>
      </div>
    </div>
  </MotionDemo>
</template>

<style scoped>
.race {
  display: grid;
  gap: var(--s-3);
  align-content: center;
}

.race__row {
  display: flex;
  align-items: center;
  gap: var(--s-3);
}

.race__body {
  flex: 1;
  min-width: 0;
}

.race__caption {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px var(--s-2);
  margin-bottom: 6px;
  font-size: 13px;
}

.race__avoid {
  color: var(--danger);
  font-size: 12px;
}

.race__track {
  height: 20px;
  border-radius: var(--r-pill);
  background: var(--surface-2);
}

.race__dot {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--lime);
}

.race__dot--avoid {
  background: var(--danger);
}
</style>
