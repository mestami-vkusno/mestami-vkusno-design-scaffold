<script setup lang="ts">
import { ref } from 'vue'
import { UiField, UiGrid, UiMediaPicker, UiRadio, UiRadioGroup, UiRatingInput, UiStack, UiText, UiTextarea, simulateMediaUpload } from '@/design-system'
import type { MediaPickerItem } from '@/design-system'
import { PICKER_SAMPLE_TEXT, PICKER_STATE_ITEMS, REASON_OPTIONS } from '../data/inputs'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseStage from '../components/ShowcaseStage.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'

const plain = ref('')
const counted = ref(PICKER_SAMPLE_TEXT)
const nearLimit = ref('Осталось совсем немного места для текста публикации, поэтому счётчик уже подсвечен.')
const grown = ref('Поле растёт по тексту.\nВторая строка.\nТретья строка.\nЧетвёртая строка.\nПятая строка.')
const invalidText = ref('')
const reason = ref('inaccurate')
const disabledReason = ref('spam')
const rating = ref(0)
const ratingSet = ref(4)
const ratingFocus = ref(3)

// Имитация загрузки без сервера: каждый второй файл падает на первой попытке, чтобы показать «Повторить».
let uploads = 0
const uploader = simulateMediaUpload({ durationMs: 2200, failWhen: (_file, attempt) => attempt === 1 && ++uploads % 2 === 0 })
const photos = ref<MediaPickerItem[]>([])
const avatar = ref<MediaPickerItem[]>([])
const rejectedCount = ref(0)
</script>

<template>
  <ShowcaseSection
    id="inputs"
    title="Многострочный ввод, выбор и файлы"
    lead="Текст публикации, причина жалобы, оценка и фото. Всё на нативных элементах: стрелки, фокус и мобильная клавиатура работают как в системе."
  >
    <ShowcaseSubheading first>Многострочное поле</ShowcaseSubheading>
    <UiGrid :min="260">
      <UiField label="Текст публикации" hint="Поле растёт по мере набора">
        <template #default="{ id, describedBy }"><UiTextarea :id="id" v-model="plain" :aria-describedby="describedBy" placeholder="Расскажите, как всё прошло" /></template>
      </UiField>
      <UiField label="Со счётчиком" hint="Предел 200 символов">
        <template #default="{ id, describedBy }"><UiTextarea :id="id" v-model="counted" :aria-describedby="describedBy" :max-length="200" /></template>
      </UiField>
      <UiField label="Лимит близко">
        <template #default="{ id }"><UiTextarea :id="id" v-model="nearLimit" :max-length="100" /></template>
      </UiField>
      <UiField label="В фокусе">
        <template #default="{ id }"><UiTextarea :id="id" v-model="grown" preview-state="focus" :rows="2" :max-rows="4" /></template>
      </UiField>
      <UiField label="С ошибкой" error="Напишите хотя бы одну строку">
        <template #default="{ id, describedBy, invalid }"><UiTextarea :id="id" v-model="invalidText" :aria-describedby="describedBy" :invalid="invalid" /></template>
      </UiField>
      <UiField label="Отключённое">
        <template #default="{ id }"><UiTextarea :id="id" model-value="Недоступно для правки" disabled /></template>
      </UiField>
    </UiGrid>

    <ShowcaseSubheading>Выбор из взаимоисключающих вариантов</ShowcaseSubheading>
    <UiGrid :min="260" align="start">
      <ShowcaseStage>
        <UiRadioGroup v-model="reason" label="Причина жалобы">
          <UiRadio v-for="option in REASON_OPTIONS" :key="option.value" :value="option.value" :description="option.description">{{ option.label }}</UiRadio>
        </UiRadioGroup>
      </ShowcaseStage>
      <ShowcaseStage>
        <UiStack :gap="2">
          <UiText variant="caption">Отключено и в фокусе</UiText>
          <UiRadioGroup v-model="disabledReason" label="Отключённая группа" disabled>
            <UiRadio value="spam">Выбрано</UiRadio>
            <UiRadio value="other">Не выбрано</UiRadio>
          </UiRadioGroup>
          <UiRadioGroup model-value="focus" label="Состояние фокуса">
            <UiRadio value="focus" preview-state="focus">В фокусе</UiRadio>
          </UiRadioGroup>
        </UiStack>
      </ShowcaseStage>
    </UiGrid>

    <ShowcaseSubheading>Оценка</ShowcaseSubheading>
    <UiGrid :min="260" align="start">
      <ShowcaseStage>
        <UiStack :gap="2">
          <UiText variant="caption">Не выбрана · клавиши со стрелками меняют оценку</UiText>
          <UiRatingInput v-model="rating" label="Ваша оценка" />
          <UiText variant="caption">Выбрано: {{ rating || 'ничего' }}</UiText>
        </UiStack>
      </ShowcaseStage>
      <ShowcaseStage>
        <UiStack :gap="2">
          <UiText variant="caption">Выбрана, в фокусе</UiText>
          <UiRatingInput v-model="ratingFocus" label="Оценка в фокусе" preview-state="focus" />
          <UiText variant="caption">Выбрана</UiText>
          <UiRatingInput v-model="ratingSet" label="Оценка выбрана" />
          <UiText variant="caption">Отключена</UiText>
          <UiRatingInput :model-value="3" label="Оценка отключена" disabled />
        </UiStack>
      </ShowcaseStage>
    </UiGrid>

    <ShowcaseSubheading>Фотографии</ShowcaseSubheading>
    <UiGrid :min="300" align="start">
      <ShowcaseStage>
        <UiStack :gap="3">
          <UiText variant="caption">Выберите файл: загрузка только имитируется, на сервер ничего не уходит. Каждый второй файл падает на первой попытке.</UiText>
          <UiMediaPicker v-model:items="photos" :max="6" :max-size="10_000_000" :uploader="uploader" @reject="rejectedCount += $event.length" />
          <UiText variant="caption">До 6 фото · выбрано {{ photos.length }}<template v-if="rejectedCount"> · не принято: {{ rejectedCount }}</template></UiText>
        </UiStack>
      </ShowcaseStage>
      <ShowcaseStage>
        <UiStack :gap="3">
          <UiText variant="caption">Готово, загрузка, ошибка и отключено</UiText>
          <UiMediaPicker :items="[...PICKER_STATE_ITEMS]" />
          <UiMediaPicker :items="[]" disabled />
        </UiStack>
      </ShowcaseStage>
      <ShowcaseStage>
        <UiStack :gap="3">
          <UiText variant="caption">Один файл, круглое превью (аватар)</UiText>
          <UiMediaPicker v-model:items="avatar" :multiple="false" ratio="1/1" shape="circle" add-label="Добавить фото профиля" :uploader="uploader" />
        </UiStack>
      </ShowcaseStage>
    </UiGrid>
  </ShowcaseSection>
</template>
