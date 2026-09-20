import type { CssToken } from './colors'

export interface SpacingStep {
  token: CssToken
  px: number
}

export interface RadiusStep {
  token: CssToken
  /** `null` — полное скругление. */
  px: number | null
  usage: string
}

export const SPACING_STEPS: readonly SpacingStep[] = [
  { token: '--s-1', px: 4 },
  { token: '--s-2', px: 8 },
  { token: '--s-3', px: 12 },
  { token: '--s-4', px: 16 },
  { token: '--s-6', px: 24 },
  { token: '--s-8', px: 32 },
  { token: '--s-12', px: 48 },
  { token: '--s-16', px: 64 },
]

export const RADIUS_STEPS: readonly RadiusStep[] = [
  { token: '--r-xs', px: 4, usage: 'бейдж' },
  { token: '--r-sm', px: 6, usage: 'поле' },
  { token: '--r-md', px: 10, usage: 'кнопка' },
  { token: '--r-lg', px: 16, usage: 'карточка' },
  { token: '--r-xl', px: 24, usage: 'панель' },
  { token: '--r-pill', px: null, usage: 'чип' },
]
