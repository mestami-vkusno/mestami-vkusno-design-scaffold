import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Обычные ссылки на страницы приложения работают как переходы роутера: компоненты дизайн-системы
 * (`UiButton`, `UiTabBar`, `UiFooter`, `UiLink`) отдают обычный `<a href>` и не знают о роутере.
 * Ссылка остаётся настоящей: открывается в новой вкладке, копируется, работает с Ctrl/⌘-щелчком.
 * Внешние ссылки, `target="_blank"`, загрузки и якоря внутри страницы не перехватываются.
 */
export function useInternalLinks(): void {
  const router = useRouter()

  function onClick(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = (event.target as Element | null)?.closest('a[href]')
    if (!(anchor instanceof HTMLAnchorElement)) return
    if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return
    if (anchor.getAttribute('href')?.startsWith('#')) return
    if (anchor.origin !== window.location.origin) return
    event.preventDefault()
    void router.push(anchor.pathname + anchor.search + anchor.hash)
  }

  onMounted(() => document.addEventListener('click', onClick))
  onBeforeUnmount(() => document.removeEventListener('click', onClick))
}
