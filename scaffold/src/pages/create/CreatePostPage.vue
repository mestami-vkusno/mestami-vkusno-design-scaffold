<script setup lang="ts">
/*
  CR1 · Редактор публикации (`/create/post`, §13, J7). Текст, фото, заведение (обязательно для публичной), позиция меню, событие,
  Посещение, контекст Оценки, видимость (всегда заметна), комментарии. Контекст предзаполняется из адреса
  (`?venue=`, `?item=`, `?event=`, `?visit=`), `?draft=` открывает черновик. Автосохранение обязательно: закрыл на середине — работа
  осталась черновиком. Первая публичная публикация проходит A5; публичная уходит «на модерацию», приватная — в Дневник.
  Мобильная: одна колонка; ≥900 px: две колонки `2fr 1fr`, справа закреплённая панель (видимость, заведение, связи, «Опубликовать»).
*/
import '@/features/shared/base.css'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiBanner, UiButton, UiCluster, UiChip, UiField, UiLink, UiMediaPicker, UiRating, UiScreenBar, UiSegmented, UiSwitch, UiText, UiTextarea, useToast } from '@/design-system'
import type { MediaPickerRejection } from '@/design-system'
import { formatMenuPrice } from '@/mocks/format'
import { getEvent } from '@/mocks/selectors/events'
import { getMenuItem } from '@/mocks/selectors/menu'
import { formatDate } from '@/mocks/format'
import { report } from '@/state/feedback'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { useViewer } from '@/shell/composables/useViewer'
import { useLibrary } from '@/state/useLibrary'
import AutosaveStatus from './components/AutosaveStatus.vue'
import ConfirmSheet from './components/ConfirmSheet.vue'
import EditorGuest from './components/EditorGuest.vue'
import LegalConsentSheet from './components/LegalConsentSheet.vue'
import ObjectPickerSheet, { type PickerKind } from './components/ObjectPickerSheet.vue'
import PostResultSheet from './components/PostResultSheet.vue'
import VenueSummary from './components/VenueSummary.vue'
import { closeEditor, POST_EDITOR, reviewEditorUrl, visitEditorUrl } from './links'
import { MAX_PHOTO_BYTES, MAX_PHOTOS, uploadPhoto } from './photos'
import { MAX_POST_TEXT, usePostEditor } from './usePostEditor'

const router = useRouter()
const { isSignedIn } = useViewer()
const library = useLibrary()
const { show } = useToast()
const editor = usePostEditor()

const title = computed(() => (editor.status.value === 'draft' ? 'Новая публикация' : 'Публикация'))
useDocumentTitle(() => `${title.value}`)

const VISIBILITY_ITEMS = [
  { id: 'public', label: 'Публичная' },
  { id: 'private', label: 'Только для меня' },
] as const

const visibilityCaption = computed(() => (editor.isPublic.value ? 'Увидят все. Пройдёт проверку.' : 'Попадёт в Дневник. В ленту и рекомендации не попадёт.'))
const submitLabel = computed(() => (editor.isPublic.value ? 'Опубликовать' : 'Сохранить в дневник'))

const ENTRY_LABEL = { blank: '', venue: 'Из карточки заведения', dish: 'Из карточки блюда', event: 'Из карточки события', visit: 'Из Посещения' } as const
const venueNote = computed(() => (editor.venueId.value !== null && editor.venueId.value === editor.prefilledVenueId.value ? ENTRY_LABEL[editor.entry.value] : ''))

const dish = computed(() => (editor.menuItemId.value === null ? undefined : getMenuItem(editor.menuItemId.value)))
const event = computed(() => (editor.eventId.value === null ? undefined : getEvent(editor.eventId.value)))
const visit = computed(() => (editor.visitId.value === null ? undefined : library.visits.value.find((entry) => entry.visit.id === editor.visitId.value)?.visit))

// ── Незавершённый черновик при пустом редакторе: пока нет «Мое → Черновики» (задача 0013), «Продолжить» лежит здесь ──
const unfinished = computed(() => {
  if (editor.postId.value !== null || editor.venueId.value !== null || editor.text.value !== '' || editor.entry.value !== 'blank') return undefined
  return library.posts.value.find((post) => post.status === 'draft')
})

