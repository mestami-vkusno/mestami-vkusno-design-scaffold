<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UiIcon from '../UiIcon/UiIcon.vue'
import type { UiAvatarProps } from './types'

const props = withDefaults(defineProps<UiAvatarProps>(), { size: 'md', shape: 'circle', tone: 'neutral' })

// Снимок, который не загрузился, заменяется инициалами, а не битой картинкой.
const failed = ref(false)
watch(() => props.src, () => (failed.value = false))

const initials = computed(() =>
  (props.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0]!)
    .join('')
    .toUpperCase(),
)
const showImage = computed(() => Boolean(props.src) && !failed.value)
</script>

<template>
  <span
    class="ui-avatar"
    :class="[`ui-avatar--${size}`, `ui-avatar--${shape}`, `ui-avatar--${tone}`]"
    :role="decorative || !name ? undefined : 'img'"
    :aria-label="decorative ? undefined : name"
    :aria-hidden="decorative ? true : undefined"
  >
    <img v-if="showImage" class="ui-avatar__img" :src="src" alt="" loading="lazy" @error="failed = true" />
    <span v-else-if="initials" class="ui-avatar__initials" aria-hidden="true">{{ initials }}</span>
    <UiIcon v-else name="user" size="55%" />
  </span>
</template>

<style scoped>
.ui-avatar {
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
  background: var(--tone-bg, var(--surface-2));
  color: var(--tone-fg, var(--text-2));
  font: 600 calc(var(--size) * 0.38) / 1 var(--font);
  letter-spacing: 0.02em;
  user-select: none;
}

.ui-avatar--xs {
  --size: 24px;
}

.ui-avatar--sm {
  --size: 32px;
}

.ui-avatar--lg {
  --size: 64px;
}

.ui-avatar--xl {
  --size: 96px;
}

.ui-avatar--rounded {
  border-radius: var(--r-md);
}

.ui-avatar--rounded.ui-avatar--lg,
.ui-avatar--rounded.ui-avatar--xl {
  border-radius: var(--r-lg);
}

.ui-avatar--rounded.ui-avatar--xs {
  border-radius: var(--r-sm);
}

.ui-avatar--accent {
  --tone-bg: var(--lime-soft);
  --tone-fg: var(--accent-fg);
}

.ui-avatar--success {
  --tone-bg: color-mix(in srgb, var(--success) 16%, var(--surface));
  --tone-fg: var(--success);
  --tone-text: var(--text);
  border-color: var(--success);
}

.ui-avatar--warning {
  --tone-bg: color-mix(in srgb, var(--warning) 16%, var(--surface));
  --tone-fg: var(--warning);
  --tone-text: var(--text);
  border-color: var(--warning);
}

.ui-avatar--danger {
  --tone-bg: color-mix(in srgb, var(--danger) 16%, var(--surface));
  --tone-fg: var(--danger);
  --tone-text: var(--text);
  border-color: var(--danger);
}

.ui-avatar__initials {
  color: var(--tone-text, currentColor);
}

.ui-avatar__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
