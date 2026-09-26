<script setup lang="ts">
import { useRouter } from 'vue-router'
import { UiButton, UiIcon, UiScreenBar, UiText, useMediaQuery } from '@/design-system'
import { closeEditor } from '@/pages/create/links'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { useViewer } from '@/shell/composables/useViewer'
import MeGuestState from './MeGuestState.vue'

/*
  Общий каркас подразделов кабинета M4–M8 и страниц AC1, ST1 (`screens-without-reference.md` §3.1, «Общие правила M2–M8»):
  верхняя панель «Назад — название — действия», под ней при необходимости пометка «Видно только вам». На телефоне это `UiScreenBar`
  (липкая), на десктопе (≥900 px) шапка сайта остаётся на месте, а название стоит в самом содержимом. «Назад» возвращает по истории
  (прокрутка и вкладки восстанавливаются, §26.3), без истории — в «Мое». Гостю вместо содержимого — приглашение войти.
*/

withDefaults(
  defineProps<{
    title: string
    /** Пояснение для гостя. Без него содержимое видно и гостю (настройки внешнего вида). */
    guestText?: string
    /** Пометка «Видно только вам» под заголовком. */
    priv?: boolean
    backHref?: string
    /** Подпись ссылки «назад» в шапке на десктопе. */
    backLabel?: string
    /** Ширина колонки содержимого: `narrow` — списки и формы, `wide` — сетка карточек. */
    width?: 'narrow' | 'wide'
  }>(),
  { guestText: undefined, priv: false, backHref: '/me', backLabel: 'Мое', width: 'wide' },
)

defineSlots<{
  /** Действия справа: на телефоне иконки в панели, на десктопе кнопки в заголовке (`desktop`). */
  actions?(props: { desktop: boolean }): unknown
  default?(): unknown
}>()

const router = useRouter()
const { isSignedIn } = useViewer()
const isDesktop = useMediaQuery('(min-width: 900px)')

function back(fallback: string): void {
  closeEditor(router, fallback)
}
</script>

<template>
  <main class="me-screen">
    <UiScreenBar v-if="!isDesktop" :title="title" @back="back(backHref)">
      <template v-if="$slots.actions" #actions><slot name="actions" :desktop="false" /></template>
    </UiScreenBar>

    <ShellContainer>
      <div class="me-screen__inner" :class="`me-screen__inner--${width}`">
        <header v-if="isDesktop" class="me-screen__head">
          <UiButton variant="ghost" size="sm" icon-left="arrow-l" :href="backHref">{{ backLabel }}</UiButton>
          <div class="me-screen__title-row">
            <UiText variant="h1">{{ title }}</UiText>
            <div v-if="$slots.actions" class="me-screen__actions"><slot name="actions" :desktop="true" /></div>
          </div>
        </header>

        <MeGuestState v-if="!isSignedIn && guestText !== undefined" :title="title" :description="guestText" />
        <template v-else>
          <p v-if="priv && isSignedIn" class="me-screen__private"><UiIcon name="lock" :size="14" />Видно только вам</p>
          <slot />
        </template>
      </div>
    </ShellContainer>
  </main>
</template>

<style scoped>
.me-screen {
  padding-bottom: var(--s-16);
}

.me-screen__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
  padding-top: var(--s-4);
  align-content: start;
}

.me-screen__inner--narrow {
  max-width: 720px;
}

.me-screen__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
  justify-items: start;
}

.me-screen__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  width: 100%;
}

.me-screen__actions {
  display: flex;
  align-items: center;
  gap: var(--s-2);
}

.me-screen__private {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  color: var(--text-3);
  font-size: 13px;
}

@media (min-width: 900px) {
  .me-screen__inner {
    padding-top: var(--s-6);
  }
}
</style>
