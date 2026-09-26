<script setup lang="ts">
/*
  CR2 · Редактор подборки (`/create/collection`, §17.1, J9). Название, описание, видимость (для каждой подборки отдельно, §20.1),
  заведения с заметками в авторском порядке — «Выше»/«Ниже», без дублей. Автосохранение: закрыл на середине — подборка осталась
  черновиком. «Опубликовать» ведёт на страницу подборки (K1), где её можно «Поделиться».
  Телефон: одна колонка. ≥900 px: слева закреплённые поля и кнопка (`1fr`), справа список заведений (`2fr`).
*/
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiBanner, UiButton, UiEmptyState, UiField, UiInput, UiScreenBar, UiSegmented, UiText, UiTextarea, useToast } from '@/design-system'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { useViewer } from '@/shell/composables/useViewer'
import { report } from '@/state/feedback'
import { useLibrary } from '@/state/useLibrary'
import AutosaveStatus from './components/AutosaveStatus.vue'
import CollectionItemEditor from './components/CollectionItemEditor.vue'
import ConfirmSheet from './components/ConfirmSheet.vue'
import EditorGuest from './components/EditorGuest.vue'
import ObjectPickerSheet, { type PickerKind } from './components/ObjectPickerSheet.vue'
import { closeEditor } from './links'
import { MAX_COLLECTION_DESCRIPTION, MAX_COLLECTION_TITLE, useCollectionEditor } from './useCollectionEditor'

const router = useRouter()
const { isSignedIn } = useViewer()
const library = useLibrary()
const { show } = useToast()
const editor = useCollectionEditor()

const heading = computed(() => (editor.status.value === 'draft' ? 'Новая подборка' : 'Подборка'))
useDocumentTitle(() => heading.value)

const VISIBILITY_ITEMS = [
  { id: 'public', label: 'Публичная' },
  { id: 'private', label: 'Только для меня' },
] as const

const submitLabel = computed(() => (editor.isPublic.value && editor.status.value === 'draft' ? 'Опубликовать' : 'Сохранить'))
const venueIds = computed(() => editor.items.value.map((item) => item.venueId))
const duplicateError = computed(() => (editor.duplicateVenueId.value === null ? '' : 'Это заведение уже в подборке'))
const titleError = ref('')

// ── Выбор объектов (O13): заведение в подборку, блюдо и событие — для строки ──
const picker = ref<{ open: boolean; kind: PickerKind; index: number }>({ open: false, kind: 'venue', index: -1 })
function openPicker(kind: PickerKind, index = -1): void {
  picker.value = { open: true, kind, index }
}
const pickerVenueId = computed(() => editor.items.value[picker.value.index]?.venueId ?? null)
function onPick(id: string): void {
  if (picker.value.kind === 'venue') editor.addVenue(id)
  else if (picker.value.kind === 'dish') editor.patchItem(picker.value.index, { menuItemId: id })
  else if (picker.value.kind === 'event') editor.patchItem(picker.value.index, { eventId: id })
}

const confirmDelete = ref(false)

function submit(): void {
  if (!editor.canSubmit.value) {
    titleError.value = editor.title.value.trim() === '' ? 'Дайте подборке название' : ''
    return
  }
  const id = editor.persist(true)
  if (id === null) return
  const result = library.publishCollection(id)
  if (!result.ok) {
    report(result, '')
    return
  }
  editor.seal()
  show({ text: editor.isPublic.value ? 'Подборка опубликована' : 'Подборка сохранена', variant: 'success' })
  void router.replace(`/collection/${id}`)
}

function deleteCollection(): void {
  const id = editor.collectionId.value
  editor.seal()
  if (id !== null) library.removeCollection(id)
  closeEditor(router, '/collections')
}

function close(): void {
  editor.persist()
  closeEditor(router, '/collections')
}
</script>

