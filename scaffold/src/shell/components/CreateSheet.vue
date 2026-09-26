<script setup lang="ts">
import { UiIcon, UiSheet } from '@/design-system'
import type { CreateAction } from '../types'

defineProps<{ actions: readonly CreateAction[] }>()

const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <UiSheet v-model:open="open" title="Создать">
    <ul class="create-sheet__list">
      <li v-for="action in actions" :key="action.id">
        <a class="create-sheet__item" :href="action.href" @click="open = false">
          <span class="create-sheet__icon"><UiIcon :name="action.icon" :size="22" /></span>
          <span class="create-sheet__text">
            <b class="create-sheet__label">{{ action.label }}</b>
            <span class="create-sheet__description">{{ action.description }}</span>
          </span>
          <UiIcon class="create-sheet__chevron" name="chev-r" :size="18" />
        </a>
      </li>
    </ul>
  </UiSheet>
</template>

<style scoped>
.create-sheet__list {
  display: grid;
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.create-sheet__item {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  min-height: 72px;
  padding: var(--s-3) var(--s-4);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-lg);
  color: var(--text);
  text-decoration: none;
  transition:
    background var(--dur-hover) ease,
    transform var(--dur-press) var(--ease-out);
}

.create-sheet__item:active {
  transform: scale(calc(1 - 0.02 * var(--motion-distance)));
}

.create-sheet__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--lime-soft);
  color: var(--accent-fg);
}

.create-sheet__text {
  display: grid;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.create-sheet__label {
  font-size: 16px;
}

.create-sheet__description {
  color: var(--text-2);
  font-size: 13px;
}

.create-sheet__chevron {
  color: var(--text-3);
}

@media (hover: hover) and (pointer: fine) {
  .create-sheet__item:hover {
    background: var(--surface-2);
  }
}
</style>
