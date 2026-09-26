<script setup lang="ts">
import { computed } from 'vue'
import { HorizontalRail, SectionHeader } from '@/features'
import { PostCard } from '@/features/actions'
import type { PostVenueRef, VenuePostCardData } from '@/features/actions'
import { getEvent } from '@/mocks/selectors/events'
import type { Venue, VenuePost } from '@/mocks/types'

const props = defineProps<{ venue: Venue; posts: readonly VenuePost[] }>()

const venueRef = computed<PostVenueRef>(() => ({ id: props.venue.id, name: props.venue.name, rating: props.venue.rating, logo: props.venue.gallery[0] }))

function cardData(post: VenuePost): VenuePostCardData {
  const event = post.eventId === undefined ? undefined : getEvent(post.eventId)
  return { variant: 'venue', post, venue: venueRef.value, ...(event ? { event: { id: event.id, title: event.title } } : {}) }
}
</script>

<template>
  <section v-if="posts.length > 0" class="venue-content" aria-labelledby="venue-content-title">
    <SectionHeader id="venue-content-title" title="Контент заведения" />
    <HorizontalRail label="Контент заведения" :item-width="320">
      <PostCard v-for="post in posts" :key="post.id" :data="cardData(post)" :heading-level="3" />
    </HorizontalRail>
  </section>
</template>

<style scoped>
.venue-content {
  content-visibility: auto;
  contain-intrinsic-size: auto 460px;
}
</style>
