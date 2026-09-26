<script setup lang="ts">
import { computed } from 'vue'
import { UiCheckbox } from '@/design-system'
import { CollectionCard, DishRow, EventRow, VenueRow } from '@/features'
import type { AiObjectCard } from '@/mocks/types'
import { resolveAiObject } from '@/mocks/selectors/activity'
import { collectionByline } from '@/mocks/selectors/collections'
import { getVenue, venueLocationLabel } from '@/mocks/selectors/places'
import { NOT_IN_DATA } from '../copy'

/*
  Карточка объекта в ответе ИИ (§23.5): сам объект теми же блоками, что и в каталоге, затем «почему подходит»
  и «компромиссы». Факты только из существующих данных: объект, которого больше нет, не выдумывается (§23.4).
*/
const props = defineProps<{
  card: AiObjectCard
  /** Показывать флажок «Сравнить»: только у заведений и только пока можно запускать ИИ. */
  selectable?: boolean
  selected?: boolean
  /** Уже выбрано четыре заведения: остальные нельзя отметить. */
  selectionFull?: boolean
}>()

const emit = defineEmits<{ toggle: [venueId: string] }>()

const resolved = computed(() => resolveAiObject(props.card.object))
const venueName = computed(() => (resolved.value?.kind === 'venue' ? resolved.value.venue.name : ''))
const model = computed({
  get: () => props.selected === true,
  set: () => emit('toggle', props.card.object.id),
})
</script>

<template>
  <li class="ai-card">
    <template v-if="resolved">
      <VenueRow v-if="resolved.kind === 'venue'" :venue="resolved.venue" :location="venueLocationLabel(resolved.venue)" :heading-level="3" />
      <EventRow v-else-if="resolved.kind === 'event'" :event="resolved.event" :venue-name="getVenue(resolved.event.venueId)?.name" :location="getVenue(resolved.event.venueId) ? venueLocationLabel(getVenue(resolved.event.venueId)!) : undefined" :heading-level="3" />
      <DishRow v-else-if="resolved.kind === 'menu_item'" :item="resolved.item" :href="`/venue/${resolved.item.venueId}/menu/${resolved.item.id}`" :venue-name="resolved.venue?.name" :heading-level="3" />
      <CollectionCard v-else :collection="resolved.collection" :byline="collectionByline(resolved.collection)" layout="row" as="div" :heading-level="3" />
    </template>
    <p v-else class="ai-card__gone">Объект больше недоступен. {{ NOT_IN_DATA }}.</p>

    <div v-if="card.reasons.length > 0 || card.tradeoffs.length > 0" class="ai-card__notes">
      <div v-if="card.reasons.length > 0">
        <h4 class="ai-card__label">Почему подходит</h4>
        <ul class="ai-card__list">
          <li v-for="reason in card.reasons" :key="reason">{{ reason }}</li>
        </ul>
      </div>
      <div v-if="card.tradeoffs.length > 0">
        <h4 class="ai-card__label">Компромиссы</h4>
        <ul class="ai-card__list ai-card__list--tradeoffs">
          <li v-for="tradeoff in card.tradeoffs" :key="tradeoff">{{ tradeoff }}</li>
        </ul>
      </div>
    </div>

    <UiCheckbox v-if="selectable && resolved?.kind === 'venue'" v-model="model" class="ai-card__compare" :disabled="selectionFull && !selected">
      Сравнить<span class="fx-sr-only"> {{ venueName }}</span>
    </UiCheckbox>
  </li>
</template>

<style scoped>
.ai-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  min-width: 0;
  list-style: none;
}

.ai-card__gone {
  margin: 0;
  padding: var(--s-4);
  border: 1px dashed var(--border-strong);
  border-radius: var(--r-md);
  font-size: 14px;
  color: var(--text-3);
}

.ai-card__notes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: var(--s-3);
  padding-inline: var(--s-2);
}

.ai-card__label {
  margin: 0 0 var(--s-1);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--text-3);
}

.ai-card__list {
  display: grid;
  gap: var(--s-1);
  margin: 0;
  padding-left: var(--s-4);
  font-size: 14px;
  line-height: 1.45;
  color: var(--text-2);
}

.ai-card__list--tradeoffs::marker {
  color: var(--warning);
}

.ai-card__compare {
  padding-inline: var(--s-2);
}
</style>
