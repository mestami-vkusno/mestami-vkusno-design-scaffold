<script setup lang="ts">
import type { OpenNowLabelProps } from './types'

defineProps<OpenNowLabelProps>()
</script>

<template>
  <span class="open-now" :class="`open-now--${state}`">
    <span class="open-now__dot" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<style scoped>
.open-now {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  font-size: 13px;
  line-height: 1.3;
  color: var(--text-2);
}

/* Смысл дублируется текстом, цвет только подсказывает. */
.open-now__dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-3);
}

.open-now--open {
  color: var(--success);
}

.open-now--open .open-now__dot {
  background: var(--success);
}

.open-now--closed {
  color: var(--text-3);
}
</style>
