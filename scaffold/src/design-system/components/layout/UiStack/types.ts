import type { SpaceToken } from '../../../types'

export interface UiStackProps {
  /** Тег корневого элемента. */
  as?: string
  gap?: SpaceToken
  align?: 'start' | 'center' | 'end' | 'stretch'
}
