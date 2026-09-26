<script setup lang="ts">
/*
  PO1 · Публикация (`/post/:id`). Экран второго уровня, обычная страница (не корневая вкладка), открывается по прямой
  ссылке без предварительного состояния (§22А). Комментарии — на этой же странице, без отдельной шторки O8: список,
  ответы в один уровень и поле ввода встроены и на мобильном, и на десктопе (упрощение относительно схемы дизайнера,
  см. отчёт задачи).
*/
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiBanner, UiBadge, UiButton, UiCluster, UiEmptyState, UiIcon, UiRating, UiSearchInput, UiScreenBar, UiSkeleton, UiStack, UiSurface, UiText } from '@/design-system'
import { AuthorRow, CommentItem, RatingLabel, SectionHeader, ShareButton } from '@/features'
import { FollowButton, LikeButton, SaveButton } from '@/features/actions'
import ActionButton from '@/features/ActionButton/ActionButton.vue'
import type { CommentThread } from '@/mocks/selectors/social'
import { getAuthor, getPost, isPubliclyVisible } from '@/mocks/selectors/social'
import { MODERATION_STATUS_LABEL } from '@/mocks/dictionaries'
import { formatAgo } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { getMenuItem } from '@/mocks/selectors/menu'
import { getEvent } from '@/mocks/selectors/events'
import { getVenue, venueLocationLabel } from '@/mocks/selectors/places'
import { useAuthGate } from '@/shell/composables/useAuthGate'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { useViewer } from '@/shell/composables/useViewer'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { openPostMenu, openReportContent } from '@/overlays/useOverlays'
import { openEditor, postEditorUrl } from '@/pages/create/links'
import { useLibrary } from '@/state/useLibrary'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
onMounted(() => requestAnimationFrame(() => (loading.value = false)))
const { userId, isSignedIn } = useViewer()
const { requireAuth } = useAuthGate()
const library = useLibrary()

const postId = computed(() => String(route.params.id))

// Своя публикация читается из библиотеки (отражает правки и удаление), чужая — из данных мока (§18, README «Состояние мока»).
const ownVersion = computed(() => library.posts.value.find((item) => item.id === postId.value))
const rawPost = computed(() => getPost(postId.value))
const wasMine = computed(() => rawPost.value?.authorId === userId.value)
const deletedByMe = computed(() => wasMine.value && isSignedIn.value && ownVersion.value === undefined)
const post = computed(() => ownVersion.value ?? rawPost.value)
const isMine = computed(() => post.value !== undefined && userId.value !== null && post.value.authorId === userId.value)

const author = computed(() => (post.value === undefined ? undefined : getAuthor(post.value.authorId)))
const blockedAuthor = computed(() => author.value !== undefined && library.isAuthorBlocked(author.value.id))

const available = computed(() => {
  if (deletedByMe.value || post.value === undefined || author.value === undefined || blockedAuthor.value) return false
  return isMine.value || isPubliclyVisible(post.value)
})

useDocumentTitle(computed(() => (available.value && author.value ? `Публикация: ${author.value.displayName}` : 'Публикация')))

const venue = computed(() => (post.value?.venueId ? getVenue(post.value.venueId) : undefined))
const dish = computed(() => (post.value?.menuItemId === undefined ? undefined : getMenuItem(post.value.menuItemId)))
const event = computed(() => (post.value?.eventId === undefined ? undefined : getEvent(post.value.eventId)))

const authorSubtitle = computed(() => (author.value && post.value ? `@${author.value.username} · ${formatAgo(post.value.createdAt)}` : ''))

const isLong = computed(() => (post.value?.text.length ?? 0) > 320)
const expanded = ref(false)

function back(): void {
  if (window.history.length > 1) router.back()
  else void router.push('/feed')
}

/* Меню публикации (O10): для чужой — скрыть, пожаловаться, заблокировать; для своей — редактировать, приватная, удалить (после удаления уходим со страницы). */
function onMore(): void {
  if (post.value === undefined) return
  openPostMenu({ postId: post.value.id, onRemoved: back })
}

/** «Исправить»: свою публикацию с запросом изменений открывает редактор CR1 (задача 0011). */
function onFix(): void {
  if (post.value === undefined) return
  openEditor(router, postEditorUrl({ draftId: post.value.id }), 'post')
}

