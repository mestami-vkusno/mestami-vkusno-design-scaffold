<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiBadge, UiIcon, UiIconButton, UiRating, UiSurface } from '@/design-system'
import { MODERATION_STATUS_LABEL } from '@/mocks/dictionaries'
import { formatAgo } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import ActionButton from '../ActionButton/ActionButton.vue'
import LikeButton from '../LikeButton/LikeButton.vue'
import { FEATURE_LABELS } from '../labels'
import PhotoAvatar from '../PhotoAvatar/PhotoAvatar.vue'
import RatingLabel from '../RatingLabel/RatingLabel.vue'
import SaveButton from '../SaveButton/SaveButton.vue'
import ShareButton from '../ShareButton/ShareButton.vue'
import '../shared/base.css'
import type { HeadingLevel } from '../shared/types'
import type { UserPostCardData } from './types'

const props = defineProps<{ data: UserPostCardData; headingLevel: HeadingLevel; deferred: boolean }>()
const emit = defineEmits<{ menu: [postId: string] }>()

const post = computed(() => props.data.post)
const author = computed(() => props.data.author)
const link = computed(() => `/post/${post.value.id}`)
const isLong = computed(() => post.value.text.length > 180)
const expanded = ref(false)
const multi = computed(() => post.value.photos.length > 1)
const slide = ref(1)
const shareTitle = computed(() => `Публикация: ${author.value.displayName}`)

function onStripScroll(event: Event): void {
  const strip = event.currentTarget as HTMLElement
  slide.value = Math.min(post.value.photos.length, Math.round(strip.scrollLeft / Math.max(strip.clientWidth, 1)) + 1)
}
</script>

<template>
  <UiSurface as="article" class="post-card" :class="{ 'post-card--deferred': deferred }" :aria-labelledby="`post-${post.id}-author`">
    <header class="post-card__head">
      <PhotoAvatar :photo="author.avatar" :name="author.displayName" size="sm" decorative class="post-card__avatar" />
      <div class="post-card__who">
        <component :is="`h${headingLevel}`" :id="`post-${post.id}-author`" class="post-card__author">
          <a class="post-card__author-link" :href="`/u/${author.username}`">{{ author.displayName }}</a>
          <UiBadge v-if="data.own" variant="neutral" pill>Вы</UiBadge>
        </component>
        <p class="post-card__caption">
          @{{ author.username }} ·
          <a class="post-card__open" :href="link"><time :datetime="post.createdAt">{{ formatAgo(post.createdAt) }}</time></a>
        </p>
      </div>
      <UiIconButton class="post-card__menu" icon="more" variant="plain" size="sm" :label="`${FEATURE_LABELS.more}: публикация ${author.displayName}`" @click="emit('menu', post.id)" />
    </header>

    <div v-if="post.visibility === 'private' || post.status !== 'published'" class="post-card__states">
      <UiBadge v-if="post.visibility === 'private'" variant="neutral" icon="lock">Приватная</UiBadge>
      <UiBadge v-if="post.status !== 'published'" variant="warning">{{ MODERATION_STATUS_LABEL[post.status] }}</UiBadge>
    </div>

    <div v-if="post.photos.length === 1" class="post-card__media">
      <UiPhotoPlaceholder v-if="post.photos[0]" :photo="post.photos[0]" ratio="4:3" />
    </div>
    <div v-else-if="multi" class="post-card__gallery">
      <div class="post-card__strip" role="group" tabindex="0" :aria-label="`Фото публикации: ${post.photos.length}`" @scroll.passive="onStripScroll">
        <div v-for="(photo, index) in post.photos" :key="index" class="post-card__slide"><UiPhotoPlaceholder :photo="photo" ratio="4:3" /></div>
      </div>
      <UiBadge class="post-card__counter" variant="neutral" pill aria-hidden="true">{{ slide }}/{{ post.photos.length }}</UiBadge>
    </div>

    <div v-if="post.text" class="post-card__text-wrap">
      <p class="post-card__text" :class="{ 'post-card__text--clamped': isLong && !expanded }">{{ post.text }}</p>
      <button v-if="isLong" class="post-card__expand" type="button" :aria-expanded="expanded" @click="expanded = !expanded">
        {{ expanded ? FEATURE_LABELS.collapse : FEATURE_LABELS.expand }}
      </button>
    </div>

    <div v-if="data.venue || data.dish || data.event || post.ratingSnapshot" class="post-card__context">
      <a v-if="data.venue" class="post-card__ctx" :href="`/venue/${data.venue.id}`">
        <UiIcon name="pin" :size="16" />
        <span class="post-card__ctx-name">{{ data.venue.name }}</span>
        <span v-if="data.venue.location" class="post-card__ctx-muted">{{ data.venue.location }}</span>
        <RatingLabel v-if="data.venue.rating !== undefined" :rating="data.venue.rating" :show-count="false" hide-when-hidden />
      </a>
      <a v-if="data.dish && !data.dish.removed" class="post-card__ctx" :href="`/venue/${data.dish.venueId}/menu/${data.dish.id}`">
        <UiIcon name="list" :size="16" />
        <span class="post-card__ctx-name">{{ data.dish.name }}</span>
      </a>
      <span v-else-if="data.dish" class="post-card__ctx post-card__ctx--static">
        <UiIcon name="list" :size="16" />
        <span class="post-card__ctx-name">{{ data.dish.name }}</span>
        <span class="post-card__ctx-muted">{{ FEATURE_LABELS.dishGone }}</span>
      </span>
      <a v-if="data.event" class="post-card__ctx" :href="`/event/${data.event.id}`">
        <UiIcon name="calendar" :size="16" />
        <span class="post-card__ctx-name">{{ data.event.title }}</span>
      </a>
      <span v-if="post.ratingSnapshot" class="post-card__ctx post-card__ctx--static">
        <UiRating :value="post.ratingSnapshot" variant="stars" />
        <span class="post-card__ctx-muted">Оценка на момент публикации</span>
      </span>
    </div>

    <footer class="post-card__actions">
      <LikeButton :post-id="post.id" :base-count="post.likesCount" />
      <ActionButton v-if="post.commentsEnabled" icon="comment" :label="FEATURE_LABELS.comments" :count="data.commentsCount" :href="`${link}#comments`" />
      <span class="post-card__spacer" />
      <SaveButton kind="post" :id="post.id" :subject="shareTitle" />
      <ShareButton :target="{ kind: 'post', id: post.id, title: shareTitle, href: link }" />
    </footer>
  </UiSurface>
