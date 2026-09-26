<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import UiButton from '../../atoms/UiButton/UiButton.vue'
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import UiIconButton from '../../atoms/UiIconButton/UiIconButton.vue'
import UiImage from '../../atoms/UiImage/UiImage.vue'
import type { MediaPickerItem, MediaPickerRejection, UiMediaPickerProps } from './types'

const props = withDefaults(defineProps<UiMediaPickerProps>(), {
  accept: 'image/*',
  multiple: true,
  ratio: '4/3',
  shape: 'rounded',
  addLabel: 'Добавить фото',
  removeLabel: 'Удалить',
  retryLabel: 'Повторить',
  uploadingLabel: 'Загрузка',
  errorLabel: 'Не удалось загрузить',
  doneLabel: 'загружено',
})

const items = defineModel<MediaPickerItem[]>('items', { default: () => [] })
const emit = defineEmits<{
  add: [files: File[]]
  remove: [item: MediaPickerItem]
  retry: [item: MediaPickerItem]
  reject: [rejections: MediaPickerRejection[]]
}>()

const canAdd = computed(() => !props.disabled && (props.multiple ? props.max === undefined || items.value.length < props.max : items.value.length === 0))
const ratioStyle = computed(() => ({ aspectRatio: props.ratio.replace('/', ' / ') }))

const controllers = new Map<string, AbortController>()
const previews = new Map<string, string>()
let counter = 0

function matchesAccept(file: File): boolean {
  return props.accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => (rule.startsWith('.') ? file.name.toLowerCase().endsWith(rule) : rule.endsWith('/*') ? file.type.startsWith(rule.slice(0, -1)) : file.type === rule))
}

function patch(id: string, changes: Partial<MediaPickerItem>): void {
  items.value = items.value.map((item) => (item.id === id ? { ...item, ...changes } : item))
}

async function upload(id: string, file: File): Promise<void> {
  if (!props.uploader) return
  const controller = new AbortController()
  controllers.set(id, controller)
  let last = -1
  try {
    await props.uploader(file, (value) => {
      const progress = Math.min(100, Math.max(0, Math.round(value)))
      if (progress === last) return
      last = progress
      patch(id, { progress })
    }, controller.signal)
    if (!controller.signal.aborted) patch(id, { status: 'done', progress: 100, error: undefined })
  } catch {
    if (!controller.signal.aborted) patch(id, { status: 'error', error: props.errorLabel })
  } finally {
    controllers.delete(id)
  }
}

function release(id: string): void {
  controllers.get(id)?.abort()
  controllers.delete(id)
  const url = previews.get(id)
  if (url) URL.revokeObjectURL(url)
  previews.delete(id)
}

function onChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const picked = Array.from(input.files ?? [])
  input.value = ''
  if (picked.length === 0) return

  const rejected: MediaPickerRejection[] = []
  const accepted: File[] = []
  // Одиночный выбор берёт первый файл, остальные не помещаются; множественный ограничен `max`.
  const room = props.multiple ? (props.max === undefined ? Infinity : props.max - items.value.length) : 1
  for (const file of picked) {
    if (!matchesAccept(file)) rejected.push({ file, reason: 'type' })
    else if (props.maxSize !== undefined && file.size > props.maxSize) rejected.push({ file, reason: 'size' })
    else if (accepted.length >= room) rejected.push({ file, reason: 'limit' })
    else accepted.push(file)
  }
  if (rejected.length) emit('reject', rejected)
  if (accepted.length === 0) return

  const created: MediaPickerItem[] = accepted.map((file) => {
    const id = `media-${++counter}`
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    if (previewUrl) previews.set(id, previewUrl)
    return { id, file, name: file.name, previewUrl, status: props.uploader ? 'uploading' : 'done', progress: props.uploader ? 0 : 100 }
  })
  items.value = [...items.value, ...created]
  emit('add', accepted)
  created.forEach((item) => void upload(item.id, item.file))
}

function remove(item: MediaPickerItem): void {
  release(item.id)
  items.value = items.value.filter((candidate) => candidate.id !== item.id)
  emit('remove', item)
}

function retry(item: MediaPickerItem): void {
  patch(item.id, props.uploader ? { status: 'uploading', progress: 0, error: undefined } : { status: 'done', progress: 100, error: undefined })
  emit('retry', item)
  void upload(item.id, item.file)
}

// Скринридеру сообщаем итог по каждому файлу: успех и ошибку, а не каждый процент.
const announcement = computed(() => {
  const last = [...items.value].reverse().find((item) => item.status !== 'uploading')
  return last ? `${last.name}: ${last.status === 'done' ? props.doneLabel : props.errorLabel}` : ''
})
watch(
  () => items.value.map((item) => item.id).join(),
  (ids) => {
    // Файл убрали снаружи (сброс формы): освобождаем превью и обрываем загрузку.
    const alive = new Set(ids.split(','))
    for (const id of [...previews.keys(), ...controllers.keys()]) if (!alive.has(id)) release(id)
  },
)

