<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiButton, UiIcon, UiSurface } from '@/design-system'
import { formatAgo } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { FEATURE_LABELS, VENUE_POST_TOPIC_LABEL } from '../labels'
import PhotoAvatar from '../PhotoAvatar/PhotoAvatar.vue'
import ShareButton from '../ShareButton/ShareButton.vue'
import { FALLBACK_PHOTO } from '../shared/photo'
import '../shared/base.css'
import type { HeadingLevel } from '../shared/types'
import type { VenuePostCardData } from './types'

const props = defineProps<{ data: VenuePostCardData; headingLevel: HeadingLevel; deferred: boolean }>()

const post = computed(() => props.data.post)
const venue = computed(() => props.data.venue)
const venueLink = computed(() => `/venue/${venue.value.id}`)
</script>

<template>
  <!--
    Официальный контент заведения (§12.1): три признака отличия от пользовательского — подпись «Заведение»,
    аватар-скруглённый квадрат, рамка --lime-line. Комментариев, «нравится» и «сохранить» нет (§14.1).
  -->
  <UiSurface as="article" class="venue-post" :class="{ 'venue-post--deferred': deferred }" :aria-labelledby="`vpost-${post.id}-title`">
    <header class="venue-post__head">
      <PhotoAvatar :photo="venue.logo ?? FALLBACK_PHOTO" :name="venue.name" size="sm" shape="rounded" decorative />
      <div class="venue-post__who">
        <p class="venue-post__venue">
          <a class="venue-post__venue-link" :href="venueLink">{{ venue.name }}</a>
          <UiBadge variant="accent" pill icon="shield">{{ FEATURE_LABELS.venueBadge }}</UiBadge>
        </p>
        <p class="venue-post__caption">
          {{ VENUE_POST_TOPIC_LABEL[post.topic] }} ·
          <time :datetime="post.publishedAt">{{ formatAgo(post.publishedAt) }}</time>
        </p>
      </div>
    </header>

    <div v-if="post.photos[0]" class="venue-post__media"><UiPhotoPlaceholder :photo="post.photos[0]" ratio="4:3" /></div>

    <div class="venue-post__body">
      <component :is="`h${headingLevel}`" :id="`vpost-${post.id}-title`" class="venue-post__title">{{ post.title }}</component>
      <p class="venue-post__text">{{ post.text }}</p>
      <a v-if="data.event" class="venue-post__event" :href="`/event/${data.event.id}`">
        <UiIcon name="calendar" :size="16" />{{ data.event.title }}
      </a>
    </div>

    <footer class="venue-post__actions">
      <UiButton :href="venueLink" variant="outline" size="sm" icon-right="arrow-r">{{ FEATURE_LABELS.openVenue }}<span class="fx-sr-only">: {{ venue.name }}</span></UiButton>
      <ShareButton :target="{ kind: 'venue', id: venue.id, title: post.title, href: venueLink }" />
    </footer>
  </UiSurface>
</template>

<style scoped>
.venue-post {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding-top: var(--s-4);
  border-color: var(--lime-line);
  transition: border-color var(--dur-hover) ease;
}

.venue-post--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 520px;
}

.venue-post__head {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding-inline: var(--s-4);
}

.venue-post__who {
  min-width: 0;
}

.venue-post__venue {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-1) var(--s-2);
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.venue-post__venue-link {
  color: inherit;
  text-decoration: none;
}

.venue-post__caption {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-3);
}

.venue-post__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-2);
  padding-inline: var(--s-4);
}

.venue-post__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.venue-post__text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-2);
}

.venue-post__event {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  min-height: 32px;
  padding: 0 var(--s-3);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-pill);
  color: var(--text);
  font-size: 13px;
  text-decoration: none;
}

.venue-post__event > :first-child {
  color: var(--accent-fg);
}

.venue-post__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-2);
  padding: 0 var(--s-4) var(--s-3);
}

@media (pointer: coarse) {
  .venue-post__venue-link {
    padding-block: 12px;
    margin-block: -12px;
  }

  .venue-post__event {
    min-height: 44px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .venue-post:hover {
    border-color: var(--accent-fg);
  }

  .venue-post__venue-link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
