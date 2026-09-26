<script setup lang="ts">
/*
  A5 · Юридическая настройка первой публичной публикации (§13А, §13Б). Один раз перед первой публикацией с `visibility=public`:
  что произойдёт с публичной записью, два отдельных согласия (ничего не отмечено заранее) и не тупик — «Оставить приватной».
  Показывается поверх редактора: черновик не теряется, документ открывается в новой вкладке.
  Согласие на распространение персональных данных (`distribution_consent`) показывается «если применяется» (§13А):
  условие в ТЗ не описано (вопрос 25 дизайнера), в моке блок не показан.
*/
import { ref, watch } from 'vue'
import { UiButton, UiCheckbox, UiInfoList, UiLink, UiSheet, UiText, type InfoListItem } from '@/design-system'
import { formatDate } from '@/mocks/format'
import { UGC_DOCUMENT_VERSION } from '@/state/useLibrary'

const emit = defineEmits<{ accept: []; 'keep-private': [] }>()
const open = defineModel<boolean>('open', { required: true })

const ITEMS: readonly InfoListItem[] = [
  { icon: 'share', title: 'Лицензия ООО «ВСЕМ» на всю территорию мира' },
  { icon: 'eye', title: 'Использование внутри сервиса и во внешней рекламе и PR «Местами вкусно»' },
  { icon: 'search', title: 'Индексация поисковиками, если тип объекта это допускает' },
]

const license = ref(false)
const imageVoice = ref(false)
watch(open, (value) => {
  if (value) {
    license.value = false
    imageVoice.value = false
  }
})

function accept(): void {
  if (!license.value || !imageVoice.value) return
  emit('accept')
}
</script>

<template>
  <UiSheet v-model:open="open" title="Перед первой публикацией">
    <div class="legal">
      <UiText variant="body">Что произойдёт с вашей публичной записью:</UiText>
      <UiInfoList :items="ITEMS" />
      <UiText variant="caption" class="legal__note">Приватные записи получают только техническую лицензию и не индексируются.</UiText>

      <fieldset class="legal__consents">
        <legend class="legal__legend">Согласия</legend>
        <UiCheckbox v-model="license">
          Принимаю лицензию на публичный пользовательский контент
          (<UiLink href="/legal/user-agreement" target="_blank" rel="noopener">документ</UiLink>)
        </UiCheckbox>
        <UiCheckbox v-model="imageVoice">Согласен на использование моего изображения и голоса</UiCheckbox>
      </fieldset>

      <UiText variant="caption" class="legal__note">Версия документа от {{ formatDate(UGC_DOCUMENT_VERSION) }}. Согласие спрашивается один раз.</UiText>

      <div class="legal__actions">
        <UiButton block :disabled="!license || !imageVoice" @click="accept">Принять и опубликовать</UiButton>
        <UiButton variant="outline" block @click="emit('keep-private')">Оставить приватной</UiButton>
        <UiButton variant="ghost" block @click="open = false">Вернуться к редактору</UiButton>
      </div>
    </div>
  </UiSheet>
</template>

<style scoped>
.legal {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.legal__note {
  margin: 0;
  color: var(--text-3);
}

.legal__consents {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  border: 0;
}

.legal__legend {
  padding: 0;
  margin-bottom: var(--s-2);
  color: var(--text-3);
  font-size: 13px;
}

.legal__actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
}
</style>
