import type { ActionOrigin } from '@/state/types'

export interface SaveButtonProps {
  /** Что сохраняем: публикацию, подборку (как ссылку, §17.3) или событие. */
  kind: 'post' | 'collection' | 'event'
  id: string
  /** Название объекта для скринридера: «Сохранить: Ужин с шефом». */
  subject?: string
  /** `action` — в панели действий карточки, `overlay` — круглая кнопка на фото, `plain` — без фона. */
  variant?: 'action' | 'overlay' | 'plain'
  origin?: ActionOrigin
}
