<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UiButton, UiField, UiInput, UiSegmented, UiSheet, UiText, UiTextarea, useToast } from '@/design-system'
import { getAuthorByUsername } from '@/mocks/selectors/social'
import { RESERVED_USERNAMES, isUsernameFormatValid } from '@/pages/auth/labels'
import { VIEWER_ID } from '@/state/session'
import { useSettings } from '@/state/settings'

/*
  Правка профиля: та же форма, что A3 («Расскажите о себе»), но поверх готового профиля (§5.7, §15.2). Имя пользователя меняется
  не чаще раза в 30 дней (assumption, вопрос 0017), видимость профиля — та же настройка, что и в «Настройки → Приватность».
  Аватар в этой версии не правится: загрузка снимка в моке ничего не сохраняет, а заглушки-фото берутся из данных (вопрос 13, front-structure).
*/

const open = defineModel<boolean>('open', { required: true })
const settings = useSettings()
const { show } = useToast()

const VISIBILITY_ITEMS = [
  { id: 'public', label: 'Публичный' },
  { id: 'private', label: 'Закрытый' },
]

const displayName = ref('')
const username = ref('')
const about = ref('')
const visibility = ref<'public' | 'private'>('public')

watch(open, (value) => {
  if (!value) return
  const profile = settings.profile.value
  displayName.value = profile?.displayName ?? ''
  username.value = profile?.username ?? ''
  about.value = profile?.about ?? ''
  visibility.value = settings.settings.value.profileVisibility
}, { immediate: true })

const current = computed(() => settings.profile.value?.username ?? '')
const locked = computed(() => settings.usernameCooldownDays.value > 0)
const changed = computed(() => username.value.trim().replace(/^@/, '') !== current.value)

const usernameError = computed<string | undefined>(() => {
  const value = username.value.trim().replace(/^@/, '')
  if (!changed.value) return undefined
  if (!isUsernameFormatValid(value)) return 'От 3 до 24 символов: латинские буквы, цифры и подчёркивание'
  if (RESERVED_USERNAMES.includes(value.toLowerCase())) return 'Это имя зарезервировано'
  const owner = getAuthorByUsername(value)
  return owner !== undefined && owner.id !== VIEWER_ID ? 'Имя занято' : undefined
})

const usernameHint = computed(() => {
  if (locked.value) return `Имя пользователя можно менять раз в 30 дней. Следующая смена через ${settings.usernameCooldownDays.value} дн.`
  return 'Позже его можно будет сменить, но не чаще раза в 30 дней'
})

const canSave = computed(() => displayName.value.trim() !== '' && usernameError.value === undefined && username.value.trim() !== '' && !(locked.value && changed.value))

const visibilityCaption = computed(() =>
  visibility.value === 'public' ? 'Профиль виден всем, есть подписчики и вкладки.' : 'Страница скрыта; отдельные публичные публикации остаются в ленте и по ссылкам.',
)

function save(): void {
  if (!canSave.value) return
  const result = settings.saveProfile({ displayName: displayName.value, username: username.value, about: about.value })
  if (!result.ok) return
  settings.setProfileVisibility(visibility.value)
  open.value = false
  show({ text: 'Профиль сохранён', variant: 'success' })
}
</script>

<template>
  <UiSheet v-model:open="open" title="Изменить профиль">
    <form class="profile-edit" novalidate @submit.prevent="save">
      <UiField label="Имя">
        <template #default="{ id, describedBy }">
          <UiInput :id="id" v-model="displayName" :aria-describedby="describedBy" autocomplete="name" />
        </template>
      </UiField>

      <UiField label="Имя пользователя" :hint="usernameHint" :error="usernameError">
        <template #default="{ id, describedBy, invalid }">
          <UiInput :id="id" v-model="username" :invalid="invalid" :disabled="locked" :aria-describedby="describedBy" autocomplete="off" />
        </template>
      </UiField>

      <UiField label="О себе (необязательно)">
        <template #default="{ id, describedBy }">
          <UiTextarea :id="id" v-model="about" :max-length="160" :aria-describedby="describedBy" />
        </template>
      </UiField>

      <div class="profile-edit__visibility">
        <UiSegmented v-model="visibility" label="Видимость профиля" :items="VISIBILITY_ITEMS" />
        <UiText variant="caption" class="profile-edit__caption">{{ visibilityCaption }}</UiText>
      </div>

      <div class="profile-edit__actions">
        <UiButton type="submit" block :disabled="!canSave">Сохранить</UiButton>
        <UiButton variant="ghost" block @click="open = false">Отмена</UiButton>
      </div>
    </form>
  </UiSheet>
</template>

<style scoped>
.profile-edit {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.profile-edit__visibility {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
}

.profile-edit__caption {
  color: var(--text-3);
}

.profile-edit__actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
}
</style>
