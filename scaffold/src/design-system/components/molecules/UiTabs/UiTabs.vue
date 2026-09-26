<script setup lang="ts">
import { useArrowNavigation } from '../../../composables'
import UiBadge from '../../atoms/UiBadge/UiBadge.vue'
import type { UiTabsProps } from './types'

defineProps<UiTabsProps>()

const model = defineModel<string>({ required: true })
const { onKeydown } = useArrowNavigation('[role="tab"]')
</script>

<template>
  <div class="ui-tabs" role="tablist" :aria-label="label" @keydown="onKeydown">
    <button
      v-for="item in items"
      :id="`tab-${item.id}`"
      :key="item.id"
      class="ui-tabs__tab"
      :class="{ 'ui-tabs__tab--active': model === item.id }"
      type="button"
      role="tab"
      :aria-selected="model === item.id"
      :tabindex="model === item.id ? 0 : -1"
      @click="model = item.id"
    >
      {{ item.label }}<UiBadge v-if="item.dot" class="ui-tabs__dot" dot variant="accent" label="Есть непрочитанное" />
    </button>
  </div>
</template>

<style scoped>
.ui-tabs {
  display: flex;
  gap: var(--s-6);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
}

.ui-tabs__tab {
  position: relative;
  padding: 12px 0;
  border: 0;
  background: none;
  color: var(--text-2);
  font: 400 15px var(--font);
  white-space: nowrap;
  cursor: pointer;
}

.ui-tabs__dot {
  margin-inline-start: var(--s-1);
  vertical-align: middle;
}

.ui-tabs__tab:hover {
  color: var(--text);
}

.ui-tabs__tab--active {
  color: var(--accent-fg);
}

.ui-tabs__tab--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  background: var(--lime);
  border-radius: 2px;
}
</style>
