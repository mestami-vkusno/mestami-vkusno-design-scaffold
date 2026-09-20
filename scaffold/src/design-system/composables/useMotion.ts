import { computed, ref } from 'vue'

export type MotionScale = 1 | 2 | 5
export type ReducedMotionMode = 'auto' | 'on' | 'off'

const scale = ref<MotionScale>(1)
const reducedMode = ref<ReducedMotionMode>('auto')
const systemReduced = ref(false)

function applyToDocument(): void {
  const root = document.documentElement
  root.style.setProperty('--motion-scale', String(scale.value))
  if (reducedMode.value === 'auto') root.removeAttribute('data-reduced-motion')
  else root.setAttribute('data-reduced-motion', reducedMode.value === 'on' ? 'true' : 'false')
}

/** Один раз при старте: следит за системной настройкой «уменьшить движение». */
export function initMotion(): void {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  systemReduced.value = query.matches
  query.addEventListener('change', (event) => {
    systemReduced.value = event.matches
  })
  applyToDocument()
}

/**
 * Состояние движения для CSS (через токены `--motion-scale`, `--motion-distance`) и для JS-анимаций.
 * Замедление и принудительный режим нужны для проверки на глаз, в продукте остаётся только системная настройка.
 */
export function useMotion() {
  const isReduced = computed(() => reducedMode.value === 'on' || (reducedMode.value === 'auto' && systemReduced.value))

  function setScale(next: MotionScale): void {
    scale.value = next
    applyToDocument()
  }

  function setReducedMode(next: ReducedMotionMode): void {
    reducedMode.value = next
    applyToDocument()
  }

  return {
    scale,
    reducedMode,
    isReduced,
    /** Значение для `MotionConfig`. */
    motionConfigMode: computed(() => (reducedMode.value === 'on' ? 'always' : reducedMode.value === 'off' ? 'never' : 'user') as 'always' | 'never' | 'user'),
    setScale,
    setReducedMode,
    /** Длительность в секундах с учётом замедления. */
    duration: (seconds: number) => seconds * scale.value,
    /** Смещение в px: при уменьшенном движении 0. */
    distance: (px: number) => (isReduced.value ? 0 : px),
  }
}
