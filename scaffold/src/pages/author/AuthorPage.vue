<script setup lang="ts">
/*
  U1 · Авторский профиль (`/u/:username`). Обычная страница второго уровня (не корневая вкладка): читает `useRoute()`
  напрямую. Закрытый профиль (§15.2) — отдельное состояние: только аватар, имя, @username и пометка, без вкладок и
  контента; отдельная публично видимая публикация или отзыв остаются доступны в Ленте и по прямой ссылке, но переход
  к автору отсюда всё равно показывает закрытый экран.
*/
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { UiBadge, UiEmptyState, UiTabs } from '@/design-system'
import type { OptionItem } from '@/design-system'
import { CollectionCard, FEATURE_LABELS, PhotoAvatar, ReviewCard, ShareButton } from '@/features'
import type { ReviewVenueRef } from '@/features'
import { FollowButton, PostCard } from '@/features/actions'
import type { PostDishRef, UserPostCardData } from '@/features/actions'
import { formatFollowers, pluralRu } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { getMenuItem } from '@/mocks/selectors/menu'
import { collectionByline } from '@/mocks/selectors/collections'
import { getVenue, venueLocationLabel } from '@/mocks/selectors/places'
import {
  collectionsByAuthor,
  getAuthorByUsername,
  isAuthorClosed,
  photosByAuthor,
  postsByAuthor,
  ratingForReview,
  reviewsByAuthor,
} from '@/mocks/selectors/social'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { useViewer } from '@/shell/composables/useViewer'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { useLibrary } from '@/state/useLibrary'

const route = useRoute()
const { userId } = useViewer()
const library = useLibrary()

const username = computed(() => String(route.params.username ?? ''))
const author = computed(() => getAuthorByUsername(username.value))
const isMine = computed(() => author.value !== undefined && userId.value === author.value.id)
const closed = computed(() => author.value !== undefined && isAuthorClosed(author.value) && !isMine.value)

useDocumentTitle(computed(() => (author.value ? `@${author.value.username}` : 'Профиль автора')))

const followers = computed(() => {
  if (author.value === undefined) return ''
  const count = author.value.followersCount
  const [one, few, many] = FEATURE_LABELS.followersCount
  return `${formatFollowers(count)} ${count >= 1000 ? many : pluralRu(count, one, few, many)}`
})

const TAB_ITEMS: readonly OptionItem[] = [
  { id: 'posts', label: 'Публикации' },
  { id: 'reviews', label: 'Обзоры' },
  { id: 'photos', label: 'Фото' },
  { id: 'collections', label: 'Подборки' },
]
type TabId = 'posts' | 'reviews' | 'photos' | 'collections'
const tab = ref<TabId>('posts')
// Смена профиля (переход между авторами по ссылке) возвращает на первую вкладку.
watch(username, () => { tab.value = 'posts' })
function setTab(next: string): void {
  if (next === 'posts' || next === 'reviews' || next === 'photos' || next === 'collections') tab.value = next
}

function dishRef(menuItemId: string | undefined): PostDishRef | undefined {
  if (menuItemId === undefined) return undefined
  const item = getMenuItem(menuItemId)
  return item === undefined ? undefined : { id: item.id, venueId: item.venueId, name: item.name, removed: item.availability === 'removed' }
}

const posts = computed<readonly UserPostCardData[]>(() => {
  if (author.value === undefined) return []
  return postsByAuthor(author.value.id).map((post) => ({
    variant: 'user' as const,
    post,
    author: author.value!,
    ...(dishRef(post.menuItemId) ? { dish: dishRef(post.menuItemId)! } : {}),
    commentsCount: library.commentsCountOf(post.id),
    ...(isMine.value ? { own: true } : {}),
  }))
})

const reviews = computed(() => (author.value === undefined ? [] : reviewsByAuthor(author.value.id)))
function reviewVenue(venueId: string): ReviewVenueRef | undefined {
  const venue = getVenue(venueId)
  return venue === undefined ? undefined : { id: venue.id, name: venue.name, photo: venue.gallery[0], subtitle: venueLocationLabel(venue) }
}

const photos = computed(() => (author.value === undefined ? [] : photosByAuthor(author.value.id)))
const collections = computed(() => (author.value === undefined ? [] : collectionsByAuthor(author.value.id)))
</script>

