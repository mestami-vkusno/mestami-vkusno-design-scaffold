<script setup lang="ts">
import UiIconButton from '../../atoms/UiIconButton/UiIconButton.vue'
import UiLogo from '../../atoms/UiLogo/UiLogo.vue'
import type { UiFooterProps } from './types'

withDefaults(defineProps<UiFooterProps>(), { socials: () => [], homeHref: '/' })
</script>

<template>
  <footer class="ui-footer">
    <div class="ui-footer__about">
      <UiLogo :href="homeHref" />
      <p v-if="description" class="ui-footer__description">{{ description }}</p>
      <div v-if="socials.length" class="ui-footer__socials">
        <UiIconButton v-for="social in socials" :key="social.label" :icon="social.icon" :label="social.label" :href="social.href" size="sm" />
      </div>
    </div>
    <nav v-for="column in columns" :key="column.title" :aria-label="column.title">
      <h5 class="ui-footer__title">{{ column.title }}</h5>
      <a v-for="link in column.links" :key="link.label" class="ui-footer__link" :href="link.href">{{ link.label }}</a>
    </nav>
  </footer>
</template>

<style scoped>
.ui-footer {
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  gap: var(--s-8);
  padding: var(--s-8) var(--s-6);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
}

.ui-footer__description {
  max-width: 260px;
  margin: var(--s-3) 0;
  color: var(--text-3);
  font-size: 13px;
}

.ui-footer__socials {
  display: flex;
  gap: 10px;
}

.ui-footer__title {
  margin: 0 0 var(--s-3);
  font-size: 15px;
  font-weight: 600;
}

.ui-footer__link {
  display: block;
  padding: 4px 0;
  color: var(--text-2);
  font-size: 14px;
  text-decoration: none;
}

.ui-footer__link:hover {
  color: var(--text);
}

@media (max-width: 720px) {
  .ui-footer {
    grid-template-columns: 1fr 1fr;
    gap: var(--s-6);
    padding: var(--s-6) var(--s-4);
  }

  .ui-footer__about {
    grid-column: 1 / -1;
  }

  .ui-footer__description {
    max-width: none;
  }
}

@media (pointer: coarse) {
  .ui-footer__link {
    padding: 9px 0;
  }
}
</style>
