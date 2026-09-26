import { computed, shallowRef } from 'vue'
import { MOCK_USER } from '@/mocks/library'
import { formatDate } from '@/mocks/format'
import { MOCK_TODAY, addDays } from '@/mocks/time'
import type { IsoDate } from '@/mocks/types'
import { PENDING_TTL_MS, bindRouter, requireAuth, safeReturnUrl } from './auth-gate'
import { report } from './feedback'
import { onMockReset } from './reset'
import { isSignedIn } from './session'
import { createSlot } from './slot'
import { readStored, writeStored } from './storage'
import { fail, succeed, type ActionOrigin, type MutationResult, type SourceSurface } from './types'

/*
  Премиум для мока (ТЗ §25). Одно право на пользователя; состояние — шесть фаз жизненного цикла.
  Покупка в реальном продукте подтверждается сервером; здесь `startPurchase()` мгновенно ставит «активно».
  Тяжёлый модуль: страницы импортируют его сами, в основной чанк он не входит.
*/

export type PremiumPhase = 'none' | 'trial' | 'active' | 'grace' | 'canceled_active' | 'expired'

/** Цены и периоды в ТЗ не утверждены (§24.3): значения только для мока. */
export const PREMIUM_PERIOD_DAYS = 30
export const PREMIUM_TRIAL_DAYS = 7

/** В каких фазах доступны новые запросы к ИИ. Льготный период сохраняет доступ (допущение). Старые диалоги читаются всегда (§23.8). */
const AI_PHASES: readonly PremiumPhase[] = ['trial', 'active', 'grace', 'canceled_active']

interface PremiumData {
  readonly phase: PremiumPhase
  readonly activeUntil: IsoDate | null
  readonly autoRenew: boolean
}

const PHASES: readonly PremiumPhase[] = ['none', 'trial', 'active', 'grace', 'canceled_active', 'expired']

function isPremiumData(value: unknown): value is PremiumData {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<Record<keyof PremiumData, unknown>>
  return PHASES.includes(item.phase as PremiumPhase) && (item.activeUntil === null || typeof item.activeUntil === 'string') && typeof item.autoRenew === 'boolean'
}

function initialData(): PremiumData {
  const { status, activeUntil, autoRenew } = MOCK_USER.premium
  return { phase: status, activeUntil: activeUntil ?? null, autoRenew: autoRenew ?? false }
}

const state = shallowRef<PremiumData>(readStored('local', 'premium', isPremiumData) ?? initialData())

function update(next: PremiumData): void {
  state.value = next
  writeStored('local', 'premium', next)
}

onMockReset(() => {
  state.value = initialData()
})

// ── Контекст покупки, `premium_intent` (§25) ──────────────────────────────

/** Откуда пользователя привело контекстное предложение подписки; после покупки он возвращается туда. */
export interface PremiumIntent {
  readonly returnUrl: string
  readonly sourceSurface: SourceSurface
  readonly expiresAt: number
}

function isPremiumIntent(value: unknown): value is PremiumIntent {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<Record<keyof PremiumIntent, unknown>>
  return typeof item.returnUrl === 'string' && typeof item.sourceSurface === 'string' && typeof item.expiresAt === 'number'
}

const intentSlot = createSlot<PremiumIntent>('premium-intent', isPremiumIntent)

/** Запоминает сценарий, из которого открыто предложение подписки (например, `/ai/chat` или пустой поиск). Живёт `PENDING_TTL_MS`. */
export function rememberPremiumIntent(origin: { returnUrl: string; sourceSurface: SourceSurface }, now: number = Date.now()): void {
  intentSlot.save({ returnUrl: safeReturnUrl(origin.returnUrl), sourceSurface: origin.sourceSurface, expiresAt: now + PENDING_TTL_MS })
}

export function peekPremiumIntent(now: number = Date.now()): PremiumIntent | null {
  return intentSlot.peek(now)
}

// ── Состояние и действия ──────────────────────────────────────────────────

