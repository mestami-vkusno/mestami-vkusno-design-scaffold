<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiButton, UiChip } from '@/design-system'
import { FavoriteButton } from '@/features/actions'
import type { AiAction, AiAssistantMessage } from '@/mocks/types'
import { getMenuItem } from '@/mocks/selectors/menu'
import { getVenue } from '@/mocks/selectors/places'
import { venuesForAction } from '../aiState'
import AiComparison from './AiComparison.vue'
import AiObjectCard from './AiObjectCard.vue'

/*
  Ответ ИИ (§23.5): короткий вывод, карточки с причинами и компромиссами, сравнение, кнопки действий, подсказки.
  Всё, что запускает новую генерацию (сравнение, подсказки), доступно только при `canGenerate`: у бесплатной версии
  и просроченного Премиум старый ответ читается, а новых запросов нет (§23.1, §23.8).
*/
const props = defineProps<{ message: AiAssistantMessage; canGenerate: boolean }>()
const emit = defineEmits<{ ask: [text: string] }>()

const venueIds = computed(() => props.message.cards.filter((card) => card.object.kind === 'venue').map((card) => card.object.id))
const selected = ref<readonly string[]>([])
const canPick = computed(() => props.canGenerate && venueIds.value.length >= 2)
const selectionFull = computed(() => selected.value.length >= 4)
const canCompare = computed(() => selected.value.length >= 2 && selected.value.length <= 4)

function toggle(id: string): void {
  selected.value = selected.value.includes(id) ? selected.value.filter((item) => item !== id) : selected.value.length < 4 ? [...selected.value, id] : selected.value
}

function compareText(ids: readonly string[]): string {
  const names = props.message.cards.filter((card) => ids.includes(card.object.id)).map((card) => nameOf(card.object.id))
  return `Сравни ${names.join(', ')}`
}

// Для запроса нужен текст с названиями заведений: ответ находит их в тексте сам.
function nameOf(id: string): string {
  return getVenue(id)?.name ?? id
}

function compareSelected(): void {
  if (!canCompare.value) return
  emit('ask', compareText(selected.value))
  selected.value = []
}

function compareAction(action: AiAction): void {
  emit('ask', compareText(venuesForAction(action.label, venueIds.value)))
}

function hrefOf(action: AiAction): string | undefined {
  const object = action.object
  if (object === undefined) return undefined
  if (object.kind === 'venue') return `/venue/${object.id}`
  if (object.kind === 'event') return `/event/${object.id}`
  if (object.kind === 'collection') return `/collection/${object.id}`
  const item = getMenuItem(object.id)
  return item === undefined ? undefined : `/venue/${item.venueId}/menu/${item.id}`
}
</script>

<template>
  <div class="ai-answer">
    <p class="ai-answer__summary">{{ message.summary }}</p>

    <ul v-if="message.cards.length > 0" class="ai-answer__cards">
      <AiObjectCard
        v-for="card in message.cards"
        :key="`${card.object.kind}:${card.object.id}`"
        :card="card"
        :selectable="canPick"
        :selected="selected.includes(card.object.id)"
        :selection-full="selectionFull"
        @toggle="toggle"
      />
    </ul>

    <div v-if="canPick" class="ai-answer__compare-bar">
      <UiButton size="sm" variant="outline" icon-left="list" :disabled="!canCompare" @click="compareSelected">Сравнить выбранные{{ selected.length > 0 ? ` (${selected.length})` : '' }}</UiButton>
      <span class="ai-answer__compare-hint">{{ selected.length < 2 ? 'Отметьте от 2 до 4 заведений' : selectionFull ? 'Выбрано максимум: 4' : '' }}</span>
    </div>

    <AiComparison v-if="message.comparison" :comparison="message.comparison" />

    <div v-if="message.actions.length > 0" class="ai-answer__actions">
      <template v-for="action in message.actions" :key="`${action.kind}:${action.label}`">
        <UiButton v-if="action.kind === 'open' && hrefOf(action)" size="sm" variant="outline" icon-right="arrow-r" :href="hrefOf(action)">{{ action.label }}</UiButton>
        <UiButton v-else-if="action.kind === 'compare' && canGenerate" size="sm" variant="outline" icon-left="list" @click="compareAction(action)">{{ action.label }}</UiButton>
        <FavoriteButton v-else-if="action.kind === 'add_to_favorites' && action.object?.kind === 'venue'" :venue-id="action.object.id" :subject="action.label" variant="button" size="sm" :origin="{ sourceSurface: 'ai' }" />
        <UiButton v-else-if="action.kind === 'save_collection_draft'" size="sm" variant="outline" icon-left="plus" href="/create/collection">{{ action.label }}</UiButton>
      </template>
    </div>

    <div v-if="canGenerate && message.followUps.length > 0" class="ai-answer__follow" role="group" aria-label="Уточнить запрос">
      <UiChip v-for="text in message.followUps" :key="text" size="sm" @click="emit('ask', text)">{{ text }}</UiChip>
    </div>
  </div>
</template>

<style scoped>
.ai-answer {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
  min-width: 0;
}

.ai-answer__summary {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.45;
}

.ai-answer__cards {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-5);
  margin: 0;
  padding: 0;
}

.ai-answer__compare-bar,
.ai-answer__actions,
.ai-answer__follow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2);
}

.ai-answer__compare-hint {
  font-size: 13px;
  color: var(--text-3);
}
</style>
