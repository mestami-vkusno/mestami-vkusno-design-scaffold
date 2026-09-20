<script setup lang="ts">
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import UiLogo from '../../atoms/UiLogo/UiLogo.vue'
import type { NavItem } from '../../../types'
import type { UiAppHeaderProps } from './types'

withDefaults(defineProps<UiAppHeaderProps>(), { homeHref: '/', label: 'Основная навигация' })
defineSlots<{ /** Кнопки справа: избранное, вход, регистрация. */ actions?(): unknown }>()

const active = defineModel<string>({ default: '' })
const emit = defineEmits<{ 'city-click': []; select: [item: NavItem] }>()

function onSelect(item: NavItem, event: MouseEvent): void {
  if (!item.href) event.preventDefault()
  active.value = item.id
  emit('select', item)
}
</script>

<template>
  <header class="ui-app-header">
    <UiLogo :href="homeHref" />
    <button v-if="city" class="ui-app-header__city" type="button" @click="emit('city-click')">
      <UiIcon name="pin" :size="16" />
      {{ city }}
      <UiIcon name="chev-d" :size="14" />
    </button>
    <nav class="ui-app-header__nav" :aria-label="label">
      <a
        v-for="item in items"
        :key="item.id"
        class="ui-app-header__link"
        :class="{ 'ui-app-header__link--active': active === item.id }"
        :href="item.href ?? '#'"
        :aria-current="active === item.id ? 'page' : undefined"
        @click="onSelect(item, $event)"
      >
        {{ item.label }}
      </a>
    </nav>
    <div v-if="$slots.actions" class="ui-app-header__actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped>
.ui-app-header {
  display: flex;
  align-items: center;
  gap: var(--s-6);
  height: 64px;
  padding: 0 var(--s-6);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow-x: auto;
}

.ui-app-header > :deep(.ui-logo) {
  flex: none;
}

.ui-app-header__city {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--text-2);
  font: 400 14px var(--font);
  white-space: nowrap;
  cursor: pointer;
}

.ui-app-header__nav {
  display: flex;
  gap: var(--s-6);
  margin: 0 auto;
}

.ui-app-header__link {
  position: relative;
  padding: 21px 0;
  color: var(--text);
  font-size: 15px;
  text-decoration: none;
  white-space: nowrap;
}

.ui-app-header__link--active {
  color: var(--accent-fg);
}

.ui-app-header__link--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: var(--lime);
  border-radius: 2px;
}

.ui-app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--s-3);
}

@media (max-width: 720px) {
  .ui-app-header {
    gap: var(--s-4);
    padding: 0 var(--s-4);
  }
}
</style>