// ── Выбор объектов (O13) ──
const picker = ref<{ open: boolean; kind: PickerKind }>({ open: false, kind: 'venue' })
function openPicker(kind: PickerKind): void {
  picker.value = { open: true, kind }
}
function onPick(id: string): void {
  if (picker.value.kind === 'venue') editor.setVenue(id)
  else if (picker.value.kind === 'dish') editor.menuItemId.value = id
  else if (picker.value.kind === 'event') editor.eventId.value = id
  else editor.visitId.value = id
}

// ── Фото ──
function onReject(rejections: MediaPickerRejection[]): void {
  const reason = rejections[0]?.reason
  show({ text: reason === 'limit' ? `Можно добавить не больше ${MAX_PHOTOS} фото` : reason === 'size' ? 'Файл больше 10 МБ' : 'Подойдут только изображения', variant: 'danger' })
}

// ── Переходы в CR3 и CR4: черновик сохраняется до ухода ──
function editRating(): void {
  if (editor.venueId.value === null) return
  editor.persist()
  void router.push(reviewEditorUrl(editor.venueId.value))
}
function toggleRating(): void {
  if (editor.activeRating.value === undefined) editRating()
  else editor.withRating.value = true
}
function addVisit(): void {
  if (editor.venueId.value === null) return
  const id = editor.persist(true)
  void router.push(visitEditorUrl(editor.venueId.value, { ...(id === null ? {} : { forDraft: id }), ...(editor.eventId.value === null ? {} : { eventId: editor.eventId.value }) }))
}

// ── Опубликовать ──
const legalOpen = ref(false)
const resultOpen = ref(false)
const confirmDelete = ref(false)
const submitError = ref(false)

function submit(): void {
  if (!editor.canSubmit.value) return
  submitError.value = false
  const id = editor.persist(true)
  if (id === null) return
  const result = library.submitPost(id)
  if (!result.ok) {
    if (result.reason === 'consent_required') legalOpen.value = true
    else {
      submitError.value = true
      report(result, '')
    }
    return
  }
  editor.seal()
  if (editor.isPublic.value) resultOpen.value = true
  else {
    show({ text: 'Сохранено в дневник', variant: 'success' })
    void router.replace('/me/diary')
  }
}

function acceptLegal(): void {
  const result = library.acceptUgcConsent(true)
  if (!result.ok) {
    report(result, '')
    return
  }
  legalOpen.value = false
  submit()
}

function keepPrivate(): void {
  legalOpen.value = false
  editor.visibility.value = 'private'
  submit()
}

function createMore(): void {
  resultOpen.value = false
  editor.startNew()
  void router.replace(POST_EDITOR)
}

function afterResult(open: boolean): void {
  if (!open && editor.postId.value !== null && editor.status.value !== 'draft') void router.replace(`/post/${editor.postId.value}`)
}

function deleteDraft(): void {
  const id = editor.postId.value
  editor.forgetDraft()
  if (id !== null) library.removePost(id)
  closeEditor(router, '/feed')
}

function close(): void {
  editor.persist()
  closeEditor(router, '/feed')
}
</script>

