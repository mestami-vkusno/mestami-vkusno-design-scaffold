<script setup lang="ts">
import { ref } from 'vue'
import { UiButton, UiSegmented, useMediaQuery, useToast } from '@/design-system'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { useViewer } from '@/shell/composables/useViewer'
import MeGuestState from './components/MeGuestState.vue'
import MeLibraryOverview from './components/MeLibraryOverview.vue'
import MeProfileSummary from './components/MeProfileSummary.vue'
import MeSideMenu from './components/MeSideMenu.vue'

/*
  P1 «Профиль» (§4.6, `/me`): два режима — «Профиль» (сводка своего авторского профиля, полное содержимое —
  задача 0010) и «Мое» (M1, §18: точки входа в личную библиотеку). Переключение режимов — состояние страницы,
  не переход роутера. На десктопе (≥900 px) им управляет постоянное левое меню (макет 0018/0020,
  `MeSideMenu` уже собирает и переходы на M2–M8); на мобильном, где меню нет, — сегментированный переключатель
  наверху и короткий блок аккаунта (Настройки, Выйти) под обзором библиотеки.

  Гость на `/me` вообще не видит режимов: «Мое» — только для вошедшего (§18), приглашение ведёт на `/auth`.
*/

type Mode = 'profile' | 'me'

const MODE_ITEMS = [
  { id: 'profile', label: 'Профиль' },
  { id: 'me', label: 'Мое' },
] as const

const { isSignedIn, signOut } = useViewer()
const isDesktop = useMediaQuery('(min-width: 900px)')
const mode = ref<Mode>('profile')
const { show } = useToast()

function onSideMenuMode(next: Mode): void {
  mode.value = next
}

function onSignOut(): void {
  signOut()
  show({ text: 'Вы вышли', variant: 'default' })
}

</script>

<template>
  <main class="me-page">
    <ShellContainer>
      <MeGuestState
        v-if="!isSignedIn"
        title="Профиль"
        description="Войдите, чтобы вести профиль и личную библиотеку: Избранное, Посещения, Дневник и другое."
      />

      <div v-else class="me-page__layout">
        <MeSideMenu v-if="isDesktop" class="me-page__side" :active="mode" @mode="onSideMenuMode" @sign-out="onSignOut" />
        <UiSegmented
          v-else
          class="me-page__switch"
          label="Раздел кабинета"
          :items="MODE_ITEMS"
          :model-value="mode"
          @update:model-value="mode = $event as Mode"
        />

        <div class="me-page__content">
          <MeProfileSummary v-if="mode === 'profile'" />
          <template v-else>
            <MeLibraryOverview />
            <div v-if="!isDesktop" class="me-page__account">
              <UiButton variant="outline" icon-left="settings" block href="/settings">Настройки</UiButton>
              <UiButton variant="outline" icon-left="logout" block @click="onSignOut">Выйти</UiButton>
            </div>
          </template>
        </div>
      </div>
    </ShellContainer>
  </main>
</template>

<style scoped>
.me-page {
  padding-block: var(--s-6) var(--s-16);
}

.me-page__layout {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
}

.me-page__switch {
  align-self: flex-start;
}

.me-page__content {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  min-width: 0;
}

.me-page__account {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

@media (min-width: 900px) {
  .me-page__layout {
    flex-direction: row;
    align-items: flex-start;
    gap: var(--s-6);
  }

  .me-page__content {
    flex: 1;
  }
}
</style>
