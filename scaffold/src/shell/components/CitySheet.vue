<script setup lang="ts">
import { UiIcon, UiSheet } from '@/design-system'
import type { City, CityId } from '../types'

defineProps<{
  cities: readonly City[]
  activeId: CityId
}>()

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ select: [id: CityId] }>()

function pick(id: CityId): void {
  emit('select', id)
  open.value = false
}
</script>

<template>
  <UiSheet v-model:open="open" title="Выберите город">
    <ul class="city-sheet__list">
      <li v-for="city in cities" :key="city.id">
        <button class="city-sheet__item" type="button" :aria-current="city.id === activeId ? 'true' : undefined" @click="pick(city.id)">
          {{ city.name }}
          <UiIcon v-if="city.id === activeId" class="city-sheet__check" name="check" />
        </button>
      </li>
    </ul>
  </UiSheet>
</template>

<style scoped>
.city-sheet__list {
  display: grid;
  gap: var(--s-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.city-sheet__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 52px;
  padding: 0 var(--s-4);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  background: none;
  color: var(--text);
  font: 500 16px var(--font);
  text-align: left;
  cursor: pointer;
  transition:
    background var(--dur-hover) ease,
    transform var(--dur-press) var(--ease-out);
}

.city-sheet__item:active {
  transform: scale(calc(1 - 0.02 * var(--motion-distance)));
}

.city-sheet__item[aria-current='true'] {
  border-color: var(--lime-line);
  background: var(--lime-soft);
  font-weight: 600;
}

.city-sheet__check {
  color: var(--accent-fg);
}

@media (hover: hover) and (pointer: fine) {
  .city-sheet__item:hover {
    background: var(--surface-2);
  }
}
</style>
