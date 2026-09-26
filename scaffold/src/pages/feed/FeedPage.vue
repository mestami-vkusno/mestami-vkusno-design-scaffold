<script setup lang="ts">
/*
  F1 · Лента (`/feed`). Корневая вкладка: держится в `<KeepAlive>`, поэтому не читает `useRoute()` — сеанс (режим,
  источник, раскрытые «новые публикации») живёт в локальных `ref`, которые не пересоздаются между переходами и
  переживают «Назад» и переключение вкладок (§12.2, §26.3).
*/
import { computed, onMounted, ref } from 'vue'
import { AiTeaser, FollowButton, PostCard } from '@/features/actions'
import type { CollectionPostCardData, PostCardData, UserPostCardData, VenuePostCardData } from '@/features/actions'
import { AuthorRow, CardSkeleton, CollectionCard, HorizontalRail, SectionHeader } from '@/features'
import { UiButton, UiEmptyState, UiSegmented, UiTabs, UiText } from '@/design-system'
import type { OptionItem } from '@/design-system'
import { openPostMenu } from '@/overlays/useOverlays'
import { useAuthGate } from '@/shell/composables/useAuthGate'
import { useCity } from '@/shell/composables/useCity'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { useViewer } from '@/shell/composables/useViewer'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { useLibrary } from '@/state/useLibrary'
import { getEvent } from '@/mocks/selectors/events'
import { getMenuItem } from '@/mocks/selectors/menu'
import { venueLocationLabel, getVenue } from '@/mocks/selectors/places'
import { collectionByline, getCollection, popularCollections } from '@/mocks/selectors/collections'
import { FEED_NEW_POSTS_COUNT, allAuthors, featuredAuthors, getAuthor, getPost, getVenuePost } from '@/mocks/selectors/social'
import type { FeedItem } from '@/mocks/types'

useDocumentTitle('Лента')

const { userId, isSignedIn } = useViewer()
const { requireAuth } = useAuthGate()
const { cityId } = useCity()
const library = useLibrary()

const MODE_ITEMS: readonly OptionItem[] = [
  { id: 'for_you', label: 'Для вас' },
  { id: 'following', label: 'Подписки' },
]
const SOURCE_ITEMS: readonly OptionItem[] = [
  { id: 'all', label: 'Все' },
  { id: 'authors', label: 'Авторы' },
  { id: 'venues', label: 'Заведения' },
]

type FeedMode = 'for_you' | 'following'
type FeedSource = 'all' | 'authors' | 'venues'

// Сеанс Ленты: режим, источник, раскрытые «новые» и то, что уже показывали (§12.2, §26.3).
const mode = ref<FeedMode>('for_you')
const source = ref<FeedSource>('all')

function setMode(next: string): void {
  if (next === 'for_you' || next === 'following') mode.value = next
}

function setSource(next: string): void {
  if (next === 'all' || next === 'authors' || next === 'venues') source.value = next
}
const revealedNew = ref(false)
const loading = ref(true)

onMounted(() => {
  // Первая отрисовка страницы: короткий скелетон, дальше повторные активации (KeepAlive) его не показывают.
  requestAnimationFrame(() => (loading.value = false))
})

interface ResolvedItem {
  readonly key: string
  readonly data: PostCardData
}

function resolveItem(item: FeedItem): ResolvedItem | null {
  if (item.kind === 'user_post') {
    const post = getPost(item.postId)
    const author = post === undefined ? undefined : getAuthor(post.authorId)
    if (post === undefined || author === undefined) return null
    const venue = post.venueId === null ? undefined : getVenue(post.venueId)
    const dish = post.menuItemId === undefined ? undefined : getMenuItem(post.menuItemId)
    const event = post.eventId === undefined ? undefined : getEvent(post.eventId)
    const data: UserPostCardData = {
      variant: 'user',
      post,
      author: { id: author.id, username: author.username, displayName: author.displayName, avatar: author.avatar },
      ...(venue === undefined ? {} : { venue: { id: venue.id, name: venue.name, location: venueLocationLabel(venue), rating: venue.rating } }),
      ...(dish === undefined ? {} : { dish: { id: dish.id, venueId: dish.venueId, name: dish.name } }),
      ...(event === undefined ? {} : { event: { id: event.id, title: event.title } }),
      commentsCount: library.commentsCountOf(post.id),
      ...(userId.value === post.authorId ? { own: true } : {}),
    }
    return { key: item.id, data }
  }
  if (item.kind === 'venue_post') {
    const post = getVenuePost(item.postId)
    const venue = post === undefined ? undefined : getVenue(post.venueId)
    if (post === undefined || venue === undefined) return null
    const event = post.eventId === undefined ? undefined : getEvent(post.eventId)
    const data: VenuePostCardData = {
      variant: 'venue',
      post,
      venue: { id: venue.id, name: venue.name, location: venueLocationLabel(venue), rating: venue.rating, logo: venue.gallery[0] },
      ...(event === undefined ? {} : { event: { id: event.id, title: event.title } }),
    }
    return { key: item.id, data }
  }
  const collection = getCollection(item.collectionId)
  if (collection === undefined) return null
  const author = collection.ownerId === null ? undefined : getAuthor(collection.ownerId)
  const data: CollectionPostCardData = {
    variant: 'collection',
    collection,
    byline: collectionByline(collection),
    ...(author === undefined ? {} : { author: { id: author.id, username: author.username, displayName: author.displayName, avatar: author.avatar } }),
  }
  return { key: item.id, data }
}

