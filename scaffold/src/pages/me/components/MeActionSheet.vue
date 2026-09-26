<script setup lang="ts">
import { UiListRow, UiSheet } from '@/design-system'
import type { IconName } from '@/design-system'

/* Меню действий над записью списка («⋯»): строки без шевронов, опасное — цветом `--danger`. Выбор закрывает шторку и сообщает id. */
export interface MeAction {
  id: string
  label: string
  icon?: IconName
  danger?: boolean
  description?: string
}

defineProps<{ title: string; actions: readonly MeAction[] }>()
const emit = defineEmits<{ select: [id: string] }>()
const open = defineModel<boolean>('open', { required: true })

function pick(id: string): void {
  open.value = false
  emit('select', id)
}
</script>

<template>
  <UiSheet v-model:open="open" :title="title">
    <div class="me-actions">
      <UiListRow v-for="action in actions" :key="action.id" :title="action.label" :description="action.description" :icon="action.icon" :danger="action.danger" :chevron="false" @click="pick(action.id)" />
    </div>
  </UiSheet>
</template>

<style scoped>
.me-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-1);
}
</style>
