<script setup lang="ts">
import { computed } from 'vue'
import { UiListRow, UiSurface } from '@/design-system'
import { useLibrary } from '@/state/useLibrary'

/*
  M1 «Мое (обзор)» (§18, режим «Мое» страницы P1): точки входа в подразделы личной библиотеки, со счётчиком —
  чтобы страница не была пустым меню. M2/M3 (Избранное, Посещения) — задача 0009, M4–M8 (Дневник, Черновики,
  Сохранённое, Оценки и отзывы, Недавно просмотренное) — задача 0013: здесь переход и счётчик, содержимое на их страницах.
*/

const library = useLibrary()

const savedCount = computed(() => library.savedPosts.value.length + library.savedCollections.value.length + library.savedEvents.value.length)
const draftsCount = computed(() => library.drafts.value.posts.length + library.drafts.value.collections.length)

interface OverviewItem {
  id: string
  title: string
  description: string
  icon: 'heart' | 'pin' | 'edit' | 'list' | 'bookmark' | 'star' | 'clock'
  href: string
  count: number
}

const items = computed<OverviewItem[]>(() => [
  { id: 'favorites', title: 'Избранное', description: 'Заведения, которые хотите не забыть', icon: 'heart', href: '/me/favorites', count: library.favorites.value.length },
  { id: 'visits', title: 'Посещения', description: 'Личные записи о том, где вы были', icon: 'pin', href: '/me/visits', count: library.visits.value.length },
  { id: 'diary', title: 'Дневник', description: 'Приватные записи, заведение не обязательно', icon: 'edit', href: '/me/diary', count: library.diary.value.length },
  { id: 'drafts', title: 'Черновики', description: 'Публикации и подборки на модерации или в работе', icon: 'list', href: '/me/drafts', count: draftsCount.value },
  { id: 'saved', title: 'Сохранённое', description: 'Публикации, подборки и события', icon: 'bookmark', href: '/me/saved', count: savedCount.value },
  { id: 'reviews', title: 'Оценки и отзывы', description: 'Что вы оценили и о чём написали', icon: 'star', href: '/me/reviews', count: library.ratings.value.length },
  { id: 'recent', title: 'Недавно просмотренное', description: 'Заведения, события и подборки, куда заглядывали', icon: 'clock', href: '/me/recent', count: library.recentlyViewed.value.length },
])
</script>

<template>
  <UiSurface variant="panel" class="me-overview">
    <UiListRow
      v-for="item in items"
      :key="item.id"
      :title="item.title"
      :description="item.description"
      :icon="item.icon"
      :href="item.href"
      :value="String(item.count)"
      divider
    />
  </UiSurface>
</template>

<style scoped>
.me-overview {
  display: flex;
  flex-direction: column;
  padding: var(--s-2);
}

.me-overview :deep(.ui-list-row--divider:last-child) {
  border-bottom: 0;
}
</style>
