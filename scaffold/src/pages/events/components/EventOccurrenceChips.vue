<script setup lang="ts">
/* Выбор даты проведения, когда у события их несколько (§11.1: от 1 до N `EventOccurrence`). */
import { computed } from 'vue'
import { UiChip } from '@/design-system'
import { formatDateShort, formatTime } from '@/mocks/format'
import type { EventOccurrence } from '@/mocks/types'

const props = defineProps<{ occurrences: readonly EventOccurrence[] }>()
const selected = defineModel<string>({ required: true })

const items = computed(() => props.occurrences.map((occurrence) => ({ occurrence, label: `${formatDateShort(occurrence.startsAt)} · ${formatTime(occurrence.startsAt)}` })))
</script>

<template>
  <div class="event-occurrence-chips" role="group" aria-label="Дата проведения">
    <UiChip v-for="item in items" :key="item.occurrence.id" :selected="selected === item.occurrence.id" @click="selected = item.occurrence.id">
      {{ item.label }}
    </UiChip>
  </div>
</template>

<style scoped>
.event-occurrence-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}
</style>
