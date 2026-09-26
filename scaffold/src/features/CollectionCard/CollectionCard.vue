<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge } from '@/design-system'
import { formatCount } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { FEATURE_LABELS } from '../labels'
import type { CollectionCardProps } from './types'

const props = withDefaults(defineProps<CollectionCardProps>(), { layout: 'tile', headingLevel: 3, as: 'article' })
defineSlots<{ /** Кнопка в правом верхнем углу: `SaveButton` для подборки. */ action?(): unknown }>()

const link = computed(() => props.href ?? `/collection/${props.collection.id}`)
const places = computed(() => {
  const [one, few, many] = FEATURE_LABELS.placesCount
  return formatCount(props.placesCount ?? props.collection.items.length, one, few, many)
})
const isPrivate = computed(() => props.collection.visibility === 'private')
const isDraft = computed(() => props.collection.status === 'draft')
</script>

<template>
  <component :is="as" class="collection-card" :class="[`collection-card--${layout}`, { 'collection-card--deferred': deferred }]">
    <div class="collection-card__media">
      <UiPhotoPlaceholder :photo="collection.cover" ratio="fill" decorative />
    </div>
    <div v-if="(isPrivate || isDraft) && layout === 'tile'" class="collection-card__badges">
      <UiBadge v-if="isDraft" variant="warning">{{ FEATURE_LABELS.draft }}</UiBadge>
      <UiBadge v-if="isPrivate" variant="neutral" icon="lock">{{ FEATURE_LABELS.privateCollection }}</UiBadge>
    </div>
    <div v-if="$slots.action" class="collection-card__action"><slot name="action" /></div>
    <div class="collection-card__text">
      <div v-if="(isPrivate || isDraft) && layout === 'row'" class="collection-card__inline-badges">
        <UiBadge v-if="isDraft" variant="warning">{{ FEATURE_LABELS.draft }}</UiBadge>
        <UiBadge v-if="isPrivate" variant="neutral" icon="lock">{{ FEATURE_LABELS.privateCollection }}</UiBadge>
      </div>
      <component :is="`h${headingLevel}`" class="collection-card__title">
        <a class="collection-card__link" :href="link">{{ collection.title }}</a>
      </component>
      <p class="collection-card__meta">{{ places }}</p>
      <p class="collection-card__byline" :class="{ 'collection-card__byline--editorial': collection.kind === 'editorial' }">{{ byline }}</p>
    </div>
  </component>
</template>

<style scoped>
.collection-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  background: var(--surface);
  transition: border-color var(--dur-hover) ease;
}

.collection-card--deferred {
  content-visibility: auto;
}

.collection-card__link {
  color: inherit;
  text-decoration: none;
}

.collection-card__link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}

.collection-card__link:focus-visible {
  box-shadow: none;
}

.collection-card:has(.collection-card__link:focus-visible) {
  box-shadow: var(--ring);
}

.collection-card__title {
  margin: 0;
}

.collection-card__meta,
.collection-card__byline {
  margin: 0;
}

.collection-card__action {
  position: absolute;
  top: var(--s-2);
  right: var(--s-2);
  z-index: 2;
}

.collection-card__badges {
  position: absolute;
  top: var(--s-2);
  left: var(--s-2);
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
  max-width: calc(100% - 56px);
  pointer-events: none;
}

/* Плитка: снимок на всю карточку, подпись поверх тёмного градиента (--scrim-strong), текст на нём --on-scrim. */
.collection-card--tile {
  display: flex;
  align-items: flex-end;
  aspect-ratio: 5 / 4;
  contain-intrinsic-size: auto 260px;
  color: var(--on-scrim);
}

.collection-card--tile .collection-card__media {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.collection-card--tile .collection-card__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--scrim-strong), transparent 62%);
}

.collection-card--tile .collection-card__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--s-3) var(--s-4);
}

.collection-card--tile .collection-card__title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.25;
}

.collection-card--tile .collection-card__meta,
.collection-card--tile .collection-card__byline {
  font-size: 13px;
  line-height: 1.35;
  opacity: 0.86;
}

.collection-card--tile .collection-card__byline--editorial {
  opacity: 1;
  font-weight: 600;
}

/* Строка: снимок 104 px слева, текст справа. */
.collection-card--row {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  min-height: 104px;
  contain-intrinsic-size: auto 106px;
}

.collection-card--row .collection-card__media {
  position: relative;
  min-height: 104px;
}

.collection-card--row .collection-card__text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--s-1);
  min-width: 0;
  padding: var(--s-3);
}

.collection-card--row .collection-card__title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
}

.collection-card--row .collection-card__meta,
.collection-card--row .collection-card__byline {
  font-size: 12.5px;
  color: var(--text-3);
}

.collection-card--row .collection-card__byline--editorial {
  color: var(--accent-fg);
  font-weight: 600;
}

.collection-card__inline-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
}

@media (hover: hover) and (pointer: fine) {
  .collection-card:hover {
    border-color: var(--border-hover);
  }
}
</style>
