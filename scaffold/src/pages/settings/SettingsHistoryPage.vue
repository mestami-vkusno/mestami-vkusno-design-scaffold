<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiListRow, UiSurface, UiText, useToast } from '@/design-system'
import { formatDate } from '@/mocks/format'
import ConfirmSheet from '@/pages/create/components/ConfirmSheet.vue'
import { useSettings } from '@/state/settings'
import { useLibrary } from '@/state/useLibrary'
import SettingsSubScreen from './components/SettingsSubScreen.vue'

/*
  ST1 · История (§20.1 «управление историей», `/settings/history`): три действия, каждое с подтверждением O12. ТЗ называет только «управление
  историей», перечень (просмотры, поиск, диалоги ИИ) — рабочий дефолт мока (assumption, вопрос 0017). История просмотров чистится по-настоящему
  (тот же список, что в «Недавно просмотренное»); история поиска в моке нигде не хранится, поэтому запоминается лишь отметка «очищена»;
  диалоги ИИ скрываются на странице ИИ.
*/

type Kind = 'views' | 'search' | 'ai'

const library = useLibrary()
const settings = useSettings()
const { show } = useToast()
const confirm = ref<{ open: boolean; kind: Kind }>({ open: false, kind: 'views' })

const TEXT: Record<Kind, { title: string; text: string; label: string }> = {
  views: { title: 'Очистить историю просмотров?', text: 'Список «Недавно просмотренное» опустеет. Избранное, отзывы и записи не пострадают.', label: 'Очистить' },
  search: { title: 'Очистить историю поиска?', text: 'Прошлые запросы перестанут подсказываться в Поиске.', label: 'Очистить' },
  ai: { title: 'Удалить историю диалогов с ИИ?', text: 'Все диалоги исчезнут из раздела ИИ. Это действие нельзя отменить.', label: 'Удалить' },
}

const data = computed(() => settings.settings.value)
const viewsCount = computed(() => library.recentlyViewed.value.length)

function ask(kind: Kind): void {
  confirm.value = { open: true, kind }
}

function onConfirm(): void {
  const kind = confirm.value.kind
  if (kind === 'views') library.clearRecentlyViewed()
  else {
    if (kind === 'search') settings.clearSearchHistory()
    else settings.clearAiHistory()
    show({ text: kind === 'search' ? 'История поиска очищена' : 'История диалогов с ИИ удалена', variant: 'success' })
  }
}
</script>

<template>
  <SettingsSubScreen title="История" hash="privacy">
    <UiSurface variant="card" class="history">
      <UiListRow title="Очистить историю просмотров" :description="viewsCount === 0 ? 'Пока пусто' : `Записей: ${viewsCount}`" icon="clock" divider :chevron="false" @click="ask('views')" />
      <UiListRow
        title="Очистить историю поиска"
        :description="data.searchHistoryClearedAt ? `Очищена ${formatDate(data.searchHistoryClearedAt)}` : undefined"
        icon="search"
        divider
        :chevron="false"
        @click="ask('search')"
      />
      <UiListRow
        title="Удалить историю диалогов с ИИ"
        :description="data.aiHistoryClearedAt ? `Удалена ${formatDate(data.aiHistoryClearedAt)}` : undefined"
        icon="sparkle"
        danger
        :chevron="false"
        @click="ask('ai')"
      />
    </UiSurface>
    <UiText variant="caption" class="history__note">Управление историей не затрагивает Избранное, Посещения, оценки, отзывы и ваши публикации.</UiText>

    <ConfirmSheet v-model:open="confirm.open" :title="TEXT[confirm.kind].title" :text="TEXT[confirm.kind].text" :confirm-label="TEXT[confirm.kind].label" @confirm="onConfirm" />
  </SettingsSubScreen>
</template>

<style scoped>
.history {
  padding: var(--s-1);
}

.history__note {
  color: var(--text-3);
}
</style>
