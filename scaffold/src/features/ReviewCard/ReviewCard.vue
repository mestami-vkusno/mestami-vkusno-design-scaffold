<script setup lang="ts">
import { UiBadge, UiButton, UiCluster, UiRating, UiSurface } from '@/design-system'
import { formatDate } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { FEATURE_LABELS } from '../labels'
import AuthorRow from '../AuthorRow/AuthorRow.vue'
import type { ReviewCardProps } from './types'

withDefaults(defineProps<ReviewCardProps>(), { headingLevel: 3 })
const emit = defineEmits<{ edit: [reviewId: string]; delete: [reviewId: string]; report: [reviewId: string] }>()
</script>

<template>
  <UiSurface as="article" class="review-card" :class="{ 'review-card--deferred': deferred }">
    <component :is="`h${headingLevel}`" v-if="venue" class="review-card__venue">
      <a class="review-card__venue-link" :href="`/venue/${venue.id}`">{{ venue.name }}</a>
      <span v-if="venue.subtitle" class="review-card__venue-sub">{{ venue.subtitle }}</span>
    </component>
    <AuthorRow :author="author" size="sm" :subtitle="formatDate(review.createdAt)">
      <template v-if="review.status === 'pending' || rating !== null" #action>
        <UiCluster :gap="2" align="center">
          <UiBadge v-if="review.status === 'pending'" variant="warning">{{ FEATURE_LABELS.reviewPending }}</UiBadge>
          <UiRating v-if="rating !== null" :value="rating" variant="stars" />
        </UiCluster>
      </template>
    </AuthorRow>
    <p class="review-card__text">{{ review.text }}</p>
    <ul v-if="review.photos.length > 0" class="review-card__photos" :aria-label="`Фото к отзыву: ${review.photos.length}`">
      <li v-for="(photo, index) in review.photos.slice(0, 4)" :key="index" class="review-card__photo">
        <UiPhotoPlaceholder :photo="photo" ratio="1:1" />
      </li>
    </ul>
    <UiCluster v-if="own" :gap="2">
      <UiButton variant="outline" size="sm" icon-left="edit" @click="emit('edit', review.id)">
        {{ FEATURE_LABELS.edit }}<span class="fx-sr-only"> отзыв</span>
      </UiButton>
      <UiButton variant="ghost" size="sm" icon-left="trash" class="review-card__delete" @click="emit('delete', review.id)">
        {{ FEATURE_LABELS.remove }}<span class="fx-sr-only"> отзыв</span>
      </UiButton>
    </UiCluster>
    <UiCluster v-else-if="reportable" :gap="2">
      <UiButton variant="ghost" size="sm" icon-left="flag" @click="emit('report', review.id)">
        {{ FEATURE_LABELS.report }}<span class="fx-sr-only"> на отзыв</span>
      </UiButton>
    </UiCluster>
  </UiSurface>
</template>

<style scoped>
.review-card {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding: var(--s-4);
}

.review-card--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 220px;
}

.review-card__venue {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 var(--s-2);
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
}

.review-card__venue-link {
  color: inherit;
  text-decoration: none;
}

.review-card__venue-sub {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-3);
}

.review-card__text {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-2);
  overflow-wrap: anywhere;
}

.review-card__photos {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 88px));
  gap: var(--s-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.review-card__photo {
  overflow: hidden;
  border-radius: var(--r-md);
}

/* «Удалить» красным, как в референсе кабинета. */
.review-card .review-card__delete {
  color: var(--danger);
}

@media (pointer: coarse) {
  .review-card__venue-link {
    padding-block: 12px;
    margin-block: -12px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .review-card__venue-link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
