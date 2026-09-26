<script setup lang="ts">
import { computed } from 'vue'
import type { UiSkeletonProps } from './types'

const props = withDefaults(defineProps<UiSkeletonProps>(), { variant: 'block', lines: 1, size: 40, label: 'Загрузка' })
defineSlots<{ /** Готовая раскладка из скелетонов: контейнер объявляет «идёт загрузка». */ default?(): unknown }>()

function css(value: number | string | undefined): string | undefined {
  return typeof value === 'number' ? `${value}px` : value
}

const shape = computed(() => {
  if (props.variant === 'circle') return { width: `${props.size}px`, height: `${props.size}px` }
  return { width: css(props.width), height: css(props.height), aspectRatio: props.height === undefined ? props.ratio?.replace('/', ' / ') : undefined }
})
</script>

<!-- Без пульсации: в каталоге движения её нет. Сами формы скрыты от скринридера, о загрузке сообщает контейнер. -->
<template>
  <div v-if="$slots.default" class="ui-skeleton-group" role="status" aria-busy="true">
    <span class="ui-skeleton-group__label">{{ label }}</span>
    <slot />
  </div>
  <span v-else-if="variant === 'text'" class="ui-skeleton-text" aria-hidden="true" :style="{ width: css(width) }">
    <span v-for="line in lines" :key="line" class="ui-skeleton ui-skeleton--line" :style="{ height: css(height), width: line === lines && lines > 1 ? '60%' : undefined }" />
  </span>
  <span v-else class="ui-skeleton" :class="`ui-skeleton--${variant}`" aria-hidden="true" :style="shape" />
</template>

<style scoped>
.ui-skeleton {
  display: block;
  background: var(--surface-2);
}

.ui-skeleton--block {
  width: 100%;
  min-height: 12px;
  border-radius: var(--r-md);
}

.ui-skeleton--circle {
  flex: none;
  border-radius: 50%;
}

.ui-skeleton-text {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  width: 100%;
}

.ui-skeleton--line {
  height: 12px;
  border-radius: var(--r-xs);
}

.ui-skeleton-group {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.ui-skeleton-group__label {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
