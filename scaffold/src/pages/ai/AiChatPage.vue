<script setup lang="ts">
/*
  AI2 · Диалог с ИИ (`/ai/chat/:conversationId`). Ответ: короткий вывод, карточки с причинами и компромиссами, сравнение
  2–4 заведений, действия и подсказки (§23.5–23.6). Два переключателя разрешений на данные (§23.3).
  Публичной ссылки на диалог нет: нет кнопки «Поделиться», страница закрыта от индексации, чужой диалог не открывается.
  Новые запросы — только при активном Премиум (`canUseAi`); иначе вместо поля запроса предложение подписки, а старые ответы читаются (§23.8).
*/
import '@/features/shared/base.css'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { UiButton, UiEmptyState, UiIcon, useMotion } from '@/design-system'
import { AiTeaser } from '@/features/actions'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { currentUserId } from '@/state/session'
import { usePremium } from '@/state/usePremium'
import { addReply, addUserMessage, awaitsReply, useMessages } from './aiState'
import { PRIVACY_NOTE, SUGGESTIONS } from './copy'
import AiAssistantMessage from './components/AiAssistantMessage.vue'
import AiComposer from './components/AiComposer.vue'
import AiPermissions from './components/AiPermissions.vue'
import { useNoIndex } from './useNoIndex'

useNoIndex()

const route = useRoute()
const { isReduced } = useMotion()
const { canUseAi, canReadAiHistory } = usePremium()

const conversationId = computed(() => String(route.params['conversationId'] ?? ''))
const { conversation, messages } = useMessages(() => conversationId.value)
useDocumentTitle(() => conversation.value?.title)

/** Диалог приватный: открывается только владельцу. */
const state = computed<'guest' | 'missing' | 'ready'>(() => {
  if (!canReadAiHistory.value) return 'guest'
  const current = conversation.value
  return current === undefined || current.userId !== currentUserId.value ? 'missing' : 'ready'
})

// Анимация только у сообщений, пришедших после открытия страницы: уже прочитанное не «влетает» заново.
const initialCount = messages.value.length
const pending = ref(false)
const permissionsOpen = ref(false)
const endMarker = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

/** Реальный идентификатор диалога: адрес `/ai/chat/1` открывает `ai-conv-1`, а сообщения хранятся под ним. */
function realId(): string {
  return conversation.value?.id ?? conversationId.value
}

function scheduleReply(question: string): void {
  const id = realId()
  pending.value = true
  timer = setTimeout(
    () => {
      addReply(id, question)
      pending.value = false
    },
    isReduced.value ? 0 : 900,
  )
}

function ask(text: string): void {
  if (!canUseAi.value || pending.value || state.value !== 'ready') return
  addUserMessage(realId(), text)
  scheduleReply(text)
}

onMounted(() => {
  const last = messages.value[messages.value.length - 1]
  if (state.value === 'ready' && canUseAi.value && last !== undefined && last.role === 'user' && awaitsReply(messages.value)) scheduleReply(last.text)
})

onBeforeUnmount(() => clearTimeout(timer))

// Новое сообщение или «печатает»: прокрутка к концу. Обычная прокрутка (`scrollIntoView`), без слоя `transform` на странице.
watch(
  () => [messages.value.length, pending.value],
  async () => {
    if (messages.value.length <= initialCount && !pending.value) return
    await nextTick()
    endMarker.value?.scrollIntoView({ behavior: isReduced.value ? 'auto' : 'smooth', block: 'end' })
  },
)
</script>

