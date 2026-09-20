<script setup lang="ts">
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import type { UiBreadcrumbsProps } from './types'

withDefaults(defineProps<UiBreadcrumbsProps>(), { label: 'Навигационная цепочка' })
</script>

<template>
  <nav :aria-label="label">
    <ol class="ui-breadcrumbs">
      <li v-for="(item, index) in items" :key="index" class="ui-breadcrumbs__item">
        <UiIcon v-if="index > 0" name="chev-r" :size="14" />
        <a v-if="item.href && index < items.length - 1" class="ui-breadcrumbs__link" :href="item.href">{{ item.label }}</a>
        <b v-else class="ui-breadcrumbs__current" :aria-current="index === items.length - 1 ? 'page' : undefined">{{ item.label }}</b>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.ui-breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  color: var(--text-3);
}

.ui-breadcrumbs__item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ui-breadcrumbs__link {
  color: inherit;
}

.ui-breadcrumbs__link:hover {
  color: var(--text);
}

.ui-breadcrumbs__current {
  color: var(--text-2);
  font-weight: 500;
}
</style>
