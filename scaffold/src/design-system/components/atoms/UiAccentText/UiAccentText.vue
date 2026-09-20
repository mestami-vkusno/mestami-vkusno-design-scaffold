<script setup lang="ts">
import type { UiAccentTextProps } from './types'

withDefaults(defineProps<UiAccentTextProps>(), { as: 'span' })
</script>

<!-- Ключевое слово в заголовке: в тёмной теме лаймовый текст, в светлой чёрный на лаймовом маркере. -->
<template>
  <component :is="as" class="ui-accent-text"><slot /></component>
</template>

<style scoped>
.ui-accent-text {
  font-style: normal;
  color: var(--accent-fg);
  background: var(--accent-mark);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  padding: 0 0.06em;
}
</style>
