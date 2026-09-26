<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { UiBadge, UiButton, UiEmptyState, UiLink, UiScreenBar, UiText } from '@/design-system'
import { AiTeaserAsync } from '@/features/lazy'
import { DishRow, PriceLabel, SectionHeader } from '@/features'
import { PostCard } from '@/features/actions'
import type { PostVenueRef, UserPostCardData } from '@/features/actions'
import { DIETARY_LABEL, MENU_AVAILABILITY_LABEL } from '@/mocks/dictionaries'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { getDishConcept, getMenuItem, similarDishes } from '@/mocks/selectors/menu'
import { getCity, resolveVenueLink } from '@/mocks/selectors/places'
import { getAuthor, postsByMenuItem } from '@/mocks/selectors/social'
import type { VisitorPhoto } from '@/mocks/selectors/social'
import type { MenuItemId } from '@/mocks/types'
import { useCity } from '@/shell/composables/useCity'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { useLibrary } from '@/state/useLibrary'
import OtherCityBanner from './components/OtherCityBanner.vue'
import VenuePhotosSection from './components/VenuePhotosSection.vue'

const route = useRoute()
const { cityId } = useCity()
const { commentsCountOf } = useLibrary()

const idParam = computed(() => String(route.params.id ?? ''))
const link = computed(() => resolveVenueLink(idParam.value, cityId.value))
const venue = computed(() => link.value?.object)

const menuItemId = computed(() => String(route.params.menuItemId ?? '') as MenuItemId)

/*
  §10.4: текущая цена и доступность позиции всегда берутся из структурированного текущего меню (`getMenuItem`),
  а не из старого пользовательского контента. Позиция, принадлежащая другому заведению по ссылке, не показывается.
*/
const item = computed(() => {
  const found = getMenuItem(menuItemId.value)
  return found && venue.value && found.venueId === venue.value.id ? found : undefined
})

useDocumentTitle(() => item.value?.name)

const concept = computed(() => (item.value?.dishConceptId === undefined ? undefined : getDishConcept(item.value.dishConceptId)))
const removed = computed(() => item.value?.availability === 'removed')

const similar = computed(() => (item.value ? similarDishes(item.value.id) : []))
const posts = computed(() => (item.value ? postsByMenuItem(item.value.id) : []))

const photos = computed<readonly VisitorPhoto[]>(() =>
  posts.value.flatMap((post) => post.photos.map((photo): VisitorPhoto => ({ photo, source: { kind: 'post', id: post.id } }))),
)

const venueRef = computed<PostVenueRef | undefined>(() =>
  venue.value ? { id: venue.value.id, name: venue.value.name, rating: venue.value.rating, logo: venue.value.gallery[0] } : undefined,
)

/* Публикации, привязанные к позиции (§10.4): у своей же позиции показываем, о каком заведении речь, а не саму позицию — это и так текущая страница. */
const cards = computed<readonly UserPostCardData[]>(() =>
  posts.value.flatMap((post) => {
    const author = getAuthor(post.authorId)
    if (author === undefined) return []
    return [{ variant: 'user' as const, post, author, ...(venueRef.value ? { venue: venueRef.value } : {}), commentsCount: commentsCountOf(post.id) }]
  }),
)
</script>

