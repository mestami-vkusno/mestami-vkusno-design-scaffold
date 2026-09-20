/**
 * Стрелки влево/вправо переключают выбор в группе кнопок (вкладки, сегменты):
 * фокус уходит на соседнюю кнопку и она активируется.
 */
export function useArrowNavigation(itemSelector: string) {
  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const container = event.currentTarget as HTMLElement
    const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector))
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (index === -1) return
    const step = event.key === 'ArrowRight' ? 1 : -1
    const next = items[(index + step + items.length) % items.length]
    if (!next) return
    event.preventDefault()
    next.focus()
    next.click()
  }

  return { onKeydown }
}
