import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/design-system'
import { MOCK_USER } from '@/mocks/library'
import { getAuthorByUsername } from '@/mocks/selectors/social'
import { readStored, removeStored, writeStored } from '@/state/storage'
import { applyPendingAction } from '@/state/useLibrary'
import { useAuthGate, type PendingAction } from '@/shell/composables/useAuthGate'
import { useViewer } from '@/shell/composables/useViewer'
import { isEmailValid, isUsernameFormatValid, RESERVED_USERNAMES } from './labels'

/*
  Состояние потока /auth (A1–A4, ТЗ §5.1–5.8). Мок: единственный зарегистрированный аккаунт — «Мария»
  (`MOCK_USER.email`). Любой другой адрес считается новым и всегда проходит настройку профиля (A3);
  `signIn()` в обоих случаях подключает тестового пользователя — это ограничение мока (`@/state/session`).
*/

export type AuthStep = 'email' | 'code' | 'profile' | 'done'
export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'reserved'

const RESEND_COOLDOWN_MS = 42_000
const MAX_SENDS = 3
const SEND_RATE_LIMIT_MS = 30_000
const MAX_CODE_ATTEMPTS = 3
const CODE_RATE_LIMIT_MS = 60_000

interface StoredFlow {
  readonly step: 'code'
  readonly email: string
  readonly resendAt: number
}

function isStoredFlow(value: unknown): value is StoredFlow {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<Record<keyof StoredFlow, unknown>>
  return item.step === 'code' && typeof item.email === 'string' && typeof item.resendAt === 'number'
}