</template>

<style scoped>
.post-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding-top: var(--s-4);
  transition: border-color var(--dur-hover) ease;
}

.post-card--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 560px;
}

.post-card:has(.post-card__open:focus-visible) {
  box-shadow: var(--ring);
}

/* Вся карточка открывает публикацию: ссылка на времени растянута на карточку, остальные ссылки и кнопки лежат выше. */
.post-card__open {
  color: inherit;
  text-decoration: none;
}

.post-card__open::after {
  content: '';
  position: absolute;
  inset: 0;
}

.post-card__open:focus-visible {
  box-shadow: none;
}

.post-card__head {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding-inline: var(--s-4);
}

.post-card__who {
  flex: 1;
  min-width: 0;
}

.post-card__author {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.post-card__author-link,
.post-card__ctx,
.post-card__menu,
.post-card__actions,
.post-card__expand,
.post-card__avatar {
  position: relative;
  z-index: 1;
}

.post-card__author-link {
  color: inherit;
  text-decoration: none;
}

.post-card__caption {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.3;
  color: var(--text-3);
}

.post-card__states {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
  padding-inline: var(--s-4);
}

.post-card__media > :deep(.photo-placeholder) {
  border-radius: 0;
}

.post-card__gallery {
  position: relative;
}

.post-card__strip {
  position: relative;
  z-index: 1;
  display: flex;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.post-card__strip::-webkit-scrollbar {
  display: none;
}

.post-card__slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

.post-card__counter {
  position: absolute;
  top: var(--s-2);
  right: var(--s-2);
  z-index: 2;
  pointer-events: none;
}

.post-card__text-wrap {
  padding-inline: var(--s-4);
}

.post-card__text {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--text);
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.post-card__text--clamped {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.post-card__expand {
  min-height: 32px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--text-3);
  font: 500 14px var(--font);
  cursor: pointer;
}

.post-card__context {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
  padding-inline: var(--s-4);
}

.post-card__ctx {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  min-height: 32px;
  max-width: 100%;
  padding: 0 var(--s-3);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-pill);
  color: var(--text);
  font-size: 13px;
  text-decoration: none;
  transition: background var(--dur-hover) ease;
}

.post-card__ctx > :first-child {
  flex: none;
  color: var(--accent-fg);
}

.post-card__ctx--static {
  z-index: auto;
  border-color: var(--border);
  cursor: default;
}

.post-card__ctx-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-card__ctx-muted {
  color: var(--text-3);
  white-space: nowrap;
}

.post-card__actions {
  display: flex;
  align-items: center;
  gap: var(--s-1);
  padding: 0 var(--s-2) var(--s-2);
}

.post-card__spacer {
  flex: 1;
}

@media (pointer: coarse) {
  .post-card__author-link {
    padding-block: 12px;
    margin-block: -12px;
  }

  .post-card__ctx {
    min-height: 44px;
  }

  .post-card__expand {
    min-height: 44px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .post-card:hover {
    border-color: var(--border-hover);
  }

  a.post-card__ctx:hover {
    background: var(--surface-2);
  }

  .post-card__author-link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
