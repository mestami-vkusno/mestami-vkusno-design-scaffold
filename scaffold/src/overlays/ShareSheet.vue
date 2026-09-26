<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UiBanner, UiButton, UiField, UiInput, UiListRow, UiSheet, UiSurface, UiText, useMediaQuery, useToast } from '@/design-system'
import type { ShareKind, ShareTarget } from '@/features/ShareButton/types'

/*
  O7 · Поделиться (§22). Ссылка открывает сам объект, а не Главную. Приватное и диалоги ИИ не делятся: кнопка «Поделиться»
  на них не рисуется, здесь пункта нет. Отдельных кнопок мессенджеров нет (вопрос 30): системное «Поделиться…» (Web Share),
  если оно есть, и копирование. На телефоне — шторка со списком, от 720 px — окно с полем ссылки и кнопкой «Копировать».
*/

const props = defineProps<{ target: ShareTarget }>()
const open = defineModel<boolean>('open', { required: true })

const KIND_LABEL: Record<ShareKind, string> = {
  venue: 'Заведение',
  menu_item: 'Блюдо',
  event: 'Событие',
  post: 'Публикация',
  collection: 'Подборка',
  author: 'Профиль',
  review: 'Отзыв',
}

const { show } = useToast()
const wide = useMediaQuery('(min-width: 720px)')
const copied = ref(false)
const failed = ref(false)
const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

const url = computed(() => new URL(props.target.href ?? window.location.pathname + window.location.search, window.location.origin).toString())

watch(open, (value) => {
  if (value) {
    copied.value = false
    failed.value = false
  }
}, { immediate: true })

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(url.value)
    copied.value = true
    failed.value = false
    show({ text: 'Ссылка скопирована', variant: 'success' })
  } catch {
    failed.value = true
  }
}

async function nativeShare(): Promise<void> {
  try {
    await navigator.share({ title: props.target.title, url: url.value })
    open.value = false
  } catch {
    /* пользователь закрыл системное окно: остаёмся в шторке */
  }
}

function selectAll(event: FocusEvent): void {
  if (event.target instanceof HTMLInputElement) event.target.select()
}
</script>

<template>
  <UiSheet v-model:open="open" title="Поделиться">
    <div class="share">
      <UiSurface variant="panel" class="share__preview">
        <UiText variant="overline">{{ KIND_LABEL[target.kind] }}</UiText>
        <UiText variant="body" class="share__title">{{ target.title }}</UiText>
      </UiSurface>

      <UiBanner v-if="failed" variant="warning">Скопируйте ссылку вручную.</UiBanner>

      <template v-if="wide || failed">
        <UiField label="Ссылка">
          <template #default="{ id }">
            <UiInput :id="id" :model-value="url" readonly @focus="selectAll" />
          </template>
        </UiField>
        <UiButton block icon-left="check" :variant="copied ? 'outline' : 'primary'" @click="copy">{{ copied ? 'Ссылка скопирована' : 'Копировать' }}</UiButton>
      </template>
      <div v-else class="share__list">
        <UiListRow v-if="canNativeShare" title="Поделиться…" icon="share" @click="nativeShare" />
        <UiListRow :title="copied ? 'Ссылка скопирована' : 'Скопировать ссылку'" :icon="copied ? 'check' : 'external'" :chevron="false" @click="copy" />
      </div>
      <UiText variant="caption" class="share__note">Ссылка откроет именно этот объект и не требует установки приложения.</UiText>
    </div>
  </UiSheet>
</template>

<style scoped>
.share {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.share__preview {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-1);
}

.share__title {
  overflow-wrap: anywhere;
  font-weight: 600;
}

.share__list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-1);
}

.share__note {
  color: var(--text-3);
}
</style>
