<script setup lang="ts">
/*
  PR1 · Премиум (`/premium`) и PR2 · заглушка оплаты (шаг «переход к провайдеру» на месте, возврат с результатом в `?payment=`).
  Цены и периоды не утверждены (§24.3, вопрос 5 в 0017): вместо чисел — заглушка. Покупка только с 18 лет (§5.8).
  Путь J10: предложение (O6) кладёт `premium_intent`, здесь после покупки `startPurchase` отдаёт адрес возврата,
  и страница ведёт туда (например, в диалог ИИ). Истина о покупке — состояние Премиум, а не адрес возврата (§25):
  `?payment=success` без действующей подписки показывается как «уточняем статус».
*/
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiBadge, UiBanner, UiIcon, UiLink, UiSparks, UiSurface, UiThemeScope, useMotion } from '@/design-system'
import { formatDate } from '@/mocks/format'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { requireAuth } from '@/state/auth-gate'
import { usePremium } from '@/state/usePremium'
import { FREE_KEEPS, PREMIUM_NOT, PREMIUM_PERKS, TERMS } from './copy'
import PaymentHistory from './components/PaymentHistory.vue'
import PremiumProvider, { type ProviderOutcome } from './components/PremiumProvider.vue'
import PremiumPurchase from './components/PremiumPurchase.vue'
import PremiumStatus from './components/PremiumStatus.vue'

useDocumentTitle('Премиум')

const route = useRoute()
const router = useRouter()
const { isReduced } = useMotion()
const premium = usePremium()

const step = ref<'offer' | 'provider'>('offer')
const pendingTrial = ref(false)

const phase = premium.phase
/** Фаза со статусом: у гостя и у «не было» карточки статуса нет. */
const statusPhase = computed(() => (phase.value === 'none' ? null : phase.value))
const showPurchase = computed(() => phase.value !== 'active' && phase.value !== 'trial')
const purchaseLabel = computed(() => (phase.value === 'none' ? 'Оформить Премиум' : phase.value === 'grace' ? 'Обновить оплату' : 'Продлить Премиум'))
const heroLead = computed(() => (premium.canUseAi.value ? 'ИИ уже доступен: спросите его в любой момент.' : 'ИИ подбирает и сравнивает места по данным сервиса. Всё остальное в приложении остаётся бесплатным.'))

// ── Результат возврата от провайдера ────────────────────────────────────
type PaymentResult = 'success' | 'failed' | 'canceled'

const payment = computed<PaymentResult | null>(() => {
  const value = route.query['payment']
  return value === 'success' || value === 'failed' || value === 'canceled' ? value : null
})

const banner = computed<{ variant: 'success' | 'danger' | 'info'; title: string; text: string } | null>(() => {
  if (payment.value === 'success') {
    return premium.canUseAi.value
      ? { variant: 'success', title: 'Оплата прошла', text: premium.activeUntil.value ? `Премиум действует до ${formatDate(premium.activeUntil.value)}.` : 'Премиум подключён.' }
      : { variant: 'info', title: 'Уточняем статус платежа', text: 'Подписка появится после подтверждения от провайдера. Это может занять несколько минут.' }
  }
  if (payment.value === 'failed') return { variant: 'danger', title: 'Платёж не прошёл', text: 'Подписка не оформлена. Попробуйте ещё раз или выберите другой способ оплаты.' }
  if (payment.value === 'canceled') return { variant: 'info', title: 'Оплата отменена', text: 'Подписка не оформлена, ничего не изменилось.' }
  return null
})

function dismissBanner(): void {
  void router.replace({ path: route.path })
}

// ── Оформление ──────────────────────────────────────────────────────────
function proceed(trial: boolean): void {
  // Гость: вход, затем возврат сюда; `premium_intent` (куда вернуть после покупки) уже сохранён предложением.
  if (!requireAuth({ actionType: 'premium', objectType: 'premium', objectId: null, sourceSurface: 'premium' })) return
  pendingTrial.value = trial
  step.value = 'provider'
}

function onOutcome(outcome: ProviderOutcome): void {
  step.value = 'offer'
  if (outcome !== 'success') {
    void router.replace({ path: route.path, query: { payment: outcome } })
    return
  }
  const result = premium.startPurchase({ ageConfirmed: true, trial: pendingTrial.value }, { sourceSurface: 'premium' })
  if (!result.ok) {
    void router.replace({ path: route.path, query: { payment: 'failed' } })
    return
  }
  // Возврат в исходный сценарий (J10): без `premium_intent` остаёмся здесь и показываем результат.
  if (result.returnUrl !== null) void router.push(result.returnUrl)
  else void router.replace({ path: route.path, query: { payment: 'success' } })
}

function focusPurchase(): void {
  const target = document.getElementById('premium-purchase')
  if (target === null) return
  target.scrollIntoView({ behavior: isReduced.value ? 'auto' : 'smooth', block: 'center' })
}

function onRenew(): void {
  if (showPurchase.value) focusPurchase()
}
</script>

