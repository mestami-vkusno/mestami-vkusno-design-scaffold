import type { UiAvatarSize, UiAvatarTone } from '@/design-system'

export const AVATAR_SIZES: readonly { size: UiAvatarSize; label: string }[] = [
  { size: 'xs', label: '24' },
  { size: 'sm', label: '32' },
  { size: 'md', label: '40' },
  { size: 'lg', label: '64' },
  { size: 'xl', label: '96' },
]

export const AVATAR_TONES: readonly { tone: UiAvatarTone; name: string }[] = [
  { tone: 'neutral', name: 'Анна Ветрова' },
  { tone: 'accent', name: 'Иван Соколов' },
  { tone: 'success', name: 'Мария Лесная' },
  { tone: 'warning', name: 'Пётр Огнев' },
  { tone: 'danger', name: 'Ольга Рыжая' },
]

export const CITY_ROWS = [
  { id: 'spb', title: 'Санкт-Петербург' },
  { id: 'msk', title: 'Москва' },
] as const
