import { useToast } from '@/design-system/composables/useToast'
import type { FailureReason, MutationResult, Success } from './types'

/* Итог действия для пользователя: тост с успехом или понятной причиной неудачи. Общий для библиотеки и Премиум. */

const FAILURE_TEXT: Record<Exclude<FailureReason, 'auth_required'>, string> = {
  not_found: 'Не удалось найти объект',
  blocked: 'Автор заблокирован — сначала разблокируйте его',
  self_action: 'Это действие недоступно для своего профиля',
  invalid_value: 'Проверьте введённые данные',
  invalid_date: 'Укажите корректную дату',
  future_date: 'Дата посещения не может быть в будущем',
  empty_text: 'Напишите текст',
  rating_required: 'Сначала поставьте оценку',
  comments_disabled: 'Автор отключил комментарии',
  age_confirmation_required: 'Покупка доступна с 18 лет — подтвердите возраст',
  already_active: 'Премиум уже подключён',
  not_active: 'Сейчас нечего отключать',
  venue_required: 'Выберите заведение: публичную публикацию нельзя без него',
  empty_content: 'Добавьте текст или фото',
  consent_required: 'Сначала нужно принять условия публичных публикаций',
  duplicate_venue: 'Это заведение уже в подборке',
  title_required: 'Дайте подборке название',
  no_items: 'Добавьте в подборку хотя бы одно заведение',
}

/** Показывает итог тостом: успех — текстом `success` или его результатом (галочка при `on`), неудача — причиной. `auth_required` молчит: гостя уже ведёт вход. */
export function report<T extends object>(result: MutationResult<T>, success: string | ((result: Success<T>) => string), on = true): MutationResult<T> {
  const { show } = useToast()
  if (result.ok) show({ text: typeof success === 'string' ? success : success(result), ...(on ? { variant: 'success' as const } : {}) })
  else if (result.reason !== 'auth_required') show({ text: FAILURE_TEXT[result.reason], variant: 'danger' })
  return result
}
