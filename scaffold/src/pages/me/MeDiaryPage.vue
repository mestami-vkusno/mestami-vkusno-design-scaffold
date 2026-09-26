<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiBadge, UiButton, UiEmptyState, UiIcon, UiIconButton, UiSurface, UiText } from '@/design-system'
import { formatDate } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { getVenue } from '@/mocks/selectors/places'
import type { UserPost } from '@/mocks/types'
import ConfirmSheet from '@/pages/create/components/ConfirmSheet.vue'
import { openEditor, postEditorUrl } from '@/pages/create/links'
import { useLibrary } from '@/state/useLibrary'
import MeActionSheet from './components/MeActionSheet.vue'
import type { MeAction } from './components/MeActionSheet.vue'
import MeList from './components/MeList.vue'
import MeScreen from './components/MeScreen.vue'

/*
  M4 «Дневник» (§4.4, §13.1, §13.2, §20.2, `/me/diary`): приватные записи (`visibility: private`), заведение необязательно. Читает те же
  публикации пользователя, что и редактор CR1 (`useLibrary().diary`); в Ленту и рекомендации записи не попадают, поэтому здесь нет
  счётчиков «нравится» и комментариев. «Редактировать» и «Сделать публичной» открывают редактор с этой записью (публичная проходит
  проверку и, при первой, юридическую настройку A5), «Удалить» — с подтверждением O12.
*/

const router = useRouter()
const library = useLibrary()
const entries = computed(() => library.diary.value)

const menu = ref({ open: false, id: '' })
const confirm = ref({ open: false, id: '' })

const ACTIONS: readonly MeAction[] = [
  { id: 'edit', label: 'Редактировать', icon: 'edit' },
  { id: 'public', label: 'Сделать публичной', icon: 'eye', description: 'Запись пройдёт проверку перед публикацией' },
  { id: 'delete', label: 'Удалить', icon: 'trash', danger: true },
]

function venueName(entry: UserPost): string {
  return entry.venueId === null ? '' : (getVenue(entry.venueId)?.name ?? '')
}

function openMenu(id: string): void {
  menu.value = { open: true, id }
}

function onAction(action: string): void {
  const id = menu.value.id
  if (action === 'edit') openEditor(router, postEditorUrl({ draftId: id }), 'me')
  else if (action === 'public') openEditor(router, postEditorUrl({ draftId: id, visibility: 'public' }), 'me')
  else confirm.value = { open: true, id }
}

function onNew(): void {
  openEditor(router, postEditorUrl({ visibility: 'private' }), 'me')
}

function onDelete(): void {
  library.removePost(confirm.value.id)
}
</script>

<template>
  <MeScreen title="Дневник" guest-text="Войдите, чтобы вести личный дневник: записи о местах видите только вы." priv>
    <template #actions="{ desktop }">
      <UiButton v-if="desktop" variant="outline" size="sm" icon-left="plus" @click="onNew">Новая запись</UiButton>
      <UiIconButton v-else icon="plus" label="Новая запись" variant="plain" @click="onNew" />
    </template>

    <UiEmptyState v-if="entries.length === 0" title="Здесь будут ваши личные записи о местах" description="Их не увидят другие: в Ленту и рекомендации записи дневника не попадают.">
      <template #actions><UiButton @click="onNew">Сделать запись</UiButton></template>
    </UiEmptyState>

    <MeList v-else layout="grid" :min="320">
      <li v-for="entry in entries" :key="entry.id">
        <UiSurface as="article" class="diary-entry">
          <div class="diary-entry__head">
            <UiText variant="caption" class="diary-entry__date">{{ formatDate(entry.createdAt) }}</UiText>
            <div class="diary-entry__badges">
              <UiBadge v-if="entry.status === 'draft'" variant="neutral">Черновик</UiBadge>
              <UiBadge variant="neutral" icon="lock">Только для меня</UiBadge>
            </div>
            <UiIconButton icon="more" label="Действия с записью" variant="plain" size="sm" @click="openMenu(entry.id)" />
          </div>
          <div class="diary-entry__body">
            <p class="diary-entry__text">{{ entry.text || 'Без текста' }}</p>
            <div v-if="entry.photos[0]" class="diary-entry__thumb"><UiPhotoPlaceholder :photo="entry.photos[0]" ratio="4:3" /></div>
          </div>
          <a v-if="venueName(entry)" class="diary-entry__venue" :href="`/venue/${entry.venueId}`"><UiIcon name="pin" :size="14" />{{ venueName(entry) }}</a>
        </UiSurface>
      </li>
    </MeList>

    <MeActionSheet v-model:open="menu.open" title="Действия с записью" :actions="ACTIONS" @select="onAction" />
    <ConfirmSheet v-model:open="confirm.open" title="Удалить запись?" text="Запись исчезнет из Дневника. Это действие нельзя отменить." confirm-label="Удалить" @confirm="onDelete" />
  </MeScreen>
</template>

<style scoped>
.diary-entry {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  padding: var(--s-4);
  content-visibility: auto;
  contain-intrinsic-size: auto 180px;
}

.diary-entry__head {
  display: flex;
  align-items: center;
  gap: var(--s-2);
}

.diary-entry__date {
  color: var(--text-3);
}

.diary-entry__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
  margin-inline-start: auto;
}

.diary-entry__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--s-3);
  align-items: start;
}

.diary-entry__text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  margin: 0;
  overflow-wrap: anywhere;
}

.diary-entry__thumb {
  width: 88px;
  overflow: hidden;
  border-radius: var(--r-md);
}

.diary-entry__venue {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  justify-self: start;
  color: var(--text-2);
  font-size: 13px;
  text-decoration: none;
}
</style>
