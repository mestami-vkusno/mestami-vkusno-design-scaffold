<script setup lang="ts">
import { UiLogo, UiThemeSwitch, useTheme } from '@/design-system'
import ShowcaseContainer from '@/showcase/components/ShowcaseContainer.vue'
import type { SiteTopbarSection } from './site-topbar'

defineProps<{ sections: readonly SiteTopbarSection[] }>()

const { theme, setTheme } = useTheme()
</script>

<template>
  <header class="site-topbar">
    <ShowcaseContainer class="site-topbar__inner">
      <UiLogo href="#top" class="site-topbar__logo" />
      <nav class="site-topbar__nav" aria-label="Разделы страницы">
        <RouterLink class="site-topbar__page" to="/">Продукт</RouterLink>
        <RouterLink class="site-topbar__page" to="/design-system">Система</RouterLink>
        <RouterLink class="site-topbar__page" to="/motion">Анимации</RouterLink>
        <RouterLink class="site-topbar__page" to="/features">Блоки</RouterLink>
        <span class="site-topbar__divider" aria-hidden="true" />
        <a v-for="section in sections" :key="section.id" class="site-topbar__link" :href="`#${section.id}`">{{ section.navLabel }}</a>
      </nav>
      <UiThemeSwitch :model-value="theme" @update:model-value="setTheme" />
    </ShowcaseContainer>
  </header>
</template>

<style scoped>
.site-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--border);
}

.site-topbar__inner {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  height: 64px;
}

.site-topbar__logo {
  flex: none;
}

.site-topbar__nav {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.site-topbar__nav::-webkit-scrollbar {
  display: none;
}

.site-topbar__link,
.site-topbar__page {
  padding: 6px 8px;
  border-radius: var(--r-pill);
  color: var(--text-2);
  font-size: 14px;
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--dur-hover) ease, background var(--dur-hover) ease;
}

.site-topbar__page {
  color: var(--text);
  font-weight: 600;
}

.site-topbar__page.router-link-exact-active {
  background: var(--lime);
  color: var(--on-accent);
}

.site-topbar__divider {
  flex: none;
  align-self: stretch;
  width: 1px;
  margin: 18px 6px;
  background: var(--border-strong);
}

@media (hover: hover) and (pointer: fine) {
  .site-topbar__link:hover {
    color: var(--text);
    background: var(--surface);
  }
}

/* Размытие фона под шапкой дорого на телефонах: там шапка непрозрачная. */
@media (pointer: fine) {
  .site-topbar {
    backdrop-filter: blur(10px);
  }
}

@media (pointer: coarse) {
  .site-topbar {
    background: var(--bg);
  }
}

@media (max-width: 720px) {
  .site-topbar__inner {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0 var(--s-3);
    height: auto;
    padding-top: 8px;
  }

  .site-topbar__nav {
    order: 3;
    flex: 0 0 100%;
    gap: 4px;
    margin: 6px calc(-1 * var(--s-4)) 0;
    padding: 0 var(--s-4);
    border-top: 1px solid var(--border);
    -webkit-overflow-scrolling: touch;
  }

  .site-topbar__link,
  .site-topbar__page {
    padding: 11px 10px;
    border-radius: 0;
  }

  .site-topbar__divider {
    margin: 12px 4px;
  }
}
</style>
