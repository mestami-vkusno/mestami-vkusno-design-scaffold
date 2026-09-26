<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiChip, UiCluster, UiSearchInput, UiSegmented, UiText } from '@/design-system'
import {
  AuthorCard,
  CardSkeleton,
  CollectionCard,
  EventCard,
  HorizontalRail,
  SectionHeader,
  VenueCard,
} from '@/features'
import { PostCard } from '@/features/actions'
import type { PostCardData } from '@/features/actions'
import { AiTeaserAsync, FavoriteButtonAsync, FollowButtonAsync, SaveButtonAsync } from '@/features/lazy'
import { collectionByline } from '@/mocks/selectors/collections'
import { homeModules, type HomeModules } from '@/mocks/selectors/home'
import { getVenue, venueLocationLabel } from '@/mocks/selectors/places'
import { getAuthor, commentsCount } from '@/mocks/selectors/social'
import type { UserPost, VenuePost, VenueTag } from '@/mocks/types'
import { useCity } from '@/shell/composables/useCity'
import { useViewer } from '@/shell/composables/useViewer'
import ShellContainer from '@/shell/components/ShellContainer.vue'

/*
  H1 · Главная (§7.1). Корневая вкладка (`keepAlive`): не читает `useRoute()`, ни разу и нигде — переход внутрь
  идёт через query у Поиска, а состояние самой Главной (день Афиши) не переживает уход со страницы и это не
  требуется (§26.3 касается только Поиска). Модули не обязаны быть все сразу: пустые скрываются целиком —
  «Рекомендуем вам» у гостя и без Избранного останется пустым, а Главная — рабочей (§20.3).
*/
const router = useRouter()
const { city, cityId } = useCity()
const { userId, isSignedIn } = useViewer()

const heroQuery = ref('')
const ready = ref(false)
const afishaDay = ref<'today' | 'tomorrow' | 'weekend'>('today')

const modules = computed<HomeModules>(() => homeModules(cityId.value, userId.value))

onMounted(() => {
  window.setTimeout(() => (ready.value = true), 300)
})
// Возврат на вкладку: короткую имитацию загрузки не повторяем, контент уже есть.
onActivated(() => (ready.value = true))

function submitHeroSearch(query: string): void {
  const q = query.trim()
  void router.push({ path: '/search', query: q ? { q } : {} })
}

const AFISHA_DAYS = [
  { id: 'today', label: 'Сегодня' },
  { id: 'tomorrow', label: 'Завтра' },
  { id: 'weekend', label: 'Выходные' },
]

function quickFilterHref(filter: HomeModules['quickFilters'][number]): string {
  if (filter.kind === 'open_now') return '/search?mode=catalog&open=1'
  if (filter.kind === 'nearby') return '/search?mode=catalog'
  return `/search?mode=catalog&tags=${filter.value}`
}

function venuePostData(post: VenuePost): PostCardData | null {
  const venue = getVenue(post.venueId)
  if (venue === undefined) return null
  return {
    variant: 'venue',
    post,
    venue: { id: venue.id, name: venue.name, location: venueLocationLabel(venue), rating: venue.rating },
  }
}

function userPostData(post: UserPost): PostCardData | null {
  const author = getAuthor(post.authorId)
  if (author === undefined) return null
  const venue = post.venueId === null ? undefined : getVenue(post.venueId)
  return {
    variant: 'user',
    post,
    author: { id: author.id, username: author.username, displayName: author.displayName, avatar: author.avatar },
    venue: venue === undefined ? undefined : { id: venue.id, name: venue.name, location: venueLocationLabel(venue), rating: venue.rating },
    commentsCount: commentsCount(post.id),
    own: isSignedIn.value && post.authorId === userId.value,
  }
}
</script>

