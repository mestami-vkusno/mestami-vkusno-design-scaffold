<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiIcon } from '@/design-system'
import { DIETARY_LABEL, MENU_AVAILABILITY_LABEL } from '@/mocks/dictionaries'
import { UiPhotoPlaceholder } from '@/mocks/media'
import PriceLabel from '../PriceLabel/PriceLabel.vue'
import type { DishRowProps } from './types'

const props = withDefaults(defineProps<DishRowProps>(), { headingLevel: 3 })

const unavailable = computed(() => props.item.availability !== 'available')
</script>

<template>
  <!-- Алкогольная позиция в публичный интерфейс не попадает ни при каких данных (§8.4). -->
  <article v-if="!item.isAlcohol" class="dish-row" :class="{ 'dish-row--unavailable': unavailable, 'dish-row--interactive': href, 'dish-row--deferred': deferred }">
    <div class="dish-row__thumb">
      <UiPhotoPlaceholder v-if="item.photo" :photo="item.photo" ratio="1:1" />
      <span v-else class="dish-row__no-photo" aria-hidden="true"><UiIcon name="image" :size="22" /></span>
    </div>
    <div class="dish-row__body">
      <component :is="`h${headingLevel}`" class="dish-row__title">
        <a v-if="href" class="dish-row__link" :href="href">{{ item.name }}</a>
        <template v-else>{{ item.name }}</template>
      </component>
      <p v-if="venueName" class="dish-row__venue">{{ venueName }}</p>
      <p v-if="item.description" class="dish-row__description">{{ item.description }}</p>
      <div v-if="item.availability !== 'available' || item.dietary.length > 0 || item.portion" class="dish-row__meta">
        <UiBadge v-if="item.availability !== 'available'" :variant="item.availability === 'removed' ? 'danger' : 'warning'">{{ MENU_AVAILABILITY_LABEL[item.availability] }}</UiBadge>
        <UiBadge v-for="tag in item.dietary" :key="tag" variant="neutral" pill>{{ DIETARY_LABEL[tag] }}</UiBadge>
        <span v-if="item.portion" class="dish-row__portion">{{ item.portion }}</span>
      </div>
    </div>
    <PriceLabel class="dish-row__price" kind="menu" :amount-rub="item.priceRub" />
  </article>
</template>

<style scoped>
.dish-row {
  position: relative;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--s-3);
  padding: var(--s-3) 0;
  border-bottom: 1px solid var(--border);
}

.dish-row--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 96px;
}

.dish-row__thumb {
  overflow: hidden;
  width: 72px;
  height: 72px;
  border-radius: var(--r-md);
  background: var(--surface-2);
}

.dish-row__thumb > :deep(.photo-placeholder) {
  height: 100%;
}

.dish-row__no-photo {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: var(--text-3);
}

.dish-row__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-1);
  min-width: 0;
}

.dish-row__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.dish-row__link {
  color: inherit;
  text-decoration: none;
}

.dish-row__link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.dish-row__link:focus-visible {
  box-shadow: none;
}

.dish-row:has(.dish-row__link:focus-visible) {
  box-shadow: inset 0 0 0 2px var(--accent-fg);
  border-radius: var(--r-md);
}

.dish-row__venue {
  margin: 0;
  font-size: 13px;
  color: var(--text-3);
}

.dish-row__description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: 0;
  font-size: 13.5px;
  line-height: 1.4;
  color: var(--text-2);
}

.dish-row__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-1) var(--s-2);
}

.dish-row__portion {
  font-size: 12px;
  color: var(--text-3);
}

/* Недоступная позиция остаётся в меню, но приглушена: пользователь видит, что она была и вернётся. */
.dish-row--unavailable .dish-row__thumb,
.dish-row--unavailable .dish-row__title,
.dish-row--unavailable .dish-row__price {
  opacity: 0.6;
}

@media (pointer: coarse) {
  .dish-row--interactive {
    min-height: 56px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .dish-row--interactive:hover .dish-row__title {
    text-decoration: underline;
    text-decoration-color: var(--link-line);
    text-underline-offset: 3px;
  }
}
</style>
