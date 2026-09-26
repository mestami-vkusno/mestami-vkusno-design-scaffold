import { computed, shallowRef } from 'vue'
import { MOCK_USER } from '@/mocks/library'
import { setAuthorOverlay, getAuthor } from '@/mocks/selectors/social'
import type { Author, IsoDateTime, PostVisibility, ProfileVisibility } from '@/mocks/types'
import { mockClock } from './clock'
import { onMockReset } from './reset'
import { VIEWER_ID, isSignedIn } from './session'
import { readStored, writeStored } from './storage'
import { fail, succeed, type MutationResult } from './types'

/*
  Настройки пользователя (ST1, §20, §19.3, §5.7, §20А) и правка профиля. Стартуют со значений `MOCK_USER.settings`,
  дальше живут в памяти и в `localStorage`. Скрытые и заблокированные лежат в библиотеке (`useLibrary`), разрешения ИИ — в
  `pages/ai/aiState` (их тоже читает ИИ), здесь остальное. Данные не меняются на месте: каждая мутация кладёт в `data` новый объект.
  Подключает правку профиля к селекторам авторов (`setAuthorOverlay`), поэтому его подгружает `useLibrary`.
*/

export type DataRequestType = 'info' | 'fix' | 'stop_public' | 'withdraw_consent' | 'other'

export const DATA_REQUEST_LABEL: Readonly<Record<DataRequestType, string>> = {
  info: 'Получить сведения о моих данных',
  fix: 'Исправить данные',
  stop_public: 'Прекратить распространение публичных данных',
  withdraw_consent: 'Отозвать согласие',
  other: 'Другое',
}

/** Юридический запрос субъекта ПД (§20А): отдельный сценарий, не удаление аккаунта. */
export interface PersonalDataRequest {
  readonly id: string
  readonly type: DataRequestType
  readonly description: string
  readonly createdAt: IsoDateTime
  /** В моке запрос лишь принимается: рассматривает его человек, срок ТЗ не задаёт (вопрос 0017). */
  readonly status: 'received'
}

export interface NotificationPreferences {
  readonly social: boolean
  readonly venueUpdates: boolean
  readonly events: boolean
  readonly recommendationsAndMarketing: boolean
}

export type NotificationCategory = keyof NotificationPreferences

/** Правка профиля поверх данных автора мока; `null` в поле — не менялось. */
export interface ProfileOverride {
  readonly displayName: string | null
  readonly username: string | null
  readonly about: string | null
}

export interface SettingsData {
  readonly profileVisibility: ProfileVisibility
  readonly defaultPostVisibility: PostVisibility
  readonly personalization: boolean
  readonly notifications: NotificationPreferences
  readonly profile: ProfileOverride
  readonly usernameChangedAt: IsoDateTime | null
  readonly email: string
  /** Новый адрес ждёт кода: пока он не подтверждён, работает старый (§5.7). */
  readonly pendingEmail: string | null
  readonly deletionRequestedAt: IsoDateTime | null
  readonly dataRequests: readonly PersonalDataRequest[]
  /** Когда очищены история поиска и диалоги ИИ; история просмотров чистится в библиотеке. */
  readonly searchHistoryClearedAt: IsoDateTime | null
  readonly aiHistoryClearedAt: IsoDateTime | null
  readonly tasteProfileResetAt: IsoDateTime | null
}

/** Имя пользователя можно менять не чаще раза в 30 дней (assumption: в ТЗ «частая смена» ограничена без срока, вопрос 0017). */
export const USERNAME_CHANGE_INTERVAL_DAYS = 30

function initialData(): SettingsData {
  const { settings } = MOCK_USER
  return {
    profileVisibility: settings.profileVisibility,
    defaultPostVisibility: settings.defaultPostVisibility,
    personalization: settings.personalization,
    notifications: {
      social: settings.notifications.social,
      venueUpdates: settings.notifications.venueUpdates,
      events: settings.notifications.events,
      recommendationsAndMarketing: settings.notifications.recommendationsAndMarketing,
    },
    profile: { displayName: null, username: null, about: null },
    usernameChangedAt: null,
    email: MOCK_USER.email,
    pendingEmail: null,
    deletionRequestedAt: null,
    dataRequests: [],
    searchHistoryClearedAt: null,
    aiHistoryClearedAt: null,
    tasteProfileResetAt: null,
  }
}

function isSettingsData(value: unknown): value is Partial<SettingsData> {
  return typeof value === 'object' && value !== null && 'notifications' in value && 'profile' in value
}

const state = shallowRef<SettingsData>({ ...initialData(), ...readStored('local', 'settings', isSettingsData) })

function update(patch: Partial<SettingsData>): void {
  state.value = { ...state.value, ...patch }
  writeStored('local', 'settings', state.value)
}

