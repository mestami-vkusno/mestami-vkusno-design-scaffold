<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiButton, UiEmptyState, UiRating, UiSegmented, UiSurface } from '@/design-system'
import { ReviewCard } from '@/features'
import type { ReviewVenueRef } from '@/features'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { venueLocationLabel } from '@/mocks/selectors/places'
import type { RatingEntry } from '@/mocks/selectors/library'
import type { StarValue } from '@/mocks/types'
import ConfirmSheet from '@/pages/create/components/ConfirmSheet.vue'
import { openEditor, reviewEditorUrl } from '@/pages/create/links'
import { useSettings } from '@/state/settings'
import { useLibrary } from '@/state/useLibrary'
import MeList from './components/MeList.vue'
import MeScreen from './components/MeScreen.vue'

/*
  M7 «Оценки и отзывы» (§16.1, §16.2, §13.3, `/me/reviews`): Оценка и Отзыв — разные сущности, поэтому два режима — «Отзывы» и «Только оценки».
  Одна активная пара «пользователь × заведение», второго отзыва о том же заведении быть не может (§3.4), поэтому «Редактировать» открывает
  тот же редактор CR3 с имеющимся отзывом. Удаление отзыва — с подтверждением O12; оценка при этом остаётся. Правка идёт через
  проверку: статус версии «На проверке» рисует сама карточка.
*/

type Mode = 'reviews' | 'ratings'

const MODES = [
  { id: 'reviews', label: 'Отзывы' },
  { id: 'ratings', label: 'Только оценки' },
] as const

const router = useRouter()
const library = useLibrary()
const settings = useSettings()
const mode = ref<Mode>('reviews')
const confirm = ref({ open: false, id: '' })

const author = computed(() => settings.profile.value)
const withReview = computed(() => library.ratings.value.filter((entry): entry is RatingEntry & { review: NonNullable<RatingEntry['review']> } => entry.review !== undefined))
const onlyRatings = computed(() => library.ratings.value.filter((entry) => entry.review === undefined))

function venueRef(entry: RatingEntry): ReviewVenueRef {
  return { id: entry.venue.id, name: entry.venue.name, photo: entry.venue.gallery[0], subtitle: venueLocationLabel(entry.venue) }
}

function edit(venueId: string): void {
  openEditor(router, reviewEditorUrl(venueId), 'me')
}

function askDelete(reviewId: string): void {
  confirm.value = { open: true, id: reviewId }
}

function onDelete(): void {
  library.removeReview(confirm.value.id)
}
</script>

<template>
  <MeScreen title="Оценки и отзывы" guest-text="Войдите, чтобы видеть свои оценки и отзывы и править их." priv>
    <UiSegmented v-model="mode" label="Что показать" :items="MODES" />

    <UiEmptyState v-if="library.ratings.value.length === 0" title="Вы пока не оценивали места" description="Оценку можно поставить после посещения.">
      <template #actions><UiButton variant="outline" href="/me/visits">Мои Посещения</UiButton></template>
    </UiEmptyState>

    <template v-else-if="mode === 'reviews'">
      <UiEmptyState v-if="withReview.length === 0" title="Отзывов пока нет" description="Оценки без отзыва — на вкладке «Только оценки». Отзыв можно написать в любой момент." />
      <MeList v-else layout="grid" :min="360">
        <li v-for="entry in withReview" :key="entry.review.id">
          <ReviewCard
            v-if="author"
            :review="entry.review"
            :rating="entry.rating.value as StarValue"
            :author="author"
            :venue="venueRef(entry)"
            own
            :heading-level="3"
            deferred
            @edit="edit(entry.venue.id)"
            @delete="askDelete"
          />
        </li>
      </MeList>
    </template>

    <template v-else>
      <UiEmptyState v-if="onlyRatings.length === 0" title="Все ваши оценки сопровождены отзывами" description="Оценка без текста появится здесь." />
      <MeList v-else layout="grid" :min="320">
        <li v-for="entry in onlyRatings" :key="entry.rating.id">
          <UiSurface as="article" class="rating-row">
            <div v-if="entry.venue.gallery[0]" class="rating-row__thumb"><UiPhotoPlaceholder :photo="entry.venue.gallery[0]" ratio="1:1" decorative /></div>
            <div class="rating-row__text">
              <a class="rating-row__name" :href="`/venue/${entry.venue.id}`">{{ entry.venue.name }}</a>
              <UiRating :value="entry.rating.value" variant="stars" />
            </div>
            <UiButton size="sm" variant="outline" @click="edit(entry.venue.id)">Изменить оценку</UiButton>
          </UiSurface>
        </li>
      </MeList>
    </template>

    <ConfirmSheet v-model:open="confirm.open" title="Удалить отзыв?" text="Отзыв исчезнет с карточки заведения. Оценка останется." confirm-label="Удалить" @confirm="onDelete" />
  </MeScreen>
</template>

<style scoped>
.rating-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3);
}

.rating-row__thumb {
  width: 56px;
  overflow: hidden;
  border-radius: var(--r-md);
}

.rating-row__text {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-1);
}

.rating-row__name {
  overflow: hidden;
  color: inherit;
  font-weight: 600;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