const rawItems = computed(() => library.feedItems({ mode: mode.value, source: source.value, cityId: cityId.value }))
const resolvedItems = computed<readonly ResolvedItem[]>(() => rawItems.value.flatMap((item) => { const resolved = resolveItem(item); return resolved === null ? [] : [resolved] }))

// Индикатор «Есть новые публикации» (§12.2): новые записи не вставляются сами. В моке без бэкенда симулируем это,
// придерживая верхушку ленты в состоянии по умолчанию, пока пользователь сам не нажмёт индикатор (assumption).
const canShowNewIndicator = computed(() => mode.value === 'for_you' && source.value === 'all' && resolvedItems.value.length > FEED_NEW_POSTS_COUNT)
const showNewIndicator = computed(() => canShowNewIndicator.value && !revealedNew.value)
const visibleItems = computed(() => (showNewIndicator.value ? resolvedItems.value.slice(FEED_NEW_POSTS_COUNT) : resolvedItems.value))

function revealNew(): void {
  revealedNew.value = true
  const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  window.scrollTo({ top: 0, behavior })
}

// Рекомендательный блок в потоке: не чаще одного на N карточек (§12.1), только авторы, которых ещё не читают.
const RECOMMEND_AFTER = 6
const recommendedAuthors = computed(() => featuredAuthors(cityId.value, 8, userId.value).filter((author) => !library.isFollowingAuthor(author.id)).slice(0, 5))
const showInlineRecommend = computed(() => mode.value === 'for_you' && source.value === 'all' && visibleItems.value.length > RECOMMEND_AFTER && recommendedAuthors.value.length > 0)

const sidebarCollections = computed(() => popularCollections(cityId.value, 2))
// Есть ли хоть одна подписка на автора: список подписок наружу `useLibrary` не отдаёт, только проверку по id.
const hasAnyFollow = computed(() => isSignedIn.value && allAuthors().some((author) => library.isFollowingAuthor(author.id)))

/* Меню публикации (O10): не интересно, скрыть автора или заведение, пожаловаться, заблокировать. */
function onMenu(postId: string): void {
  openPostMenu({ postId })
}

// Гость на «Подписки»: тот же гейт, что у значимых действий (§5.1); после входа он вернётся на `/feed` сам.
function promptSignIn(): void {
  requireAuth({ actionType: 'follow', objectType: 'author', objectId: null, sourceSurface: 'feed' })
}
</script>