<template>
  <main class="ai-chat">
    <ShellContainer class="ai-chat__body">
      <UiEmptyState v-if="state === 'guest'" mode="guest" title="Диалоги видны только вам" description="Войдите, чтобы открыть свои диалоги с ИИ." page>
        <template #actions><UiButton href="/auth">Войти или создать аккаунт</UiButton></template>
      </UiEmptyState>

      <UiEmptyState v-else-if="state === 'missing'" mode="empty" title="Диалог не найден" description="Он мог быть удалён, либо принадлежит другому пользователю." page>
        <template #actions><UiButton variant="outline" href="/ai">К запросам ИИ</UiButton></template>
      </UiEmptyState>

      <template v-else-if="conversation">
        <header class="ai-chat__head">
          <UiButton variant="ghost" size="sm" icon-left="arrow-l" href="/ai">ИИ</UiButton>
          <h1 class="ai-chat__title">{{ conversation.title }}</h1>
          <div class="ai-chat__meta">
            <p class="ai-chat__privacy"><UiIcon name="lock" :size="14" /> {{ PRIVACY_NOTE }}</p>
            <UiButton size="sm" variant="outline" icon-left="shield" aria-haspopup="dialog" @click="permissionsOpen = true">Данные для ИИ</UiButton>
          </div>
        </header>

        <ol class="ai-chat__list" role="log" aria-label="Диалог с ИИ" aria-live="polite">
          <li v-for="(message, index) in messages" :key="message.id" class="ai-chat__item" :class="[`ai-chat__item--${message.role}`, { 'ai-chat__item--new': index >= initialCount }]">
            <p v-if="message.role === 'user'" class="ai-chat__bubble"><span class="fx-sr-only">Вы: </span>{{ message.text }}</p>
            <AiAssistantMessage v-else :message="message" :can-generate="canUseAi" @ask="ask" />
          </li>
          <Transition name="ai-typing">
            <li v-if="pending" class="ai-chat__item ai-chat__typing" aria-label="ИИ готовит ответ" role="status">
              <span class="ai-chat__dot" /><span class="ai-chat__dot" /><span class="ai-chat__dot" />
            </li>
          </Transition>
        </ol>
        <div ref="endMarker" class="ai-chat__end" aria-hidden="true" />

        <div class="ai-chat__composer">
          <AiComposer v-if="canUseAi" :placeholder="SUGGESTIONS[0]" @submit="ask" />
          <AiTeaser
            v-else
            context="general"
            source-surface="ai"
            :heading-level="2"
            title="Продолжить диалог — в Премиум"
            description="Старые ответы можно читать. Новые запросы, сравнения и подсказки доступны в Премиум."
            action-label="Подключить Премиум"
          />
        </div>

        <AiPermissions v-model:open="permissionsOpen" />
      </template>
    </ShellContainer>
  </main>
</template>

<style scoped>
.ai-chat {
  padding-block: var(--s-4) var(--s-6);
}

.ai-chat__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-5);
  max-width: 820px;
}

.ai-chat__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: start;
  gap: var(--s-2);
}

.ai-chat__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.ai-chat__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3);
}

.ai-chat__privacy {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  font-size: 13px;
  color: var(--text-3);
}

.ai-chat__list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-6);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Длинная переписка: сообщения вне экрана не считаются и не рисуются. */
.ai-chat__item {
  min-width: 0;
  content-visibility: auto;
  contain-intrinsic-size: auto 240px;
}

.ai-chat__item--user {
  justify-self: end;
  max-width: 88%;
}

.ai-chat__bubble {
  margin: 0;
  padding: var(--s-3) var(--s-4);
  border-radius: var(--r-lg) var(--r-lg) var(--r-xs) var(--r-lg);
  background: var(--surface-2);
  font-size: 15px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

/* Новое сообщение: CSS на токенах, opacity и короткий сдвиг (при уменьшенном движении сдвиг равен нулю). */
.ai-chat__item--new {
  animation: ai-in var(--dur-modal) var(--ease-out) both;
}

@keyframes ai-in {
  from {
    opacity: 0;
    transform: translateY(calc(10px * var(--motion-distance)));
  }
}

.ai-chat__typing {
  display: flex;
  gap: 6px;
  padding: var(--s-2) 0;
}

.ai-chat__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-3);
  animation: ai-dot calc(1.1s * var(--motion-scale)) var(--ease-in-out) infinite;
}

.ai-chat__dot:nth-child(2) {
  animation-delay: 0.15s;
}

.ai-chat__dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes ai-dot {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.ai-typing-enter-active,
.ai-typing-leave-active {
  transition: opacity var(--dur-dropdown) var(--ease-out);
}

.ai-typing-enter-from,
.ai-typing-leave-to {
  opacity: 0;
}

.ai-chat__end {
  height: 1px;
  scroll-margin-bottom: 120px;
}

/* Поле запроса закреплено внизу окна: тот же фон, что у страницы, без размытия. */
.ai-chat__composer {
  position: sticky;
  bottom: 0;
  z-index: 1;
  padding-block: var(--s-3) calc(var(--s-3) + env(safe-area-inset-bottom, 0px));
  background: var(--bg);
}

@media (max-width: 720px) {
  .ai-chat__title {
    font-size: 20px;
  }

  .ai-chat__item--user {
    max-width: 94%;
  }
}
</style>
