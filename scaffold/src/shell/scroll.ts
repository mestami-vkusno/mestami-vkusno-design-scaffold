import { START_LOCATION, type RouteLocationNormalized, type RouterScrollBehavior } from 'vue-router'

interface Position {
  left: number
  top: number
}

type Target = Position | { el: string } | null

/** Где остановились на корневой вкладке: возвращаясь на неё по нажатию вкладки (а не «Назад»), продолжаем с того же места. */
const tabPositions = new Map<string, Position>()
let pending: Target = null

/** Вызывать до ухода со страницы: пока она ещё на экране и прокрутка настоящая. */
export function rememberTabScroll(from: RouteLocationNormalized): void {
  if (from.meta.keepAlive && typeof from.name === 'string') tabPositions.set(from.name, { left: window.scrollX, top: window.scrollY })
}

/**
 * Роутер сам не прокручивает: страницу меняет `<Transition mode="out-in">` (см. App.vue), и прокрутка до
 * появления новой страницы либо прыгала бы на уходящей, либо упиралась бы в пустой документ. Здесь только
 * решаем, куда прокрутить, а `applyPendingScroll` делает это, когда новая страница уже в документе.
 * «Назад» и «Вперёд» дают сохранённое положение, переход по ссылке — начало страницы или якорь.
 */
export const scrollBehavior: RouterScrollBehavior = (to, from, saved) => {
  const samePage = from !== START_LOCATION && to.path === from.path
  if (samePage) {
    pending = null
    // Тот же адрес с другим якорем — переход страниц не запускается, прокручиваем сразу.
    return to.hash ? { el: to.hash, behavior: 'instant' } : false
  }
  const tabPosition = to.meta.keepAlive && typeof to.name === 'string' ? tabPositions.get(to.name) : undefined
  pending = saved ?? tabPosition ?? (to.hash ? { el: to.hash } : { left: 0, top: 0 })
  return false
}

/** Мгновенно, без плавной прокрутки: иначе по пути отрисовываются пропущенные разделы и цель уезжает. */
export function applyPendingScroll(): void {
  const target = pending
  pending = null
  if (!target) return
  if ('el' in target) document.querySelector(target.el)?.scrollIntoView({ behavior: 'instant' })
  else window.scrollTo({ left: target.left, top: target.top, behavior: 'instant' })
}
