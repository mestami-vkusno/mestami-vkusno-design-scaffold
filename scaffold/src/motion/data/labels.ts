import type { FrequencyTier, MotionPurpose } from '../types'

export const TIER_LABEL: Record<FrequencyTier, string> = {
  often: 'Десятки раз в день',
  occasional: 'Время от времени',
  rare: 'Редко или впервые',
}

export const PURPOSE_LABEL: Record<MotionPurpose, string> = {
  feedback: 'Обратная связь',
  spatial: 'Пространственная связность',
  state: 'Показ состояния',
  jarring: 'Смягчение резкого изменения',
  explanation: 'Объяснение',
  delight: 'Приятная мелочь',
}
