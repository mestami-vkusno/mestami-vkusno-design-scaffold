<script setup lang="ts">
import { computed } from 'vue'
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import { buildPaginationItems } from './buildPaginationItems'
import type { UiPaginationProps } from './types'

const props = withDefaults(defineProps<UiPaginationProps>(), { label: 'Страницы' })

const page = defineModel<number>('page', { required: true })
const items = computed(() => buildPaginationItems(page.value, props.pageCount))
</script>

<template>
  <nav class="ui-pagination" :aria-label="label">
    <button v-if="page > 1" class="ui-pagination__item" type="button" aria-label="Назад" @click="page -= 1">
      <UiIcon name="arrow-l" />
    </button>
    <template v-for="item in items" :key="item.type === 'page' ? item.page : item.key">
      <button
        v-if="item.type === 'page'"
        class="ui-pagination__item"
        :class="{ 'ui-pagination__item--active': item.page === page }"
        type="button"
        :aria-current="item.page === page ? 'page' : undefined"
        @click="page = item.page"
      >
        {{ item.page }}
      </button>
      <span v-else class="ui-pagination__gap" aria-hidden="true">…</span>
    </template>
    <button v-if="page < pageCount" class="ui-pagination__item" type="button" aria-label="Далее" @click="page += 1">
      <UiIcon name="arrow-r" />
    </button>
  </nav>
</template>

<style scoped>
.ui-pagination {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ui-pagination__item {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text-2);
  font: 400 14px var(--font);
  cursor: pointer;
}

.ui-pagination__item:hover {
  background: var(--surface);
}

.ui-pagination__item--active,
.ui-pagination__item--active:hover {
  background: var(--lime);
  border-color: var(--lime);
  color: var(--on-accent);
  font-weight: 600;
}

.ui-pagination__gap {
  font-size: 12.5px;
  color: var(--text-3);
}

@media (pointer: coarse) {
  .ui-pagination__item {
    width: 40px;
    height: 40px;
  }
}
</style>
