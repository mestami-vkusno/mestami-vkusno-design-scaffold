<script setup lang="ts">
import { UiListRow, UiThemeSwitch, useTheme } from '@/design-system'
import SettingsGroup from './SettingsGroup.vue'

/* ST1 · Внешний вид (assumption, вопрос 4): переключатель светлой и тёмной темы доступен и гостю. Смену темы ведёт `useTheme` (затухание на тач-экранах). */
const { theme, setTheme } = useTheme()
</script>

<template>
  <SettingsGroup id="appearance" title="Внешний вид">
    <UiListRow title="Тема">
      <template #trailing><UiThemeSwitch :model-value="theme" @update:model-value="setTheme" /></template>
    </UiListRow>
  </SettingsGroup>
</template>