/** Фаза для вошедшего; у гостя Премиума нет. */
const phase = computed<PremiumPhase>(() => (isSignedIn.value ? state.value.phase : 'none'))
const canUseAi = computed(() => AI_PHASES.includes(phase.value))

export interface PurchaseOptions {
  /** Покупка с 18 лет или при подтверждённой дееспособности (§5.8). */
  readonly ageConfirmed: boolean
  /** Пробный период: только пока Премиума не было. Включается бизнес-конфигурацией (§25). */
  readonly trial?: boolean
}

export interface PurchaseResult {
  readonly phase: PremiumPhase
  readonly activeUntil: IsoDate
  /** Куда вернуть пользователя: адрес из `premium_intent`, если он был. */
  readonly returnUrl: string | null
}

/** Что показывает состояние в подписи: «до 24 октября» или пусто. */
function activeUntilLabel(activeUntil: IsoDate | null): string {
  return activeUntil === null ? '' : ` до ${formatDate(activeUntil)}`
}

function startPurchase(options: PurchaseOptions, origin?: ActionOrigin): MutationResult<PurchaseResult> {
  if (!requireAuth({ actionType: 'premium', objectType: 'premium', objectId: null, ...origin })) return fail('auth_required')
  if (!options.ageConfirmed) return report(fail('age_confirmation_required'), '')
  const current = state.value.phase
  if (current === 'active' || current === 'trial') return report(fail('already_active'), '')
  const trial = options.trial === true && current === 'none'
  const activeUntil = addDays(MOCK_TODAY, trial ? PREMIUM_TRIAL_DAYS : PREMIUM_PERIOD_DAYS)
  update({ phase: trial ? 'trial' : 'active', activeUntil, autoRenew: true })
  const returnUrl = intentSlot.take()?.returnUrl ?? null
  return report(succeed({ phase: state.value.phase, activeUntil, returnUrl }), trial ? `Пробный период подключён${activeUntilLabel(activeUntil)}` : 'Премиум подключён')
}

/** Отключает автопродление без уловок: право действует до конца оплаченного периода, данные не удаляются (§25). */
function cancelAutoRenew(): MutationResult<{ phase: PremiumPhase; activeUntil: IsoDate | null }> {
  if (!isSignedIn.value) return fail('auth_required')
  const { phase: current, activeUntil } = state.value
  if (current !== 'active' && current !== 'trial' && current !== 'grace') return report(fail('not_active'), '')
  update({ phase: 'canceled_active', activeUntil, autoRenew: false })
  return report(succeed({ phase: 'canceled_active' as const, activeUntil }), `Автопродление отключено, Премиум действует${activeUntilLabel(activeUntil)}`, false)
}

/** Только для мока и витрины: ставит фазу напрямую, чтобы показать каждое состояние (`grace`, `expired` и т. д.). */
function setMockPhase(next: PremiumPhase): void {
  const active = next === 'trial' || next === 'active' || next === 'grace' || next === 'canceled_active'
  const activeUntil = next === 'none' ? null : addDays(MOCK_TODAY, active ? PREMIUM_PERIOD_DAYS : -14)
  update({ phase: next, activeUntil, autoRenew: next === 'trial' || next === 'active' || next === 'grace' })
}

export function usePremium() {
  bindRouter()
  return {
    phase,
    activeUntil: computed(() => (isSignedIn.value ? state.value.activeUntil : null)),
    autoRenew: computed(() => isSignedIn.value && state.value.autoRenew),
    /** Новые запросы к ИИ разрешены. У бесплатного, гостя и с истёкшим Премиум — нет: только предложение подписки (§23.8). */
    canUseAi,
    /** Старые диалоги ИИ читаются у любого вошедшего, в том числе после окончания Премиум (§23.8). */
    canReadAiHistory: isSignedIn,
    startPurchase,
    cancelAutoRenew,
    rememberIntent: rememberPremiumIntent,
    peekIntent: peekPremiumIntent,
    setMockPhase,
  }
}