onBeforeUnmount(() => [...new Set([...previews.keys(), ...controllers.keys()])].forEach(release))
</script>

<!-- Только нативный <input type="file">: на телефоне открывается системный выбор фото. На сервер ничего не отправляется — состояния файлов уходят наружу. -->
<template>
  <div class="ui-media-picker" :class="[`ui-media-picker--${shape}`, { 'ui-media-picker--single': !multiple }]">
    <ul class="ui-media-picker__grid" role="list">
      <li v-for="item in items" :key="item.id" class="ui-media-picker__tile" :class="`ui-media-picker__tile--${item.status}`">
        <div class="ui-media-picker__media">
          <UiImage :src="item.previewUrl" :alt="item.name" :ratio="ratio" tone="dusk" />
          <div v-if="item.status === 'uploading'" class="ui-media-picker__overlay">
            <span class="ui-media-picker__percent" aria-hidden="true">{{ item.progress }}%</span>
            <span
              class="ui-media-picker__progress"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="item.progress"
              :aria-label="`${uploadingLabel}: ${item.name}`"
            >
              <span class="ui-media-picker__bar" :style="{ transform: `scaleX(${item.progress / 100})` }" />
            </span>
          </div>
          <div v-else-if="item.status === 'error'" class="ui-media-picker__overlay ui-media-picker__overlay--error">
            <UiIcon name="alert" :size="20" />
            <span class="ui-media-picker__message">{{ item.error ?? errorLabel }}</span>
            <UiButton class="ui-media-picker__retry" size="sm" @click="retry(item)">{{ retryLabel }}</UiButton>
          </div>
        </div>
        <UiIconButton class="ui-media-picker__remove" icon="close" size="sm" :label="`${removeLabel}: ${item.name}`" @click="remove(item)" />
      </li>
      <li v-if="canAdd" class="ui-media-picker__add-item">
        <label class="ui-media-picker__add" :style="ratioStyle">
          <input class="ui-media-picker__input" type="file" :accept="accept" :multiple="multiple" :disabled="disabled" @change="onChange" />
          <UiIcon name="image" :size="24" />
          <span>{{ addLabel }}</span>
        </label>
      </li>
    </ul>
    <span class="ui-media-picker__announce" role="status">{{ announcement }}</span>
  </div>
</template>

<style scoped>
.ui-media-picker {
  --tile: 112px;
}

.ui-media-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--tile), 1fr));
  gap: var(--s-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-media-picker--single .ui-media-picker__grid {
  grid-template-columns: var(--tile);
}

.ui-media-picker__tile,
.ui-media-picker__add-item {
  position: relative;
  min-width: 0;
}

.ui-media-picker__media {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
}

.ui-media-picker--circle .ui-media-picker__media,
.ui-media-picker--circle .ui-media-picker__add {
  border-radius: 50%;
}

.ui-media-picker__remove {
  position: absolute;
  top: 6px;
  right: 6px;
}

.ui-media-picker--circle .ui-media-picker__remove {
  top: 0;
  right: 0;
}

/* Поверх снимка: тёмная подложка и белый текст в обеих темах, как подписи на плитках. */
.ui-media-picker__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: var(--scrim);
  color: var(--on-scrim);
  font-size: 12px;
  text-align: center;
}

.ui-media-picker__overlay--error {
  background: var(--scrim-strong);
}

.ui-media-picker__percent {
  font: 600 14px var(--font);
  font-variant-numeric: tabular-nums;
}

.ui-media-picker__message {
  line-height: 1.25;
}

.ui-media-picker__retry.ui-button {
  --px: 8px;
  max-width: 100%;
}

.ui-media-picker__progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 4px;
  background: var(--on-scrim-track);
}

.ui-media-picker__bar {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--lime);
  transform-origin: left;
  transition: transform var(--dur-hover) var(--ease-out);
}

.ui-media-picker__add {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--r-md);
  background: var(--field);
  color: var(--text-2);
  font-size: 13px;
  line-height: 1.25;
  text-align: center;
  cursor: pointer;
  transition: background var(--dur-hover) ease, border-color var(--dur-hover) ease;
}

.ui-media-picker__add:active {
  background: var(--surface-2);
}

.ui-media-picker__add:has(.ui-media-picker__input:focus-visible) {
  border-color: var(--accent-fg);
  border-style: solid;
  box-shadow: var(--ring);
}

.ui-media-picker__add:has(.ui-media-picker__input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Настоящий input остаётся в порядке фокуса; видна только плитка вокруг него. */
.ui-media-picker__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  opacity: 0;
}

.ui-media-picker__announce {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (hover: hover) and (pointer: fine) {
  .ui-media-picker__add:hover {
    background: var(--surface);
    border-color: var(--text-3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-media-picker__bar {
    transition: none;
  }
}
</style>
