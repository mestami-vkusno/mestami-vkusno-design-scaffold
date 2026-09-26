<script setup lang="ts">
import { UiButton, UiEmptyState, UiLink } from '@/design-system'

/*
  Приглашение войти: гость на /me, /me/favorites, /me/visits видит его вместо пустой страницы (задача 0009,
  «Мое» — только авторизованным, §18). Ведёт на /auth обычной ссылкой: requireAuth не нужен, страница целиком
  доступна только вошедшему, а не одно действие на ней.
*/

defineProps<{ title: string; description: string }>()
</script>

<template>
  <UiEmptyState mode="guest" :title="title" :description="description" page>
    <template #actions>
      <UiButton variant="primary" href="/auth">Войти или создать аккаунт</UiButton>
      <UiLink variant="muted" icon-left="settings" href="/settings">Настройки внешнего вида</UiLink>
    </template>
  </UiEmptyState>
</template>
