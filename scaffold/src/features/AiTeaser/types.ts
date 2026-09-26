import type { SourceSurface } from '@/state/types'
import type { HeadingLevel } from '../shared/types'

/** Где стоит блок: от места зависят заголовок и пояснение. Текст о возможностях, а не пример ответа (§23.1). */
export type AiTeaserContext = 'general' | 'venue' | 'compare' | 'event' | 'search_empty'

export interface AiTeaserProps {
  context?: AiTeaserContext
  /** Свой заголовок вместо заготовленного для места. */
  title?: string
  description?: string
  /** Подпись кнопки; по умолчанию «Спросить AI». */
  actionLabel?: string
  /** Экран, с которого пришли: после покупки Премиум пользователь вернётся на него (`premium_intent`). */
  sourceSurface?: SourceSurface
  headingLevel?: HeadingLevel
}
