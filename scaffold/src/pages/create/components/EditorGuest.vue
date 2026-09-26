<script setup lang="ts">
import { UiButton, UiEmptyState } from '@/design-system'
import { requireAuth } from '@/state/auth-gate'

/*
  Гость в редакторе (§5.1): редактор не открывается без входа, а вход — по кнопке, не автоматически, чтобы «Назад»
  из входа не возвращал в редактор, который снова уводит на вход. После входа возвращаемся на этот же адрес.
*/
const props = defineProps<{ title: string; description: string }>()

function signIn(): void {
  requireAuth({ actionType: 'create', objectType: 'venue', objectId: null, sourceSurface: 'other' })
}
</script>

<template>
  <UiEmptyState mode="guest" :title="props.title" :description="props.description" page>
    <template #actions>
      <UiButton @click="signIn">Войти или создать аккаунт</UiButton>
      <UiButton variant="outline" href="/">На главную</UiButton>
    </template>
  </UiEmptyState>
</template>
