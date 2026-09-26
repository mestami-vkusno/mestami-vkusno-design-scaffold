/**
 * Гейт авторизации для значимых действий гостя (ТЗ §5.1–5.2). Фасад над `@/state/auth-gate`:
 * `requireAuth(pending)` — вошедшему `true`, гостю `false` и переход на `/auth` с сохранённым отложенным действием;
 * `consumePendingAction()` — после входа возвращает действие (с `returnUrl`) для исполнения.
 */
export { useAuthGate, AUTH_ROUTE, PENDING_TTL_MS } from '@/state/auth-gate'
export type { PendingAction, PendingActionInput, PendingActionType, PendingObjectType, SourceSurface } from '@/state/auth-gate'
