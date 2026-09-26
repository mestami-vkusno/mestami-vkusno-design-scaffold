<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UiBadge, UiButton, UiCodeInput, UiField, UiInput, UiSheet, UiText, useToast } from '@/design-system'
import { isEmailValid } from '@/pages/auth/labels'
import { useSettings } from '@/state/settings'

/*
  Смена email (§5.7): новый адрес → код на **новый** адрес → подтверждение. Пока код не введён, работает старый адрес, у строки «Email» бейдж
  «Ожидает подтверждения». Код в моке: любой, кроме `000000` и `999999` (как на экране входа, A2). Занятый адрес — `taken@example.com` и текущий.
*/

const open = defineModel<boolean>('open', { required: true })
const settings = useSettings()
const { show } = useToast()

const email = ref('')
const code = ref('')
const emailError = ref('')
const codeError = ref('')

const pending = computed(() => settings.settings.value.pendingEmail)
const step = computed<'email' | 'code'>(() => (pending.value === null ? 'email' : 'code'))

watch(open, (value) => {
  if (!value) return
  email.value = ''
  code.value = ''
  emailError.value = ''
  codeError.value = ''
}, { immediate: true })

function sendCode(): void {
  const value = email.value.trim()
  if (!isEmailValid(value)) {
    emailError.value = 'Проверьте адрес: name@example.ru'
    return
  }
  if (value.toLowerCase() === settings.settings.value.email.toLowerCase() || value.toLowerCase() === 'taken@example.com') {
    emailError.value = 'Такой адрес уже используется'
    return
  }
  emailError.value = ''
  settings.requestEmailChange(value)
}

function confirm(): void {
  if (code.value === '000000' || code.value === '999999' || code.value.length < 6) {
    codeError.value = 'Код неверен или устарел'
    return
  }
  codeError.value = ''
  settings.confirmEmailChange()
  open.value = false
  show({ text: 'Email изменён', variant: 'success' })
}

function cancel(): void {
  settings.cancelEmailChange()
  open.value = false
}
</script>

<template>
  <UiSheet v-model:open="open" title="Изменить email">
    <form v-if="step === 'email'" class="email-change" novalidate @submit.prevent="sendCode">
      <UiText variant="body">Сейчас: {{ settings.settings.value.email }}. Пришлём код на новый адрес, а пока вы его не подтвердите, работает старый.</UiText>
      <UiField label="Новый email" :error="emailError || undefined">
        <template #default="{ id, describedBy, invalid }">
          <UiInput :id="id" v-model="email" type="email" autocomplete="email" :invalid="invalid" :aria-describedby="describedBy" placeholder="name@example.ru" />
        </template>
      </UiField>
      <UiButton type="submit" block :disabled="email.trim() === ''">Отправить код</UiButton>
    </form>

    <div v-else class="email-change">
      <UiBadge variant="warning">Ожидает подтверждения</UiBadge>
      <UiText variant="body">Мы отправили код на {{ pending }}. Введите его, чтобы подтвердить новый адрес.</UiText>
      <UiField label="Код из письма" :error="codeError || undefined">
        <template #default="{ id }">
          <UiCodeInput :id="id" v-model="code" :invalid="Boolean(codeError)" @complete="confirm" />
        </template>
      </UiField>
      <UiButton block :disabled="code.length < 6" @click="confirm">Подтвердить</UiButton>
      <UiButton variant="ghost" block @click="cancel">Отменить смену</UiButton>
    </div>
  </UiSheet>
</template>

<style scoped>
.email-change {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: start;
  gap: var(--s-4);
}

.email-change > * {
  min-width: 0;
}

.email-change :deep(.ui-button--block),
.email-change :deep(.ui-field) {
  justify-self: stretch;
}
</style>
