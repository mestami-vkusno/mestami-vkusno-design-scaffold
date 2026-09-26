import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/** Совпадает ли медиазапрос сейчас; следит за изменениями и снимает слушатель при размонтировании. */
export function useMediaQuery(query: string): Readonly<Ref<boolean>> {
  const matches = ref(typeof window !== 'undefined' && window.matchMedia(query).matches)
  let list: MediaQueryList | undefined

  const onChange = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }

  onMounted(() => {
    list = window.matchMedia(query)
    matches.value = list.matches
    list.addEventListener('change', onChange)
  })
  onBeforeUnmount(() => list?.removeEventListener('change', onChange))

  return matches
}
