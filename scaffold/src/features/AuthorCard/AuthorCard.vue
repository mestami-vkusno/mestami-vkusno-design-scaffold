<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiSurface } from '@/design-system'
import { formatFollowers, pluralRu } from '@/mocks/format'
import { FEATURE_LABELS } from '../labels'
import PhotoAvatar from '../PhotoAvatar/PhotoAvatar.vue'
import type { AuthorCardProps } from './types'

const props = withDefaults(defineProps<AuthorCardProps>(), { headingLevel: 3 })
defineSlots<{ /** Кнопка «Подписаться» (`FollowButton`). */ action?(): unknown }>()

const link = computed(() => props.href ?? `/u/${props.author.username}`)
const closed = computed(() => props.author.profileVisibility === 'private')
// «12,5 тыс. подписчиков» или «84 подписчика».
const followers = computed(() => {
  const count = props.author.followersCount
  const [one, few, many] = FEATURE_LABELS.followersCount
  return `${formatFollowers(count)} ${count >= 1000 ? many : pluralRu(count, one, few, many)}`
})
</script>

<template>
  <UiSurface as="article" class="author-card" :class="{ 'author-card--deferred': deferred }">
    <PhotoAvatar :photo="author.avatar" :name="author.displayName" size="lg" decorative />
    <div class="author-card__body">
      <component :is="`h${headingLevel}`" class="author-card__name">
        <a class="author-card__link" :href="link">{{ author.displayName }}</a>
      </component>
      <p class="author-card__username">@{{ author.username }}</p>
      <!-- Закрытый профиль: на карточке только имя, аватар и пометка (§15.2). -->
      <UiBadge v-if="closed" variant="neutral" pill icon="lock">{{ FEATURE_LABELS.closedProfile }}</UiBadge>
      <template v-else>
        <p class="author-card__about">{{ author.about }}</p>
        <p class="author-card__followers">{{ followers }}</p>
      </template>
    </div>
    <div v-if="$slots.action" class="author-card__action"><slot name="action" /></div>
  </UiSurface>
</template>

<style scoped>
.author-card {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: var(--s-3) var(--s-4);
  padding: var(--s-4);
  transition: border-color var(--dur-hover) ease;
}

.author-card--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 150px;
}

.author-card__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-1);
  min-width: 0;
}

.author-card__name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
}

.author-card__link {
  color: inherit;
  text-decoration: none;
}

/* Вся карточка — одна цель нажатия: ссылка растянута, кнопка действия поднята над ней. */
.author-card__link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.author-card__link:focus-visible {
  box-shadow: none;
}

.author-card:has(.author-card__link:focus-visible) {
  box-shadow: var(--ring);
}

.author-card__username,
.author-card__followers {
  margin: 0;
  font-size: 13px;
  color: var(--text-3);
}

.author-card__about {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: var(--s-1) 0 0;
  font-size: 14px;
  line-height: 1.45;
  color: var(--text-2);
}

.author-card__action {
  position: relative;
  z-index: 1;
  grid-column: 1 / -1;
}

@media (hover: hover) and (pointer: fine) {
  .author-card:hover {
    border-color: var(--border-hover);
  }
}
</style>
