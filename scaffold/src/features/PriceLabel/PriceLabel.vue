<script setup lang="ts">
import { computed } from 'vue'
import { formatAverageCheck, formatEventPrice, formatMenuPrice } from '@/mocks/format'
import type { PriceLabelProps } from './types'

const props = defineProps<PriceLabelProps>()

const text = computed(() => {
  if (props.kind === 'event') return props.event === undefined ? '' : formatEventPrice(props.event)
  if (props.kind === 'menu') return formatMenuPrice(props.amountRub ?? null)
  return formatAverageCheck(props.amountRub ?? null)
})
const modifier = computed(() => {
  if (props.kind === 'event' && props.event?.kind === 'free') return 'free'
  if ((props.kind === 'event' && props.event?.kind === 'not_specified') || (props.kind !== 'event' && props.amountRub == null)) return 'unknown'
  return 'known'
})
</script>

<template>
  <span class="price-label" :class="`price-label--${modifier}`">{{ text }}</span>
</template>

<style scoped>
.price-label {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.price-label--free {
  color: var(--success);
}

.price-label--unknown {
  color: var(--text-3);
  font-weight: 400;
}
</style>
