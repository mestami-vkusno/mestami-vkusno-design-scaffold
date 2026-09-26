<script setup lang="ts">
/* Фильтры Афиши, которым не хватает места в верхней строке (§11.2): местоположение, стоимость, статус. */
import { reactive, watch } from 'vue'
import { UiButton, UiCheckbox, UiCluster, UiField, UiSelect, UiSheet, UiStack, UiText } from '@/design-system'
import { EVENT_PRICE_KIND_LABEL, EVENT_STATUS_LABEL } from '@/mocks/dictionaries'
import type { District, EventPriceKind, EventStatus } from '@/mocks/types'
import { EVENT_PRICE_KINDS, EVENT_STATUSES } from '../eventHelpers'

const props = defineProps<{
  districts: readonly District[]
  locationId: string
  priceKinds: readonly EventPriceKind[]
  statuses: readonly EventStatus[]
}>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ apply: [value: { locationId: string; priceKinds: EventPriceKind[]; statuses: EventStatus[] }] }>()

const draft = reactive({
  locationId: props.locationId,
  priceKinds: new Set<EventPriceKind>(props.priceKinds),
  statuses: new Set<EventStatus>(props.statuses),
})

watch(open, (isOpen) => {
  if (!isOpen) return
  draft.locationId = props.locationId
  draft.priceKinds = new Set(props.priceKinds)
  draft.statuses = new Set(props.statuses)
})

function togglePrice(kind: EventPriceKind, on: boolean): void {
  if (on) draft.priceKinds.add(kind)
  else draft.priceKinds.delete(kind)
}

function toggleStatus(status: EventStatus, on: boolean): void {
  if (on) draft.statuses.add(status)
  else draft.statuses.delete(status)
}

function apply(): void {
  emit('apply', { locationId: draft.locationId, priceKinds: [...draft.priceKinds], statuses: [...draft.statuses] })
  open.value = false
}

function resetAll(): void {
  draft.locationId = ''
  draft.priceKinds.clear()
  draft.statuses.clear()
}
</script>

<template>
  <UiSheet v-model:open="open" title="Фильтры">
    <UiStack :gap="6">
      <UiField label="Местоположение">
        <template #default="{ id }">
          <UiSelect :id="id" v-model="draft.locationId" placeholder="Все районы" :options="districts.map((d) => ({ value: d.id, label: d.name }))" />
        </template>
      </UiField>
      <fieldset class="events-filters-sheet__group">
        <UiText as="legend" variant="body">Стоимость</UiText>
        <UiCheckbox
          v-for="kind in EVENT_PRICE_KINDS"
          :key="kind"
          :model-value="draft.priceKinds.has(kind)"
          @update:model-value="(on) => togglePrice(kind, on)"
        >
          {{ EVENT_PRICE_KIND_LABEL[kind] }}
        </UiCheckbox>
      </fieldset>
      <fieldset class="events-filters-sheet__group">
        <UiText as="legend" variant="body">Статус</UiText>
        <UiCheckbox
          v-for="status in EVENT_STATUSES"
          :key="status"
          :model-value="draft.statuses.has(status)"
          @update:model-value="(on) => toggleStatus(status, on)"
        >
          {{ EVENT_STATUS_LABEL[status] }}
        </UiCheckbox>
      </fieldset>
      <UiCluster justify="between">
        <UiButton variant="outline" @click="resetAll">Сбросить</UiButton>
        <UiButton @click="apply">Показать</UiButton>
      </UiCluster>
    </UiStack>
  </UiSheet>
</template>

<style scoped>
.events-filters-sheet__group {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  margin: 0;
  padding: 0;
  border: 0;
}

.events-filters-sheet__group :deep(legend) {
  margin-bottom: var(--s-1);
  color: var(--text-2);
}
</style>
