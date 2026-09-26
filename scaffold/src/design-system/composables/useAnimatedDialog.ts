import { onBeforeUnmount, ref, useTemplateRef, type Ref } from 'vue'

export type DialogState = 'closed' | 'open'

/**
 * Нативный <dialog> с анимацией входа и выхода: фокус, Escape и «инертность» фона даёт браузер.
 * `data-state` переключается после showModal(), поэтому переход стартует с закрытого вида;
 * закрывается диалог, когда отыграет выход. Повторное открытие во время выхода отменяет закрытие.
 */
export function useAnimatedDialog(refName: string, exitMs: () => number): {
  dialog: Readonly<Ref<HTMLDialogElement | null>>
  state: Ref<DialogState>
  open: () => void
  close: () => void
  onBackdropClick: (event: MouseEvent) => void
} {
  const dialog = useTemplateRef<HTMLDialogElement>(refName)
  const state = ref<DialogState>('closed')
  let timer: ReturnType<typeof setTimeout> | undefined

  function open(): void {
    const element = dialog.value
    if (!element) return
    clearTimeout(timer)
    if (!element.open) {
      element.showModal()
      void element.offsetWidth
    }
    state.value = 'open'
  }

  function close(): void {
    const element = dialog.value
    if (!element?.open || state.value === 'closed') return
    state.value = 'closed'
    timer = setTimeout(() => element.close(), exitMs())
  }

  function onBackdropClick(event: MouseEvent): void {
    if (event.target === dialog.value) close()
  }

  onBeforeUnmount(() => clearTimeout(timer))
  return { dialog, state, open, close, onBackdropClick }
}
