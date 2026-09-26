<script setup lang="ts">
import { nextTick, onMounted, ref, useId, watch } from 'vue'
import { useAnimatedDialog } from '../../../composables/useAnimatedDialog'
import { useMediaQuery } from '../../../composables/useMediaQuery'
import { useMotion } from '../../../composables/useMotion'
import { DURATION } from '../../../motion'
import UiIconButton from '../../atoms/UiIconButton/UiIconButton.vue'
import type { UiSheetProps } from './types'

defineProps<UiSheetProps>()
defineSlots<{ default?(): unknown }>()

const isOpen = defineModel<boolean>('open', { default: false })

const titleId = useId()
const { duration } = useMotion()
/** От 720 px шторка превращается в окно по центру: у него другой выход. */
const centered = useMediaQuery('(min-width: 720px)')
const { dialog: dialogElement, state, open, close } = useAnimatedDialog('dialog', () => duration(centered.value ? DURATION.modal : DURATION.drawer) * 1000)

// Содержимое монтируется при первом открытии: закрытая шторка ничего не стоит на странице.
const rendered = ref(false)

async function sync(): Promise<void> {
  if (isOpen.value) {
    rendered.value = true
    await nextTick()
    open()
  } else {
    close()
  }
}

watch(isOpen, sync)
onMounted(() => {
  if (isOpen.value) void sync()
})

function requestClose(): void {
  isOpen.value = false
}

function onBackdropClick(event: MouseEvent): void {
  if (event.target === dialogElement.value) requestClose()
}
</script>

<template>
  <dialog ref="dialog" class="ui-sheet" :data-state="state" :aria-labelledby="titleId" @cancel.prevent="requestClose" @close="isOpen = false" @click="onBackdropClick">
    <div v-if="rendered" class="ui-sheet__panel">
      <span class="ui-sheet__grip" aria-hidden="true" />
      <header class="ui-sheet__header">
        <h2 :id="titleId" class="ui-sheet__title">{{ title }}</h2>
        <UiIconButton icon="close" label="Закрыть" variant="plain" size="sm" @click="requestClose" />
      </header>
      <div class="ui-sheet__body"><slot /></div>
    </div>
  </dialog>
</template>

<style scoped>
/* Мобильный вид: шторка снизу. Приходит и уходит одним путём, кривая в духе iOS. */
.ui-sheet {
  inset: auto 0 0 0;
  width: 100%;
  max-width: 480px;
  max-height: none;
  margin: 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  overflow: visible;
  transition:
    transform var(--dur-drawer) var(--ease-drawer),
    opacity var(--dur-drawer) var(--ease-drawer);
}

.ui-sheet[data-state='closed'] {
  transform: translateY(calc(100% * var(--motion-distance)));
  opacity: var(--motion-distance);
}

.ui-sheet::backdrop {
  background: var(--scrim);
  transition: opacity var(--dur-drawer) var(--ease-drawer);
}

.ui-sheet[data-state='closed']::backdrop {
  opacity: 0;
}

.ui-sheet__panel {
  display: flex;
  flex-direction: column;
  max-height: min(85dvh, 640px);
  padding: var(--s-3) var(--s-6) max(var(--s-6), env(safe-area-inset-bottom));
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-bottom: 0;
  border-radius: var(--r-xl) var(--r-xl) 0 0;
}

.ui-sheet__grip {
  flex: none;
  align-self: center;
  width: 40px;
  height: 4px;
  border-radius: var(--r-pill);
  background: var(--border-strong);
}

.ui-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  margin: var(--s-2) 0 var(--s-3);
}

.ui-sheet__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.ui-sheet__body {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Широкий экран: окно по центру, растёт из центра, а не едет снизу. */
@media (min-width: 720px) {
  .ui-sheet {
    inset: 0;
    width: min(420px, calc(100vw - 32px));
    height: fit-content;
    margin: auto;
    transform-origin: center;
    transition:
      transform var(--dur-modal) var(--ease-out),
      opacity var(--dur-modal) var(--ease-out);
  }

  .ui-sheet[data-state='closed'] {
    transform: scale(calc(1 - 0.04 * var(--motion-distance)));
    opacity: 0;
  }

  .ui-sheet::backdrop {
    transition: opacity var(--dur-modal) var(--ease-out);
  }

  .ui-sheet__grip {
    display: none;
  }

  .ui-sheet__panel {
    padding: var(--s-5) var(--s-6) var(--s-6);
    border-bottom: 1px solid var(--border-strong);
    border-radius: var(--r-lg);
  }
}

/* Пока шторка открыта, страница под ней не прокручивается (место под полосу прокрутки остаётся). */
:global(html:has(.ui-sheet[open])) {
  overflow: hidden;
  scrollbar-gutter: stable;
}
</style>