<template>
  <main class="menu-item-page">
    <ShellContainer v-if="!venue">
      <UiEmptyState mode="empty" title="Такого заведения нет" description="Возможно, ссылка устарела или адрес введён неверно." page>
        <template #actions>
          <UiButton href="/search" size="lg">Открыть поиск</UiButton>
          <UiButton href="/" variant="outline" size="lg">На главную</UiButton>
        </template>
      </UiEmptyState>
    </ShellContainer>

    <ShellContainer v-else-if="!item">
      <UiEmptyState mode="empty" title="Такой позиции нет" description="Возможно, ссылка устарела или позицию убрали из меню.">
        <template #actions>
          <UiButton :href="`/venue/${venue.id}/menu`" size="lg">К меню заведения</UiButton>
          <UiButton :href="`/venue/${venue.id}`" variant="outline" size="lg">К заведению</UiButton>
        </template>
      </UiEmptyState>
    </ShellContainer>

    <template v-else>
      <UiScreenBar :title="item.name" :back-href="`/venue/${venue.id}/menu`" back-label="К меню" />

      <ShellContainer class="menu-item-page__body">
        <OtherCityBanner v-if="link?.isOtherCity" :city-name="getCity(venue.cityId)?.name ?? ''" />

        <div v-if="item.photo" class="menu-item-page__photo">
          <UiPhotoPlaceholder :photo="item.photo" ratio="4:3" />
        </div>

        <div class="menu-item-page__head">
          <UiLink :href="`/venue/${venue.id}`" variant="muted" icon-left="pin">{{ venue.name }}</UiLink>

          <div class="menu-item-page__badges">
            <UiBadge v-if="item.availability !== 'available'" :variant="removed ? 'danger' : 'warning'">{{ MENU_AVAILABILITY_LABEL[item.availability] }}</UiBadge>
            <UiBadge v-for="tag in item.dietary" :key="tag" variant="neutral" pill>{{ DIETARY_LABEL[tag] }}</UiBadge>
          </div>

          <p v-if="item.description" class="menu-item-page__description">{{ item.description }}</p>
          <p v-if="item.portion" class="menu-item-page__portion">{{ item.portion }}</p>

          <PriceLabel class="menu-item-page__price" kind="menu" :amount-rub="item.priceRub" />

          <p v-if="removed" class="menu-item-page__removed-note">Этой позиции больше нет в текущем меню — страница сохранена по ссылке из старых публикаций.</p>
        </div>

        <section v-if="similar.length > 0" class="menu-item-page__similar" aria-labelledby="menu-item-similar-title">
          <SectionHeader id="menu-item-similar-title" title="Похожие блюда и где ещё есть" :description="concept ? `Другие заведения с «${concept.name}»` : undefined" />
          <div class="menu-item-page__similar-list">
            <DishRow
              v-for="result in similar"
              :key="result.item.id"
              :item="result.item"
              :venue-name="result.venue.name"
              :href="`/venue/${result.venue.id}/menu/${result.item.id}`"
              :heading-level="3"
              deferred
            />
          </div>
        </section>

        <VenuePhotosSection :photos="photos" />

        <section class="menu-item-page__posts" aria-labelledby="menu-item-posts-title">
          <SectionHeader id="menu-item-posts-title" title="Публикации посетителей" />
          <div v-if="cards.length > 0" class="menu-item-page__posts-list">
            <PostCard v-for="card in cards" :key="card.post.id" :data="card" :heading-level="3" />
          </div>
          <UiText v-else variant="body">Посетители ещё не рассказали об этом блюде.</UiText>
        </section>

        <AiTeaserAsync
          context="venue"
          source-surface="menu_item"
          title="Спросите AI об этом блюде"
          description="Что оно из себя представляет, с чем сочетается и в каких ещё заведениях есть похожее."
        />
      </ShellContainer>
    </template>
  </main>
</template>

<style scoped>
.menu-item-page {
  padding-bottom: var(--s-12);
}

.menu-item-page__body {
  display: grid;
  gap: var(--s-8);
  padding-top: var(--s-5);
}

.menu-item-page__photo {
  overflow: hidden;
  border-radius: var(--r-lg);
  aspect-ratio: 4 / 3;
}

@media (min-width: 720px) {
  .menu-item-page__photo {
    aspect-ratio: 16 / 6;
  }
}

.menu-item-page__head {
  display: grid;
  gap: var(--s-3);
  max-width: 640px;
}

.menu-item-page__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

.menu-item-page__description {
  margin: 0;
  color: var(--text-2);
  font-size: 15px;
  line-height: 1.5;
}

.menu-item-page__portion {
  margin: 0;
  color: var(--text-3);
  font-size: 13px;
}

.menu-item-page__price {
  font-size: 20px;
  font-weight: 700;
}

.menu-item-page__removed-note {
  margin: 0;
  padding: var(--s-3);
  background: var(--surface-2);
  border-radius: var(--r-md);
  color: var(--text-2);
  font-size: 13px;
}

.menu-item-page__similar,
.menu-item-page__posts {
  content-visibility: auto;
  contain-intrinsic-size: auto 420px;
}

.menu-item-page__similar-list {
  display: flex;
  flex-direction: column;
}

.menu-item-page__posts-list {
  display: grid;
  gap: var(--s-4);
}

@media (min-width: 720px) {
  .menu-item-page__posts-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
