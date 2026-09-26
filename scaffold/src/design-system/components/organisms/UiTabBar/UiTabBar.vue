<script setup lang="ts">
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import type { TabBarItem, UiTabBarProps } from './types'

withDefaults(defineProps<UiTabBarProps>(), { label: 'Основная навигация' })

const active = defineModel<string>({ default: '' })
const emit = defineEmits<{ select: [item: TabBarItem] }>()

function onSelect(item: TabBarItem, event: MouseEvent): void {
  if (!item.href) event.preventDefault()
  if (!item.popup) active.value = item.id
  emit('select', item)
}
</script>

<template>
  <nav class="ui-tab-bar" :style="{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }" :aria-label="label">
    <component
      :is="item.popup ? 'button' : 'a'"
      v-for="item in items"
      :key="item.id"
      class="ui-tab-bar__item"
      :class="{ 'ui-tab-bar__item--active': !item.popup && active === item.id, 'ui-tab-bar__item--popup': item.popup }"
      :type="item.popup ? 'button' : undefined"
      :href="item.popup ? undefined : (item.href ?? '#')"
      :aria-haspopup="item.popup"
      :aria-current="!item.popup && active === item.id ? 'page' : undefined"
      @click="onSelect(item, $event)"
    >
      <UiIcon class="ui-tab-bar__icon" :name="item.icon" :filled="!item.popup && active === item.id" />
      {{ item.label }}
    </component>
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

/* Пункт-действие: кнопка без рамки, знак на лаймовой подложке того же размера, что у активной вкладки. */
.ui-tab-bar__item--popup {
  border: 0;
  background: none;
  font-family: inherit;
  cursor: pointer;
}

.ui-tab-bar__item--popup .ui-tab-bar__icon {
  box-sizing: content-box;
  width: 24px;
  height: 22px;
  padding: 4px 10px;
  border-radius: var(--r-pill);
  background: var(--lime);
  color: var(--on-accent);
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
