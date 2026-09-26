<script setup lang="ts">
/* Итог «Опубликовать» для публичной записи (J7, §13.4): отправлено на проверку, пока идёт проверка запись видна только автору. */
import { UiButton, UiEmptyState, UiSheet } from '@/design-system'

defineProps<{ postId: string | null }>()
const emit = defineEmits<{ 'create-more': [] }>()
const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <UiSheet v-model:open="open" title="Публикация отправлена">
    <div class="result">
      <UiEmptyState mode="empty" icon="check" title="Отправлено на проверку" description="Пока идёт проверка, публикация видна только вам. Статус — в «Мое → Черновики»." :heading-level="3" />
      <div class="result__actions">
        <UiButton block :href="postId === null ? '/me/drafts' : `/post/${postId}`">К публикации</UiButton>
        <UiButton variant="outline" block @click="emit('create-more')">Создать ещё</UiButton>
      </div>
    </div>
  </UiSheet>
</template>

<style scoped>
.result {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.result__actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
}
</style>
