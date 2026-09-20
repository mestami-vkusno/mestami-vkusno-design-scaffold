<script setup lang="ts">
import type { UiLogoProps } from './types'

withDefaults(defineProps<UiLogoProps>(), { size: 'md' })
</script>

<!-- Знак и надпись — временный текстовый макет; заменить оригинальным логотипом. -->
<template>
  <component :is="href ? 'a' : 'span'" class="ui-logo" :class="`ui-logo--${size}`" :href="href" aria-label="Местами вкусно">
    <svg class="ui-logo__mark" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 29S6 20.5 6 12.5a10 10 0 0 1 20 0C26 20.5 16 29 16 29z" class="ui-logo__pin" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
      <path d="m16 8.5 1.8 3.6 4 .6-2.9 2.8.7 4-3.6-2-3.6 2 .7-4-2.9-2.8 4-.6z" fill="currentColor" />
    </svg>
    <b class="ui-logo__text">Местами<br />вкусно</b>
  </component>
</template>

<style scoped>
.ui-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
}

.ui-logo__mark {
  width: 30px;
  height: 30px;
  flex: none;
  color: var(--mark);
}

.ui-logo__pin {
  fill: var(--mark-fill);
}

.ui-logo__text {
  display: block;
  font-weight: 800;
  font-size: 15px;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ui-logo--sm .ui-logo__mark {
  width: 26px;
  height: 26px;
}

.ui-logo--sm .ui-logo__text {
  font-size: 13px;
}
</style>
