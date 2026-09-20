import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const whenIdle = (callback: () => void): number =>
  typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(callback, { timeout: 120 }) : window.setTimeout(callback, 16)

const cancelIdle = (handle: number): void => {
  if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(handle)
  else clearTimeout(handle)
}

// Мгновенный прыжок, без плавной прокрутки: иначе по пути отрисовываются пропущенные разделы, их высоты
// меняются и цель уезжает. Второй прыжок добирает поправку от разделов, отрисованных после первого.
function jumpToHash(hash: string): void {
  const jump = () => document.querySelector(hash)?.scrollIntoView({ behavior: 'instant' })
  requestAnimationFrame(() => {
    jump()
    setTimeout(jump, 250)
  })
}

/**
 * Длинная страница монтируется по одному разделу за простой браузера: первый кадр и переход страниц
 * не ждут отрисовки всего, что ниже экрана. Когда всё смонтировано, прокручивает к якорю из адреса.
 */
export function useProgressiveMount(total: number, initial = 2) {
  const shown = ref(Math.min(initial, total))
  const done = computed(() => shown.value >= total)
  const route = useRoute()
  let handle = 0

  function step(): void {
    shown.value += 1
    if (shown.value < total) {
      handle = whenIdle(step)
      return
    }
    if (route.hash) jumpToHash(route.hash)
  }

  onMounted(() => {
    if (shown.value < total) requestAnimationFrame(() => (handle = whenIdle(step)))
  })
  onBeforeUnmount(() => cancelIdle(handle))

  return { shown, done }
}
