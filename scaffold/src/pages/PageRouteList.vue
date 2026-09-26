<script setup lang="ts">
import { UiText } from '@/design-system'
import { PAGES } from '@/shell/data/routes'

/** Все страницы мока со ссылками: для страниц с параметрами — пример адреса. */
const pages = PAGES.map((page) => ({ name: page.name, title: page.title, pageId: page.pageId, href: page.example ?? page.path }))
</script>

<template>
  <section aria-labelledby="route-list-title" class="route-list">
    <UiText id="route-list-title" as="h2" variant="h3">Все страницы мока</UiText>
    <ul class="route-list__items">
      <li v-for="page in pages" :key="page.name">
        <a class="route-list__link" :href="page.href">
          <span>{{ page.title }}</span>
          <code>{{ page.href }}</code>
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.route-list {
  display: grid;
  gap: var(--s-3);
  width: 100%;
}

.route-list__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--s-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.route-list__link {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3);
  min-height: 44px;
  padding: var(--s-2) var(--s-3);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  color: var(--text);
  text-decoration: none;
  transition: background var(--dur-hover) ease;
}

@media (hover: hover) and (pointer: fine) {
  .route-list__link:hover {
    background: var(--surface);
  }
}
</style>
