<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiListRow, UiSheet, useToast } from '@/design-system'
import { getAuthor, getPost } from '@/mocks/selectors/social'
import { getVenue } from '@/mocks/selectors/places'
import { postEditorUrl } from '@/pages/create/links'
import ConfirmSheet from '@/pages/create/components/ConfirmSheet.vue'
import { requireAuth } from '@/state/auth-gate'
import * as actions from '@/state/library-actions'
import { VIEWER_ID, isSignedIn } from '@/state/session'
import { useLibrary } from '@/state/useLibrary'
import { openReportContent, type PostMenuRequest } from './useOverlays'

/*
  O10 · Меню публикации (⋯, §12.4, §21.2, §21.5). Чужая: «Не интересно», «Показывать меньше такого», «Скрыть автора»,
  «Скрыть заведение», «Пожаловаться» (→ O9а), «Заблокировать» (→ O12). Своя: «Редактировать», «Комментарии: вкл/выкл»,
  «Сделать приватной» (→ O12), «Удалить» (→ O12). После пункта окно закрывается, публикация уходит из Ленты, тост «Скрыто. Отменить».
  Управление скрытыми и заблокированными — «Настройки → Приватность». Гость: пункты, меняющие списки, ведут на вход (O5).
*/

const props = defineProps<{ request: PostMenuRequest }>()
const open = defineModel<boolean>('open', { required: true })

const router = useRouter()
const library = useLibrary()
const { show } = useToast()

const post = computed(() => library.posts.value.find((item) => item.id === props.request.postId) ?? getPost(props.request.postId))
const author = computed(() => (post.value === undefined ? undefined : getAuthor(post.value.authorId)))
const venue = computed(() => (post.value?.venueId ? getVenue(post.value.venueId) : undefined))
const isMine = computed(() => isSignedIn.value && post.value?.authorId === VIEWER_ID)
const mine = post

type Confirm = 'block' | 'private' | 'delete'
const confirm = ref<{ open: boolean; kind: Confirm }>({ open: false, kind: 'block' })

function gated(): boolean {
  return requireAuth({ actionType: 'hide', objectType: 'post', objectId: props.request.postId })
}

function close(): void {
  open.value = false
}

function notInterested(): void {
  close()
  if (!gated()) return
  const id = props.request.postId
  library.dismissPost(id, true)
  show({ text: 'Скрыто. Публикация больше не показывается в Ленте', action: { label: 'Отменить', onClick: () => void library.dismissPost(id, false) } })
}

function showLess(): void {
  close()
  if (!gated()) return
  show({ text: 'Учтём: такого будет меньше в рекомендациях', variant: 'success' })
}

function hideAuthor(): void {
  close()
  const id = author.value?.id
  if (id === undefined || !gated()) return
  actions.setHiddenAuthor(id, true)
  show({ text: `Скрыто: ${author.value?.displayName ?? 'автор'}`, action: { label: 'Отменить', onClick: () => void actions.setHiddenAuthor(id, false) } })
}

function hideVenue(): void {
  close()
  const id = venue.value?.id
  if (id === undefined || !gated()) return
  actions.setHiddenVenue(id, true)
  show({ text: `Скрыто: ${venue.value?.name ?? 'заведение'}`, action: { label: 'Отменить', onClick: () => void actions.setHiddenVenue(id, false) } })
}

function report(): void {
  close()
  if (post.value === undefined) return
  openReportContent({ kind: 'post', id: post.value.id, title: author.value ? `Публикация: ${author.value.displayName}` : 'Публикация', notify: { kind: 'post', id: post.value.id } })
}

function askConfirm(kind: Confirm): void {
  close()
  if (kind === 'block' && !gated()) return
  confirm.value = { open: true, kind }
}

function edit(): void {
  close()
  if (post.value !== undefined) void router.push(postEditorUrl({ draftId: post.value.id }))
}

function toggleComments(): void {
  close()
  const current = mine.value
  if (current === undefined) return
  const next = !current.commentsEnabled
  library.savePost({ ...current, commentsEnabled: next })
  show({ text: next ? 'Комментарии включены' : 'Комментарии отключены', variant: 'success' })
}

const CONFIRM_TEXT: Record<Confirm, { title: string; text: string; label: string }> = {
  block: { title: 'Заблокировать автора?', text: 'Автор не увидит ваши действия, а подписка на него снимется. После разблокировки она не восстановится.', label: 'Заблокировать' },
  private: { title: 'Сделать публикацию приватной?', text: 'Она исчезнет из публичных мест и останется в вашем Дневнике. Ссылки на неё перестанут работать.', label: 'Сделать приватной' },
  delete: { title: 'Удалить публикацию?', text: 'Публикация исчезнет из публичных мест сразу. Это действие нельзя отменить.', label: 'Удалить' },
}

function onConfirm(): void {
  const id = props.request.postId
  if (confirm.value.kind === 'block') {
    if (author.value !== undefined) library.blockAuthor(author.value.id)
  } else if (confirm.value.kind === 'private') {
    const current = mine.value
    if (current !== undefined) {
      library.savePost({ ...current, visibility: 'private', status: 'published' })
      show({ text: 'Публикация стала приватной', variant: 'success' })
    }
  } else {
    library.removePost(id)
    props.request.onRemoved?.()
  }
}
</script>

<template>
  <UiSheet v-model:open="open" title="Действия с публикацией">
    <div class="post-menu">
      <template v-if="isMine">
        <UiListRow title="Редактировать" icon="edit" :chevron="false" @click="edit" />
        <UiListRow :title="mine?.commentsEnabled === false ? 'Комментарии: включить' : 'Комментарии: отключить'" icon="comment" :chevron="false" @click="toggleComments" />
        <UiListRow v-if="mine?.visibility === 'public'" title="Сделать приватной" icon="lock" :chevron="false" @click="askConfirm('private')" />
        <UiListRow title="Удалить" icon="trash" danger :chevron="false" @click="askConfirm('delete')" />
      </template>
      <template v-else>
        <UiListRow title="Не интересно" icon="close" :chevron="false" @click="notInterested" />
        <UiListRow title="Показывать меньше такого" icon="sparkle" :chevron="false" @click="showLess" />
        <UiListRow v-if="author" :title="`Скрыть автора: ${author.displayName}`" icon="eye" :chevron="false" @click="hideAuthor" />
        <UiListRow v-if="venue" :title="`Скрыть заведение: ${venue.name}`" icon="pin" :chevron="false" @click="hideVenue" />
        <UiListRow title="Пожаловаться" icon="flag" :chevron="false" @click="report" />
        <UiListRow v-if="author" title="Заблокировать" description="Автор не увидит ваши действия, подписка снимется" icon="shield" danger :chevron="false" @click="askConfirm('block')" />
      </template>
    </div>
  </UiSheet>
  <ConfirmSheet v-model:open="confirm.open" :title="CONFIRM_TEXT[confirm.kind].title" :text="CONFIRM_TEXT[confirm.kind].text" :confirm-label="CONFIRM_TEXT[confirm.kind].label" @confirm="onConfirm" />
</template>

<style scoped>
.post-menu {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-1);
}
</style>
