<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiButton, UiListRow, UiSegmented, UiText, useToast } from '@/design-system'
import ConfirmSheet from '@/pages/create/components/ConfirmSheet.vue'
import { useAiPermissions } from '@/pages/ai/aiState'
import { useSettings } from '@/state/settings'
import { useLibrary } from '@/state/useLibrary'
import SettingsField from './SettingsField.vue'
import SettingsGroup from './SettingsGroup.vue'

/*
  ST1 · Приватность (§20.1–20.3, §15.2, §5.6, §23.3, §12.4): видимость профиля и публикаций по умолчанию, персонализация (Главная и Поиск работают и
  без неё, §20.3), два разных разрешения ИИ, заблокированные, скрытые, история. Переключатели применяются сразу, тост «Сохранено».
*/

const settings = useSettings()
const library = useLibrary()
const ai = useAiPermissions()
const { show } = useToast()
const confirmReset = ref(false)

const PROFILE_ITEMS = [
  { id: 'public', label: 'Публичный' },
  { id: 'private', label: 'Закрытый' },
]
const POST_ITEMS = [
  { id: 'public', label: 'Публичная' },
  { id: 'private', label: 'Только для меня' },
]

const data = computed(() => settings.settings.value)
const blocked = computed(() => library.blockedAuthorIds.value.length)
const hidden = computed(() => library.hiddenAuthorIds.value.length + library.hiddenVenueIds.value.length)

function saved(): void {
  show({ text: 'Сохранено', variant: 'success' })
}

function onProfile(value: string): void {
  settings.setProfileVisibility(value === 'private' ? 'private' : 'public')
  saved()
}

function onPosts(value: string): void {
  settings.setDefaultPostVisibility(value === 'private' ? 'private' : 'public')
  saved()
}

function onPersonalization(on: boolean | undefined): void {
  settings.setPersonalization(on === true)
  saved()
}

function onAiLibrary(on: boolean | undefined): void {
  ai.setLibrary(on === true)
  saved()
}

function onAiPrivate(on: boolean | undefined): void {
  ai.setPrivateText(on === true)
  saved()
}

function onReset(): void {
  settings.resetTasteProfile()
  show({ text: 'Профиль вкусов сброшен', variant: 'success' })
}
</script>

<template>
  <SettingsGroup id="privacy" title="Приватность">
    <SettingsField
      title="Видимость профиля"
      :description="data.profileVisibility === 'private' ? 'Ваша страница скрыта. Отдельные публичные публикации остаются в ленте и по ссылкам.' : 'Профиль виден всем: подписчики, публикации, подборки.'"
    >
      <UiSegmented label="Видимость профиля" :items="PROFILE_ITEMS" :model-value="data.profileVisibility" @update:model-value="onProfile" />
    </SettingsField>

    <SettingsField title="Видимость публикаций" description="Значение для новых записей: в редакторе оно подставляется само и всегда видно. Видимость подборок задаётся у каждой подборки.">
      <UiSegmented label="Видимость публикаций по умолчанию" :items="POST_ITEMS" :model-value="data.defaultPostVisibility" @update:model-value="onPosts" />
    </SettingsField>

    <div class="settings-privacy__block">
      <UiListRow
        title="Персональные рекомендации"
        description="Если выключить, Главная и Поиск продолжат работать: подборки редакции, популярное и контекст города."
        :toggle="data.personalization"
        @update:toggle="onPersonalization"
      />
      <div class="settings-privacy__reset">
        <UiButton variant="ghost" size="sm" @click="confirmReset = true">Сбросить профиль вкусов</UiButton>
        <UiText v-if="data.tasteProfileResetAt" variant="caption">Сброшен</UiText>
      </div>
    </div>

    <div class="settings-privacy__block">
      <SettingsField title="Разрешения ИИ" description="Работают только с Премиум. Приватные данные других пользователей ИИ не использует." />
      <UiListRow
        title="Доступ ИИ к личной библиотеке"
        description="Избранное, Посещения, Оценки, приватные подборки, сохранённые события."
        :toggle="ai.permissions.value.library"
        @update:toggle="onAiLibrary"
      />
      <UiListRow
        title="Доступ ИИ к приватным текстам"
        description="Текст приватных публикаций и Дневника. По умолчанию выключено."
        :toggle="ai.permissions.value.privateText"
        @update:toggle="onAiPrivate"
      />
      <UiText variant="caption" class="settings-privacy__note">Сервис не предназначен для учёта медицинских данных.</UiText>
    </div>

    <UiListRow title="Заблокированные" href="/settings/blocked" :value="String(blocked)" />
    <UiListRow title="Скрытые авторы и заведения" href="/settings/hidden" :value="String(hidden)" />
    <UiListRow title="История" href="/settings/history" />

    <ConfirmSheet
      v-model:open="confirmReset"
      title="Сбросить профиль вкусов?"
      text="Рекомендации начнутся заново. Сброс не удаляет ваши избранное, отзывы и записи."
      confirm-label="Сбросить"
      @confirm="onReset"
    />
  </SettingsGroup>
</template>

<style scoped>
.settings-privacy__block {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.settings-privacy__reset {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  padding: 0 var(--s-2) var(--s-2);
}

.settings-privacy__note {
  padding: var(--s-2) var(--s-3) var(--s-3);
  color: var(--text-3);
}
</style>
