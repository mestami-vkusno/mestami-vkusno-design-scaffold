<script setup lang="ts">
import { computed } from 'vue'
import { UiPhotoPlaceholder } from '@/mocks/media'
import type { PhotoAvatarProps } from './types'

const props = withDefaults(defineProps<PhotoAvatarProps>(), { size: 'md', shape: 'circle', decorative: false })

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <span class="photo-avatar" :class="[`photo-avatar--${size}`, `photo-avatar--${shape}`]" :role="decorative ? undefined : 'img'" :aria-label="decorative ? undefined : name" :aria-hidden="decorative ? 'true' : undefined">
    <UiPhotoPlaceholder :photo="photo" ratio="fill" decorative />
    <span class="photo-avatar__initials" aria-hidden="true">{{ initials }}</span>
  </span>
</template>

<style scoped>
.photo-avatar {
  --size: 40px;
  position: relative;
  display: inline-grid;
  flex: none;
  place-items: center;
  width: var(--size);
  height: var(--size);
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text);
  font: 600 calc(var(--size) * 0.38) / 1 var(--font);
  letter-spacing: 0.02em;
  user-select: none;
}

.photo-avatar > :deep(.photo-placeholder) {
  position: absolute;
  inset: 0;
}

.photo-avatar__initials {
  position: relative;
}

.photo-avatar--xs {
  --size: 24px;
}

.photo-avatar--sm {
  --size: 32px;
}

.photo-avatar--lg {
  --size: 64px;
}

.photo-avatar--xl {
  --size: 96px;
}

.photo-avatar--rounded {
  border-radius: var(--r-md);
}

.photo-avatar--rounded.photo-avatar--lg,
.photo-avatar--rounded.photo-avatar--xl {
  border-radius: var(--r-lg);
}

.photo-avatar--rounded.photo-avatar--xs {
  border-radius: var(--r-sm);
}
</style>
