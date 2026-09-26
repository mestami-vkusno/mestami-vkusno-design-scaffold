export interface UiRadioProps {
  /** Значение варианта: то, что попадёт в `v-model`, когда он выбран. */
  value: string
  disabled?: boolean
  /** Пояснение под подписью (например, к причине жалобы). */
  description?: string
  /** Имя группы для одиночного радио вне `UiRadioGroup`. */
  name?: string
  /** Принудительное состояние фокуса для витрины; в продукте не используется. */
  previewState?: 'focus'
}
