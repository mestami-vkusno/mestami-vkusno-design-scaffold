<script setup lang="ts">
/* Подтверждение необратимого действия (O12): вопрос, последствия конкретно, «Отмена» и главная кнопка с глаголом. */
import { UiButton, UiSheet, UiText } from '@/design-system'

defineProps<{ title: string; text: string; confirmLabel: string }>()
const emit = defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>('open', { required: true })

function confirm(): void {
  open.value = false
  emit('confirm')
}
</script>

<template>
  <UiSheet v-model:open="open" :title="title">
    <div class="confirm">
      <UiText variant="body">{{ text }}</UiText>
      <div class="confirm__actions">
        <UiButton variant="outline" block @click="open = false">Отмена</UiButton>
        <UiButton block @click="confirm">{{ confirmLabel }}</UiButton>
      </div>
    </div>
  </UiSheet>
</template>

<style scoped>
.confirm {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.confirm__actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
}
</style>
