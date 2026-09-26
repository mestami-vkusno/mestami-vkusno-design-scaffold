import type { IconName } from '../../../icons'

/** `empty` — пусто (нейтрально, путь к наполнению), `error` — не получилось (что случилось и «Повторить»), `offline` — нет сети, `guest` — нужен вход. */
export type UiEmptyStateMode = 'empty' | 'error' | 'offline' | 'guest'

export interface UiEmptyStateProps {
  mode?: UiEmptyStateMode
  title: string
  description?: string
  /** Иконка; по умолчанию своя у режима (`empty` — `list`, `error` — `alert`, `offline` — `wifi-off`, `guest` — `lock`). */
  icon?: IconName
  /** Уровень заголовка в структуре страницы. */
  headingLevel?: 2 | 3 | 4
  /** Занять экран: для блокирующей ошибки и страниц «недоступно». */
  page?: boolean
}
