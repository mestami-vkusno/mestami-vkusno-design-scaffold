import type { InjectionKey, Ref } from 'vue'

/** Что группа `UiRadioGroup` передаёт своим `UiRadio`. */
export interface RadioGroupContext {
  name: string
  model: Ref<string>
  disabled: Ref<boolean | undefined>
  invalid: Ref<boolean | undefined>
}

export const RADIO_GROUP_KEY: InjectionKey<RadioGroupContext> = Symbol('UiRadioGroup')