export function useAuthFlow() {
  const router = useRouter()
  const { signIn } = useViewer()
  const { consumePendingAction, peekPendingAction, discardPendingAction } = useAuthGate()

  const restored = readStored('session', 'auth-flow', isStoredFlow)

  const step = ref<AuthStep>(restored ? 'code' : 'email')
  const email = ref(restored?.email ?? '')
  const emailError = ref('')
  const ageChecked = ref(false)
  const termsChecked = ref(false)
  const pdChecked = ref(false)
  const marketingChecked = ref(false)
  const sending = ref(false)
  const sendCount = ref(0)
  const sendBlockedUntil = ref(0)

  const code = ref('')
  const codeError = ref('')
  const codeChecking = ref(false)
  const codeAttempts = ref(0)
  const codeBlockedUntil = ref(0)
  const resendAt = ref(restored?.resendAt ?? 0)
  watch(code, () => {
    if (codeError.value) codeError.value = ''
  })

  const displayName = ref('')
  const username = ref('')
  const about = ref('')
  const visibility = ref<'public' | 'private'>('public')
  const usernameStatus = ref<UsernameStatus>('idle')
  let usernameCheckToken = 0

  const pendingAction = shallowRef<PendingAction | null>(peekPendingAction())
  const doneAction = shallowRef<PendingAction | null>(null)
  const doneOk = ref(true)

  const now = ref(Date.now())
  const tick = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
  onBeforeUnmount(() => window.clearInterval(tick))

  const resendRemainingMs = computed(() => Math.max(0, resendAt.value - now.value))
  const sendBlockedRemainingMs = computed(() => Math.max(0, sendBlockedUntil.value - now.value))
  const codeBlockedRemainingMs = computed(() => Math.max(0, codeBlockedUntil.value - now.value))

  function persistCodeStep(): void {
    writeStored('session', 'auth-flow', { step: 'code', email: email.value, resendAt: resendAt.value } satisfies StoredFlow)
  }

  function clearPersisted(): void {
    removeStored('session', 'auth-flow')
  }

  const emailValid = computed(() => isEmailValid(email.value))
  const consentsOk = computed(() => ageChecked.value && termsChecked.value && pdChecked.value)
  const canSubmitEmail = computed(() => emailValid.value && consentsOk.value && sendBlockedRemainingMs.value === 0)

  function sendCode(): void {
    if (!emailValid.value) {
      emailError.value = 'Проверьте адрес email'
      return
    }
    if (!consentsOk.value) return
    emailError.value = ''
    sending.value = true
    window.setTimeout(() => {
      sending.value = false
      sendCount.value += 1
      if (sendCount.value > MAX_SENDS) {
        sendBlockedUntil.value = Date.now() + SEND_RATE_LIMIT_MS
        emailError.value = 'Слишком много попыток. Повторите позже'
        return
      }
      code.value = ''
      codeError.value = ''
      codeAttempts.value = 0
      codeBlockedUntil.value = 0
      resendAt.value = Date.now() + RESEND_COOLDOWN_MS
      step.value = 'code'
      persistCodeStep()
    }, 500)
  }

  function resendCode(): void {
    if (resendRemainingMs.value > 0 || sendBlockedRemainingMs.value > 0) return
    sendCode()
  }

  function changeEmail(): void {
    step.value = 'email'
    code.value = ''
    codeError.value = ''
    clearPersisted()
  }

  function known(): boolean {
    return email.value.trim().toLowerCase() === MOCK_USER.email.toLowerCase()
  }

  function goToDone(): void {
    clearPersisted()
    signIn()
    const action = consumePendingAction()
    doneAction.value = action
    if (action !== null) {
      // Действия библиотеки (Избранное, подписка, оценка…) исполняет `applyPendingAction`; тост об итоге показывает она сама.
      const result = applyPendingAction(action)
      doneOk.value = result === null || result.ok
    } else {
      useToast().show({ text: 'Вы вошли', variant: 'success' })
    }
    step.value = 'done'
  }

  function submitCode(): void {
    if (code.value.length !== 6 || codeBlockedRemainingMs.value > 0) return
    codeChecking.value = true
    window.setTimeout(() => {
      codeChecking.value = false
      if (code.value === '000000' || code.value === '999999') {
        codeAttempts.value += 1
        codeError.value = code.value === '999999' ? 'Срок действия кода истёк. Запросите новый' : 'Неверный код'
        code.value = ''
        if (codeAttempts.value >= MAX_CODE_ATTEMPTS) {
          codeBlockedUntil.value = Date.now() + CODE_RATE_LIMIT_MS
          codeError.value = 'Слишком много попыток. Попробуйте снова через минуту'
        }
        return
      }
      codeError.value = ''
      if (known()) {
        goToDone()
      } else {
        step.value = 'profile'
        clearPersisted()
      }
    }, 450)
  }

  function checkUsername(): void {
    const value = username.value.trim()
    usernameCheckToken += 1
    const token = usernameCheckToken
    if (!isUsernameFormatValid(value)) {
      usernameStatus.value = 'idle'
      return
    }
    usernameStatus.value = 'checking'
    window.setTimeout(() => {
      if (token !== usernameCheckToken) return
      if (RESERVED_USERNAMES.includes(value.toLowerCase())) usernameStatus.value = 'reserved'
      else if (getAuthorByUsername(value) !== undefined) usernameStatus.value = 'taken'
      else usernameStatus.value = 'available'
    }, 450)
  }

  const canSubmitProfile = computed(() => displayName.value.trim().length > 0 && usernameStatus.value === 'available')

  function submitProfile(): void {
    if (!canSubmitProfile.value) return
    goToDone()
  }

  function closeFlow(): void {
    discardPendingAction()
    clearPersisted()
    if (window.history.length > 1) router.back()
    else void router.push('/')
  }

  function finish(): void {
    const url = doneAction.value?.returnUrl
    void router.push(url && url.startsWith('/') ? url : '/')
  }

  return {
    step,
    email,
    emailError,
    ageChecked,
    termsChecked,
    pdChecked,
    marketingChecked,
    sending,
    canSubmitEmail,
    emailValid,
    sendBlockedRemainingMs,
    sendCode,

    code,
    codeError,
    codeChecking,
    resendRemainingMs,
    codeBlockedRemainingMs,
    resendCode,
    changeEmail,
    submitCode,

    displayName,
    username,
    about,
    visibility,
    usernameStatus,
    checkUsername,
    canSubmitProfile,
    submitProfile,

    pendingAction,
    doneAction,
    doneOk,
    closeFlow,
    finish,
  }
}