<template>
  <main class="create-collection">
    <UiScreenBar :title="heading" back-label="Закрыть" @back="close">
      <template #actions>
        <UiButton class="create-collection__bar-submit" size="sm" :disabled="!editor.canSubmit.value" @click="submit">{{ submitLabel }}</UiButton>
      </template>
    </UiScreenBar>

    <div class="create-collection__frame">
      <EditorGuest v-if="!isSignedIn" title="Войдите, чтобы создавать подборки" description="Черновик сохранится, а после входа вы вернётесь в редактор." />

      <template v-else>
        <AutosaveStatus :state="editor.autosave.value" :restored="editor.restored.value" />

        <div class="create-collection__banners">
          <UiBanner v-if="editor.notFound.value" variant="info" title="Подборка не найдена">Возможно, её удалили. Можно начать новую.</UiBanner>
          <UiBanner v-if="!editor.online.value" variant="warning" title="Нет сети">Черновик сохранён на устройстве. Опубликовать можно, когда связь вернётся.</UiBanner>
        </div>

        <div class="create-collection__body">
          <div class="create-collection__fields">
            <UiField label="Название" :error="titleError">
              <template #default="{ id, describedBy, invalid }">
                <UiInput :id="id" v-model="editor.title.value" :aria-describedby="describedBy" :invalid="invalid" :maxlength="MAX_COLLECTION_TITLE" placeholder="Например, «Завтраки на выходные»" @update:model-value="titleError = ''" />
              </template>
            </UiField>

            <UiField label="Описание (необязательно)">
              <template #default="{ id, describedBy }">
                <UiTextarea :id="id" v-model="editor.description.value" :aria-describedby="describedBy" :max-length="MAX_COLLECTION_DESCRIPTION" :rows="3" :max-rows="8" placeholder="О чём эта подборка?" />
              </template>
            </UiField>

            <div class="create-collection__visibility">
              <UiSegmented v-model="editor.visibility.value" :items="VISIBILITY_ITEMS" label="Видимость" />
              <UiText variant="caption" class="create-collection__caption">{{ editor.visibilityCaption.value }}</UiText>
            </div>

            <div class="create-collection__submit">
              <UiButton class="create-collection__side-submit" block :disabled="!editor.canSubmit.value" @click="submit">{{ submitLabel }}</UiButton>
              <UiText v-if="editor.submitHint.value" variant="caption" class="create-collection__caption">{{ editor.submitHint.value }}</UiText>
            </div>
          </div>

          <section class="create-collection__venues" aria-labelledby="collection-venues-title">
            <div class="create-collection__venues-head">
              <UiText id="collection-venues-title" as="h2" variant="h3">Заведения ({{ editor.items.value.length }})</UiText>
              <UiButton variant="outline" size="sm" icon-left="plus" @click="openPicker('venue')">Добавить заведение</UiButton>
            </div>
            <p v-if="duplicateError" class="create-collection__error" role="alert">{{ duplicateError }}</p>

            <TransitionGroup v-if="editor.items.value.length > 0" name="collection-item" tag="ul" class="create-collection__list">
              <li v-for="(item, index) in editor.items.value" :key="item.venueId" class="create-collection__row">
                <CollectionItemEditor
                  :item="item"
                  :index="index"
                  :count="editor.items.value.length"
                  :flash="editor.duplicateVenueId.value === item.venueId"
                  @move="editor.moveItem(index, $event)"
                  @remove="editor.removeItem(index)"
                  @note="editor.patchItem(index, { note: $event })"
                  @pick-dish="openPicker('dish', index)"
                  @pick-event="openPicker('event', index)"
                  @clear-dish="editor.patchItem(index, { menuItemId: null })"
                  @clear-event="editor.patchItem(index, { eventId: null })"
                />
              </li>
            </TransitionGroup>
            <UiEmptyState v-else mode="empty" icon="list" title="Добавьте первое заведение" description="Подборка — список заведений с вашими заметками, в порядке, который вы выберете." :heading-level="3" />
            <UiButton v-if="editor.collectionId.value !== null" class="create-collection__delete" variant="ghost" block @click="confirmDelete = true">Удалить подборку</UiButton>
          </section>
        </div>
      </template>
    </div>

    <ObjectPickerSheet v-model:open="picker.open" :kind="picker.kind" :venue-id="pickerVenueId" :taken="venueIds" @pick="onPick" />
    <ConfirmSheet v-model:open="confirmDelete" title="Удалить подборку?" text="Подборка и заметки в ней исчезнут, вернуть их будет нельзя. Те, кто её сохранил, потеряют ссылку." confirm-label="Удалить" @confirm="deleteCollection" />
  </main>
</template>

<style scoped>
.create-collection {
  min-height: 100dvh;
  padding-bottom: var(--s-12);
}

.create-collection__frame {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
  max-width: 1080px;
  margin: 0 auto;
  padding: var(--s-4) max(var(--s-4), env(safe-area-inset-right)) 0 max(var(--s-4), env(safe-area-inset-left));
}

.create-collection__banners {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
}

.create-collection__banners:empty {
  display: none;
}

.create-collection__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-5);
}

.create-collection__fields,
.create-collection__visibility,
.create-collection__submit,
.create-collection__venues {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  min-width: 0;
}

.create-collection__fields {
  gap: var(--s-4);
}

.create-collection__caption {
  margin: 0;
  color: var(--text-3);
}

.create-collection__venues-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
}

.create-collection__error {
  margin: 0;
  color: var(--danger);
  font-size: 13px;
}

.create-collection__list {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.create-collection__row {
  min-width: 0;
}

/* Добавление, удаление и перестановка: FLIP на `<TransitionGroup>` — соседи сдвигаются `transform` за `--dur-reflow`, без библиотек. */
.collection-item-enter-active,
.collection-item-leave-active {
  transition:
    opacity var(--dur-modal) var(--ease-out),
    transform var(--dur-modal) var(--ease-out);
}

.collection-item-leave-active {
  position: absolute;
  inset-inline: 0;
}

.collection-item-enter-from {
  opacity: 0;
  transform: translateY(calc(-8px * var(--motion-distance)));
}

.collection-item-leave-to {
  opacity: 0;
  transform: scale(calc(1 - 0.04 * var(--motion-distance)));
}

.collection-item-move {
  transition: transform var(--dur-reflow) var(--ease-out);
}

@media (max-width: 899.98px) {
  .create-collection__side-submit {
    display: none;
  }
}

@media (min-width: 900px) {
  .create-collection__bar-submit {
    display: none;
  }

  .create-collection__frame {
    gap: var(--s-5);
    padding-top: var(--s-6);
  }

  .create-collection__body {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    align-items: start;
    gap: var(--s-8);
  }

  .create-collection__fields {
    position: sticky;
    top: calc(56px + var(--s-4));
    padding: var(--s-4);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    background: var(--surface);
  }
}
</style>
