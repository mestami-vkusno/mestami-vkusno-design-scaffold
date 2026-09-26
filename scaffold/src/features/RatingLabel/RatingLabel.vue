<script setup lang="ts">
import { computed } from 'vue'
import { UiIcon } from '@/design-system'
import { formatCount, formatRating, formatRatingValue, isRatingPublic } from '@/mocks/format'
import type { RatingLabelProps } from './types'

const props = withDefaults(defineProps<RatingLabelProps>(), { showCount: true, hideWhenHidden: false })

const publicRating = computed(() => (isRatingPublic(props.rating) ? props.rating : null))
const countText = computed(() => (publicRating.value === null ? '' : formatCount(publicRating.value.count, 'отзыв', 'отзыва', 'отзывов')))
const ariaLabel = computed(() => (publicRating.value === null ? formatRating(props.rating) : `Оценка ${formatRatingValue(publicRating.value.value)} из 5, ${countText.value}`))
</script>

<template>
  <span v-if="publicRating" class="rating-label" role="img" :aria-label="ariaLabel">
    <UiIcon name="star" :size="14" filled class="rating-label__star" />
    <span aria-hidden="true">{{ formatRatingValue(publicRating.value) }}</span>
    <span v-if="showCount" class="rating-label__count" aria-hidden="true">({{ publicRating.count }})</span>
  </span>
  <span v-else-if="!hideWhenHidden" class="rating-label rating-label--hidden">{{ formatRating(rating) }}</span>
</template>

<style scoped>
.rating-label {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  font-size: 13px;
  line-height: 1.3;
  white-space: nowrap;
}

.rating-label__star {
  color: var(--star);
}

.rating-label__count {
  color: var(--text-3);
}

.rating-label--hidden {
  color: var(--text-3);
}
</style>
