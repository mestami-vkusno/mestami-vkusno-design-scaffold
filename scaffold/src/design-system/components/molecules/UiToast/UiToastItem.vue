<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { TOAST_ACTION_DURATION_MS, TOAST_DURATION_MS } from '../../../composables/useToast'
import type { IconName } from '../../../icons'
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import UiIconButton from '../../atoms/UiIconButton/UiIconButton.vue'
import type { ToastItem } from './types'

const props = defineProps<{ toast: ToastItem; closeLabel: string }>()
const emit = defineEmits<{ dismiss: [] }>()

const DEFAULT_ICON: Partial<Record<NonNullable<ToastItem['variant']>, IconName>> = { success: 'check', danger: 'alert' }
/** После паузы тосту оставляем не меньше, чем нужно, чтобы дочитать и дотянуться до кнопки. */
const MIN_RESUME_MS = 1500

const root = ref<HTMLElement | null>(null)
const icon = computed(() => props.toast.icon ?? DEFAULT_ICON[props.toast.variant ?? 'default'])
const duration = props.toast.duration ?? (props.toast.action ? TOAST_ACTION_DURATION_MS : TOAST_DURATION_MS)

// Автозакрытие ставится на паузу, пока на тосте курсор или фокус: время не «сгорает», пока его читают или тянутся к кнопке.
let remaining = duration
let startedAt = 0
let timer: ReturnType<typeof setTimeout> | undefined
let hovered = false
let focused = false

function run(): void {
  if (duration <= 0 || timer !== undefined) return
  startedAt = performance.now()
  timer = setTimeout(() => emit('dismiss'), remaining)
}

function halt(): void {
  if (timer === undefined) return
  clearTimeout(timer)
  timer = undefined
  remaining = Math.max(remaining - (performance.now() - startedAt), MIN_RESUME_MS)
}

function sync(): void {
  if (hovered || focused) halt()
  else run()
}

function onPointer(inside: boolean, event: PointerEvent): void {
  if (event.pointerType === 'touch') return
  hovered = inside
  sync()
}

function onFocusIn(): void {
  focused = true
  sync()
}

function onFocusOut(event: FocusEvent): void {
  if (root.value?.contains(event.relatedTarget as Node | null)) return
  focused = false
  sync()
}

function onAction(): void {
  props.toast.action?.onClick()
  emit('dismiss')
}

onMounted(run)
onBeforeUnmount(halt)
</script>

<template>
  <div
    ref="root"
    class="ui-toast__item"
    :class="`ui-toast__item--${toast.variant ?? 'default'}`"
    @pointerenter="onPointer(true, $event)"
    @pointerleave="onPointer(false, $event)"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @keydown.esc="emit('dismiss')"
  >
    <UiIcon v-if="icon" class="ui-toast__icon" :name="icon" />
    <span class="ui-toast__text">{{ toast.text }}</span>
    <button v-if="toast.action" class="ui-toast__action" type="button" @click="onAction">{{ toast.action.label }}</button>
    <UiIconButton class="ui-toast__close" icon="close" variant="plain" size="sm" :label="closeLabel" @click="emit('dismiss')" />
  </div>
</template>

<style scoped>
.ui-toast__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 6px 6px 14px;
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  color: var(--text);
  font-size: 14px;
  line-height: 1.4;
  box-shadow: var(--shadow-float);
  pointer-events: auto;
}

.ui-toast__icon {
  color: var(--text-2);
}

.ui-toast__item--success .ui-toast__icon {
  color: var(--success);
}

.ui-toast__item--danger .ui-toast__icon {
  color: var(--danger);
}

.ui-toast__text {
  flex: 1;
  padding: 6px 0;
  overflow-wrap: anywhere;
}

.ui-toast__action {
  flex: none;
  min-height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--accent-fg);
  font: 600 14px var(--font);
  text-decoration: underline;
  text-decoration-color: var(--link-line);
  text-decoration-thickness: var(--link-thick);
  text-underline-offset: 3px;
  cursor: pointer;
}

.ui-toast__action:active {
  background: var(--surface);
}

@media (pointer: coarse) {
  .ui-toast__action {
    min-height: 44px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .ui-toast__action:hover {
    background: var(--surface);
  }
}
</style>