<template>
  <main class="author-page">
    <ShellContainer v-if="author === undefined">
      <UiEmptyState mode="empty" title="Такого автора нет" description="Возможно, ссылка устарела или адрес введён неверно." page>
        <template #actions>
          <a href="/feed">В ленту</a>
        </template>
      </UiEmptyState>
    </ShellContainer>

    <ShellContainer v-else class="author-page__body">
      <header class="author-page__head">
        <PhotoAvatar :photo="author.avatar" :name="author.displayName" size="xl" decorative />
        <div class="author-page__identity">
          <h1 class="author-page__name">{{ author.displayName }}</h1>
          <p class="author-page__username">@{{ author.username }}</p>
          <UiBadge v-if="closed" variant="neutral" pill icon="lock">{{ FEATURE_LABELS.closedProfile }}</UiBadge>
          <template v-else>
            <p v-if="author.about" class="author-page__about">{{ author.about }}</p>
            <p class="author-page__followers">{{ followers }}</p>
          </template>
        </div>
        <div class="author-page__actions">
          <ShareButton variant="plain" :target="{ kind: 'author', id: author.id, title: author.displayName, href: `/u/${author.username}` }" />
          <FollowButton v-if="!isMine" kind="author" :id="author.id" :name="author.displayName" :origin="{ sourceSurface: 'author' }" />
          <UiBadge v-if="isMine" variant="neutral">Это вы</UiBadge>
        </div>
      </header>

      <!-- Закрытый профиль (§15.2): дальше ничего не показываем — ни вкладок, ни списков. -->
      <UiEmptyState v-if="closed" mode="empty" title="Этот профиль закрыт" description="Автор ограничил доступ к публикациям, обзорам, фото и подборкам." />

      <template v-else>
        <UiTabs class="author-page__tabs" :model-value="tab" @update:model-value="setTab" :items="TAB_ITEMS" label="Разделы профиля" />

        <section v-if="tab === 'posts'" aria-label="Публикации">
          <div v-if="posts.length > 0" class="author-page__posts">
            <PostCard v-for="card in posts" :key="card.post.id" :data="card" :heading-level="2" />
          </div>
          <UiEmptyState v-else mode="empty" title="Публикаций пока нет" />
        </section>

        <section v-else-if="tab === 'reviews'" aria-label="Обзоры">
          <div v-if="reviews.length > 0" class="author-page__reviews">
            <ReviewCard
              v-for="review in reviews"
              :key="review.id"
              :review="review"
              :rating="ratingForReview(review)?.value ?? null"
              :author="author"
              :venue="reviewVenue(review.venueId)"
              :own="isMine"
              deferred
            />
          </div>
          <UiEmptyState v-else mode="empty" title="Обзоров пока нет" />
        </section>

        <section v-else-if="tab === 'photos'" aria-label="Фото">
          <ul v-if="photos.length > 0" class="author-page__photos" :aria-label="`Фото: ${photos.length}`">
            <li v-for="(item, index) in photos" :key="index" class="author-page__photo">
              <UiPhotoPlaceholder :photo="item.photo" ratio="1:1" />
            </li>
          </ul>
          <UiEmptyState v-else mode="empty" title="Фото пока нет" />
        </section>

        <section v-else aria-label="Подборки">
          <div v-if="collections.length > 0" class="author-page__collections">
            <CollectionCard v-for="collection in collections" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="tile" :heading-level="3" />
          </div>
          <UiEmptyState v-else mode="empty" title="Подборок пока нет" />
        </section>
      </template>
    </ShellContainer>
  </main>
</template>

<style scoped>
.author-page {
  padding-bottom: var(--s-12);
}

.author-page__body {
  padding-top: var(--s-5);
}

.author-page__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--s-3) var(--s-4);
  align-items: start;
  margin-bottom: var(--s-6);
}

.author-page__identity {
  display: grid;
  gap: var(--s-1);
  min-width: 0;
}

.author-page__name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
}

.author-page__username,
.author-page__followers {
  margin: 0;
  color: var(--text-3);
  font-size: 14px;
}

.author-page__about {
  margin: var(--s-1) 0 0;
  color: var(--text-2);
  font-size: 14px;
  line-height: 1.45;
}

.author-page__actions {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: var(--s-2);
}

.author-page__tabs {
  margin-bottom: var(--s-5);
}

.author-page__posts,
.author-page__reviews {
  display: grid;
  gap: var(--s-4);
  content-visibility: auto;
  contain-intrinsic-size: auto 640px;
}

.author-page__collections {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--s-4);
  content-visibility: auto;
  contain-intrinsic-size: auto 320px;
}

.author-page__photos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--s-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.author-page__photo {
  overflow: hidden;
  border-radius: var(--r-md);
}

@media (min-width: 720px) {
  .author-page__posts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .author-page__photos {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 640px) {
  .author-page__head {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .author-page__actions {
    grid-column: auto;
  }
}
</style>
