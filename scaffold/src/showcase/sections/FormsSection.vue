<script setup lang="ts">
import { ref } from 'vue'
import { UiCheckbox, UiCodeInput, UiField, UiGrid, UiInput, UiLink, UiPasswordInput, UiSearchInput, UiSelect, UiStack, UiSwitch } from '@/design-system'
import { SELECT_OPTIONS } from '../data/forms'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseStage from '../components/ShowcaseStage.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'

const focused = ref('Введённый текст')
const invalidValue = ref('Неверное значение')
const password = ref('password123')
const code = ref('4')
const query = ref('')
const acceptedTerms = ref(true)
const switchOff = ref(false)
const switchOn = ref(true)
const selected = ref('')
const unchecked = ref(false)
const checkOne = ref(true)
const checkTwo = ref(false)
</script>

<template>
  <ShowcaseSection
    id="forms"
    title="Поля и выбор"
    lead="Поля с тонкой границей; в фокусе граница становится акцентной, вокруг — мягкое лаймовое кольцо. Ошибка красная, с текстом под полем."
  >
    <UiGrid :min="240">
      <UiField label="Обычное поле" hint="Пояснение под полем">
        <template #default="{ id, describedBy }"><UiInput :id="id" :aria-describedby="describedBy" placeholder="Подсказка в поле" /></template>
      </UiField>
      <UiField label="В фокусе">
        <template #default="{ id }"><UiInput :id="id" v-model="focused" preview-state="focus" /></template>
      </UiField>
      <UiField label="С ошибкой" error="Текст ошибки, что исправить">
        <template #default="{ id, describedBy, invalid: isInvalid }"><UiInput :id="id" v-model="invalidValue" :aria-describedby="describedBy" :invalid="isInvalid" /></template>
      </UiField>
      <UiField label="Пароль" hint="Минимум 8 символов">
        <template #default="{ id, describedBy }"><UiPasswordInput :id="id" v-model="password" :aria-describedby="describedBy" /></template>
      </UiField>
      <UiField label="Отключённое">
        <template #default="{ id }"><UiInput :id="id" placeholder="Недоступно" disabled /></template>
      </UiField>
      <UiField label="Код из письма">
        <template #default="{ id }"><UiCodeInput :id="id" v-model="code" /></template>
      </UiField>
    </UiGrid>

    <ShowcaseSubheading>Поиск</ShowcaseSubheading>
    <ShowcaseStage class="forms-search">
      <UiSearchInput v-model="query" label="Поиск" placeholder="Найти по названию…" />
    </ShowcaseStage>

    <ShowcaseSubheading>Выбор</ShowcaseSubheading>
    <UiGrid :min="240" align="start">
      <ShowcaseStage>
        <UiStack :gap="4">
          <UiCheckbox v-model="unchecked">Не выбрано</UiCheckbox>
          <UiCheckbox v-model="acceptedTerms">Выбрано, <UiLink href="#forms">с ссылкой</UiLink></UiCheckbox>
          <UiCheckbox disabled>Отключено</UiCheckbox>
        </UiStack>
      </ShowcaseStage>
      <ShowcaseStage>
        <UiStack :gap="4">
          <UiSwitch v-model="switchOff">Выключено</UiSwitch>
          <UiSwitch v-model="switchOn">Включено</UiSwitch>
        </UiStack>
      </ShowcaseStage>
      <ShowcaseStage>
        <UiStack :gap="3">
          <UiField label="Список с выбором">
            <template #default="{ id }"><UiSelect :id="id" v-model="selected" :options="SELECT_OPTIONS" placeholder="Выберите значение" /></template>
          </UiField>
          <UiCheckbox v-model="checkOne">Пункт 1</UiCheckbox>
          <UiCheckbox v-model="checkTwo">Пункт 2</UiCheckbox>
        </UiStack>
      </ShowcaseStage>
    </UiGrid>
  </ShowcaseSection>
</template>

<style scoped>
.forms-search {
  max-width: 640px;
}
</style>