<template>
  <main class="create-post">
    <UiScreenBar :title="title" back-label="Закрыть" @back="close">
      <template #actions>
        <UiButton class="create-post__bar-submit" size="sm" :disabled="!editor.canSubmit.value" @click="submit">{{ submitLabel }}</UiButton>
      </template>
    </UiScreenBar>

    <div class="create-post__frame">
      <EditorGuest v-if="!isSignedIn" title="Войдите, чтобы создавать публикации" description="Черновик сохранится, а после входа вы вернётесь в редактор." />

      <template v-else>
        <AutosaveStatus class="create-post__status" :state="editor.autosave.value" :restored="editor.restored.value" />

        <div class="create-post__banners">
          <UiBanner v-if="editor.notFound.value" variant="info" title="Черновик не найден">Возможно, его удалили. Можно начать новую публикацию.</UiBanner>
          <UiBanner v-if="unfinished" variant="info" title="Есть незавершённый черновик">
            <UiLink :href="`${POST_EDITOR}?draft=${unfinished.id}`">Продолжить черновик</UiLink>
            · изменён {{ formatDate(unfinished.updatedAt) }}
          </UiBanner>
          <UiBanner v-if="editor.status.value === 'changes_requested'" variant="warning" title="Запрошены изменения">{{ editor.moderationNote.value ?? 'Исправьте публикацию и отправьте её снова.' }}</UiBanner>
          <UiBanner v-else-if="editor.status.value === 'rejected'" variant="danger" title="Публикация отклонена">{{ editor.moderationNote.value ?? 'Отредактируйте её и отправьте снова.' }}</UiBanner>
          <UiBanner v-if="editor.visibilityChangeNote.value" variant="info">{{ editor.visibilityChangeNote.value }}</UiBanner>
          <UiBanner v-if="!editor.online.value" variant="warning" title="Нет сети">Черновик сохранён на устройстве. Отправить можно, когда связь вернётся.</UiBanner>
          <UiBanner v-if="submitError" variant="danger" title="Не удалось отправить">
            Черновик сохранён. <UiButton size="sm" variant="outline" @click="submit">Повторить</UiButton>
          </UiBanner>
        </div>

        <div class="create-post__body">
          <div class="create-post__main">
            <div class="create-post__field create-post__field--text">
              <UiField label="Текст" hint="Расскажите, что понравилось, что взяли, с кем ходили.">
                <template #default="{ id, describedBy, invalid }">
                  <UiTextarea :id="id" v-model="editor.text.value" :aria-describedby="describedBy" :invalid="invalid" :max-length="MAX_POST_TEXT" :rows="6" :max-rows="16" placeholder="Что вы хотите рассказать?" />
                </template>
              </UiField>
            </div>

            <div class="create-post__field create-post__field--photos">
              <UiField label="Фото" :hint="`До ${MAX_PHOTOS} фото`">
                <template #default>
                  <UiMediaPicker v-model:items="editor.mediaItems.value" :max="MAX_PHOTOS" :max-size="MAX_PHOTO_BYTES" :uploader="uploadPhoto" @reject="onReject" />
                </template>
              </UiField>
            </div>

            <UiText variant="caption" class="create-post__field create-post__field--rules create-post__rules">
              Платные, бартерные и спонсорские интеграции запрещены без официального рекламного процесса.
              <UiLink href="/legal/service-rules" target="_blank" rel="noopener">Правила публикаций</UiLink>
            </UiText>
          </div>

          <div class="create-post__side">
            <div class="create-post__field create-post__field--visibility">
              <UiSegmented v-model="editor.visibility.value" :items="VISIBILITY_ITEMS" label="Видимость" />
              <UiText variant="caption" class="create-post__caption">{{ visibilityCaption }}</UiText>
            </div>

            <div class="create-post__field create-post__field--venue">
              <UiField label="Заведение" :hint="editor.isPublic.value ? 'Обязательно для публичной публикации' : 'Для записи в дневник заведение необязательно'" :error="editor.venueError.value">
                <template #default>
                  <VenueSummary v-if="editor.venueId.value !== null" :venue-id="editor.venueId.value" :note="venueNote" removable @remove="editor.setVenue(null)" />
                  <UiButton v-else variant="outline" block icon-left="pin" @click="openPicker('venue')">Выбрать заведение</UiButton>
                </template>
              </UiField>
              <UiText v-if="editor.venueId.value === null" variant="caption" class="create-post__caption">Не нашли заведение? Публиковать можно о заведениях из каталога.</UiText>
            </div>

            <div class="create-post__field create-post__field--links">
              <UiText variant="caption" class="create-post__caption">Связать</UiText>
              <UiCluster :gap="2">
                <UiChip v-if="dish" variant="tag" removable :remove-label="`Убрать блюдо: ${dish.name}`" @remove="editor.menuItemId.value = null">Блюдо: {{ dish.name }} · {{ formatMenuPrice(dish.priceRub) }}</UiChip>
                <UiChip v-else :disabled="editor.venueId.value === null" @click="openPicker('dish')">Блюдо</UiChip>

                <UiChip v-if="event" variant="tag" removable :remove-label="`Убрать событие: ${event.title}`" @remove="editor.eventId.value = null">Событие: {{ event.title }}</UiChip>
                <UiChip v-else :disabled="editor.venueId.value === null" @click="openPicker('event')">Событие</UiChip>

                <UiChip v-if="visit" variant="tag" removable remove-label="Убрать Посещение" @remove="editor.visitId.value = null">Посещение: {{ formatDate(visit.visitedOn) }}</UiChip>
                <UiChip v-else :disabled="editor.venueId.value === null" @click="openPicker('visit')">Посещение</UiChip>

                <UiChip v-if="editor.withRating.value && editor.activeRating.value" variant="tag" removable remove-label="Убрать оценку" @remove="editor.withRating.value = false">Оценка: {{ editor.activeRating.value.value }} из 5</UiChip>
                <UiChip v-else :disabled="editor.venueId.value === null" @click="toggleRating">Оценка</UiChip>
              </UiCluster>
              <p v-if="editor.withRating.value && editor.activeRating.value" class="create-post__rating">
                <UiRating :value="editor.activeRating.value.value" variant="stars" />
                <UiButton size="sm" variant="ghost" @click="editRating">Изменить</UiButton>
              </p>
              <UiText v-if="editor.venueId.value === null" variant="caption" class="create-post__caption">Сначала выберите заведение: блюдо, событие и Посещение относятся к нему.</UiText>
            </div>

            <div class="create-post__field create-post__field--comments">
              <UiSwitch v-model="editor.commentsEnabled.value">Разрешить комментарии</UiSwitch>
            </div>

            <div class="create-post__field create-post__field--submit">
              <UiButton class="create-post__side-submit" block :disabled="!editor.canSubmit.value" @click="submit">{{ submitLabel }}</UiButton>
              <UiText v-if="editor.submitHint.value" variant="caption" class="create-post__caption">{{ editor.submitHint.value }}</UiText>
              <UiButton v-if="editor.postId.value !== null && editor.status.value === 'draft'" variant="ghost" block @click="confirmDelete = true">Удалить черновик</UiButton>
            </div>
          </div>
        </div>
      </template>
    </div>

    <ObjectPickerSheet v-model:open="picker.open" :kind="picker.kind" :venue-id="editor.venueId.value" @pick="onPick" @add-visit="addVisit" />
    <LegalConsentSheet v-model:open="legalOpen" @accept="acceptLegal" @keep-private="keepPrivate" />
    <PostResultSheet v-model:open="resultOpen" :post-id="editor.postId.value" @create-more="createMore" @update:open="afterResult" />
    <ConfirmSheet v-model:open="confirmDelete" title="Удалить черновик?" text="Черновик и фото из него исчезнут, вернуть их будет нельзя." confirm-label="Удалить" @confirm="deleteDraft" />
  </main>
