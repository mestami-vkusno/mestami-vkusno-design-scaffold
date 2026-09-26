<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { UiButton, UiEmptyState, useToast } from '@/design-system'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import SrHeading from './SrHeading.vue'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'

// X2 «Блокирующая ошибка, нет сети» (§2.8 `docs/front-structure.md`, §26.1, §26.4): в ТЗ нет отдельного экрана —
// в проде оба состояния перекрывают текущую страницу, когда её нельзя показать вовсе (`blocking_error`) или нет
// сети (`offline_cached`, но без кэша показать нечего). Отдельный маршрут `/error` — предположение автора (как и
// маршруты X3–X5), чтобы состояние можно было увидеть и проверить как страницу; путь и query-параметр `state`
// нигде в продукте не используются (см. новый вопрос в `.ai/tasks/0017-owner-open-questions.md`).

const route = useRoute()
const { show } = useToast()

const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
const wasOffline = ref(!isOnline.value)

function handleOnline(): void {
  isOnline.value = true
  if (wasOffline.value) show({ text: 'Соединение восстановлено. Обновите страницу, чтобы продолжить.', variant: 'success' })
}

function handleOffline(): void {
  isOnline.value = false
  wasOffline.value = true
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

// Реальный обрыв сети побеждает демонстрационный параметр: если сети правда нет, нет смысла показывать «ошибку».
const variant = computed<'offline' | 'error'>(() => (!isOnline.value || route.query.state === 'offline' ? 'offline' : 'error'))

useDocumentTitle(() => (variant.value === 'offline' ? 'Нет сети' : 'Ошибка'))

function reload(): void {
  window.location.reload()
}
</script>

<template>
  <main class="error-state-page">
    <ShellContainer>
      <SrHeading>{{ variant === 'offline' ? 'Нет соединения' : 'Ошибка загрузки' }}</SrHeading>
      <UiEmptyState
        v-if="variant === 'offline'"
        mode="offline"
        page
        :heading-level="2"
        title="Нет соединения"
        description="Проверьте интернет и попробуйте ещё раз. Черновики и недавно просмотренное сохранены на устройстве."
      >
        <template #actions>
          <UiButton icon-left="refresh" @click="reload">Обновить страницу</UiButton>
        </template>
      </UiEmptyState>

      <UiEmptyState v-else mode="error" page :heading-level="2" title="Не удалось загрузить страницу" description="Что-то пошло не так на нашей стороне. Попробуйте обновить страницу; если не поможет — зайдите позже.">
        <template #actions>
          <UiButton icon-left="refresh" @click="reload">Обновить страницу</UiButton>
          <UiButton href="/" variant="outline">На главную</UiButton>
        </template>
      </UiEmptyState>
    </ShellContainer>
  </main>
</template>

<style scoped>
.error-state-page {
  display: flex;
  align-items: center;
  min-height: 60dvh;
  padding-block: var(--s-8);
}
</style>
