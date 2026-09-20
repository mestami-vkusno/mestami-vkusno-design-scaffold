import type { SpaceToken } from '../../../types'

export interface UiClusterProps {
  as?: string
  gap?: SpaceToken
  align?: 'start' | 'center' | 'end' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between'
  /** Переносить элементы на следующую строку. */
  wrap?: boolean
}
