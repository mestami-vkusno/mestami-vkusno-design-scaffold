<script setup lang="ts">
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import type { IconName } from '../../../icons'
import type { UiEmptyStateMode, UiEmptyStateProps } from './types'

const DEFAULT_ICON: Record<UiEmptyStateMode, IconName> = { empty: 'list', error: 'alert', offline: 'wifi-off', guest: 'lock' }

withDefaults(defineProps<UiEmptyStateProps>(), { mode: 'empty', headingLevel: 3 })
defineSlots<{
  /** Действия: главное `UiButton`, второстепенное `UiLink`. */
  actions?(): unknown
}>()
</script>

<!-- Пусто ≠ ошибка: у пустого нейтральный тон, у ошибки красный знак и «Повторить». Ошибку скринридер объявляет сразу. -->
<template>
  <section class="ui-empty-state" :class="[`ui-empty-state--${mode}`, { 'ui-empty-state--page': page }]" :role="mode === 'error' ? 'alert' : mode === 'offline' ? 'status' : undefined">
    <span class="ui-empty-state__icon"><UiIcon :name="icon ?? DEFAULT_ICON[mode]" :size="32" /></span>
    <component :is="`h${headingLevel}`" class="ui-empty-state__title">{{ title }}</component>
    <p v-if="description" class="ui-empty-state__description">{{ description }}</p>
    <div v-if="$slots.actions" class="ui-empty-state__actions"><slot name="actions" /></div>
  </section>
</template>

<style scoped>
.ui-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-2);
  max-width: 420px;
  margin-inline: auto;
  padding: var(--s-8) var(--s-4);
  text-align: center;
}

.ui-empty-state--page {
  justify-content: center;
  min-height: min(60dvh, 560px);
}

.ui-empty-state__icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: var(--s-2);
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-3);
}

.ui-empty-state--error .ui-empty-state__icon {
  border-color: color-mix(in srgb, var(--danger) 45%, transparent);
  background: color-mix(in srgb, var(--danger) 12%, var(--surface));
  color: var(--danger);
}

.ui-empty-state--guest .ui-empty-state__icon {
  color: var(--accent-fg);
}

.ui-empty-state__title {
  margin: 0;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 600;
}

.ui-empty-state__description {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-2);
}

.ui-empty-state__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-3);
  width: 100%;
  margin-top: var(--s-4);
}

@media (min-width: 480px) {
  .ui-empty-state__actions {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
