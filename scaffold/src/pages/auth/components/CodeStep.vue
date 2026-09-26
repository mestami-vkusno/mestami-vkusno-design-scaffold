<script setup lang="ts">
import { UiButton, UiCodeInput, UiField, UiLink, UiText } from '@/design-system'
import { formatCountdown } from '../format'

defineProps<{
  email: string
  code: string
  codeError: string
  codeChecking: boolean
  resendRemainingMs: number
  codeBlockedRemainingMs: number
  sendBlockedRemainingMs: number
}>()

const emit = defineEmits<{ 'update:code': [string]; complete: []; resend: []; 'change-email': [] }>()

function onInput(value: string): void {
  emit('update:code', value)
}
</script>

<template>
  <div class="auth-step">
    <UiText variant="h1">Введите код</UiText>
    <UiText variant="body" class="auth-step__lead">Код отправлен на <strong>{{ email }}</strong>. <UiLink variant="accent" href="#" @click.prevent="emit('change-email')">Изменить email</UiLink></UiText>

    <div class="auth-step__form">
      <UiField label="Код из письма" :error="codeError || undefined">
        <template #default="{ id }">
          <UiCodeInput :id="id" :model-value="code" :invalid="Boolean(codeError)" @update:model-value="onInput" @complete="emit('complete')" />
        </template>
      </UiField>

      <p class="auth-step__resend">
        <UiText v-if="sendBlockedRemainingMs > 0" variant="caption">Слишком много попыток. Повторите через {{ formatCountdown(sendBlockedRemainingMs) }}</UiText>
        <template v-else-if="resendRemainingMs > 0">
          <UiText variant="caption">Отправить код повторно через {{ formatCountdown(resendRemainingMs) }}</UiText>
        </template>
        <UiButton v-else variant="outline" icon-left="refresh" size="sm" @click="emit('resend')">Отправить код повторно</UiButton>
      </p>

      <UiButton
        variant="primary"
        block
        :loading="codeChecking"
        :disabled="code.length !== 6 || codeBlockedRemainingMs > 0"
        @click="emit('complete')"
      >
        Подтвердить
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.auth-step__lead {
  color: var(--text-2);
  margin-top: var(--s-1);
}

.auth-step__form {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  margin-top: var(--s-6);
}

.auth-step__resend {
  margin: 0;
}
</style>