</template>

<style scoped>
.create-post {
  min-height: 100dvh;
  padding-bottom: var(--s-12);
}

.create-post__frame {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
  max-width: 1080px;
  margin: 0 auto;
  padding: var(--s-4) max(var(--s-4), env(safe-area-inset-right)) 0 max(var(--s-4), env(safe-area-inset-left));
}

.create-post__banners {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
}

.create-post__banners:empty {
  display: none;
}

/* Телефон: обе колонки «растворяются», а `order` собирает порядок из ТЗ — видимость, заведение, текст, фото, связи, комментарии. */
.create-post__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-5);
}

.create-post__main,
.create-post__side {
  display: contents;
}

.create-post__field {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
  min-width: 0;
}

.create-post__field--visibility { order: 1; }
.create-post__field--venue { order: 2; }
.create-post__field--text { order: 3; }
.create-post__field--photos { order: 4; }
.create-post__field--links { order: 5; }
.create-post__field--comments { order: 6; }
.create-post__field--rules { order: 7; }
.create-post__field--submit { order: 8; }

.create-post__caption {
  margin: 0;
  color: var(--text-3);
}

.create-post__rules {
  margin: 0;
  color: var(--text-3);
}

.create-post__rating {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  margin: 0;
}

/* «Опубликовать» на телефоне — в шапке, на широком экране — в панели справа. */
@media (max-width: 899.98px) {
  .create-post__side-submit {
    display: none;
  }
}

@media (min-width: 900px) {
  .create-post__bar-submit {
    display: none;
  }

  .create-post__frame {
    gap: var(--s-5);
    padding-top: var(--s-6);
  }

  .create-post__body {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    align-items: start;
    gap: var(--s-8);
  }

  .create-post__main,
  .create-post__side {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--s-5);
    min-width: 0;
  }

  .create-post__side {
    position: sticky;
    top: calc(56px + var(--s-4));
    padding: var(--s-4);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    background: var(--surface);
  }
}
</style>
