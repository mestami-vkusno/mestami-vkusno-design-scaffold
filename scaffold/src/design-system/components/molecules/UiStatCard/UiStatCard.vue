<script setup lang="ts">
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import UiSurface from '../../atoms/UiSurface/UiSurface.vue'
import type { UiStatCardProps } from './types'

defineProps<UiStatCardProps>()
</script>

<template>
  <UiSurface class="ui-stat-card">
    <span class="ui-stat-card__icon"><UiIcon :name="icon" size="100%" /></span>
    <b class="ui-stat-card__value">{{ value }}</b>
    <span class="ui-stat-card__label">{{ label }}</span>
  </UiSurface>
</template>

<style scoped>
.ui-stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--s-4);
  text-align: center;
}

.ui-stat-card__icon {
  display: grid;
  width: var(--stat-icon-size);
  height: var(--stat-icon-size);
  padding: var(--stat-icon-pad);
  border-radius: 50%;
  background: var(--stat-icon-bg);
  color: var(--accent-fg);
}

.ui-stat-card__value {
  font-size: 26px;
  line-height: 1.1;
  font-weight: 700;
}

.ui-stat-card__label {
  font-size: 13px;
  color: var(--text-2);
}
</style>
