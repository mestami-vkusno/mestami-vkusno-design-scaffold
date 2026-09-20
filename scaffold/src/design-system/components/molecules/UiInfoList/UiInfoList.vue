<script setup lang="ts">
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import UiSurface from '../../atoms/UiSurface/UiSurface.vue'
import type { UiInfoListProps } from './types'

defineProps<UiInfoListProps>()
</script>

<template>
  <UiSurface variant="panel">
    <ul class="ui-info-list">
      <li v-for="item in items" :key="item.title" class="ui-info-list__item">
        <UiIcon :name="item.icon" class="ui-info-list__icon" />
        <div>
          {{ item.title }}
          <small v-if="item.subtitle" class="ui-info-list__subtitle">{{ item.subtitle }}</small>
        </div>
      </li>
    </ul>
  </UiSurface>
</template>

<style scoped>
.ui-info-list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-info-list__item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 0;
  border-top: 1px solid var(--border);
  font-size: 14px;
}

.ui-info-list__item:first-child {
  padding-top: 0;
  border-top: 0;
}

.ui-info-list__icon {
  margin-top: 1px;
  color: var(--text-2);
}

.ui-info-list__subtitle {
  display: block;
  color: var(--text-3);
  font-size: 12.5px;
}
</style>
