import type { SpaceToken } from '../../../types'

export interface UiGridProps {
  as?: string
  /** Минимальная ширина колонки в px: колонки сами перестраиваются, на узком экране остаётся одна. */
  min?: number
  gap?: SpaceToken
  align?: 'start' | 'center' | 'stretch'
}
