<script setup lang="ts">
/*
  CR4 · Добавление Посещения (`/create/visit`, §16.3–16.4, J8). «Вы были здесь?»: дата (не в будущем, по умолчанию сегодня) и
  необязательное событие этого заведения. Посещение приватно: ресторан и подписчики его не видят. Повторные Посещения разрешены
  и нового отзыва не создают. После сохранения экран предлагает Оценку, Отзыв и Публикацию — всё необязательно.
  `?venue=` — заведение, `?event=` — событие, `?for=<id черновика>` — из редактора публикации: после сохранения возвращаемся в него.
*/
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiButton, UiField, UiIcon, UiInput, UiListRow, UiSelect, UiText } from '@/design-system'
import { formatDate } from '@/mocks/format'
import { eventsByVenue, getEvent } from '@/mocks/selectors/events'
import { getVenue } from '@/mocks/selectors/places'
import { MOCK_TODAY } from '@/mocks/time'
import type { Visit } from '@/mocks/types'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { useViewer } from '@/shell/composables/useViewer'
import { useLibrary } from '@/state/useLibrary'
import EditorFrame from './components/EditorFrame.vue'
import EditorGuest from './components/EditorGuest.vue'
import ObjectPickerSheet from './components/ObjectPickerSheet.vue'
import VenueSummary from './components/VenueSummary.vue'
import { closeEditor, postEditorUrl, reviewEditorUrl } from './links'

const route = useRoute()
const router = useRouter()
const { isSignedIn } = useViewer()
const library = useLibrary()

function queryText(key: string): string | null {
  const value = route.query[key]
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' && first !== '' ? first : null
}

const forDraft = queryText('for')
const venueParam = queryText('venue')
const venueId = ref<string | null>(venueParam !== null && getVenue(venueParam) !== undefined ? venueParam : null)
const eventParam = queryText('event')
const eventId = ref(eventParam !== null && getEvent(eventParam)?.venueId === venueId.value ? eventParam : '')
const date = ref<string>(MOCK_TODAY)
const dateError = ref('')
const saved = ref<Visit | null>(null)
const pickerOpen = ref(false)

const venue = computed(() => (venueId.value === null ? undefined : getVenue(venueId.value)))
useDocumentTitle(() => (saved.value === null ? 'Вы были здесь?' : 'Посещение сохранено'))

const eventOptions = computed(() => [
  { value: '', label: 'Без события' },
  ...eventsByVenue(venueId.value ?? '').map((event) => ({ value: event.id, label: event.title })),
])

function chooseVenue(id: string): void {
  venueId.value = id
  eventId.value = ''
}

function validate(): boolean {
  if (date.value === '') dateError.value = 'Укажите дату'
  else if (date.value > MOCK_TODAY) dateError.value = 'Дата не может быть в будущем'
  else dateError.value = ''
  return dateError.value === ''
}

function save(): void {
  if (venueId.value === null || !validate()) return
  const result = library.addVisit({ venueId: venueId.value, visitedOn: date.value, ...(eventId.value === '' ? {} : { eventId: eventId.value }) })
  if (!result.ok) return
  // Из редактора публикации: возвращаемся в него с Посещением, без промежуточного экрана.
  if (forDraft !== null) {
    void router.replace(postEditorUrl({ draftId: forDraft, visitId: result.visit.id }))
    return
  }
  saved.value = result.visit
}

const rating = computed(() => (venueId.value === null ? undefined : library.ratingOf(venueId.value)))
const review = computed(() => (venueId.value === null ? undefined : library.reviewOf(venueId.value)))

function next(url: string): void {
  void router.replace(url)
}

function close(): void {
  closeEditor(router, venueId.value === null ? '/me/visits' : `/venue/${venueId.value}`)
}
</script>

<template>
  <EditorFrame :title="saved ? 'Посещение сохранено' : 'Вы были здесь?'" @close="close">
    <EditorGuest v-if="!isSignedIn" title="Войдите, чтобы отмечать Посещения" description="Посещения видны только вам. После входа вы вернётесь сюда." />

    <Transition v-else name="visit-swap" mode="out-in">
      <form v-if="saved === null" key="form" class="visit__form" novalidate @submit.prevent="save">
        <VenueSummary v-if="venue" :venue-id="venue.id" />
        <UiButton v-else variant="outline" block icon-left="pin" @click="pickerOpen = true">Выбрать заведение</UiButton>

        <UiField label="Дата" :error="dateError">
          <template #default="{ id, describedBy, invalid }">
            <UiInput :id="id" v-model="date" type="date" :max="MOCK_TODAY" :aria-describedby="describedBy" :invalid="invalid" @update:model-value="dateError = ''" />
          </template>
        </UiField>

        <UiField v-if="venue" label="Событие (необязательно)">
          <template #default="{ id, describedBy }">
            <UiSelect :id="id" v-model="eventId" :options="eventOptions" :aria-describedby="describedBy" />
          </template>
        </UiField>

        <UiText variant="caption" class="visit__lock"><UiIcon name="lock" :size="14" />Посещение видно только вам. Ресторан и подписчики его не видят.</UiText>
        <UiText v-if="review" variant="caption" class="visit__lock">У вас уже есть отзыв на это заведение: новое Посещение второй отзыв не создаёт.</UiText>

        <UiButton type="submit" block :disabled="venue === undefined">Сохранить посещение</UiButton>
      </form>

      <div v-else key="done" class="visit__done">
        <UiText variant="body">{{ venue?.name }} · {{ formatDate(saved.visitedOn) }}. Всё дальше по желанию.</UiText>
        <div class="visit__rows">
          <UiListRow :title="rating ? 'Изменить оценку' : 'Поставить оценку'" :description="rating ? `Сейчас: ${rating.value} из 5` : undefined" icon="star" divider @click="next(reviewEditorUrl(venueId ?? undefined, saved.id))" />
          <UiListRow :title="review ? 'Изменить отзыв' : 'Написать отзыв'" icon="comment" divider @click="next(reviewEditorUrl(venueId ?? undefined, saved.id))" />
          <UiListRow title="Написать публикацию" description="С заведением и этим Посещением" icon="edit" divider @click="next(postEditorUrl({ ...(venueId === null ? {} : { venueId }), visitId: saved.id }))" />
        </div>
        <UiText v-if="review" variant="caption" class="visit__lock">Отзыв на заведение один: его можно только изменить.</UiText>
        <UiButton variant="ghost" block @click="close">Не сейчас</UiButton>
      </div>
    </Transition>

    <ObjectPickerSheet v-model:open="pickerOpen" kind="venue" @pick="chooseVenue" />
  </EditorFrame>
</template>

<style scoped>
.visit__form,
.visit__done,
.visit__rows {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.visit__rows {
  gap: 0;
}

.visit__lock {
  display: flex;
  align-items: flex-start;
  gap: var(--s-2);
  margin: 0;
  color: var(--text-3);
}

/* Смена содержимого — затухание (`--dur-modal`, `--ease-out`): без движения по осям, поэтому подходит и при «уменьшенном движении». */
.visit-swap-enter-active,
.visit-swap-leave-active {
  transition: opacity var(--dur-modal) var(--ease-out);
}

.visit-swap-enter-from,
.visit-swap-leave-to {
  opacity: 0;
}
</style>
