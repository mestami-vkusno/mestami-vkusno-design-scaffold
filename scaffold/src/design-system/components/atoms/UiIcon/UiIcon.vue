<script setup lang="ts">
import { computed } from 'vue'
import { ICON_SHAPES } from '../../../icons'
import type { UiIconProps } from './types'

const props = withDefaults(defineProps<UiIconProps>(), { size: 20, filled: false })

const shapes = computed(() => ICON_SHAPES[props.name])
</script>

<template>
  <svg
    class="ui-icon"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    :fill="filled ? 'currentColor' : 'none'"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="title ? 'img' : undefined"
    :aria-hidden="title ? undefined : true"
  >
    <title v-if="title">{{ title }}</title>
    <component :is="shape.tag" v-for="(shape, index) in shapes" :key="index" v-bind="shape.attrs" />
  </svg>
</template>

<style scoped>
.ui-icon {
  flex: none;
}
</style>
