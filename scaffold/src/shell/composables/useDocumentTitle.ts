import { onActivated, onBeforeUnmount, toValue, watch, type MaybeRefOrGetter } from 'vue'

const SUFFIX = ' · Местами вкусно'

/**
 * Заголовок вкладки браузера для страниц, название которых известно только по данным («Birch · Местами вкусно»).
 * Статический заголовок страницы задаёт таблица маршрутов (`shell/data/routes.ts`), а этот композабл перекрывает его,
 * пока страница открыта, и возвращает прежний при уходе. Пустое значение оставляет заголовок маршрута.
 * `RouteAnnouncer` читает `document.title` уже после перехода, поэтому скринридер объявляет заголовок страницы, а не маршрута.
 *
 * ```ts
 * useDocumentTitle(() => venue.value?.name)          // «Birch · Местами вкусно»
 * useDocumentTitle(() => post.value?.title, { suffix: false })
 * ```
 */
export function useDocumentTitle(title: MaybeRefOrGetter<string | null | undefined>, options: { suffix?: boolean } = {}): void {
  if (typeof document === 'undefined') return
  const routeTitle = document.title

  const apply = (): void => {
    const value = toValue(title)
    if (value !== null && value !== undefined && value !== '') document.title = options.suffix === false ? value : `${value}${SUFFIX}`
  }

  // Роутер выставляет заголовок маршрута после перехода, а компонент монтируется позже; повтор при возврате на закреплённую вкладку.
  watch(() => toValue(title), apply, { immediate: true, flush: 'post' })
  onActivated(apply)
  onBeforeUnmount(() => {
    // Заголовок уже мог смениться на следующую страницу: возвращаем свой прежний, только если он всё ещё наш.
    const value = toValue(title)
    if (value !== null && value !== undefined && document.title === (options.suffix === false ? value : `${value}${SUFFIX}`)) document.title = routeTitle
  })
}
