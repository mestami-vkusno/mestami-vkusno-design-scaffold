<script setup lang="ts">
import { UiTabBar, type TabBarItem } from '@/design-system'

defineProps<{
  items: readonly TabBarItem[]
  /** Id подсвеченной вкладки; у страниц вне вкладок пусто. */
  active?: string
}>()

const emit = defineEmits<{
  /** Нажат пункт-действие («Создать»). */
  popup: [item: TabBarItem]
  /** Нажата уже активная вкладка: страница возвращается к началу. */
  reselect: [item: TabBarItem]
}>()

function onSelect(item: TabBarItem, active: string | undefined): void {
  if (item.popup) emit('popup', item)
  else if (item.id === active) emit('reselect', item)
}

// Подсветкой управляет маршрут, а не нажатие: слушатель без действия делает модель управляемой.
function followRoute(): void {}
</script>

<template>
  <div class="product-tab-bar">
    <UiTabBar class="product-tab-bar__bar" :items="items" :model-value="active ?? ''" label="Основная навигация" @update:model-value="followRoute" @select="onSelect($event, active)" />
  </div>
</template>

<style scoped>
/* Плавающая панель поверх страницы, вне блока, который анимируется при переходе. */
.product-tab-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  padding: 0 max(var(--s-2), env(safe-area-inset-right)) max(var(--s-2), env(safe-area-inset-bottom)) max(var(--s-2), env(safe-area-inset-left));
  pointer-events: none;
}

.product-tab-bar__bar {
  width: min(100%, 480px);
  pointer-events: auto;
}

@media (min-width: 900px) {
  .product-tab-bar {
    display: none;
  }
}
</style>
