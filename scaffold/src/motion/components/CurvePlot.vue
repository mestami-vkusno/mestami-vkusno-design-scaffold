<script setup lang="ts">
import { computed } from 'vue'
import type { CubicBezier } from '@/design-system'

const props = defineProps<{ curve: CubicBezier; label: string }>()

const SIZE = 64
const PAD = 8
const inner = SIZE - PAD * 2

const path = computed(() => {
  const [x1, y1, x2, y2] = props.curve
  const point = (x: number, y: number) => `${PAD + x * inner} ${SIZE - PAD - y * inner}`
  return `M ${point(0, 0)} C ${point(x1, y1)}, ${point(x2, y2)}, ${point(1, 1)}`
})
</script>

<template>
  <svg class="curve-plot" :viewBox="`0 0 ${SIZE} ${SIZE}`" role="img" :aria-label="`График кривой: ${label}`">
    <rect :x="PAD" :y="PAD" :width="inner" :height="inner" class="curve-plot__frame" />
    <path :d="path" class="curve-plot__line" />
  </svg>
</template>

<style scoped>
.curve-plot {
  width: 64px;
  height: 64px;
  flex: none;
}

.curve-plot__frame {
  fill: none;
  stroke: var(--border-strong);
  stroke-dasharray: 2 3;
}

.curve-plot__line {
  fill: none;
  stroke: var(--accent-fg);
  stroke-width: 2.25;
  stroke-linecap: round;
}
</style>
