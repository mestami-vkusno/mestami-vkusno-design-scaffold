<script setup lang="ts">
import { computed, nextTick, onMounted, useAttrs, useTemplateRef, watch, type StyleValue } from 'vue'
import type { UiTextareaProps } from './types'

const props = withDefaults(defineProps<UiTextareaProps>(), {
  autoGrow: true,
  rows: 3,
  maxRows: 10,
  remainingLabel: (left: number) => `Осталось символов: ${left}`,
})
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })
const attrs = useAttrs()
const field = useTemplateRef<HTMLTextAreaElement>('field')

// class и style остаются на обёртке; всё остальное (id, aria-describedby, placeholder, disabled, name) уходит на <textarea>.
const fieldAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const length = computed(() => model.value.length)
const left = computed(() => (props.maxLength === undefined ? undefined : props.maxLength - length.value))
/** Порог «лимит близко»: 10 % или 10 символов. */
const threshold = computed(() => Math.max(10, Math.round((props.maxLength ?? 0) * 0.1)))
const nearLimit = computed(() => left.value !== undefined && left.value <= threshold.value)
/** Скринридеру остаток сообщается дважды: когда лимит стал близок и когда он исчерпан, а не на каждую букву. */
const announcement = computed(() => (left.value !== undefined && (left.value === threshold.value || left.value === 0) ? props.remainingLabel(left.value) : ''))

function resize(): void {
  const element = field.value
  if (!props.autoGrow || !element) return
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight + element.offsetHeight - element.clientHeight}px`
}

watch(model, () => void nextTick(resize))
onMounted(resize)
</script>

<template>
  <div class="ui-textarea" :class="[attrs.class, { 'ui-textarea--invalid': invalid }]" :style="[attrs.style as StyleValue, { '--max-rows': maxRows }]">
    <textarea
      ref="field"
      v-model="model"
      class="ui-textarea__field"
      :class="{ 'ui-textarea__field--grow': autoGrow }"
      v-bind="fieldAttrs"
      :rows="rows"
      :maxlength="maxLength"
      :aria-invalid="invalid || undefined"
      :data-preview="previewState"
    />
    <span v-if="maxLength !== undefined" class="ui-textarea__counter" :class="{ 'ui-textarea__counter--near': nearLimit }" aria-hidden="true">{{ length }} / {{ maxLength }}</span>
    <span v-if="maxLength !== undefined" class="ui-textarea__announce" role="status">{{ announcement }}</span>
  </div>
</template>

<style scoped>
.ui-textarea {
  --line: 1.5em;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.ui-textarea__field {
  display: block;
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  background: var(--field);
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  font: 400 15px/var(--line) var(--font);
  resize: vertical;
}

.ui-textarea__field--grow {
  max-height: calc(var(--max-rows) * var(--line) + 22px);
  overflow-y: auto;
  resize: none;
}

.ui-textarea__field::placeholder {
  color: var(--text-3);
}

.ui-textarea__field:hover {
  border-color: var(--border-hover);
}

.ui-textarea__field:focus,
.ui-textarea__field[data-preview='focus'] {
  outline: none;
  border-color: var(--accent-fg);
  box-shadow: 0 0 0 3px var(--lime-soft);
}

.ui-textarea--invalid .ui-textarea__field {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 14%, transparent);
}

.ui-textarea__field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  resize: none;
}

.ui-textarea__counter {
  align-self: flex-end;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--text-3);
}

.ui-textarea__counter--near {
  color: var(--warning);
}

.ui-textarea__announce {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