onMockReset(() => {
  state.value = initialData()
})

let requestCounter = 0

// Свой профиль: то, что человек поправил, видно везде, где читается автор (Профиль, публичная страница, карточки, комментарии).
setAuthorOverlay((author) => {
  if (author.id !== VIEWER_ID) return author
  const { profile, profileVisibility } = state.value
  return { ...author, displayName: profile.displayName ?? author.displayName, username: profile.username ?? author.username, about: profile.about ?? author.about, profileVisibility }
})

/** Свой авторский профиль с правками; `undefined`, если данных автора нет. */
export const ownProfile = computed<Author | undefined>(() => getAuthor(VIEWER_ID))

/** Текущие настройки; читайте `settings.value` внутри `computed` или шаблона. */
export const settings = state

const NOW_DAY_MS = 86_400_000

/** Через сколько дней можно снова сменить имя пользователя; 0 — можно сейчас. */
export const usernameCooldownDays = computed(() => {
  const changedAt = state.value.usernameChangedAt
  if (changedAt === null) return 0
  const passed = (Date.parse(mockClock()) - Date.parse(changedAt)) / NOW_DAY_MS
  return Math.max(0, Math.ceil(USERNAME_CHANGE_INTERVAL_DAYS - passed))
})

/** Настройки для страниц. Действия молчат для гостя: настройки есть только у вошедшего. */
export function useSettings() {
  function guard<T extends object>(run: () => MutationResult<T>): MutationResult<T> {
    return isSignedIn.value ? run() : fail('auth_required')
  }

  return {
    settings: computed(() => state.value),
    profile: ownProfile,
    usernameCooldownDays,
    setProfileVisibility: (value: ProfileVisibility) => guard(() => (update({ profileVisibility: value }), succeed())),
    setDefaultPostVisibility: (value: PostVisibility) => guard(() => (update({ defaultPostVisibility: value }), succeed())),
    setPersonalization: (on: boolean) => guard(() => (update({ personalization: on }), succeed())),
    /** «Рекомендации и маркетинг» — точка отзыва маркетингового согласия (§20А); «Системные» не отключаются (§19.3). */
    setNotification: (category: NotificationCategory, on: boolean) => guard(() => (update({ notifications: { ...state.value.notifications, [category]: on } }), succeed())),
    /** Сброс профиля вкусов не удаляет избранное, отзывы и записи (§20.3). */
    resetTasteProfile: () => guard(() => (update({ tasteProfileResetAt: mockClock() }), succeed())),
    /** Правка профиля (A3-форма): пустое имя нельзя, имя пользователя — не чаще раза в 30 дней. */
    saveProfile: (input: { displayName: string; username: string; about: string }) =>
      guard(() => {
        const displayName = input.displayName.trim()
        const username = input.username.trim().replace(/^@/, '')
        if (displayName === '' || username === '') return fail('invalid_value')
        const usernameChanged = username !== ownProfile.value?.username
        if (usernameChanged && usernameCooldownDays.value > 0) return fail('invalid_value')
        update({
          profile: { displayName, username, about: input.about.trim() },
          ...(usernameChanged ? { usernameChangedAt: mockClock() } : {}),
        })
        return succeed({ usernameChanged })
      }),
    /** Смена email (§5.7): код уходит на новый адрес, до подтверждения работает старый. */
    requestEmailChange: (email: string) => guard(() => (update({ pendingEmail: email.trim() }), succeed())),
    confirmEmailChange: () =>
      guard(() => {
        const next = state.value.pendingEmail
        if (next === null) return fail('not_found')
        update({ email: next, pendingEmail: null })
        return succeed()
      }),
    cancelEmailChange: () => guard(() => (update({ pendingEmail: null }), succeed())),
    /** Запрос на удаление аккаунта (§5.7); льготный период не описан ТЗ (вопрос 12 в front-structure, вопрос 0017). */
    requestAccountDeletion: () => guard(() => (update({ deletionRequestedAt: mockClock() }), succeed())),
    cancelAccountDeletion: () => guard(() => (update({ deletionRequestedAt: null }), succeed())),
    /** Запрос по персональным данным (§20А). Не удаление аккаунта. */
    submitDataRequest: (type: DataRequestType, description: string) =>
      guard(() => {
        requestCounter += 1
        const request: PersonalDataRequest = { id: `pd-${state.value.dataRequests.length + requestCounter}`, type, description: description.trim(), createdAt: mockClock(), status: 'received' }
        update({ dataRequests: [request, ...state.value.dataRequests] })
        return succeed({ request })
      }),
    clearSearchHistory: () => guard(() => (update({ searchHistoryClearedAt: mockClock() }), succeed())),
    clearAiHistory: () => guard(() => (update({ aiHistoryClearedAt: mockClock() }), succeed())),
  }
}
