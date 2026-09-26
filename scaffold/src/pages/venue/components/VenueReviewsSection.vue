<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiRating, UiText } from '@/design-system'
import { ReviewCard, SectionHeader } from '@/features'
import { formatRating, formatRatingValue, isRatingPublic } from '@/mocks/format'
import { getAuthor } from '@/mocks/selectors/social'
import type { AuthorId, Review, StarValue, Venue } from '@/mocks/types'
import { openReportContent } from '@/overlays/useOverlays'
import ConfirmSheet from '@/pages/create/components/ConfirmSheet.vue'
import { openEditor, reviewEditorUrl } from '@/pages/create/links'
import { useLibrary } from '@/state/useLibrary'

const props = defineProps<{
  venue: Venue
  reviews: readonly Review[]
  ratingByReview: ReadonlyMap<string, StarValue>
  viewerId: AuthorId | null
}>()

const library = useLibrary()
const confirm = ref({ open: false, id: '' })
const router = useRouter()
const publicRating = computed(() => (isRatingPublic(props.venue.rating) ? props.venue.rating : null))

function editReview(): void {
  openEditor(router, reviewEditorUrl(props.venue.id), 'venue')
}

/* Удаление своего отзыва — с подтверждением O12; оценка остаётся (§16.1–16.2). */
function askDelete(reviewId: string): void {
  confirm.value = { open: true, id: reviewId }
}

/* Жалоба на чужой отзыв (O9а, J12). */
function report(reviewId: string): void {
  openReportContent({ kind: 'review', id: reviewId, title: `Отзыв о «${props.venue.name}»`, notify: { kind: 'venue', id: props.venue.id } })
}
</script>

<template>
  <section class="venue-reviews" aria-labelledby="venue-reviews-title">
    <SectionHeader id="venue-reviews-title" title="Отзывы" :count="venue.rating ? `${venue.rating.count}` : undefined" />

    <div v-if="publicRating" class="venue-reviews__summary">
      <UiRating :value="publicRating.value" :count="publicRating.count" variant="stars" />
      <UiText variant="body">{{ formatRatingValue(publicRating.value) }} · {{ publicRating.count }} оценок</UiText>
    </div>
    <UiText v-else variant="caption" class="venue-reviews__hidden">{{ formatRating(venue.rating) }}</UiText>

    <div v-if="reviews.length > 0" class="venue-reviews__list">
      <ReviewCard
        v-for="review in reviews"
        :key="review.id"
        :review="review"
        :rating="ratingByReview.get(review.id) ?? null"
        :author="getAuthor(review.userId) ?? { id: review.userId, username: 'user', displayName: 'Гость сервиса', avatar: { ratio: '1:1', tone: 'slate' } }"
        :own="review.userId === viewerId"
        :reportable="review.userId !== viewerId"
        deferred
        @edit="editReview"
        @delete="askDelete"
        @report="report"
      />
    </div>
    <UiText v-else variant="body">Пока нет отзывов — станьте первым, кто напишет.</UiText>
    <ConfirmSheet v-model:open="confirm.open" title="Удалить отзыв?" text="Отзыв исчезнет с карточки заведения. Оценка останется." confirm-label="Удалить" @confirm="library.removeReview(confirm.id)" />
  </section>
</template>

<style scoped>
.venue-reviews {
  display: grid;
  gap: var(--s-4);
  content-visibility: auto;
  contain-intrinsic-size: auto 520px;
}

.venue-reviews__summary {
  display: flex;
  align-items: center;
  gap: var(--s-3);
}

.venue-reviews__hidden {
  color: var(--text-3);
}

.venue-reviews__list {
  display: grid;
  gap: var(--s-3);
}
</style>
