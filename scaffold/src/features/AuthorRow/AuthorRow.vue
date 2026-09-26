<script setup lang="ts">
import { computed } from 'vue'
import PhotoAvatar from '../PhotoAvatar/PhotoAvatar.vue'
import type { AuthorRowProps } from './types'

const props = withDefaults(defineProps<AuthorRowProps>(), { size: 'md' })
defineSlots<{ /** Действие справа: `FollowButton`, меню. */ action?(): unknown }>()

const link = computed(() => props.href ?? `/u/${props.author.username}`)
</script>

<template>
  <div class="author-row" :class="`author-row--${size}`">
    <component :is="plain ? 'div' : 'a'" class="author-row__main" :href="plain ? undefined : link">
      <PhotoAvatar :photo="author.avatar" :name="author.displayName" :size="size === 'lg' ? 'md' : size === 'md' ? 'sm' : 'xs'" decorative />
      <span class="author-row__text">
        <span class="author-row__name">{{ author.displayName }}</span>
        <span class="author-row__sub">{{ subtitle ?? `@${author.username}` }}</span>
      </span>
    </component>
    <div v-if="$slots.action" class="author-row__action"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.author-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  min-width: 0;
}

.author-row__main {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  min-width: 0;
  min-height: 44px;
  color: inherit;
  text-decoration: none;
  border-radius: var(--r-md);
}

.author-row__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.author-row__name {
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author-row__sub {
  overflow: hidden;
  font-size: 12.5px;
  line-height: 1.3;
  color: var(--text-3);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author-row--lg .author-row__name {
  font-size: 17px;
}

.author-row--sm .author-row__name {
  font-size: 14px;
}

.author-row__action {
  flex: none;
}

@media (hover: hover) and (pointer: fine) {
  a.author-row__main:hover .author-row__name {
    text-decoration: underline;
    text-decoration-color: var(--link-line);
    text-underline-offset: 3px;
  }
}
</style>
