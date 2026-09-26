<script setup lang="ts">
import { UiButton, UiIcon, UiIconButton, UiLogo } from '@/design-system'
import type { ProductNavId, ProductNavItem, Viewer } from '../types'
import ShellContainer from './ShellContainer.vue'

defineProps<{
  /** Разделы верхней навигации (видны на десктопе). */
  navItems: readonly ProductNavItem[]
  activeNav?: ProductNavId
  cityName: string
  /** Вошедший пользователь; у гостя `null` и показывается «Войти». */
  viewer: Viewer | null
}>()

const emit = defineEmits<{ 'open-city': []; 'open-create': [] }>()
</script>

<template>
  <header class="product-header">
    <ShellContainer class="product-header__inner">
      <UiLogo class="product-header__logo" href="/" size="sm" />
      <button class="product-header__city" type="button" aria-haspopup="dialog" :aria-label="`${cityName}, сменить город`" @click="emit('open-city')">
        <UiIcon name="pin" :size="16" />
        <span class="product-header__city-name">{{ cityName }}</span>
        <UiIcon name="chev-d" :size="14" />
      </button>

      <nav class="product-header__nav" aria-label="Основная навигация">
        <a v-for="item in navItems" :key="item.id" class="product-header__link" :href="item.href" :aria-current="activeNav === item.id ? 'page' : undefined">{{ item.label }}</a>
      </nav>

      <div class="product-header__actions">
        <UiIconButton class="product-header__search" icon="search" label="Поиск" href="/search" variant="plain" size="sm" />
        <UiIconButton icon="bell" label="Центр активности" href="/activity" variant="plain" size="sm" />
        <UiButton class="product-header__create" size="sm" icon-left="plus" aria-haspopup="dialog" @click="emit('open-create')">Создать</UiButton>
        <a v-if="viewer" class="product-header__avatar" href="/me" :aria-label="`Профиль: ${viewer.name}`">{{ viewer.name.charAt(0) }}</a>
        <UiButton v-else class="product-header__login" size="sm" variant="neutral" href="/auth">Войти</UiButton>
      </div>
    </ShellContainer>
  </header>
</template>

<style scoped>
.product-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--border);
}

.product-header__inner {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  height: 56px;
}

.product-header__logo {
  flex: none;
  /* Цель нажатия не меньше 44 px и без надписи на узком экране. */
  display: inline-flex;
  align-items: center;
  min-width: 44px;
  min-height: 44px;
}

.product-header__city {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  min-height: 44px;
  margin: 0 auto;
  padding: 0 var(--s-2);
  border: 0;
  border-radius: var(--r-pill);
  background: none;
  color: var(--text);
  font: 500 14px var(--font);
  cursor: pointer;
  transition: background var(--dur-hover) ease;
}

.product-header__city-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-header__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--s-1);
}

/* На узком экране остаётся знак: название читается из подписи ссылки, а место нужно городу. */
@media (max-width: 480px) {
  .product-header__logo :deep(.ui-logo__text) {
    display: none;
  }
}

/* «Создать», «Войти» и верхняя навигация — только на десктопе; на телефоне их заменяет нижняя панель. */
.product-header__nav,
.product-header__create,
.product-header__login,
.product-header__avatar {
  display: none;
}

.product-header__link {
  position: relative;
  padding: 21px 0;
  color: var(--text);
  font-size: 15px;
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--dur-hover) ease;
}

.product-header__link[aria-current='page'] {
  color: var(--accent-fg);
  font-weight: 600;
}

.product-header__link[aria-current='page']::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  border-radius: 2px;
  background: var(--lime);
}

.product-header__avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--lime);
  color: var(--on-accent);
  font-weight: 700;
  text-decoration: none;
}

/* Размытие фона под шапкой дорого на телефонах: там шапка непрозрачная. */
@media (pointer: fine) {
  .product-header {
    backdrop-filter: blur(10px);
  }
}

@media (pointer: coarse) {
  .product-header {
    background: var(--bg);
  }
}

@media (hover: hover) and (pointer: fine) {
  .product-header__city:hover {
    background: var(--surface);
  }

  .product-header__link:hover {
    color: var(--accent-fg);
  }
}

@media (min-width: 900px) {
  .product-header__inner {
    gap: var(--s-6);
    height: 64px;
  }

  .product-header__city {
    margin: 0;
  }

  .product-header__nav {
    display: flex;
    gap: var(--s-6);
    margin: 0 auto;
  }

  .product-header__actions {
    gap: var(--s-3);
  }

  .product-header__search {
    display: none;
  }

  .product-header__create,
  .product-header__login {
    display: inline-flex;
  }

  .product-header__avatar {
    display: grid;
  }
}
</style>
