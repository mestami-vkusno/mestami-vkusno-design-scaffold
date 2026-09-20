<script setup lang="ts">
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import type { TabBarItem, UiTabBarProps } from './types'

withDefaults(defineProps<UiTabBarProps>(), { label: 'Основная навигация' })

const active = defineModel<string>({ default: '' })
const emit = defineEmits<{ select: [item: TabBarItem] }>()

function onSelect(item: TabBarItem, event: MouseEvent): void {
  if (!item.href) event.preventDefault()
  active.value = item.id
  emit('select', item)
}
</script>

<template>
  <nav class="ui-tab-bar" :style="{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }" :aria-label="label">
    <a
      v-for="item in items"
      :key="item.id"
      class="ui-tab-bar__item"
      :class="{ 'ui-tab-bar__item--active': active === item.id }"
      :href="item.href ?? '#'"
      :aria-current="active === item.id ? 'page' : undefined"
      @click="onSelect(item, $event)"
    >
      <UiIcon class="ui-tab-bar__icon" :name="item.icon" :filled="active === item.id" />
      {{ item.label }}
    </a>
  </nav>
</template>

<style scoped>
.ui-tab-bar {
  display: grid;
  padding: 8px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-xl);
}

.ui-tab-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 0;
  border-radius: var(--r-md);
  color: var(--text-2);
  font-size: 11px;
  text-decoration: none;
}

.ui-tab-bar__item--active {
  color: var(--accent-fg);
  font-weight: 600;
}

.ui-tab-bar__item--active .ui-tab-bar__icon {
  box-sizing: content-box;
  width: 24px;
  height: 22px;
  padding: 4px 10px;
  border-radius: var(--r-pill);
  background: var(--tab-active-bg);
}
</style>
