<script setup lang="ts">
import type { UiThemeScopeProps } from './types'

withDefaults(defineProps<UiThemeScopeProps>(), { as: 'div' })
</script>

<!-- Локально включает тему для блока: например, тёмный остров ИИ на светлой странице. -->
<template>
  <component :is="as" :data-theme="theme"><slot /></component>
</template>
