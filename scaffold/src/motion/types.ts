/** Как часто пользователь видит анимацию: от этого зависит, сколько движения можно потратить. */
export type FrequencyTier = 'often' | 'occasional' | 'rare'

/** Зачем нужно движение. Без названной цели анимации нет. */
export type MotionPurpose = 'feedback' | 'spatial' | 'state' | 'jarring' | 'explanation' | 'delight'

export interface MotionSpec {
  label: string
  value: string
}
