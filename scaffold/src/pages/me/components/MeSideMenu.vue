<script setup lang="ts">
import { UiSideMenu } from '@/design-system'
import type { NavItem } from '@/design-system'

/*
  Левое меню кабинета на десктопе (≥900 px), общее для /me, /me/favorites, /me/visits (раздел 3.1 screens-without-reference.md).
  «Профиль» и «Мое» — режимы одного маршрута `/me`, не переходы: страница ловит клик по ним через `@mode`.
  Пункты M4–M8 и «Настройки» — обычные ссылки на свои страницы (задача 0013).
*/

const props = defineProps<{
  /** 'profile' | 'me' | 'favorites' | 'visits' | 'diary' | 'drafts' | 'saved' | 'reviews' | 'recent'. */
  active: string
}>()

const emit = defineEmits<{ mode: ['profile' | 'me']; 'sign-out': [] }>()

const ITEMS: readonly NavItem[] = [
  { id: 'profile', label: 'Профиль', icon: 'user' },
  { id: 'me', label: 'Мое', icon: 'list' },
  { id: 'favorites', label: 'Избранное', icon: 'heart', href: '/me/favorites' },
  { id: 'visits', label: 'Посещения', icon: 'pin', href: '/me/visits' },
  { id: 'diary', label: 'Дневник', icon: 'edit', href: '/me/diary' },
  { id: 'drafts', label: 'Черновики', icon: 'list', href: '/me/drafts' },
  { id: 'saved', label: 'Сохранённое', icon: 'bookmark', href: '/me/saved' },
  { id: 'reviews', label: 'Оценки и отзывы', icon: 'star', href: '/me/reviews' },
  { id: 'recent', label: 'Недавно просмотренное', icon: 'clock', href: '/me/recent' },
  { id: 'settings', label: 'Настройки', icon: 'settings', href: '/settings' },
]

const SECONDARY: readonly NavItem[] = [{ id: 'logout', label: 'Выйти', icon: 'logout' }]

function onSelect(item: NavItem): void {
  if (item.id === 'profile' || item.id === 'me') emit('mode', item.id)
  else if (item.id === 'logout') emit('sign-out')
}
</script>

<template>
  <UiSideMenu class="me-side-menu" :items="ITEMS" :secondary-items="SECONDARY" :model-value="props.active" label="Меню кабинета" @select="onSelect" />
</template>

<style scoped>
.me-side-menu {
  position: sticky;
  top: calc(56px + var(--s-4));
  flex: none;
}
</style>
