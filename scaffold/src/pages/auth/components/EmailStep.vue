<script setup lang="ts">
import { computed } from 'vue'
import { UiBanner, UiButton, UiCheckbox, UiField, UiIcon, UiInput, UiLink, UiStack, UiText } from '@/design-system'
import type { PendingAction } from '@/shell/composables/useAuthGate'
import { formatCountdown } from '../format'
import { pendingContextText } from '../labels'

const props = defineProps<{
  email: string
  emailError: string
  ageChecked: boolean
  termsChecked: boolean
  pdChecked: boolean
  marketingChecked: boolean
  sending: boolean
  canSubmit: boolean
  sendBlockedRemainingMs: number
  pendingAction: PendingAction | null
}>()

const emit = defineEmits<{
  'update:email': [string]
  'update:ageChecked': [boolean]
  'update:termsChecked': [boolean]
  'update:pdChecked': [boolean]
  'update:marketingChecked': [boolean]
  submit: []
}>()

const contextText = computed(() => (props.pendingAction ? pendingContextText(props.pendingAction) : ''))
</script>

<template>
  <div class="auth-step">
    <UiText variant="h1">Войдите или создайте аккаунт</UiText>
    <UiText variant="body" class="auth-step__lead">Отправим код на вашу почту. Пароль не нужен.</UiText>
    <p v-if="contextText" class="auth-step__context">
      <UiIcon name="info" :size="16" />
      {{ contextText }}
    </p>

    <form class="auth-step__form" novalidate @submit.prevent="emit('submit')">
      <UiField label="Email" hint="name@example.ru" :error="emailError || undefined">
        <template #default="{ id, describedBy, invalid }">
          <UiInput
            :id="id"
            type="email"
            autocomplete="email"
            :model-value="email"
            :invalid="invalid"
            :aria-describedby="describedBy"
            placeholder="name@example.ru"
            @update:model-value="emit('update:email', $event)"
          />
        </template>
      </UiField>

      <UiStack :gap="3" class="auth-step__consents">
        <UiCheckbox :model-value="ageChecked" @update:model-value="emit('update:ageChecked', $event)">Мне есть 14 лет *</UiCheckbox>
        <UiCheckbox :model-value="termsChecked" @update:model-value="emit('update:termsChecked', $event)">
          Принимаю <UiLink variant="accent" href="/legal/user-agreement">Пользовательское соглашение</UiLink> и
          <UiLink variant="accent" href="/legal/privacy-policy">Политику конфиденциальности</UiLink> *
        </UiCheckbox>
        <UiCheckbox :model-value="pdChecked" @update:model-value="emit('update:pdChecked', $event)">
          Даю согласие на <UiLink variant="accent" href="/legal/pd-consent">обработку персональных данных</UiLink> *
        </UiCheckbox>
        <UiCheckbox :model-value="marketingChecked" @update:model-value="emit('update:marketingChecked', $event)">
          Хочу получать новости и рекомендации сервиса
        </UiCheckbox>
        <UiText variant="caption" class="auth-step__required-note">* обязательно</UiText>
      </UiStack>

      <UiBanner v-if="sendBlockedRemainingMs > 0" variant="warning">Слишком много попыток. Повторите через {{ formatCountdown(sendBlockedRemainingMs) }}</UiBanner>

      <UiButton type="submit" variant="primary" block :loading="sending" :disabled="!canSubmit">Получить код</UiButton>
    </form>
  </div>
</template>

<style scoped>
.auth-step__lead {
  color: var(--text-2);
  margin-top: var(--s-1);
}

.auth-step__context {
  display: flex;
  align-items: flex-start;
  gap: var(--s-2);
  margin: var(--s-4) 0 0;
  padding: var(--s-3);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text-2);
  font-size: 14px;
}

.auth-step__form {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  margin-top: var(--s-6);
}

.auth-step__required-note {
  color: var(--text-3);
}

.auth-step__switch {
  margin-top: var(--s-4);
}
</style>
