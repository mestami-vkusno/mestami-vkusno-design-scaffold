<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiButton, UiField, UiInput, UiMediaPicker, UiSegmented, UiText, UiTextarea, simulateMediaUpload } from '@/design-system'
import type { MediaPickerItem } from '@/design-system'
import type { UsernameStatus } from '../useAuthFlow'

const props = defineProps<{
  displayName: string
  username: string
  about: string
  visibility: 'public' | 'private'
  usernameStatus: UsernameStatus
  canSubmit: boolean
}>()

const emit = defineEmits<{
  'update:displayName': [string]
  'update:username': [string]
  'update:about': [string]
  'update:visibility': ['public' | 'private']
  'check-username': []
  submit: []
}>()

const avatarItems = ref<MediaPickerItem[]>([])
const uploader = simulateMediaUpload({ durationMs: 1400 })

const VISIBILITY_ITEMS = [
  { id: 'public', label: 'Публичный' },
  { id: 'private', label: 'Закрытый' },
]

const usernameHint = computed<string | undefined>(() => {
  if (props.usernameStatus === 'checking') return 'Проверяем…'
  if (props.usernameStatus === 'available') return 'Свободно'
  return 'Позже его можно будет сменить, но не сразу'
})

const usernameError = computed<string | undefined>(() => {
  if (props.usernameStatus === 'taken') return 'Имя занято'
  if (props.usernameStatus === 'reserved') return 'Это имя зарезервировано'
  return undefined
})

const visibilityCaption = computed(() =>
  props.visibility === 'public'
    ? 'Профиль виден всем, есть подписчики и вкладки.'
    : 'Страница скрыта; отдельные публичные публикации остаются в ленте и по ссылкам.',
)

function onUsernameInput(value: string): void {
  emit('update:username', value.replace(/^@/, ''))
  emit('check-username')
}
</script>

<template>
  <div class="auth-step">
    <UiText variant="h1">Расскажите о себе</UiText>

    <form class="auth-step__form" novalidate @submit.prevent="emit('submit')">
      <div class="auth-step__avatar">
        <UiMediaPicker v-model:items="avatarItems" :multiple="false" ratio="1/1" shape="circle" add-label="Добавить фото" :uploader="uploader" />
      </div>

      <UiField label="Имя">
        <template #default="{ id, describedBy }">
          <UiInput :id="id" :model-value="displayName" :aria-describedby="describedBy" autocomplete="name" @update:model-value="emit('update:displayName', $event)" />
        </template>
      </UiField>

      <UiField label="Имя пользователя" :hint="usernameHint" :error="usernameError">
        <template #default="{ id, describedBy, invalid }">
          <div class="auth-step__username">
            <span class="auth-step__at">@</span>
            <UiInput :id="id" :model-value="username" :invalid="invalid" :aria-describedby="describedBy" autocomplete="off" @update:model-value="onUsernameInput" />
          </div>
        </template>
      </UiField>

      <UiField label="О себе (необязательно)">
        <template #default="{ id, describedBy }">
          <UiTextarea :id="id" :model-value="about" :max-length="160" :aria-describedby="describedBy" @update:model-value="emit('update:about', $event)" />
        </template>
      </UiField>

      <div class="auth-step__visibility">
        <UiSegmented label="Видимость профиля" :items="VISIBILITY_ITEMS" :model-value="visibility" @update:model-value="emit('update:visibility', $event as 'public' | 'private')" />
        <UiText variant="caption" class="auth-step__visibility-caption">{{ visibilityCaption }}</UiText>
      </div>

      <UiButton type="submit" variant="primary" block :disabled="!canSubmit">Продолжить</UiButton>
    </form>
  </div>
</template>

<style scoped>
.auth-step__form {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  margin-top: var(--s-6);
}

.auth-step__avatar {
  display: flex;
  justify-content: center;
}

.auth-step__username {
  position: relative;
}

.auth-step__at {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 14px;
  display: flex;
  align-items: center;
  color: var(--text-3);
  pointer-events: none;
}

.auth-step__username :deep(.ui-input) {
  padding-left: 26px;
}

.auth-step__visibility {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  align-items: flex-start;
}

.auth-step__visibility-caption {
  color: var(--text-3);
}
</style>