<template>
  <main class="premium-page">
    <ShellContainer class="premium-page__body">
      <UiThemeScope theme="dark" as="header" class="premium-hero">
        <UiSparks class="premium-hero__sparks" />
        <UiBadge pill>Для тех, кто любит выбирать с умом</UiBadge>
        <h1 class="premium-hero__title">Премиум</h1>
        <p class="premium-hero__lead">{{ heroLead }}</p>
      </UiThemeScope>

      <Transition name="premium-fade">
        <UiBanner v-if="banner" :variant="banner.variant" :title="banner.title" dismissible @dismiss="dismissBanner">{{ banner.text }}</UiBanner>
      </Transition>

      <PremiumStatus v-if="statusPhase" :phase="statusPhase" :active-until="premium.activeUntil.value" :auto-renew="premium.autoRenew.value" @cancel-auto-renew="premium.cancelAutoRenew()" @renew="onRenew" />

      <section class="premium-page__section" aria-labelledby="premium-perks-title">
        <h2 id="premium-perks-title" class="premium-page__h2">Что даёт Премиум</h2>
        <ul class="premium-perks">
          <li v-for="perk in PREMIUM_PERKS" :key="perk.title" class="premium-perks__item">
            <span class="premium-perks__icon" aria-hidden="true"><UiIcon :name="perk.icon" :size="20" /></span>
            <span class="premium-perks__text">
              <span class="premium-perks__title">{{ perk.title }}</span>
              <span class="premium-perks__desc">{{ perk.text }}</span>
            </span>
          </li>
        </ul>
      </section>

      <section id="premium-purchase" class="premium-page__section premium-page__section--swap" :aria-busy="step === 'provider'">
        <Transition name="premium-swap" mode="out-in">
          <PremiumProvider v-if="step === 'provider'" :trial="pendingTrial" @outcome="onOutcome" />
          <PremiumPurchase v-else-if="showPurchase" :action-label="purchaseLabel" :trial-available="phase === 'none'" :signed-in="premium.canReadAiHistory.value" @proceed="proceed" />
        </Transition>
      </section>

      <section class="premium-page__section premium-page__lazy" aria-labelledby="premium-boundary-title">
        <h2 id="premium-boundary-title" class="premium-page__h2">Что остаётся как есть</h2>
        <div class="premium-boundary">
          <UiSurface variant="panel" as="div">
            <h3 class="premium-boundary__title">Бесплатно и без подписки</h3>
            <ul class="premium-boundary__list">
              <li v-for="item in FREE_KEEPS" :key="item">{{ item }}</li>
            </ul>
          </UiSurface>
          <UiSurface variant="panel" as="div">
            <h3 class="premium-boundary__title">Премиум не даёт</h3>
            <ul class="premium-boundary__list">
              <li v-for="item in PREMIUM_NOT" :key="item">{{ item }}</li>
            </ul>
          </UiSurface>
        </div>
      </section>

      <section class="premium-page__section premium-page__lazy" aria-labelledby="premium-terms-title">
        <h2 id="premium-terms-title" class="premium-page__h2">Условия</h2>
        <ul class="premium-terms">
          <li v-for="term in TERMS" :key="term">{{ term }}</li>
        </ul>
        <UiLink href="/legal/premium-offer" icon-right="arrow-r">Условия подписки и оплаты полностью</UiLink>
      </section>

      <div class="premium-page__lazy">
        <PaymentHistory :phase="phase" :active-until="premium.activeUntil.value" />
      </div>
    </ShellContainer>
  </main>
</template>

<style scoped>
.premium-page {
  padding-block: var(--s-4) var(--s-12);
}

.premium-page__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-8);
}

.premium-page__section {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.premium-page__section--swap {
  gap: 0;
}

/* Длинные разделы ниже первого экрана не считаются и не рисуются, пока не подъехали. */
.premium-page__lazy {
  content-visibility: auto;
  contain-intrinsic-size: auto 360px;
}

.premium-page__h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

/* Акцентный «остров» как у AiTeaser: всегда тёмный, лаймовый контур. Без backdrop-filter. */
.premium-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: start;
  gap: var(--s-4);
  overflow: hidden;
  padding: var(--s-8) var(--s-6);
  background: radial-gradient(120% 140% at 0% 0%, var(--promo-tint), transparent 55%), var(--bg);
  border: 1px solid var(--lime-line);
  border-radius: var(--r-lg);
  color: var(--text);
  box-shadow: var(--glow);
}

.premium-hero__sparks {
  position: absolute;
  top: 12px;
  right: 20px;
  width: 140px;
  opacity: 0.85;
  pointer-events: none;
}

.premium-hero__title {
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.1;
}

.premium-hero__lead {
  max-width: 560px;
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-2);
}

.premium-perks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.premium-perks__item {
  display: flex;
  gap: var(--s-3);
  padding: var(--s-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
}

.premium-perks__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--r-sm);
  background: var(--lime-soft);
  color: var(--accent-fg);
}

.premium-perks__text {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.premium-perks__title {
  font-weight: 600;
}

.premium-perks__desc {
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--text-2);
}

.premium-boundary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: var(--s-4);
}

.premium-boundary__title {
  margin: 0 0 var(--s-2);
  font-size: 15px;
  font-weight: 700;
}

.premium-boundary__list,
.premium-terms {
  display: grid;
  gap: var(--s-2);
  margin: 0;
  padding-left: var(--s-5);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-2);
}

/* Появление и обмен блоков: opacity + короткий сдвиг на токенах; при уменьшенном движении сдвиг равен нулю. */
.premium-fade-enter-active,
.premium-swap-enter-active {
  transition:
    opacity var(--dur-modal) var(--ease-out),
    transform var(--dur-modal) var(--ease-out);
}

.premium-fade-leave-active,
.premium-swap-leave-active {
  transition: opacity var(--dur-page-out) var(--ease-out);
}

.premium-fade-enter-from,
.premium-swap-enter-from {
  opacity: 0;
  transform: translateY(calc(8px * var(--motion-distance)));
}

.premium-fade-leave-to,
.premium-swap-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .premium-page__body {
    gap: var(--s-6);
  }

  .premium-hero {
    padding: var(--s-6) var(--s-4);
  }

  .premium-hero__title {
    font-size: 32px;
  }

  .premium-hero__sparks {
    top: 8px;
    right: 10px;
    width: 72px;
    opacity: 0.55;
  }
}
</style>
