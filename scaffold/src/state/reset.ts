import { useToast } from '@/design-system/composables/useToast'
import { clearStored } from './storage'

/*
  Сброс мока. Хранилища состояния (сессия, библиотека, Премиум, отложенное действие) подгружаются по отдельности,
  поэтому сами регистрируют свой сброс здесь, а `resetMock()` не знает о них и не тянет их в основной чанк.
*/
const listeners = new Set<() => void>()

/** Хранилище сообщает, как вернуть исходные данные в памяти. Вызывается один раз при загрузке модуля. */
export function onMockReset(listener: () => void): void {
  listeners.add(listener)
}

/**
 * «Сбросить мок»: стирает сохранённое состояние и возвращает исходные данные — гость, библиотека Марии
 * из `MOCK_LIBRARY`, Премиум как в `MOCK_USER`, без отложенного действия. Выбор города не затрагивается.
 */
export function resetMock(): void {
  clearStored()
  for (const listener of listeners) listener()
  useToast().show({ text: 'Мок сброшен к исходным данным', variant: 'success' })
}
