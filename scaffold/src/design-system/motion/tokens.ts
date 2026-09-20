/** Зеркало токенов из styles/motion.css для анимаций на JS (Motion, WAAPI). Менять в обоих местах. */

export type CubicBezier = readonly [number, number, number, number]

export const EASE = {
  /** Сильный ease-out: появление, исчезновение, реакция на действие. */
  out: [0.23, 1, 0.32, 1],
  /** Сильный ease-in-out: движение и трансформация на экране. */
  inOut: [0.77, 0, 0.175, 1],
  /** Кривая шторки в духе iOS. */
  drawer: [0.32, 0.72, 0, 1],
} as const satisfies Record<string, CubicBezier>

export type EaseName = keyof typeof EASE

/** Встроенные CSS-кривые: слабые, нужны только для сравнения на витрине. */
export const BUILT_IN_EASE = {
  ease: [0.25, 0.1, 0.25, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in': [0.42, 0, 1, 1],
} as const satisfies Record<string, CubicBezier>

export function cubicBezierCss(curve: CubicBezier): string {
  return `cubic-bezier(${curve.join(', ')})`
}

/** Длительности в секундах, как в CSS-токенах. */
export const DURATION = {
  press: 0.16,
  hover: 0.15,
  tooltip: 0.125,
  dropdown: 0.2,
  modal: 0.25,
  drawer: 0.5,
  toast: 0.4,
  pageIn: 0.22,
  pageOut: 0.12,
  theme: 0.42,
} as const

export type DurationName = keyof typeof DURATION

/** Пружины: для жестов и всего, что пользователь может прервать или развернуть. */
export const SPRING = {
  /** Мягкая, почти без отскока. */
  soft: { type: 'spring', duration: 0.5, bounce: 0.2 },
  /** Плотная: для расстановки элементов и слоёв. */
  tight: { type: 'spring', duration: 0.35, bounce: 0 },
} as const
