<script setup lang="ts">
import { UiLogo, UiThemeSwitch, useTheme } from '@/design-system'
import { SHOWCASE_SECTIONS } from '../data/sections'
import ShowcaseContainer from './ShowcaseContainer.vue'

const { theme, setTheme } = useTheme()
</script>

<template>
  <header class="showcase-topbar">
    <ShowcaseContainer class="showcase-topbar__inner">
      <UiLogo href="#top" class="showcase-topbar__logo" />
      <nav class="showcase-topbar__nav" aria-label="Разделы страницы">
        <a v-for="section in SHOWCASE_SECTIONS" :key="section.id" class="showcase-topbar__link" :href="`#${section.id}`">{{ section.navLabel }}</a>
      </nav>
      <UiThemeSwitch :model-value="theme" @update:model-value="setTheme" />
    </ShowcaseContainer>
  </header>
</template>

<style scoped>
.showcase-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--topbar-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.showcase-topbar__inner {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  height: 64px;
}

.showcase-topbar__logo {
  flex: none;
}

.showcase-topbar__nav {
  display: flex;
  gap: 2px;
  margin-left: auto;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.showcase-topbar__nav::-webkit-scrollbar {
  display: none;
}

.showcase-topbar__link {
  padding: 6px 8px;
  border-radius: var(--r-pill);
  color: var(--text-2);
  font-size: 14px;
  text-decoration: none;
  white-space: nowrap;
}

.showcase-topbar__link:hover {
  color: var(--text);
  background: var(--surface);
}

@media (max-width: 720px) {
  .showcase-topbar__inner {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0 var(--s-3);
    height: auto;
    padding-top: 8px;
  }

  .showcase-topbar__nav {
    order: 3;
    flex: 0 0 100%;
    gap: 4px;
    margin: 6px calc(-1 * var(--s-4)) 0;
    padding: 0 var(--s-4);
    border-top: 1px solid var(--border);
    -webkit-overflow-scrolling: touch;
  }

  .showcase-topbar__link {
    padding: 11px 10px;
    border-radius: 0;
  }
}
</style>
