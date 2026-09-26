<script setup lang="ts">
import { ref, useId } from 'vue'
import { useRouter } from 'vue-router'
import { UiBadge, UiButton, UiSearchInput, UiSparks, UiThemeScope } from '@/design-system'
import { usePremium } from '@/state/usePremium'
import { FEATURE_LABELS } from '../labels'
import { AI_TEASER_COPY, AI_TEASER_PLACEHOLDER } from './copy'
import type { AiTeaserProps } from './types'

const props = withDefaults(defineProps<AiTeaserProps>(), { context: 'general', sourceSurface: 'other', headingLevel: 2, actionLabel: FEATURE_LABELS.aiAsk })

/*
  §23.1: в бесплатной версии и у гостя ИИ нет вовсе — ни квоты, ни частичного ответа, ни тизера сводки.
  Поэтому у них здесь не поле ввода с замком, а честное предложение: заголовок, пояснение и кнопка в Премиум.
  Поле запроса, которое ведёт на /ai, — только у активного Премиум (`canUseAi`); у просроченного — предложение.
*/
const { canUseAi, rememberIntent } = usePremium()
const router = useRouter()
const titleId = useId()
const query = ref('')

function currentUrl(): string {
  return window.location.pathname + window.location.search + window.location.hash
}

// Куда вернуть после покупки: контекст предложения сохраняется как `premium_intent`. Переход делает обычная ссылка.
function rememberOrigin(): void {
  rememberIntent({ returnUrl: currentUrl(), sourceSurface: props.sourceSurface })
}

function ask(text: string): void {
  const value = text.trim()
  void router.push({ path: '/ai', query: value ? { q: value } : {} })
}
</script>

<template>
  <UiThemeScope theme="dark" as="section" class="ai-teaser" :aria-labelledby="titleId">
    <UiSparks class="ai-teaser__sparks" />
    <component :is="`h${headingLevel}`" :id="titleId" class="ai-teaser__title">
      {{ title ?? AI_TEASER_COPY[context].title }}
      <UiBadge pill>{{ FEATURE_LABELS.aiPremiumBadge }}</UiBadge>
    </component>
    <p class="ai-teaser__description">{{ description ?? AI_TEASER_COPY[context].description }}</p>
    <div class="ai-teaser__action">
      <UiSearchInput v-if="canUseAi" v-model="query" :label="FEATURE_LABELS.aiField" :placeholder="AI_TEASER_PLACEHOLDER" button-icon="send" :button-label="FEATURE_LABELS.aiSend" @submit="ask" />
      <UiButton v-else href="/premium" size="lg" icon-right="arrow-r" @click="rememberOrigin">{{ actionLabel }}</UiButton>
    </div>
    <p v-if="!canUseAi" class="ai-teaser__note">{{ FEATURE_LABELS.aiPremiumNote }}</p>
  </UiThemeScope>
</template>

<style scoped>
/* Акцентный «остров»: всегда тёмный, с лаймовым контуром и свечением, в том числе в светлой теме. Токены те же, что у UiPromoPanel. */
.ai-teaser {
  position: relative;
  display: grid;
  gap: var(--s-4);
  overflow: hidden;
  padding: var(--s-6);
  background: radial-gradient(120% 140% at 0% 0%, var(--promo-tint), transparent 55%), var(--bg);
  border: 1px solid var(--lime-line);
  border-radius: var(--r-lg);
  color: var(--text);
  box-shadow: var(--glow);
}

.ai-teaser__sparks {
  position: absolute;
  top: 10px;
  right: 18px;
  width: 120px;
  opacity: 0.85;
  pointer-events: none;
}

.ai-teaser__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3);
  margin: 0;
  padding-right: 110px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.ai-teaser__description {
  max-width: 640px;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-2);
}

.ai-teaser__action {
  max-width: 640px;
}

.ai-teaser__note {
  margin: 0;
  font-size: 12px;
  color: var(--text-3);
}

@media (max-width: 720px) {
  .ai-teaser {
    padding: var(--s-5) var(--s-4);
  }

  .ai-teaser__title {
    padding-right: 56px;
    font-size: 20px;
  }

  .ai-teaser__sparks {
    top: 6px;
    right: 8px;
    width: 64px;
    opacity: 0.55;
  }
}
</style>
