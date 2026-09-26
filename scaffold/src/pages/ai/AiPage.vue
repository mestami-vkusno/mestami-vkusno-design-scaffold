<script setup lang="ts">
/*
  AI1 · ИИ (`/ai`). Для активного Премиум — запрос, подсказки и история диалогов. Для гостя, бесплатной версии и
  просроченного Премиум — только контекстное предложение подписки (O6): ни квоты, ни частичного ответа, ни примера ответа (§23.1).
  Предложение сохраняет `premium_intent` (`/ai`, экран `ai`), после покупки пользователь возвращается сюда (J10).
  У просроченного Премиум история диалогов остаётся доступной для чтения (§23.8).
*/
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiChip, UiSurface } from '@/design-system'
import { AiTeaser } from '@/features/actions'
import { conversationsOf } from '@/mocks/selectors/activity'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { currentUserId } from '@/state/session'
import { usePremium } from '@/state/usePremium'
import { settings } from '@/state/settings'
import { startConversation, DRAFT_ID } from './aiState'
import { CAPABILITIES, SUGGESTIONS } from './copy'
import AiComposer from './components/AiComposer.vue'
import AiHistoryList from './components/AiHistoryList.vue'

useDocumentTitle('ИИ')

const route = useRoute()
const router = useRouter()
const { canUseAi, canReadAiHistory } = usePremium()

const initialQuery = computed(() => (typeof route.query['q'] === 'string' ? route.query['q'] : ''))
// «Настройки → История → Удалить историю диалогов с ИИ» (задача 0013) скрывает диалоги здесь.
const aiHistoryCleared = computed(() => settings.value.aiHistoryClearedAt !== null)
const history = computed(() => (canReadAiHistory.value && !aiHistoryCleared.value ? conversationsOf(currentUserId.value) : []))

function ask(text: string): void {
  const userId = currentUserId.value
  if (userId === null || !canUseAi.value) return
  startConversation(text, userId)
  void router.push(`/ai/chat/${DRAFT_ID}`)
}
</script>

<template>
  <main class="ai-page">
    <ShellContainer class="ai-page__body">
      <header class="ai-page__head">
        <h1 class="ai-page__title">ИИ</h1>
        <p class="ai-page__lead">Подбирает и сравнивает места по данным сервиса и объясняет, почему они подходят.</p>
      </header>

      <template v-if="canUseAi">
        <section class="ai-page__ask" aria-label="Новый запрос">
          <AiComposer :initial="initialQuery" :placeholder="SUGGESTIONS[0]" @submit="ask" />
          <div class="ai-page__chips" role="group" aria-label="Подсказки">
            <UiChip v-for="suggestion in SUGGESTIONS" :key="suggestion" size="sm" @click="ask(suggestion)">{{ suggestion }}</UiChip>
          </div>
        </section>
      </template>
      <template v-else>
        <AiTeaser context="general" source-surface="ai" :heading-level="2" action-label="Подключить Премиум" />
        <UiSurface variant="panel" as="section" class="ai-page__caps" aria-labelledby="ai-caps-title">
          <h2 id="ai-caps-title" class="ai-page__h2">Что умеет ИИ</h2>
          <ul class="ai-page__list">
            <li v-for="item in CAPABILITIES" :key="item">{{ item }}</li>
          </ul>
        </UiSurface>
      </template>

      <section v-if="history.length > 0" class="ai-page__history" aria-labelledby="ai-history-title">
        <h2 id="ai-history-title" class="ai-page__h2">Ваши диалоги</h2>
        <p v-if="!canUseAi" class="ai-page__note">Старые диалоги можно читать. Новые запросы доступны в Премиум.</p>
        <AiHistoryList :conversations="history" />
      </section>
    </ShellContainer>
  </main>
</template>

<style scoped>
.ai-page {
  padding-block: var(--s-4) var(--s-12);
}

.ai-page__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-6);
}

.ai-page__head {
  display: grid;
  gap: var(--s-2);
}

.ai-page__title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.15;
}

.ai-page__lead {
  max-width: 560px;
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-2);
}

.ai-page__ask {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  max-width: 720px;
}

.ai-page__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

.ai-page__caps,
.ai-page__history {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
}

.ai-page__history {
  content-visibility: auto;
  contain-intrinsic-size: auto 220px;
}

.ai-page__h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.ai-page__list {
  display: grid;
  gap: var(--s-2);
  margin: 0;
  padding-left: var(--s-5);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-2);
}

.ai-page__note {
  margin: 0;
  font-size: 14px;
  color: var(--text-2);
}
</style>
