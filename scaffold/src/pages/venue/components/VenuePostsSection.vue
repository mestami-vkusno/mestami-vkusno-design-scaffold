<script setup lang="ts">
import { computed } from 'vue'
import { UiText } from '@/design-system'
import { SectionHeader } from '@/features'
import { PostCard } from '@/features/actions'
import type { PostDishRef, UserPostCardData } from '@/features/actions'
import { getAuthor } from '@/mocks/selectors/social'
import { getMenuItem } from '@/mocks/selectors/menu'
import { useLibrary } from '@/state/useLibrary'
import type { AuthorId, UserPost } from '@/mocks/types'

const props = defineProps<{ posts: readonly UserPost[]; viewerId: AuthorId | null }>()
const { commentsCountOf } = useLibrary()

function dishRef(post: UserPost): PostDishRef | undefined {
  if (post.menuItemId === undefined) return undefined
  const item = getMenuItem(post.menuItemId)
  return item === undefined ? undefined : { id: item.id, venueId: item.venueId, name: item.name, removed: item.availability === 'removed' }
}

const cards = computed<readonly UserPostCardData[]>(() =>
  props.posts.flatMap((post): UserPostCardData[] => {
    const author = getAuthor(post.authorId)
    if (author === undefined) return []
    const dish = dishRef(post)
    return [
      {
        variant: 'user',
        post,
        author,
        ...(dish ? { dish } : {}),
        commentsCount: commentsCountOf(post.id),
        own: post.authorId === props.viewerId,
      },
    ]
  }),
)
</script>

<template>
  <section class="venue-posts" aria-labelledby="venue-posts-title">
    <SectionHeader id="venue-posts-title" title="Публикации посетителей" />
    <div v-if="cards.length > 0" class="venue-posts__list">
      <PostCard v-for="card in cards" :key="card.post.id" :data="card" :heading-level="3" />
    </div>
    <UiText v-else variant="body">Посетители ещё не рассказали об этом месте.</UiText>
  </section>
</template>

<style scoped>
.venue-posts {
  content-visibility: auto;
  contain-intrinsic-size: auto 620px;
}

.venue-posts__list {
  display: grid;
  gap: var(--s-4);
}

@media (min-width: 720px) {
  .venue-posts__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
