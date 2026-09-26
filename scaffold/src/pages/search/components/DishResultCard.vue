<script setup lang="ts">
import { computed } from 'vue'
import { RatingLabel, PriceLabel } from '@/features'
import { CUISINE_LABEL } from '@/mocks/dictionaries'
import { formatDistance } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import type { Venue } from '@/mocks/types'
import type { DishResult } from '@/mocks/selectors/menu'

/*
  Результат поиска по блюду (§8.3): позиция меню → заведение. Не входит в `@/features`: нужен только режиму
  «Поиск» страницы Поиска (и рядом «Недавно просмотренное» на Главной). Кандидат в `features/`, если пригодится
  ещё где-то (например, в позиции меню «где ещё есть это блюдо»).
*/
const props = withDefaults(defineProps<{
  result: DishResult
  /** Название района заведения (`venueLocationLabel`). */
  location?: string
  headingLevel?: 2 | 3 | 4 | 5
  deferred?: boolean
}>(), { headingLevel: 3, deferred: false })

const link = computed(() => `/venue/${props.result.venue.id}/menu/${props.result.item.id}`)
const venue = computed<Venue>(() => props.result.venue)
const cuisine = computed(() => venue.value.cuisines.slice(0, 1).map((id) => CUISINE_LABEL[id]).join(''))
const subtitle = computed(() => [venue.value.name, cuisine.value, props.location].filter(Boolean).join(' · '))
</script>

<template>
  <article class="dish-result" :class="{ 'dish-result--deferred': deferred }">
    <div class="dish-result__thumb">
      <UiPhotoPlaceholder v-if="result.item.photo" :photo="result.item.photo" ratio="1:1" decorative />
      <UiPhotoPlaceholder v-else :photo="{ ratio: '1:1', tone: 'slate' }" ratio="1:1" decorative />
    </div>
    <div class="dish-result__body">
      <component :is="`h${headingLevel}`" class="dish-result__title">
        <a class="dish-result__link" :href="link">{{ result.item.name }}</a>
      </component>
      <p class="dish-result__venue">{{ subtitle }}</p>
      <div class="dish-result__facts">
        <RatingLabel :rating="venue.rating" />
        <span v-if="venue.distanceKm !== undefined" class="dish-result__distance">{{ formatDistance(venue.distanceKm) }}</span>
      </div>
    </div>
    <PriceLabel class="dish-result__price" kind="menu" :amount-rub="result.item.priceRub" />
  </article>
</template>

<style scoped>
.dish-result {
  position: relative;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--s-3);
  padding: var(--s-3) 0;
  border-bottom: 1px solid var(--border);
}

.dish-result--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 96px;
}

.dish-result__thumb {
  overflow: hidden;
  width: 72px;
  height: 72px;
  border-radius: var(--r-md);
  background: var(--surface-2);
  flex: none;
}

.dish-result__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-1);
  min-width: 0;
}

.dish-result__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.dish-result__link {
  color: inherit;
  text-decoration: none;
}

.dish-result__link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.dish-result__link:focus-visible {
  box-shadow: none;
}

.dish-result:has(.dish-result__link:focus-visible) {
  box-shadow: inset 0 0 0 2px var(--accent-fg);
  border-radius: var(--r-md);
}

.dish-result__venue {
  margin: 0;
  font-size: 13px;
  color: var(--text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-result__facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-1) var(--s-3);
  margin-top: var(--s-1);
}

.dish-result__distance {
  font-size: 13px;
  color: var(--text-3);
}

.dish-result__price {
  color: var(--text-2);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}
</style>
