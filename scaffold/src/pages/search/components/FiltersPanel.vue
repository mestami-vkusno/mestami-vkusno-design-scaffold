<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiButton, UiChip, UiCheckbox, UiSegmented, UiStack, UiSwitch, UiText } from '@/design-system'
import { CUISINE_LABEL, VENUE_TAG_LABEL } from '@/mocks/dictionaries'
import { areasByCity, districtsByCity, metroByCity } from '@/mocks/selectors/places'
import type { CityId, CuisineId, VenueTag } from '@/mocks/types'
import type { GeoScope, PriceTier, SearchState } from '../searchState'
import { PRICE_TIERS } from '../searchState'

/*
  Группы фильтров Поиска (O4, §8.5): используется и в шторке (мобильная), и как левая колонка каталога (десктоп).
  Сама панель не решает, где она отрисована, и не хранит состояние — снимок приходит из `SearchPage`.
  «Тип заведения» здесь не повторяется: он уже выбирается чипами категорий над списком (одна активная, как в
  `catalog.png`) — второй контрол для того же поля был бы избыточен в моке (assumption).
*/
const props = defineProps<{
  cityId: CityId
  cuisines: readonly CuisineId[]
  geoScope: GeoScope
  geoIds: readonly string[]
  price: PriceTier | null
  openNow: boolean
  tags: readonly VenueTag[]
}>()

const emit = defineEmits<{
  change: [patch: Partial<SearchState>]
}>()

const CUISINE_IDS = Object.keys(CUISINE_LABEL) as CuisineId[]
const TAG_IDS = Object.keys(VENUE_TAG_LABEL) as VenueTag[]
const GEO_ITEMS = [
  { id: 'district', label: 'Район' },
  { id: 'area', label: 'Местность' },
  { id: 'metro', label: 'Метро' },
]

const cuisinesExpanded = ref(false)
const visibleCuisines = computed(() => (cuisinesExpanded.value ? CUISINE_IDS : CUISINE_IDS.slice(0, 8)))

const geoOptions = computed(() => {
  if (props.geoScope === 'area') return areasByCity(props.cityId).map((area) => ({ id: area.id, label: area.name }))
  if (props.geoScope === 'metro') return metroByCity(props.cityId).map((station) => ({ id: station.id, label: station.name }))
  return districtsByCity(props.cityId).map((district) => ({ id: district.id, label: district.name }))
})

function toggle<T>(list: readonly T[], value: T): readonly T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function toggleCuisine(id: CuisineId): void {
  emit('change', { cuisines: toggle(props.cuisines, id) })
}

function toggleGeoId(id: string): void {
  emit('change', { geoIds: toggle(props.geoIds, id) })
}

function setGeoScope(scope: string): void {
  // Смена области очищает выбор: район, местность и метро — три разных списка (О4).
  emit('change', { geoScope: scope as GeoScope, geoIds: [] })
}

function togglePrice(tier: PriceTier): void {
  emit('change', { price: props.price === tier ? null : tier })
}

function toggleTag(tag: VenueTag, checked: boolean): void {
  emit('change', { tags: checked ? [...props.tags, tag] : props.tags.filter((item) => item !== tag) })
}
</script>

<template>
  <UiStack :gap="6" class="filters-panel">
    <section class="filters-panel__group" aria-labelledby="filters-cuisine">
      <UiText id="filters-cuisine" as="h3" variant="body">Кухня</UiText>
      <div class="filters-panel__chips">
        <UiChip v-for="id in visibleCuisines" :key="id" size="sm" :selected="cuisines.includes(id)" @click="toggleCuisine(id)">{{ CUISINE_LABEL[id] }}</UiChip>
        <UiButton v-if="!cuisinesExpanded" variant="ghost" size="sm" @click="cuisinesExpanded = true">Все кухни</UiButton>
      </div>
    </section>

    <section class="filters-panel__group" aria-labelledby="filters-geo">
      <UiText id="filters-geo" as="h3" variant="body">Расположение</UiText>
      <UiSegmented :items="GEO_ITEMS" label="Расположение: район, местность или метро" :model-value="geoScope" @update:model-value="setGeoScope" />
      <div class="filters-panel__chips filters-panel__chips--geo">
        <UiChip v-for="option in geoOptions" :key="option.id" size="sm" :selected="geoIds.includes(option.id)" @click="toggleGeoId(option.id)">{{ option.label }}</UiChip>
      </div>
    </section>

    <section class="filters-panel__group" aria-labelledby="filters-price">
      <UiText id="filters-price" as="h3" variant="body">Цена</UiText>
      <div class="filters-panel__chips">
        <UiChip v-for="tier in (['low', 'mid', 'high'] as const)" :key="tier" size="sm" :selected="price === tier" @click="togglePrice(tier)">{{ PRICE_TIERS[tier].label }}</UiChip>
      </div>
    </section>

    <section class="filters-panel__group">
      <UiSwitch :model-value="openNow" @update:model-value="(value: boolean) => emit('change', { openNow: value })">Открыто сейчас</UiSwitch>
    </section>

    <section class="filters-panel__group" aria-labelledby="filters-tags">
      <UiText id="filters-tags" as="h3" variant="body">Особенности</UiText>
      <UiStack :gap="2">
        <UiCheckbox v-for="id in TAG_IDS" :key="id" :model-value="tags.includes(id)" @update:model-value="(value: boolean) => toggleTag(id, value)">
          {{ VENUE_TAG_LABEL[id] }}
        </UiCheckbox>
      </UiStack>
    </section>
  </UiStack>
</template>

<style scoped>
.filters-panel__group {
  display: grid;
  gap: var(--s-2);
}

.filters-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

.filters-panel__chips--geo {
  max-height: 168px;
  overflow-y: auto;
}
</style>
