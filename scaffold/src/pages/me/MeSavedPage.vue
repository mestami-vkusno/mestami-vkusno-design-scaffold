<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiBadge, UiButton, UiEmptyState, UiTabs } from '@/design-system'
import { CollectionCard, EventCard } from '@/features'
import { PostCard, SaveButton } from '@/features/actions'
import type { PostCardData } from '@/features/actions'
import { collectionByline, isCollectionPublic } from '@/mocks/selectors/collections'
import { getVenue, venueLocationLabel } from '@/mocks/selectors/places'
import { getAuthor } from '@/mocks/selectors/social'
import type { UserPost } from '@/mocks/types'
import { useLibrary } from '@/state/useLibrary'
import MeList from './components/MeList.vue'
import MeScreen from './components/MeScreen.vue'

/*
  M6 «Сохранённое» (§14.2, §17.3, §18, §11.4, `/me/saved`): публикации, подборки и события, которые пользователь сохранил. Сохранение — ссылка,
  а не копия: подборка, которая перестала быть публичной, остаётся в списке с пометкой «Недоступна» и кнопкой «Убрать из сохранённых»;
  событие — с пометкой «Перенесено», «Отменено» или «Места закончились» (её рисует сама карточка). Кто сохранил, публично не раскрывается.
*/

type Tab = 'posts' | 'collections' | 'events'

const TABS = [
  { id: 'posts', label: 'Публикации' },
  { id: 'collections', label: 'Подборки' },
  { id: 'events', label: 'События' },
] as const

const library = useLibrary()
const tab = ref<Tab>('posts')

function postData(post: UserPost): PostCardData | null {
  const author = getAuthor(post.authorId)
  if (author === undefined) return null
  const venue = post.venueId === null ? undefined : getVenue(post.venueId)
  return {
    variant: 'user',
    post,
    author: { id: author.id, username: author.username, displayName: author.displayName, avatar: author.avatar },
    ...(venue === undefined ? {} : { venue: { id: venue.id, name: venue.name, location: venueLocationLabel(venue), rating: venue.rating } }),
    commentsCount: library.commentsCountOf(post.id),
  }
}

const posts = computed(() => library.savedPosts.value.flatMap((post) => postData(post) ?? []))
const collections = computed(() => library.savedCollections.value)
const events = computed(() =>
  library.savedEvents.value.map((event) => {
    const venue = getVenue(event.venueId)
    return { event, venueName: venue?.name, location: venue === undefined ? undefined : venueLocationLabel(venue) }
  }),
)
</script>

<template>
  <MeScreen title="Сохранённое" guest-text="Войдите, чтобы сохранять публикации, подборки и события и возвращаться к ним." priv>
    <UiTabs v-model="tab" :items="TABS" label="Что сохранено" />

    <template v-if="tab === 'posts'">
      <UiEmptyState v-if="posts.length === 0" title="Публикации, которые вы сохраните, будут здесь" description="Нажмите закладку на публикации в Ленте.">
        <template #actions><UiButton variant="outline" href="/feed">Открыть Ленту</UiButton></template>
      </UiEmptyState>
      <MeList v-else layout="grid" :min="360">
        <li v-for="item in posts" :key="item.variant === 'user' ? item.post.id : ''"><PostCard :data="item" :heading-level="3" deferred /></li>
      </MeList>
    </template>

    <template v-else-if="tab === 'collections'">
      <UiEmptyState v-if="collections.length === 0" title="Подборки, которые вы сохраните, будут здесь" description="Подборка сохраняется ссылкой: изменения автора вы увидите сразу.">
        <template #actions><UiButton variant="outline" href="/collections">Открыть подборки</UiButton></template>
      </UiEmptyState>
      <MeList v-else layout="grid" :min="240">
        <li v-for="collection in collections" :key="collection.id" class="saved-item">
          <CollectionCard :collection="collection" :byline="collectionByline(collection)" :heading-level="3" deferred />
          <div v-if="!isCollectionPublic(collection)" class="saved-item__unavailable">
            <UiBadge variant="warning">Недоступна</UiBadge>
            <UiButton size="sm" variant="outline" @click="library.toggleSaveCollection(collection.id)">Убрать из сохранённых</UiButton>
          </div>
        </li>
      </MeList>
    </template>

    <template v-else>
      <UiEmptyState v-if="events.length === 0" title="События, которые вы сохраните, будут здесь" description="Сохраните событие в Афише, и мы сообщим, если его перенесут или отменят.">
        <template #actions><UiButton variant="outline" href="/events">Открыть Афишу</UiButton></template>
      </UiEmptyState>
      <MeList v-else layout="grid" :min="240">
        <li v-for="item in events" :key="item.event.id">
          <EventCard :event="item.event" :venue-name="item.venueName" :location="item.location" :heading-level="3" deferred>
            <template #action><SaveButton kind="event" :id="item.event.id" :subject="item.event.title" variant="overlay" /></template>
          </EventCard>
        </li>
      </MeList>
    </template>
  </MeScreen>
</template>

<style scoped>
.saved-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
}

.saved-item__unavailable {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2);
}
</style>
