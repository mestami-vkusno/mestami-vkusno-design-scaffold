<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiEmptyState, UiButton, UiSideMenu, useMediaQuery, useToast } from '@/design-system'
import type { NavItem } from '@/design-system'
import MeScreen from '@/pages/me/components/MeScreen.vue'
import { useViewer } from '@/shell/composables/useViewer'
import SettingsAccount from './components/SettingsAccount.vue'
import SettingsAppearance from './components/SettingsAppearance.vue'
import SettingsData from './components/SettingsData.vue'
import SettingsNotifications from './components/SettingsNotifications.vue'
import SettingsPrivacy from './components/SettingsPrivacy.vue'

/*
  ST1 «Настройки» (§20.1–20.4, §20А, §19.3, §5.6, §5.7, §23.3, `/settings`): пять групп — Приватность, Уведомления, Аккаунт, Персональные данные,
  Внешний вид. На телефоне это один экран с группами подряд (якоря `/settings#privacy`…), на десктопе (≥900 px) — «мастер — деталь»: слева меню
  групп, справа выбранная. Гость видит только «Внешний вид», документы и приглашение войти (вопрос 4). Скрытые, заблокированные и история
  открываются вложенными маршрутами `/settings/blocked`, `/settings/hidden`, `/settings/history` (вопрос 14).
*/

type GroupId = 'privacy' | 'notifications' | 'account' | 'data' | 'appearance'

const MENU: readonly NavItem[] = [
  { id: 'privacy', label: 'Приватность', icon: 'lock' },
  { id: 'notifications', label: 'Уведомления', icon: 'bell' },
  { id: 'account', label: 'Аккаунт', icon: 'user' },
  { id: 'data', label: 'Персональные данные', icon: 'shield' },
  { id: 'appearance', label: 'Внешний вид', icon: 'sparkle' },
]
const SECONDARY: readonly NavItem[] = [{ id: 'logout', label: 'Выйти', icon: 'logout' }]
const GROUPS: readonly GroupId[] = ['privacy', 'notifications', 'account', 'data', 'appearance']

const route = useRoute()
const router = useRouter()
const { isSignedIn, signOut } = useViewer()
const { show } = useToast()
const isDesktop = useMediaQuery('(min-width: 900px)')

const active = computed<GroupId>(() => {
  const hash = route.hash.replace('#', '')
  return GROUPS.find((id) => id === hash) ?? (isSignedIn.value ? 'privacy' : 'appearance')
})

// На десктопе видна одна группа: якорь в адресе выбирает её, а не прокручивает.
watch(
  () => route.hash,
  () => {
    if (isDesktop.value) window.scrollTo({ top: 0, behavior: 'instant' })
  },
)

function onSelect(item: NavItem): void {
  if (item.id === 'logout') {
    signOut()
    show({ text: 'Вы вышли' })
    void router.push('/')
  } else {
    void router.replace({ hash: `#${item.id}` })
  }
}

const shown = (id: GroupId): boolean => !isDesktop.value || active.value === id
</script>

<template>
  <MeScreen title="Настройки" width="wide">
    <div class="settings">
      <UiSideMenu v-if="isDesktop && isSignedIn" class="settings__menu" label="Разделы настроек" :items="MENU" :secondary-items="SECONDARY" :model-value="active" @select="onSelect" />

      <div class="settings__groups">
        <template v-if="isSignedIn">
          <SettingsPrivacy v-if="shown('privacy')" />
          <SettingsNotifications v-if="shown('notifications')" />
          <SettingsAccount v-if="shown('account')" />
          <SettingsData v-if="shown('data')" />
        </template>
        <UiEmptyState v-else mode="guest" title="Войдите, чтобы управлять приватностью" description="Видимость профиля, уведомления, аккаунт и запросы по персональным данным доступны после входа.">
          <template #actions><UiButton href="/auth">Войти или создать аккаунт</UiButton></template>
        </UiEmptyState>
        <SettingsAppearance v-if="shown('appearance')" />
      </div>
    </div>
  </MeScreen>
</template>

<style scoped>
.settings {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-6);
  align-items: start;
}

.settings__groups {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-6);
}

@media (min-width: 900px) {
  .settings {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .settings__groups {
    max-width: 720px;
  }

  .settings__menu {
    position: sticky;
    top: calc(56px + var(--s-4));
  }
}
</style>
