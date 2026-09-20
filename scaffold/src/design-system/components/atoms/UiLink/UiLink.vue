<script setup lang="ts">
import UiIcon from '../UiIcon/UiIcon.vue'
import type { UiLinkProps } from './types'

withDefaults(defineProps<UiLinkProps>(), { variant: 'accent' })
</script>

<template>
  <a class="ui-link" :class="`ui-link--${variant}`" :href="href">
    <UiIcon v-if="iconLeft" :name="iconLeft" :size="16" />
    <slot />
    <UiIcon v-if="iconRight" :name="iconRight" :size="16" />
  </a>
</template>

<style scoped>
.ui-link--accent {
  color: var(--accent-fg);
  text-decoration: underline;
  text-decoration-color: var(--link-line);
  text-decoration-thickness: var(--link-thick);
  text-underline-offset: 3px;
}

.ui-link--muted {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-2);
  font-size: 14px;
  text-decoration: none;
}

.ui-link--muted:hover {
  color: var(--text);
}
</style>
