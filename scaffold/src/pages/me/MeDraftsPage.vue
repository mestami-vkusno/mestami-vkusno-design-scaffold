<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { UiBadge, UiButton, UiEmptyState, UiIconButton, UiSurface, UiTabs, UiText } from '@/design-system'
import type { UiBadgeVariant } from '@/design-system'
import { formatAgo } from '@/mocks/format'
import { MODERATION_STATUS_LABEL } from '@/mocks/dictionaries'
import type { Collection, ModerationStatus, UserPost } from '@/mocks/types'
import ConfirmSheet from '@/pages/create/components/ConfirmSheet.vue'
import { collectionEditorUrl, postEditorUrl } from '@/pages/create/links'
import { useLibrary } from '@/state/useLibrary'
import MeActionSheet from './components/MeActionSheet.vue'
import type { MeAction } from './components/MeActionSheet.vue'
import MeList from './components/MeList.vue'
import MeScreen from './components/MeScreen.vue'

/*
  M5 «Черновики» (§13.4, §26.2, `/me/drafts`): публикации и подборки, автосохранение, статус модерации. Читает то же хранилище, что и
  редакторы CR1/CR2 (`useLibrary().drafts`); строка открывает редактор `?draft=<id>` с восстановлением, «Удалить черновик» — с подтверждением O12.
  Для «Запрошены изменения» и «Отклонено» под строкой причина (её пишет модерация) и «Исправить» / «Подробнее». Смахивание влево не
  делаем: кнопочная альтернатива (`⋯`) обязательна, а жест — только дополнение.
*/

type Tab = 'posts' | 'collections'

const TABS = [
  { id: 'posts', label: 'Публикации' },
  { id: 'collections', label: 'Подборки' },
] as const

const library = useLibrary()
const tab = ref<Tab>('posts')
const posts = computed(() => library.drafts.value.posts)
const collections = computed(() => library.drafts.value.collections)

const menu = ref({ open: false, id: '', kind: 'posts' as Tab })
const confirm = ref({ open: false, id: '', kind: 'posts' as Tab })
const ACTIONS: readonly MeAction[] = [{ id: 'delete', label: 'Удалить черновик', icon: 'trash', danger: true }]

const STATUS_VARIANT: Partial<Record<ModerationStatus, UiBadgeVariant>> = { draft: 'neutral', pending: 'warning', changes_requested: 'warning', rejected: 'danger' }

// «Не отправлено. Нет сети» (§26.2): черновик лежит на устройстве, пока связи нет.
const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
const syncOnline = (): void => void (online.value = navigator.onLine)
onMounted(() => {
  window.addEventListener('online', syncOnline)
  window.addEventListener('offline', syncOnline)
})
onBeforeUnmount(() => {
  window.removeEventListener('online', syncOnline)
  window.removeEventListener('offline', syncOnline)
})

function postTitle(post: UserPost): string {
  const first = post.text.trim().split('\n')[0] ?? ''
  return first === '' ? 'Без названия' : first
}

function collectionTitle(collection: Collection): string {
  return collection.title.trim() === '' ? 'Без названия' : collection.title
}

function openMenu(kind: Tab, id: string): void {
  menu.value = { open: true, id, kind }
}

function onAction(): void {
  confirm.value = { open: true, id: menu.value.id, kind: menu.value.kind }
}

function onDelete(): void {
  if (confirm.value.kind === 'posts') library.removePost(confirm.value.id)
  else library.removeCollection(confirm.value.id)
}
</script>

<template>
  <MeScreen title="Черновики" guest-text="Войдите, чтобы черновики публикаций и подборок сохранялись у вас в кабинете." priv width="narrow">
    <UiTabs v-model="tab" :items="TABS" label="Тип черновика" />

    <template v-if="tab === 'posts'">
      <UiEmptyState v-if="posts.length === 0" title="Черновиков нет" description="Всё, что вы начали, сохраняется здесь автоматически." />
      <MeList v-else>
        <li v-for="post in posts" :key="post.id">
          <UiSurface as="article" class="draft">
            <a class="draft__main" :href="postEditorUrl({ draftId: post.id })">
              <span class="draft__title">{{ postTitle(post) }}</span>
              <UiText variant="caption" class="draft__meta">Изменён {{ formatAgo(post.updatedAt) }}</UiText>
              <span class="draft__badges">
                <UiBadge :variant="STATUS_VARIANT[post.status] ?? 'neutral'">{{ MODERATION_STATUS_LABEL[post.status] }}</UiBadge>
                <UiBadge v-if="post.status === 'draft' && !online" variant="neutral" icon="refresh">Не отправлено. Нет сети</UiBadge>
              </span>
            </a>
            <UiIconButton class="draft__more" icon="more" label="Действия с черновиком" variant="plain" size="sm" @click="openMenu('posts', post.id)" />
            <div v-if="post.moderationNote && (post.status === 'changes_requested' || post.status === 'rejected')" class="draft__note">
              <UiText variant="caption">{{ post.moderationNote }}</UiText>
              <UiButton size="sm" :variant="post.status === 'rejected' ? 'outline' : 'primary'" :href="post.status === 'rejected' ? `/post/${post.id}` : postEditorUrl({ draftId: post.id })">
                {{ post.status === 'rejected' ? 'Подробнее' : 'Исправить' }}
              </UiButton>
            </div>
          </UiSurface>
        </li>
      </MeList>
    </template>

    <template v-else>
      <UiEmptyState v-if="collections.length === 0" title="Черновиков подборок нет" description="Подборка, которую вы начали, сохраняется здесь автоматически.">
        <template #actions><UiButton variant="outline" :href="collectionEditorUrl()">Создать подборку</UiButton></template>
      </UiEmptyState>
      <MeList v-else>
        <li v-for="collection in collections" :key="collection.id">
          <UiSurface as="article" class="draft">
            <a class="draft__main" :href="collectionEditorUrl(collection.id)">
              <span class="draft__title">{{ collectionTitle(collection) }}</span>
              <UiText variant="caption" class="draft__meta">Изменён {{ formatAgo(collection.updatedAt) }} · мест: {{ collection.items.length }}</UiText>
              <span class="draft__badges"><UiBadge variant="neutral">Черновик</UiBadge></span>
            </a>
            <UiIconButton class="draft__more" icon="more" label="Действия с черновиком" variant="plain" size="sm" @click="openMenu('collections', collection.id)" />
          </UiSurface>
        </li>
      </MeList>
    </template>

    <MeActionSheet v-model:open="menu.open" title="Действия с черновиком" :actions="ACTIONS" @select="onAction" />
    <ConfirmSheet
      v-model:open="confirm.open"
      :title="confirm.kind === 'posts' ? 'Удалить черновик?' : 'Удалить черновик подборки?'"
      text="Черновик исчезнет без возможности восстановления."
      confirm-label="Удалить"
      @confirm="onDelete"
    />
  </MeScreen>
</template>

<style scoped>
.draft {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--s-2) var(--s-2);
  padding: var(--s-3) var(--s-3) var(--s-3) var(--s-4);
  content-visibility: auto;
  contain-intrinsic-size: auto 88px;
}

.draft__main {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-1);
  color: inherit;
  text-decoration: none;
}

.draft__title {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.draft__meta {
  color: var(--text-3);
}

.draft__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
}

.draft__note {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  grid-column: 1 / -1;
  justify-content: space-between;
  gap: var(--s-2);
  color: var(--text-2);
}
</style>
