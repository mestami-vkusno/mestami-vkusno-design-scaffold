export interface DemoScreen {
  id: string
  title: string
}

export const DEMO_SCREENS: readonly DemoScreen[] = [
  { id: 'places', title: 'Места' },
  { id: 'place', title: 'Заведение' },
  { id: 'booking', title: 'Запись' },
]

export type TransitionPattern = 'push' | 'fade' | 'sheet'

export interface PatternInfo {
  id: TransitionPattern
  label: string
  when: string
  specs: readonly { label: string; value: string }[]
}

export const PATTERNS: readonly PatternInfo[] = [
  {
    id: 'push',
    label: 'Сдвиг',
    when: 'Углубление и возврат: список → карточка. Направление показывает, куда мы пошли.',
    specs: [
      { label: 'Свойство', value: 'transform: translateX(100% → 0), уходящий −30%' },
      { label: 'Кривая', value: 'var(--ease-drawer)' },
      { label: 'Длительность', value: '350 мс' },
    ],
  },
  {
    id: 'fade',
    label: 'Затухание',
    when: 'Равные по уровню экраны, например вкладки. Сначала уходит старый, потом приходит новый.',
    specs: [
      { label: 'Свойство', value: 'opacity, transform: scale(0.98 → 1)' },
      { label: 'Кривая', value: 'var(--ease-out), режим out-in' },
      { label: 'Длительность', value: '120 мс уход + 220 мс приход' },
    ],
  },
  {
    id: 'sheet',
    label: 'Шторка',
    when: 'Отдельная задача поверх текущего экрана: запись, фильтры. Основа отступает и темнеет.',
    specs: [
      { label: 'Свойство', value: 'transform: translateY(100% → 0)' },
      { label: 'Кривая', value: 'var(--ease-drawer)' },
      { label: 'Длительность', value: '500 мс' },
    ],
  },
]
