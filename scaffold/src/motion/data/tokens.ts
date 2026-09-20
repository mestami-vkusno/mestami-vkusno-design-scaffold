import { BUILT_IN_EASE, EASE, DURATION } from '@/design-system'
import type { CubicBezier, DurationName } from '@/design-system'

export interface EasingRow {
  id: string
  label: string
  token: string
  curve: CubicBezier
  /** `true` — кривая не для интерфейса, показана для сравнения. */
  avoid?: boolean
}

export const EASING_ROWS: readonly EasingRow[] = [
  { id: 'out', label: 'Сильный ease-out', token: '--ease-out', curve: EASE.out },
  { id: 'in-out', label: 'Сильный ease-in-out', token: '--ease-in-out', curve: EASE.inOut },
  { id: 'drawer', label: 'Шторка', token: '--ease-drawer', curve: EASE.drawer },
  { id: 'css-out', label: 'Встроенный ease-out', token: 'ease-out', curve: BUILT_IN_EASE['ease-out'] },
  { id: 'css-in', label: 'Встроенный ease-in', token: 'ease-in', curve: BUILT_IN_EASE['ease-in'], avoid: true },
]

export interface DurationRow {
  name: DurationName
  token: string
  label: string
  use: string
  ms: number
}

const durationRow = (name: DurationName, token: string, label: string, use: string): DurationRow => ({ name, token, label, use, ms: Math.round(DURATION[name] * 1000) })

export const DURATION_ROWS: readonly DurationRow[] = [
  durationRow('tooltip', '--dur-tooltip', 'Подсказка', 'Маленькие всплывающие элементы'),
  durationRow('hover', '--dur-hover', 'Наведение', 'Цвет, фон, рамка'),
  durationRow('press', '--dur-press', 'Нажатие', 'Кнопки, чипы, иконки'),
  durationRow('dropdown', '--dur-dropdown', 'Выпадающий список', 'Меню, списки, селекты'),
  durationRow('modal', '--dur-modal', 'Окно', 'Модальные окна'),
  durationRow('toast', '--dur-toast', 'Уведомление', 'Тосты — чуть медленнее по характеру'),
  durationRow('drawer', '--dur-drawer', 'Шторка', 'Панели снизу и сбоку'),
]
