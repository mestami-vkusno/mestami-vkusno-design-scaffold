<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef } from 'vue'
import { UiIconButton, useMotion } from '@/design-system'
import { FEATURE_LABELS } from '../labels'
import type { HorizontalRailProps } from './types'

const props = withDefaults(defineProps<HorizontalRailProps>(), { itemWidth: 260, gap: 4, bleed: true })
defineSlots<{ /** Карточки ряда: каждый прямой потомок становится точкой прилипания. */ default?(): unknown }>()

/*
  Лента карточек без JS-карусели: прокручивает браузер (scroll-snap), скрипт только следит за краями и листает стрелками.
  Стрелки есть только у мыши (`pointer: fine`), на телефоне рядом прокручивают пальцем.
  Клавиатура: Tab идёт по карточкам (браузер сам подводит их в поле зрения), стрелки влево/вправо, Home, End листают ряд.
*/
const track = useTemplateRef<HTMLElement>('track')
const canPrev = ref(false)
const canNext = ref(false)
const { isReduced } = useMotion()

let frame = 0
let observer: ResizeObserver | undefined

function measure(): void {
  frame = 0
  const element = track.value
  if (element === null) return
  // Полпикселя запаса: на дробных масштабах scrollLeft не доходит до края ровно.
  canPrev.value = element.scrollLeft > 1
  canNext.value = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
}

function schedule(): void {
  if (frame === 0) frame = requestAnimationFrame(measure)
}

onMounted(() => {
  measure()
  if (track.value !== null && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(schedule)
    observer.observe(track.value)
  }
})
onUpdated(() => void nextTick(measure))
onBeforeUnmount(() => {
  observer?.disconnect()
  if (frame !== 0) cancelAnimationFrame(frame)
})

function scrollByPage(direction: 1 | -1): void {
  const element = track.value
  if (element === null) return
  element.scrollBy({ left: direction * element.clientWidth * 0.85, behavior: isReduced.value ? 'auto' : 'smooth' })
}

function scrollToEdge(edge: 'start' | 'end'): void {
  const element = track.value
  if (element === null) return
  element.scrollTo({ left: edge === 'start' ? 0 : element.scrollWidth, behavior: isReduced.value ? 'auto' : 'smooth' })
}

function onKeydown(event: KeyboardEvent): void {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  const target = event.target
  // В полях ввода стрелки двигают курсор, а не ряд.
  if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return
  if (event.key === 'ArrowRight') scrollByPage(1)
  else if (event.key === 'ArrowLeft') scrollByPage(-1)
  else if (event.key === 'Home') scrollToEdge('start')
  else if (event.key === 'End') scrollToEdge('end')
  else return
  event.preventDefault()
}

const style = computed(() => ({ '--rail-item': `${props.itemWidth}px`, '--rail-gap': `var(--s-${props.gap})` }))
</script>

<template>
  <div class="rail" :class="{ 'rail--bleed': bleed }" :style="style">
    <div ref="track" class="rail__track" role="group" :aria-label="label" @scroll.passive="schedule" @keydown="onKeydown">
      <slot />
    </div>
    <UiIconButton v-if="canPrev" class="rail__arrow rail__arrow--prev" icon="arrow-l" :label="`${FEATURE_LABELS.railPrev}: ${label}`" @click="scrollByPage(-1)" />
    <UiIconButton v-if="canNext" class="rail__arrow rail__arrow--next" icon="arrow-r" :label="`${FEATURE_LABELS.railNext}: ${label}`" @click="scrollByPage(1)" />
  </div>
</template>

<style scoped>
.rail {
  --rail-gutter: var(--s-4);
  position: relative;
}

.rail__track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: var(--rail-item);
  gap: var(--rail-gap);
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  /* Запас под тень и рамку фокуса у краёв: без него прокрутка их срезает. */
  padding-block: var(--s-1);
  margin-block: calc(var(--s-1) * -1);
}

.rail__track::-webkit-scrollbar {
  display: none;
}

.rail__track > :deep(*) {
  scroll-snap-align: start;
  min-width: 0;
}

.rail__track:focus-visible {
  border-radius: var(--r-md);
}

@media (max-width: 899px) {
  .rail--bleed .rail__track {
    margin-inline: calc(var(--rail-gutter) * -1);
    padding-inline: var(--rail-gutter);
    scroll-padding-inline: var(--rail-gutter);
  }
}

/* Стрелки только у мыши и только если есть куда листать. */
.rail__arrow {
  display: none;
}

@media (hover: hover) and (pointer: fine) {
  .rail__arrow {
    position: absolute;
    top: 50%;
    z-index: 2;
    display: inline-grid;
    translate: 0 -50%;
    box-shadow: var(--shadow-float);
  }

  .rail__arrow--prev {
    left: calc(var(--s-3) * -1);
  }

  .rail__arrow--next {
    right: calc(var(--s-3) * -1);
  }
}
</style>
