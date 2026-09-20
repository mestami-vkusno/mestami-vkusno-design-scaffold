<script setup lang="ts">
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import type { NavItem } from '../../../types'
import type { UiSideMenuProps } from './types'

withDefaults(defineProps<UiSideMenuProps>(), { secondaryItems: () => [], label: 'Меню кабинета' })

const active = defineModel<string>({ default: '' })
const emit = defineEmits<{ select: [item: NavItem] }>()

function onSelect(item: NavItem, event: MouseEvent): void {
  if (!item.href) event.preventDefault()
  active.value = item.id
  emit('select', item)
}
</script>

<template>
  <nav class="ui-side-menu" :aria-label="label">
    <a
      v-for="item in items"
      :key="item.id"
      class="ui-side-menu__item"
      :class="{ 'ui-side-menu__item--active': active === item.id }"
      :href="item.href ?? '#'"
      :aria-current="active === item.id ? 'page' : undefined"
      @click="onSelect(item, $event)"
    >
      <UiIcon v-if="item.icon" :name="item.icon" />
      {{ item.label }}
    </a>
    <a
      v-for="(item, index) in secondaryItems"
      :key="item.id"
      class="ui-side-menu__item ui-side-menu__item--secondary"
      :class="{ 'ui-side-menu__item--gap': index === 0 }"
      :href="item.href ?? '#'"
      @click="onSelect(item, $event)"
    >
      <UiIcon v-if="item.icon" :name="item.icon" />
      {{ item.label }}
    </a>
  </nav>
</template>

<style scoped>
.ui-side-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 240px;
  padding: var(--s-4);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
}

.ui-side-menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: var(--r-md);
  color: var(--text);
  font-size: 15px;
  text-decoration: none;
}

.ui-side-menu__item:hover {
  background: var(--surface);
}

.ui-side-menu__item--active,
.ui-side-menu__item--active:hover {
  background: var(--lime);
  color: var(--on-accent);
  font-weight: 600;
}

.ui-side-menu__item--secondary {
  color: var(--text-2);
}

.ui-side-menu__item--gap {
  margin-top: 8px;
}

@media (max-width: 720px) {
  .ui-side-menu {
    width: 100%;
  }
}

@media (pointer: coarse) {
  .ui-side-menu__item {
    padding-top: 12px;
    padding-bottom: 12px;
  }
}
</style>
