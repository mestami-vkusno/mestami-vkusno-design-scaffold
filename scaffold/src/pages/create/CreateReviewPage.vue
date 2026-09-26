<script setup lang="ts">
/*
  CR3 · Оценка и отзыв (`/create/review`, §16.1–16.2, §13.3, J8). Оценка 1–5 — одна активная на пару «пользователь × заведение»;
  отзыв (текст, фото) необязателен и тоже один: у кого он уже есть, тот открывает его на правку, а не создаёт второй.
  Кнопка «Сохранить оценку» — только звёзды, «Опубликовать отзыв» — если есть текст. `?venue=` — заведение, `?visit=` — из Посещения.
  Открывается из заведения («Оценить», «Оставить отзыв»), «Мое → Посещения», «Мое → Оценки и отзывы» и связи «Оценка» в CR1.
*/
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiBanner, UiButton, UiField, UiMediaPicker, UiRatingInput, UiText, UiTextarea, useToast } from '@/design-system'
import type { MediaPickerItem, MediaPickerRejection } from '@/design-system'
import { formatDate } from '@/mocks/format'
import { getVenue } from '@/mocks/selectors/places'
import type { Photo } from '@/mocks/types'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { useViewer } from '@/shell/composables/useViewer'
import { useLibrary } from '@/state/useLibrary'
import EditorFrame from './components/EditorFrame.vue'
import EditorGuest from './components/EditorGuest.vue'
import ObjectPickerSheet from './components/ObjectPickerSheet.vue'
import VenueSummary from './components/VenueSummary.vue'
import { closeEditor } from './links'
import { hasFailed, hasUploading, itemsToPhotos, MAX_PHOTO_BYTES, MAX_PHOTOS, photosToItems, uploadPhoto } from './photos'

/** Предел текста отзыва: в ТЗ настраиваемый (§13.2), в моке — 2000 символов. */
const MAX_REVIEW_TEXT = 2000

const route = useRoute()
const router = useRouter()
const { isSignedIn } = useViewer()
const library = useLibrary()
const { show } = useToast()

function queryText(key: string): string | null {
  const value = route.query[key]
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' && first !== '' ? first : null
}

const venueParam = queryText('venue')
const venueId = ref<string | null>(venueParam !== null && getVenue(venueParam) !== undefined ? venueParam : null)
const venue = computed(() => (venueId.value === null ? undefined : getVenue(venueId.value)))
const visit = computed(() => {
  const id = queryText('visit')
  return id === null ? undefined : library.visits.value.find((entry) => entry.visit.id === id && entry.venue.id === venueId.value)?.visit
})

// Правка: оценка и отзыв читаются из библиотеки; новое заведение (выбранное здесь) читается так же.
const existingReview = computed(() => (venueId.value === null ? undefined : library.reviewOf(venueId.value)))
const existingRating = computed(() => (venueId.value === null ? undefined : library.ratingOf(venueId.value)))

const rating = ref(0)
const text = ref('')
const mediaItems = ref<MediaPickerItem[]>([])
const known = ref<readonly Photo[]>([])
const ratingError = ref('')
const textError = ref('')
const submitting = ref(false)
const pickerOpen = ref(false)

function prefill(): void {
  rating.value = existingRating.value?.value ?? 0
  text.value = existingReview.value?.text ?? ''
  known.value = existingReview.value?.photos ?? []
  mediaItems.value = photosToItems(known.value, 'review')
  ratingError.value = ''
  textError.value = ''
}
prefill()

function chooseVenue(id: string): void {
  venueId.value = id
  prefill()
}

const title = computed(() => (existingReview.value ? 'Ваш отзыв' : 'Оценка и отзыв'))
useDocumentTitle(() => title.value)

const photos = computed(() => itemsToPhotos(mediaItems.value, known.value))
const hasReview = computed(() => text.value.trim() !== '' || photos.value.length > 0)
const submitLabel = computed(() => (hasReview.value ? 'Опубликовать отзыв' : 'Сохранить оценку'))
const busyPhotos = computed(() => hasUploading(mediaItems.value) || hasFailed(mediaItems.value))

function onReject(rejections: MediaPickerRejection[]): void {
  const reason = rejections[0]?.reason
  show({ text: reason === 'limit' ? `Можно добавить не больше ${MAX_PHOTOS} фото` : reason === 'size' ? 'Файл больше 10 МБ' : 'Подойдут только изображения', variant: 'danger' })
}

function submit(): void {
  if (venueId.value === null || submitting.value) return
  ratingError.value = rating.value === 0 ? 'Поставьте оценку' : ''
  textError.value = text.value.trim() === '' && photos.value.length > 0 ? 'Добавьте текст отзыва: фото без текста не публикуется' : ''
  if (ratingError.value !== '' || textError.value !== '') return
  submitting.value = true
  const result = library.submitReview(venueId.value, { value: rating.value, text: text.value, photos: photos.value })
  submitting.value = false
  if (result.ok) closeEditor(router, `/venue/${venueId.value}`)
}

function close(): void {
  closeEditor(router, venueId.value === null ? '/me/reviews' : `/venue/${venueId.value}`)
}
</script>

<template>
  <EditorFrame :title="title" @close="close">
    <EditorGuest v-if="!isSignedIn" title="Войдите, чтобы оценивать" description="Оценка и отзыв привязаны к вашему аккаунту. После входа вы вернётесь сюда." />

    <form v-else class="review" novalidate @submit.prevent="submit">
      <VenueSummary v-if="venue" :venue-id="venue.id" />
      <UiButton v-else variant="outline" block icon-left="pin" @click="pickerOpen = true">Выбрать заведение</UiButton>

      <UiText v-if="visit" variant="caption" class="review__caption">Посещение: {{ formatDate(visit.visitedOn) }}</UiText>

      <UiBanner v-if="existingReview" variant="info">У вас уже есть отзыв на это заведение. Он будет обновлён: оценка и отзыв — один на заведение, второй не создаётся.</UiBanner>

      <UiField label="Оценка" :error="ratingError">
        <template #default="{ invalid }">
          <UiRatingInput v-model="rating" label="Ваша оценка" :invalid="invalid" @update:model-value="ratingError = ''" />
        </template>
      </UiField>

      <UiField label="Отзыв (необязательно)" :error="textError">
        <template #default="{ id, describedBy, invalid }">
          <UiTextarea :id="id" v-model="text" :aria-describedby="describedBy" :invalid="invalid" :max-length="MAX_REVIEW_TEXT" :rows="5" :max-rows="14" placeholder="Что вам запомнилось?" />
        </template>
      </UiField>

      <UiField label="Фото" :hint="`До ${MAX_PHOTOS} фото`">
        <template #default>
          <UiMediaPicker v-model:items="mediaItems" :max="MAX_PHOTOS" :max-size="MAX_PHOTO_BYTES" :uploader="uploadPhoto" @reject="onReject" />
        </template>
      </UiField>

      <UiText variant="caption" class="review__caption">Отзыв публичный. Оценка — одна на заведение: новая заменяет прежнюю.</UiText>

      <UiButton type="submit" block :disabled="venue === undefined || busyPhotos" :loading="submitting">{{ submitLabel }}</UiButton>
      <UiText v-if="busyPhotos" variant="caption" class="review__caption">Дождитесь загрузки фото или уберите неудавшееся.</UiText>
    </form>

    <ObjectPickerSheet v-model:open="pickerOpen" kind="venue" @pick="chooseVenue" />
  </EditorFrame>
</template>

<style scoped>
.review {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.review__caption {
  margin: 0;
  color: var(--text-3);
}
</style>