<template>
  <main class="feed-page">
    <ShellContainer>
      <h1 class="fx-sr-only">Лента</h1>

      <div class="feed-page__layout">
        <div class="feed-page__main">
          <div class="feed-page__filters">
            <UiTabs :model-value="mode" @update:model-value="setMode" :items="MODE_ITEMS" label="Лента" />
            <UiSegmented class="feed-page__segmented feed-page__segmented--mobile" :model-value="source" @update:model-value="setSource" :items="SOURCE_ITEMS" label="Источник публикаций" />
          </div>

          <div v-if="showNewIndicator" class="feed-page__new">
            <UiButton size="sm" variant="primary" icon-left="refresh" @click="revealNew">
              Есть новые публикации<span class="fx-sr-only">: {{ FEED_NEW_POSTS_COUNT }}</span>
            </UiButton>
          </div>

          <div v-if="loading" class="feed-page__list">
            <CardSkeleton kind="post" :count="3" label="Загрузка ленты" />
          </div>

          <UiEmptyState v-else-if="mode === 'following' && !isSignedIn" mode="guest" title="Войдите, чтобы видеть публикации тех, на кого вы подписаны">
            <template #actions>
              <UiButton variant="primary" @click="promptSignIn">Войти</UiButton>
            </template>
          </UiEmptyState>

          <UiEmptyState
            v-else-if="mode === 'following' && isSignedIn && !hasAnyFollow && visibleItems.length === 0"
            mode="empty"
            title="Вы пока ни на кого не подписаны"
            description="Подпишитесь на авторов и заведения, чтобы видеть их публикации здесь"
          >
            <template #actions>
              <UiButton variant="primary" href="/">Найти авторов</UiButton>
            </template>
          </UiEmptyState>

          <UiEmptyState v-else-if="mode === 'following' && visibleItems.length === 0" mode="empty" title="Пока нет новых публикаций от тех, на кого вы подписаны">
            <template #actions>
              <UiButton variant="outline" @click="mode = 'for_you'">Смотреть «Для вас»</UiButton>
            </template>
          </UiEmptyState>

          <UiEmptyState v-else-if="source === 'venues' && visibleItems.length === 0" mode="empty" title="Заведения из вашего города пока ничего не публиковали" />

          <UiEmptyState v-else-if="visibleItems.length === 0" mode="empty" title="Пока нечего показать" description="Загляните позже — здесь появятся новые публикации" />

          <template v-else>
            <div class="feed-page__list">
              <template v-for="(item, index) in visibleItems" :key="item.key">
                <PostCard :data="item.data" @menu="onMenu" />
                <div v-if="showInlineRecommend && index === RECOMMEND_AFTER - 1" class="feed-page__recommend">
                  <SectionHeader title="Кого читать" :heading-level="2" size="md" />
                  <HorizontalRail label="Кого читать" :item-width="220">
                    <article v-for="author in recommendedAuthors" :key="author.id" class="feed-page__recommend-card">
                      <AuthorRow :author="author" subtitle="Автор" />
                      <FollowButton kind="author" :id="author.id" :name="author.displayName" size="sm" block :origin="{ sourceSurface: 'feed' }" />
                    </article>
                  </HorizontalRail>
                </div>
              </template>
            </div>
            <div class="feed-page__end">
              <UiText variant="caption">Вы посмотрели всё новое</UiText>
              <UiButton variant="neutral" block @click="revealedNew = false">Обновить</UiButton>
            </div>
          </template>
        </div>

        <aside class="feed-page__sidebar" aria-label="Дополнительно">
          <UiSegmented class="feed-page__segmented feed-page__segmented--desktop" :model-value="source" @update:model-value="setSource" :items="SOURCE_ITEMS" label="Источник публикаций" />

          <section v-if="recommendedAuthors.length > 0" class="feed-page__sidebar-block" aria-labelledby="feed-sidebar-authors">
            <UiText id="feed-sidebar-authors" as="h2" variant="h3">Кого читать</UiText>
            <ul class="feed-page__sidebar-authors">
              <li v-for="author in recommendedAuthors.slice(0, 4)" :key="author.id" class="feed-page__sidebar-author">
                <AuthorRow :author="author" subtitle="Автор" />
                <FollowButton kind="author" :id="author.id" :name="author.displayName" size="sm" :origin="{ sourceSurface: 'feed' }" />
              </li>
            </ul>
          </section>

          <section v-if="sidebarCollections.length > 0" class="feed-page__sidebar-block" aria-labelledby="feed-sidebar-collections">
            <UiText id="feed-sidebar-collections" as="h2" variant="h3">Подборки для вас</UiText>
            <div class="feed-page__sidebar-collections">
              <CollectionCard v-for="collection in sidebarCollections" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="tile" :heading-level="3" />
            </div>
          </section>
        </aside>
      </div>

      <AiTeaser context="general" source-surface="feed" class="feed-page__ai" />
    </ShellContainer>
  </main>
</template>

<style scoped>
.feed-page {
  padding-block: var(--s-4) var(--s-12);
}

.feed-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-6);
}

.feed-page__main {
  min-width: 0;
}

.feed-page__filters {
  position: sticky;
  top: 0;
  z-index: 2;
  display: grid;
  gap: var(--s-3);
  padding-block: var(--s-2) var(--s-3);
  background: var(--bg);
}

.feed-page__segmented--desktop {
  display: none;
}

.feed-page__new {
  display: flex;
  justify-content: center;
  padding-bottom: var(--s-3);
}

.feed-page__list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.feed-page__recommend {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  /*
    `contain: layout`, не только `minmax(0, 1fr)`: внутри — HorizontalRail (`.rail__track`, `overflow-x: auto`,
    сетка `grid-auto-flow: column` из карточек по 220px). Несмотря на то что сам `.rail__track` укладывается точно
    в 100% ширины (проверено `getBoundingClientRect`), в собранной версии (build + preview, Chromium) его карточки
    всё равно раздували `document.documentElement.scrollWidth` — минус только `minmax(0, 1fr)` или только
    `overflow: hidden` на самом рельсе не помогали, помогает изоляция через `contain: layout` у прямого обёртчика
    рельса (проверено адресным экспериментом: display:none/overflow-x:hidden/contain — см. отчёт задачи 0010).
  */
  contain: layout;
}

.feed-page__recommend-card {
  display: grid;
  gap: var(--s-3);
  padding: var(--s-3);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  background: var(--surface);
}

.feed-page__end {
  display: grid;
  justify-items: center;
  gap: var(--s-3);
  padding-block: var(--s-6);
  text-align: center;
}

.feed-page__sidebar {
  display: none;
}

.feed-page__sidebar-block {
  display: grid;
  gap: var(--s-3);
}

.feed-page__sidebar-authors {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.feed-page__sidebar-author {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
}

.feed-page__sidebar-collections {
  display: grid;
  gap: var(--s-3);
}

.feed-page__ai {
  margin-top: var(--s-8);
}

@media (min-width: 900px) {
  .feed-page__layout {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    align-items: start;
  }

  .feed-page__segmented--mobile {
    display: none;
  }

  .feed-page__segmented--desktop {
    display: inline-flex;
  }

  .feed-page__sidebar {
    position: sticky;
    top: var(--s-4);
    display: grid;
    gap: var(--s-6);
  }
}
</style>
