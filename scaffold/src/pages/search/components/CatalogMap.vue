<script setup lang="ts">
import { computed } from 'vue'
import { UiButton, UiIcon, UiText } from '@/design-system'
import { RatingLabel, PriceLabel } from '@/features'
import { CUISINE_LABEL } from '@/mocks/dictionaries'
import { venueLocationLabel } from '@/mocks/selectors/places'
import type { Venue } from '@/mocks/types'

/*
  Заглушка карты (§8.6): своих тайлов нет — стилизованное поле из токенов дизайн-системы с метками и кластерами.
  Позиция метки — детерминированный псевдо-хэш от `id` (одна и та же точка при каждой перерисовке), а не
  реальные координаты: у мока нет геослоя, только фиксированное поле `distanceKm`. Список рядом всегда есть
  (`SearchPage` рисует его сам), сбой карты сюда не приходит — карта не может «упасть» отдельно от списка.
*/
const props = defineProps<{
  venues: readonly Venue[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [id: string | null]
  'search-area': []
}>()

interface Point {
  readonly venue: Venue
  readonly x: number
  readonly y: number
  readonly cell: string
}

// Хэш строки в [0, 1): стабильно раскладывает заведения по полю без реальной геометрии.
function hash01(value: string, salt: number): number {
  let h = salt
  for (let i = 0; i < value.length; i += 1) h = (Math.imul(h, 31) + value.charCodeAt(i)) | 0
  return ((h >>> 0) % 10000) / 10000
}

const GRID = 5

const points = computed<readonly Point[]>(() =>
  props.venues.map((venue) => {
    const x = 8 + hash01(venue.id, 17) * 84
    const y = 10 + hash01(venue.id, 53) * 78
    const cell = `${Math.floor(x / (100 / GRID))}-${Math.floor(y / (100 / GRID))}`
    return { venue, x, y, cell }
  }),
)

const clusters = computed(() => {
  const byCell = new Map<string, Point[]>()
  for (const point of points.value) {
    const list = byCell.get(point.cell) ?? []
    list.push(point)
    byCell.set(point.cell, list)
  }
  return byCell
})

const selected = computed(() => props.venues.find((venue) => venue.id === props.selectedId) ?? null)

function clusterFor(point: Point): readonly Point[] | undefined {
  const cell = clusters.value.get(point.cell)
  return cell !== undefined && cell.length > 1 ? cell : undefined
}

function isClusterAnchor(point: Point): boolean {
  const cell = clusters.value.get(point.cell)
  return cell !== undefined && cell.length > 1 && cell[0]?.venue.id === point.venue.id
}

function pickCluster(cell: readonly Point[]): void {
  // Мок без зума: клик по кластеру выбирает первое заведение в нём, остальные видно в списке рядом.
  emit('select', cell[0]?.venue.id ?? null)
}
</script>

<template>
  <div class="catalog-map">
    <div class="catalog-map__field" role="group" aria-label="Карта заведений (заглушка)">
      <template v-for="point in points" :key="point.venue.id">
        <button
          v-if="isClusterAnchor(point)"
          class="catalog-map__cluster"
          type="button"
          :style="{ left: `${point.x}%`, top: `${point.y}%` }"
          :aria-label="`Группа заведений: ${clusterFor(point)?.length ?? 0}`"
          @click="pickCluster(clusterFor(point) ?? [point])"
        >
          {{ clusterFor(point)?.length }}
        </button>
        <button
          v-else-if="clusterFor(point) === undefined"
          class="catalog-map__pin"
          type="button"
          :class="{ 'catalog-map__pin--selected': point.venue.id === selectedId }"
          :style="{ left: `${point.x}%`, top: `${point.y}%` }"
          :aria-label="`${point.venue.name}, показать на карте`"
          :aria-pressed="point.venue.id === selectedId"
          @click="emit('select', point.venue.id === selectedId ? null : point.venue.id)"
        >
          <UiIcon :name="point.venue.id === selectedId ? 'star' : 'pin'" :size="16" :filled="point.venue.id === selectedId" />
        </button>
      </template>
    </div>

    <UiButton class="catalog-map__search-area" variant="neutral" size="sm" icon-left="refresh" @click="emit('search-area')">Искать в этой области</UiButton>

    <div v-if="selected" class="catalog-map__preview">
      <button class="catalog-map__preview-close" type="button" aria-label="Закрыть превью" @click="emit('select', null)"><UiIcon name="close" :size="16" /></button>
      <a class="catalog-map__preview-link" :href="`/venue/${selected.id}`">
        <UiText variant="body" class="catalog-map__preview-title">{{ selected.name }}</UiText>
      </a>
      <p class="catalog-map__preview-meta">{{ [selected.cuisines.slice(0, 1).map((id) => CUISINE_LABEL[id]).join(''), venueLocationLabel(selected)].filter(Boolean).join(' · ') }}</p>
      <div class="catalog-map__preview-facts">
        <RatingLabel :rating="selected.rating" />
        <PriceLabel v-if="selected.averageCheckRub !== null" kind="check" :amount-rub="selected.averageCheckRub" />
      </div>
      <UiButton size="sm" variant="outline" :href="`/venue/${selected.id}`">Открыть заведение</UiButton>
    </div>
  </div>
</template>

<style scoped>
.catalog-map {
  position: relative;
  overflow: hidden;
  min-height: 360px;
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  background: var(--surface);
}

.catalog-map__field {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 40px 40px;
  background-color: var(--surface-2);
}

.catalog-map__pin,
.catalog-map__cluster {
  position: absolute;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  translate: -50% -50%;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-pill);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: transform var(--dur-press) var(--ease-out), border-color var(--dur-hover) ease;
}

.catalog-map__pin:active,
.catalog-map__cluster:active {
  transform: translate(-50%, -50%) scale(calc(1 - 0.06 * var(--motion-distance)));
}

.catalog-map__pin--selected {
  border-color: var(--accent-fg);
  background: var(--lime);
  color: var(--on-accent);
}

.catalog-map__cluster {
  min-width: 32px;
  padding: 0 var(--s-2);
  font: 700 13px var(--font);
  background: var(--inverse-bg);
  color: var(--inverse-text);
  border-color: transparent;
}

@media (hover: hover) and (pointer: fine) {
  .catalog-map__pin:hover,
  .catalog-map__cluster:hover {
    border-color: var(--border-hover);
  }
}

.catalog-map__search-area {
  position: absolute;
  top: var(--s-3);
  left: 50%;
  translate: -50% 0;
  box-shadow: var(--shadow-float);
}

.catalog-map__preview {
  position: absolute;
  right: var(--s-3);
  bottom: var(--s-3);
  left: var(--s-3);
  display: grid;
  gap: var(--s-1);
  padding: var(--s-4);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-lg);
  background: var(--surface);
  box-shadow: var(--shadow-float);
}

.catalog-map__preview-close {
  position: absolute;
  top: var(--s-2);
  right: var(--s-2);
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--overlay-btn-bg);
  color: var(--text);
  cursor: pointer;
}

.catalog-map__preview-title {
  font-weight: 600;
}

.catalog-map__preview-link {
  padding-right: var(--s-8);
  color: inherit;
  text-decoration: none;
}

.catalog-map__preview-meta {
  margin: 0;
  font-size: 13px;
  color: var(--text-3);
}

.catalog-map__preview-facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3);
}

@media (min-width: 480px) {
  .catalog-map__preview {
    left: auto;
    width: 280px;
  }
}

@media (min-width: 900px) {
  .catalog-map {
    min-height: 520px;
  }
}
</style>
