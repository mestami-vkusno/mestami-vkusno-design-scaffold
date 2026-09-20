import { nextTick, onMounted, ref, watch, type Ref } from 'vue'
import { useTheme } from './useTheme'

/** Минификатор CSS сокращает #CCFF00 до #CF0 и переписывает rgba в #RRGGBBAA: возвращаем читаемый вид. */
function formatTokenValue(raw: string): string {
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(raw)
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toUpperCase()
  const withAlpha = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(raw)
  if (withAlpha) {
    const [r, g, b, a] = withAlpha.slice(1).map((part) => parseInt(part, 16)) as [number, number, number, number]
    return `rgba(${r}, ${g}, ${b}, ${Number((a / 255).toFixed(2))})`
  }
  return /^#/.test(raw) ? raw.toUpperCase() : raw
}

/** Текущее значение CSS-переменной токена; пересчитывается при смене темы. */
export function useCssToken(token: string): Ref<string> {
  const value = ref('')
  const { theme } = useTheme()

  function read(): void {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim().replace(/\s+/g, ' ')
    value.value = formatTokenValue(raw)
  }

  onMounted(read)
  watch(theme, () => void nextTick(read))

  return value
}
