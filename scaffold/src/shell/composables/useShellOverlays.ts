import { ref } from 'vue'

const createOpen = ref(false)
const cityOpen = ref(false)

/** Панели оболочки без своего маршрута: «Создать» (ТЗ §4.4) и выбор города (ТЗ §6.1). Открываются из шапки и нижней навигации. */
export function useShellOverlays() {
  return { createOpen, cityOpen }
}