<template>
  <main class="home-page">
    <ShellContainer>
      <section class="home-page__hero" aria-label="Поиск заведений и быстрые фильтры">
        <h1 class="home-page__title"><span class="home-page__title-line">Открывайте</span><span class="home-page__title-accent">вкусный город</span></h1>
        <p class="home-page__subtitle">Рестораны, кафе, бары и события — в одном гастрономическом гиде {{ city.name }}</p>
        <UiSearchInput
          v-model="heroQuery"
          label="Поиск заведений, кухонь и блюд"
          placeholder="Найти ресторан, кухню или блюдо…"
          @submit="submitHeroSearch"
        />
        <div class="home-page__quick">
          <UiChip v-for="filter in modules.quickFilters" :key="filter.id" @click="router.push(quickFilterHref(filter))">{{ filter.label }}</UiChip>
        </div>
      </section>

      <div v-if="!ready" class="home-page__sections">
        <CardSkeleton kind="venue" :count="4" label="Загружаем главную" />
      </div>

      <div v-else class="home-page__sections">
        <section v-if="modules.whereToGo.length > 0" aria-labelledby="home-where">
          <SectionHeader id="home-where" title="Куда сходить" size="lg" href="/search?mode=catalog&sort=rating" :heading-level="2" />
          <HorizontalRail label="Куда сходить">
            <VenueCard v-for="venue in modules.whereToGo" :key="venue.id" :venue="venue" :location="venueLocationLabel(venue)">
              <template #action><FavoriteButtonAsync :venue-id="venue.id" :subject="venue.name" /></template>
            </VenueCard>
          </HorizontalRail>
        </section>

        <section v-if="modules.recommended.length > 0" aria-labelledby="home-recommended">
          <SectionHeader id="home-recommended" title="Рекомендуем вам" size="lg" href="/search?mode=catalog" :heading-level="2" />
          <HorizontalRail label="Рекомендуем вам">
            <VenueCard v-for="venue in modules.recommended" :key="venue.id" :venue="venue" :location="venueLocationLabel(venue)">
              <template #action><FavoriteButtonAsync :venue-id="venue.id" :subject="venue.name" /></template>
            </VenueCard>
          </HorizontalRail>
        </section>

        <section v-if="modules.collections.length > 0" aria-labelledby="home-collections">
          <SectionHeader id="home-collections" title="Подборки для любого повода" size="lg" href="/collections" :heading-level="2" />
          <HorizontalRail label="Подборки для любого повода" :item-width="220">
            <CollectionCard v-for="collection in modules.collections" :key="collection.id" :collection="collection" :byline="collectionByline(collection)">
              <template #action><SaveButtonAsync kind="collection" :id="collection.id" :subject="collection.title" variant="overlay" /></template>
            </CollectionCard>
          </HorizontalRail>
        </section>

        <section v-if="modules.venueNews.length > 0" aria-labelledby="home-news">
          <SectionHeader id="home-news" title="Что нового у заведений" size="lg" href="/feed" :heading-level="2" />
          <HorizontalRail label="Что нового у заведений" :item-width="320">
            <template v-for="post in modules.venueNews" :key="post.id">
              <PostCard v-if="venuePostData(post)" :data="venuePostData(post)!" />
            </template>
          </HorizontalRail>
        </section>

        <section v-if="modules.afisha.today.length + modules.afisha.tomorrow.length + modules.afisha.weekend.length > 0" aria-labelledby="home-afisha">
          <UiCluster justify="between" align="baseline" class="home-page__afisha-head">
            <UiText id="home-afisha" as="h2" variant="h3">Что происходит в городе</UiText>
            <UiSegmented :items="AFISHA_DAYS" label="День" v-model="afishaDay" />
          </UiCluster>
          <HorizontalRail label="Афиша" aria-labelledby="home-afisha">
            <EventCard v-for="item in modules.afisha[afishaDay]" :key="item.event.id" :event="item.event" :occurrence="item.occurrence" :venue-name="getVenue(item.event.venueId)?.name" :location="getVenue(item.event.venueId) && venueLocationLabel(getVenue(item.event.venueId)!)">
              <template #action><SaveButtonAsync kind="event" :id="item.event.id" :subject="item.event.title" variant="overlay" /></template>
            </EventCard>
          </HorizontalRail>
          <div class="home-page__afisha-link"><a href="/events" class="home-page__afisha-all">Вся афиша →</a></div>
        </section>

        <section v-if="modules.fromVisitors.length > 0" aria-labelledby="home-visitors">
          <SectionHeader id="home-visitors" title="От посетителей" size="lg" href="/feed" :heading-level="2" />
          <HorizontalRail label="От посетителей" :item-width="320">
            <template v-for="post in modules.fromVisitors" :key="post.id">
              <PostCard v-if="userPostData(post)" :data="userPostData(post)!" />
            </template>
          </HorizontalRail>
        </section>

        <section v-if="modules.newPlaces.length > 0" aria-labelledby="home-new-places">
          <SectionHeader id="home-new-places" title="Новые места" size="lg" href="/search?mode=catalog" :heading-level="2" />
          <HorizontalRail label="Новые места">
            <VenueCard v-for="venue in modules.newPlaces" :key="venue.id" :venue="venue" :location="venueLocationLabel(venue)">
              <template #action><FavoriteButtonAsync :venue-id="venue.id" :subject="venue.name" /></template>
            </VenueCard>
          </HorizontalRail>
        </section>

        <section aria-labelledby="home-ai">
          <h2 id="home-ai" class="fx-sr-only">ИИ Премиум</h2>
          <AiTeaserAsync context="general" source-surface="home" />
        </section>

        <section v-if="modules.authors.length > 0" aria-labelledby="home-authors">
          <SectionHeader id="home-authors" title="Авторы" size="lg" :heading-level="2" />
          <HorizontalRail label="Авторы" :item-width="240">
            <AuthorCard v-for="author in modules.authors" :key="author.id" :author="author">
              <template #action><FollowButtonAsync kind="author" :id="author.id" :name="author.displayName" /></template>
            </AuthorCard>
          </HorizontalRail>
        </section>

        <section v-if="isSignedIn && modules.recentlyViewed.length > 0" aria-labelledby="home-recent">
          <SectionHeader id="home-recent" title="Недавно просмотренное" size="lg" href="/me/recent" :heading-level="2" />
          <HorizontalRail label="Недавно просмотренное">
            <template v-for="item in modules.recentlyViewed" :key="`${item.kind}-${item.id}`">
              <VenueCard v-if="item.kind === 'venue' && getVenue(item.id)" :venue="getVenue(item.id)!" :location="venueLocationLabel(getVenue(item.id)!)" />
            </template>
          </HorizontalRail>
        </section>
      </div>
    </ShellContainer>
  </main>
