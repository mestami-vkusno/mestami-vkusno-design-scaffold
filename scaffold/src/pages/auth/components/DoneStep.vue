<script setup lang="ts">
import { computed } from 'vue'
import { UiBanner, UiButton, UiIcon, UiSurface, UiText } from '@/design-system'
import type { PendingAction } from '@/shell/composables/useAuthGate'
import { pendingResultText, returnLabel } from '../labels'

const props = defineProps<{ action: PendingAction | null; ok: boolean }>()
defineEmits<{ finish: [] }>()

const resultText = computed(() => (props.action ? pendingResultText(props.action) : ''))
const buttonLabel = computed(() => {
  const label = returnLabel(props.action)
  return label ? `Вернуться к «${label}»` : 'Продолжить'
})
</script>

<template>
  <div class="auth-step auth-step--done">
    <div class="auth-step__illustration" aria-hidden="true">
      <UiIcon name="pin" :size="64" filled />
    </div>
    <UiText variant="h1">Готово!</UiText>
    <UiText variant="body" class="auth-step__lead">Почта подтверждена. Добро пожаловать в «Местами вкусно».</UiText>

    <UiSurface v-if="action && ok && resultText" variant="panel" class="auth-step__result">
      <UiIcon name="check" :size="18" />
      <UiText variant="body">{{ resultText }}</UiText>
    </UiSurface>
    <UiBanner v-else-if="action && !ok" variant="warning">Не удалось завершить действие. Повторите на странице заведения.</UiBanner>

    <UiButton variant="primary" block class="auth-step__cta" @click="$emit('finish')">{{ buttonLabel }}</UiButton>

    <p class="auth-step__shield">
      <UiIcon name="shield" :size="14" />
      Ваши данные под надёжной защитой
    </p>
  </div>
</template>

<style scoped>
.auth-step--done {
  text-align: center;
}

.auth-step__illustration {
  display: flex;
  justify-content: center;
  margin-bottom: var(--s-4);
  color: var(--accent-fg);
}

.auth-step__lead {
  color: var(--text-2);
  margin-top: var(--s-1);
}

.auth-step__result {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin-top: var(--s-6);
  color: var(--text);
}

.auth-step__cta {
  margin-top: var(--s-6);
}

.auth-step__shield {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-1);
  margin: var(--s-4) 0 0;
  color: var(--text-3);
  font-size: 13px;
}
</style>