// ── Комментарии (§14.1–14.2), один уровень: ответ на ответ ложится к тому же родителю (assumption). ──
const threads = computed<readonly CommentThread[]>(() => (post.value === undefined ? [] : library.commentThreads(post.value.id)))
const expandedThreads = ref<Set<string>>(new Set())
const replyTo = ref<{ id: string; name: string } | null>(null)
const commentText = ref('')

function toggleReplies(id: string): void {
  const next = new Set(expandedThreads.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedThreads.value = next
}

function startReply(rootId: string, name: string): void {
  if (!requireAuth({ actionType: 'comment', objectType: 'post', objectId: postId.value, sourceSurface: 'post' })) return
  replyTo.value = { id: rootId, name }
  document.getElementById('comment-field-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function promptCommentSignIn(): void {
  if (post.value === undefined) return
  requireAuth({ actionType: 'comment', objectType: 'post', objectId: post.value.id, sourceSurface: 'post' })
}

function cancelReply(): void {
  replyTo.value = null
}

function submitComment(text: string): void {
  if (post.value === undefined) return
  const trimmed = text.trim()
  if (trimmed === '') return
  if (!requireAuth({ actionType: 'comment', objectType: 'post', objectId: post.value.id, payload: { text: trimmed, ...(replyTo.value ? { parentId: replyTo.value.id } : {}) }, sourceSurface: 'post' })) return
  library.addComment(post.value.id, trimmed, replyTo.value?.id)
  commentText.value = ''
  replyTo.value = null
}

function onCommentMenu(comment: { authorId: string; id: string }): void {
  if (comment.authorId === userId.value) library.deleteComment(comment.id)
  else if (post.value !== undefined) openReportContent({ kind: 'comment', id: comment.id, title: 'Комментарий', notify: { kind: 'post', id: post.value.id } })
}
</script>

<template>
  <main class="post-page">
    <UiScreenBar title="Публикация" @back="back">
      <template #actions>
        <ShareButton v-if="post && available && post.visibility === 'public'" variant="plain" :target="{ kind: 'post', id: post.id, title: author ? `Публикация: ${author.displayName}` : 'Публикация', href: `/post/${post.id}` }" />
        <UiIcon v-if="post && post.visibility === 'private'" name="lock" :size="16" title="Приватная публикация" />
        <button class="post-page__more" type="button" aria-label="Действия с публикацией" @click="onMore">
          <UiIcon name="more" :size="20" />
        </button>
      </template>
    </UiScreenBar>

    <ShellContainer>
      <div v-if="loading" class="post-page__skeleton" role="status" aria-busy="true" aria-label="Загрузка публикации">
        <UiCluster :gap="3" align="center">
          <UiSkeleton variant="circle" :size="40" />
          <UiSkeleton variant="text" width="40%" :height="14" />
        </UiCluster>
        <UiSkeleton ratio="4/3" />
        <UiSkeleton variant="text" :lines="3" :height="14" />
      </div>

      <UiEmptyState v-else-if="!available" mode="empty" title="Публикация недоступна" description="Публикация удалена, скрыта или недоступна для просмотра." page>
        <template #actions>
          <UiButton variant="primary" href="/feed">В ленту</UiButton>
          <UiButton variant="outline" href="/">На главную</UiButton>
        </template>
      </UiEmptyState>

      <div v-else-if="post && author" class="post-page__content">
        <div v-if="isMine" class="post-page__status">
          <UiBadge
            :variant="post.status === 'published' ? 'success' : post.status === 'rejected' || post.status === 'removed_by_admin' ? 'danger' : post.status === 'draft' ? 'neutral' : 'warning'"
          >
            {{ MODERATION_STATUS_LABEL[post.status] }}
          </UiBadge>
          <UiBadge v-if="post.visibility === 'private'" variant="neutral" icon="lock">Приватная</UiBadge>
          <UiBanner v-if="post.moderationNote" variant="warning" title="Комментарий модератора">
            {{ post.moderationNote }}
            <template #action>
              <UiButton size="sm" @click="onFix">{{ post.status === 'rejected' ? 'Подать апелляцию' : 'Исправить' }}</UiButton>
            </template>
          </UiBanner>
        </div>

        <div class="post-page__layout">
          <AuthorRow class="post-page__author" :author="{ id: author.id, username: author.username, displayName: author.displayName, avatar: author.avatar }" size="lg" :subtitle="authorSubtitle">
            <template v-if="!isMine" #action>
              <FollowButton kind="author" :id="author.id" :name="author.displayName" size="sm" :origin="{ sourceSurface: 'post' }" />
            </template>
          </AuthorRow>

          <div class="post-page__media-area">
            <div v-if="post.photos.length === 1" class="post-page__media">
              <UiPhotoPlaceholder :photo="post.photos[0]!" ratio="4:3" />
            </div>
            <div v-else-if="post.photos.length > 1" class="post-page__gallery">
              <div class="post-page__strip">
                <div v-for="(photo, index) in post.photos" :key="index" class="post-page__slide"><UiPhotoPlaceholder :photo="photo" ratio="4:3" /></div>
              </div>
              <UiBadge class="post-page__counter" variant="neutral" pill>{{ post.photos.length }} фото</UiBadge>
            </div>

            <div v-if="post.text" class="post-page__text-wrap">
              <UiText variant="body-lg" class="post-page__text" :class="{ 'post-page__text--clamped': isLong && !expanded }">{{ post.text }}</UiText>
              <button v-if="isLong" class="post-page__expand" type="button" :aria-expanded="expanded" @click="expanded = !expanded">{{ expanded ? 'Свернуть' : 'Ещё' }}</button>
            </div>

            <div v-if="venue || dish || event || post.ratingSnapshot" class="post-page__context">
              <a v-if="venue" class="post-page__ctx" :href="`/venue/${venue.id}`">
                <UiIcon name="pin" :size="16" />
                <span>{{ venue.name }}</span>
                <span class="post-page__ctx-muted">{{ venueLocationLabel(venue) }}</span>
                <RatingLabel :rating="venue.rating" :show-count="false" hide-when-hidden />
              </a>
              <a v-if="dish" class="post-page__ctx" :href="`/venue/${dish.venueId}/menu/${dish.id}`">
                <UiIcon name="list" :size="16" />
                <span>{{ dish.name }}</span>
              </a>
              <a v-if="event" class="post-page__ctx" :href="`/event/${event.id}`">
                <UiIcon name="calendar" :size="16" />
                <span>{{ event.title }}</span>
              </a>
              <span v-if="post.ratingSnapshot" class="post-page__ctx post-page__ctx--static">
                <UiRating :value="post.ratingSnapshot" variant="stars" />
                <span class="post-page__ctx-muted">Оценка на момент публикации</span>
              </span>
            </div>
          </div>

          <UiCluster class="post-page__actions" :gap="1">
            <LikeButton :post-id="post.id" :base-count="post.likesCount" />
            <ActionButton v-if="post.commentsEnabled" icon="comment" label="Комментарии" :count="threads.reduce((sum, t) => sum + 1 + t.replies.length, 0)" />
            <span class="post-page__spacer" />
            <SaveButton kind="post" :id="post.id" :subject="author ? `Публикация: ${author.displayName}` : undefined" />
          </UiCluster>

          <section id="comments" class="post-page__comments" aria-labelledby="comments-title">
            <SectionHeader id="comments-title" :title="`Комментарии${threads.length ? ` · ${threads.reduce((sum, t) => sum + 1 + t.replies.length, 0)}` : ''}`" :heading-level="2" />

            <UiText v-if="!post.commentsEnabled" variant="body" class="post-page__comments-off">Автор отключил комментарии</UiText>
            <template v-else>
              <UiStack v-if="threads.length" :gap="4" class="post-page__threads">
                <CommentItem
                  v-for="thread in threads"
                  :key="thread.comment.id"
                  :comment="thread.comment"
                  :author="getAuthor(thread.comment.authorId) ?? { id: thread.comment.authorId, username: 'user', displayName: 'Пользователь', avatar: { ratio: '1:1', tone: 'slate' } }"
                  :own="thread.comment.authorId === userId"
                  @reply="startReply(thread.comment.id, getAuthor(thread.comment.authorId)?.displayName ?? 'пользователю')"
                  @menu="onCommentMenu(thread.comment)"
                >
                  <template v-if="thread.replies.length" #replies>
                    <UiButton v-if="!expandedThreads.has(thread.comment.id)" variant="ghost" size="sm" @click="toggleReplies(thread.comment.id)">
                      Показать ответы ({{ thread.replies.length }})
                    </UiButton>
                    <template v-else>
                      <CommentItem
                        v-for="reply in thread.replies"
                        :key="reply.id"
                        reply
                        :comment="reply"
                        :author="getAuthor(reply.authorId) ?? { id: reply.authorId, username: 'user', displayName: 'Пользователь', avatar: { ratio: '1:1', tone: 'slate' } }"
                        :own="reply.authorId === userId"
                        @reply="startReply(thread.comment.id, getAuthor(reply.authorId)?.displayName ?? 'пользователю')"
                        @menu="onCommentMenu(reply)"
                      />
                    </template>
                  </template>
                </CommentItem>
              </UiStack>
              <UiText v-else variant="body" class="post-page__comments-empty">Комментариев пока нет. Будьте первым</UiText>

              <p v-if="replyTo" class="post-page__reply-hint">
                Ответ для {{ replyTo.name }}
                <UiButton variant="ghost" size="sm" @click="cancelReply">Отменить</UiButton>
              </p>
              <div v-if="isSignedIn" id="comment-field-wrap">
                <UiSearchInput v-model="commentText" label="Комментарий" placeholder="Написать комментарий…" button-icon="send" button-label="Отправить" @submit="submitComment" />
              </div>
              <UiButton v-else variant="outline" block @click="promptCommentSignIn">Войти, чтобы комментировать</UiButton>
            </template>
          </section>
        </div>
      </div>
    </ShellContainer>
  </main>
</template>

<style scoped>
.post-page {
  padding-bottom: var(--s-12);
}

.post-page__more {
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 0;
  background: none;
  border-radius: var(--r-pill);
  color: var(--text);
  cursor: pointer;
}

.post-page__content {
  display: grid;
  gap: var(--s-4);
  padding-block: var(--s-4);
}

.post-page__status {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

.post-page__layout {
  display: grid;
  gap: var(--s-4);
  min-width: 0;
}

.post-page__media-area {
  display: grid;
  gap: var(--s-4);
  min-width: 0;
}

.post-page__media > :deep(.photo-placeholder) {
  border-radius: var(--r-lg);
}

.post-page__gallery {
  position: relative;
}

.post-page__strip {
  display: flex;
  gap: var(--s-2);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  border-radius: var(--r-lg);
}

.post-page__slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

.post-page__counter {
  position: absolute;
  top: var(--s-2);
  right: var(--s-2);
}

.post-page__text {
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.post-page__text--clamped {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
  overflow: hidden;
}

.post-page__expand {
  min-height: 40px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--text-3);
  font: 500 14px var(--font);
  cursor: pointer;
}

.post-page__context {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

.post-page__ctx {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  min-height: 40px;
  padding: 0 var(--s-3);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-pill);
  color: var(--text);
  font-size: 13px;
  text-decoration: none;
}

.post-page__ctx--static {
  border-color: var(--border);
}

.post-page__ctx-muted {
  color: var(--text-3);
}

.post-page__actions {
  padding-block: var(--s-2);
  border-block: 1px solid var(--border);
}

.post-page__spacer {
  flex: 1;
}

.post-page__comments {
  display: grid;
  gap: var(--s-4);
  content-visibility: auto;
}

.post-page__comments-off,
.post-page__comments-empty {
  color: var(--text-2);
}

.post-page__reply-hint {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  font-size: 13px;
  color: var(--text-2);
}

/* Десктоп (§2.2 схемы): слева медиа/текст/контекст, справа автор, панель действий и встроенные комментарии. */
@media (min-width: 900px) {
  .post-page__layout {
    grid-template-columns: 3fr 2fr;
    grid-template-areas:
      'media author'
      'media actions'
      'media comments';
    align-items: start;
  }

  .post-page__author {
    grid-area: author;
  }

  .post-page__media-area {
    grid-area: media;
  }

  .post-page__actions {
    grid-area: actions;
  }

  .post-page__comments {
    grid-area: comments;
  }
}
</style>
