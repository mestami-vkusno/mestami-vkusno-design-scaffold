import { onBeforeUnmount, onMounted } from 'vue'

/**
 * Диалог с ИИ приватен: публичной ссылки нет (front-structure AI2), поэтому страница просит поисковики её не индексировать.
 * Тег ставится, пока страница открыта, и снимается при уходе.
 */
export function useNoIndex(): void {
  let tag: HTMLMetaElement | null = null
  onMounted(() => {
    tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex, nofollow'
    document.head.append(tag)
  })
  onBeforeUnmount(() => tag?.remove())
}
