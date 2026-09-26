<script setup lang="ts">
import MeScreen from '@/pages/me/components/MeScreen.vue'

/* Вложенный экран настроек (`/settings/blocked|hidden|history`, вопрос 14): «Назад» ведёт в настройки, содержимое — колонка чтения. */
defineProps<{ title: string; hash: string }>()
</script>

<template>
  <MeScreen :title="title" :back-href="`/settings#${hash}`" back-label="Настройки" guest-text="Войдите, чтобы управлять приватностью." width="narrow">
    <slot />
  </MeScreen>
</template>
