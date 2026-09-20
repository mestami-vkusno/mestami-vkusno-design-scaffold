<script setup lang="ts">
import { computed } from 'vue'
import type { UiTextProps, UiTextVariant } from './types'

const DEFAULT_TAG: Record<UiTextVariant, string> = {
  display: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  'body-lg': 'p',
  body: 'p',
  caption: 'p',
  overline: 'p',
}

const props = withDefaults(defineProps<UiTextProps>(), { variant: 'body' })

const tag = computed(() => props.as ?? DEFAULT_TAG[props.variant])
</script>

<template>
  <component :is="tag" class="ui-text" :class="`ui-text--${variant}`">
    <slot />
  </component>
</template>

<style scoped>
.ui-text {
  margin: 0;
}

.ui-text--display {
  font-size: clamp(36px, 6vw, 56px);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.ui-text--h1 {
  font-size: 40px;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.ui-text--h2 {
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
}

.ui-text--h3 {
  font-size: 20px;
  line-height: 1.3;
  font-weight: 600;
}

.ui-text--body-lg {
  font-size: 16px;
  line-height: 1.55;
}

.ui-text--body {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-2);
}

.ui-text--caption {
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-3);
}

.ui-text--overline {
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--accent-fg);
}

@media (max-width: 720px) {
  .ui-text--h1 {
    font-size: 32px;
  }

  .ui-text--h2 {
    font-size: 24px;
  }
}
</style>
