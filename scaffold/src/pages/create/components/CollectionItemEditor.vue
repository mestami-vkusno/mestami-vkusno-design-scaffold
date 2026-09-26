<script setup lang="ts">
/*
  Строка подборки в редакторе (CR2, §17.1): заведение, «Выше»/«Ниже» и «Убрать», заметка автора и необязательный контекст —
  блюдо и событие. `flash` подсвечивает строку рамкой, когда то же заведение пытались добавить второй раз.
*/
import { computed } from 'vue'
import { UiChip, UiCluster, UiIconButton, UiSurface, UiTextarea } from '@/design-system'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { getEvent } from '@/mocks/selectors/events'
import { getMenuItem } from '@/mocks/selectors/menu'
import { getVenue, venueLocationLabel } from '@/mocks/selectors/places'
import type { CollectionItem } from '@/mocks/types'
import { MAX_ITEM_NOTE } from '../useCollectionEditor'

const props = defineProps<{ item: CollectionItem; index: number; count: number; flash?: boolean }>()
const emit = defineEmits<{
  move: [delta: -1 | 1]
  remove: []
  note: [text: string]
  'pick-dish': []
  'pick-event': []
  'clear-dish': []
  'clear-event': []
}>()

const venue = computed(() => getVenue(props.item.venueId))
const dish = computed(() => (props.item.menuItemId === undefined ? undefined : getMenuItem(props.item.menuItemId)))
const event = computed(() => (props.item.eventId === undefined ? undefined : getEvent(props.item.eventId)))
</script>

<template>
  <UiSurface v-if="venue" as="div" variant="panel" class="item" :class="{ 'item--flash': flash }">
    <div class="item__head">
      <span class="item__index" aria-hidden="true">{{ index + 1 }}</span>
      <span class="item__thumb"><UiPhotoPlaceholder v-if="venue.gallery[0]" :photo="venue.gallery[0]" ratio="fill" decorative /></span>
      <span class="item__text">
        <b class="item__name">{{ venue.name }}</b>
        <span class="item__meta">{{ venueLocationLabel(venue) }}</span>
      </span>
      <span class="item__buttons">
        <UiIconButton icon="chev-u" variant="plain" size="sm" :label="`Выше: ${venue.name}`" :disabled="index === 0" @click="emit('move', -1)" />
        <UiIconButton icon="chev-d" variant="plain" size="sm" :label="`Ниже: ${venue.name}`" :disabled="index === count - 1" @click="emit('move', 1)" />
        <UiIconButton icon="close" variant="plain" size="sm" :label="`Убрать из подборки: ${venue.name}`" @click="emit('remove')" />
      </span>
    </div>

    <UiTextarea
      :model-value="item.note ?? ''"
      :aria-label="`Заметка автора: ${venue.name}`"
      placeholder="Заметка автора (необязательно)"
      :max-length="MAX_ITEM_NOTE"
      :rows="2"
      :max-rows="6"
      @update:model-value="emit('note', $event)"
    />

    <UiCluster :gap="2">
      <UiChip v-if="dish" variant="tag" size="sm" removable :remove-label="`Убрать блюдо: ${dish.name}`" @remove="emit('clear-dish')">Блюдо: {{ dish.name }}</UiChip>
      <UiChip v-else size="sm" @click="emit('pick-dish')">Блюдо</UiChip>
      <UiChip v-if="event" variant="tag" size="sm" removable :remove-label="`Убрать событие: ${event.title}`" @remove="emit('clear-event')">Событие: {{ event.title }}</UiChip>
      <UiChip v-else size="sm" @click="emit('pick-event')">Событие</UiChip>
    </UiCluster>
  </UiSurface>
</template>

<style scoped>
.item {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  border: 1px solid var(--border);
  transition: border-color var(--dur-hover) ease;
}

.item--flash {
  border-color: var(--lime-line);
}

.item__head {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  min-width: 0;
}

.item__index {
  flex: none;
  width: 20px;
  color: var(--text-3);
  font-size: 13px;
  text-align: center;
}

.item__thumb {
  position: relative;
  flex: none;
  width: 48px;
  height: 48px;
  overflow: hidden;
  border-radius: var(--r-md);
}

.item__text {
  display: grid;
  flex: 1;
  gap: 2px;
  min-width: 0;
}

.item__name,
.item__meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item__name {
  font-size: 15px;
}

.item__meta {
  color: var(--text-2);
  font-size: 13px;
}

.item__buttons {
  display: flex;
  flex: none;
  align-items: center;
}
</style>