</template>

<style scoped>
.home-page {
  padding-block: var(--s-6) var(--s-12);
}

.home-page__hero {
  display: grid;
  gap: var(--s-4);
  margin-bottom: var(--s-8);
}

.home-page__title {
  display: flex;
  flex-direction: column;
  margin: 0;
  font-size: clamp(28px, 6vw, 44px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.home-page__title-accent {
  color: var(--accent-fg);
}

.home-page__subtitle {
  margin: 0;
  max-width: 560px;
  color: var(--text-2);
  font-size: 15px;
  line-height: 1.5;
}

.home-page__quick {
  display: flex;
  flex-wrap: nowrap;
  gap: var(--s-2);
  overflow-x: auto;
  margin-inline: calc(var(--s-4) * -1);
  padding-inline: var(--s-4);
  scrollbar-width: none;
}

.home-page__quick::-webkit-scrollbar {
  display: none;
}

.home-page__sections {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-10);
}

.home-page__sections > section {
  content-visibility: auto;
  contain-intrinsic-size: auto 420px;
}

.home-page__afisha-head {
  margin-bottom: var(--s-4);
}

.home-page__afisha-link {
  margin-top: var(--s-3);
  text-align: right;
}

.home-page__afisha-all {
  color: var(--accent-fg);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}

@media (hover: hover) and (pointer: fine) {
  .home-page__afisha-all:hover {
    text-decoration: underline;
  }
}
</style>
