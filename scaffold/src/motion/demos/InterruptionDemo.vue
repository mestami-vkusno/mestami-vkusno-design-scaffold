<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { animate } from 'motion-v'
import { EASE, cubicBezierCss, useMotion } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

interface Lane {
  id: 'keyframes' | 'transition' | 'spring'
  label: string
  note: string
}

const LANES: readonly Lane[] = [
  { id: 'keyframes', label: 'Keyframes', note: 'каждый клик начинает с нуля' },
  { id: 'transition', label: 'Transition', note: 'продолжает с текущего места' },
  { id: 'spring', label: 'Пружина', note: 'ещё и сохраняет скорость' },
]

const DOT = 24
const STEP_SECONDS = 0.7

const zone = useTemplateRef<HTMLElement>('zone')
const dots = useTemplateRef<HTMLElement[]>('dots')
const { duration, isReduced } = useMotion()

function moveTo(event: PointerEvent): void {
  const bounds = zone.value?.getBoundingClientRect()
  if (!bounds || !dots.value) return
  const target = Math.min(Math.max(event.clientX - bounds.left - DOT / 2, 0), bounds.width - DOT)
  const seconds = duration(STEP_SECONDS)

  dots.value.forEach((dot, index) => {
    const lane = LANES[index]
    if (!lane) return
    if (isReduced.value) {
      dot.getAnimations().forEach((animation) => animation.cancel())
      dot.style.transform = `translateX(${target}px)`
      return
    }
    if (lane.id === 'keyframes') {
      dot.getAnimations().forEach((animation) => animation.cancel())
      dot.animate([{ transform: 'translateX(0px)' }, { transform: `translateX(${target}px)` }], { duration: seconds * 1000, easing: cubicBezierCss(EASE.out), fill: 'forwards' })
    } else if (lane.id === 'transition') {
      dot.style.transform = `translateX(${target}px)`
    } else {
      animate(dot, { transform: `translateX(${target}px)` }, { type: 'spring', duration: seconds, bounce: 0.2 })
    }
  })
}
</script>

<template>
  <MotionDemo
    title="Прерывание анимации"
    tier="often"
    purpose="explanation"
    description="Кликайте по полосам подряд, не дожидаясь конца. Keyframes каждый раз возвращаются в начало и дёргаются; transition и пружина продолжают с того места, где точка сейчас."
    :specs="[
      { label: 'Вывод', value: 'для всего, что нажимают часто, — transition или пружина' },
      { label: 'Keyframes', value: 'WAAPI из начала в цель' },
      { label: 'Transition', value: 'CSS transition: transform, 700 мс' },
      { label: 'Пружина', value: 'Motion animate(), duration 0.7, bounce 0.2' },
    ]"
  >
    <div ref="zone" class="lanes" @pointerdown="moveTo">
      <div v-for="lane in LANES" :key="lane.id" class="lane">
        <span class="lane__label"><b>{{ lane.label }}</b> · {{ lane.note }}</span>
        <div class="lane__track">
          <i ref="dots" class="lane__dot" :class="{ 'lane__dot--transition': lane.id === 'transition' }" />
        </div>
      </div>
    </div>
  </MotionDemo>
</template>

<style scoped>
.lanes {
  display: grid;
  gap: var(--s-3);
  align-content: center;
  cursor: pointer;
  touch-action: manipulation;
}

.lane {
  display: grid;
  gap: 6px;
}

.lane__label {
  color: var(--text-3);
  font-size: 12.5px;
}

.lane__label b {
  color: var(--text);
}

.lane__track {
  height: 24px;
  border-radius: var(--r-pill);
  background: var(--surface-2);
}

.lane__dot {
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--lime);
}

.lane__dot--transition {
  transition: transform calc(700ms * var(--motion-scale)) var(--ease-out);
}
</style>
