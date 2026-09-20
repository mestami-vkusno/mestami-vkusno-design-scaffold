<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiButton, UiCluster, UiSegmented, UiStack, useMotion, useTheme } from '@/design-system'
import type { OptionItem, ThemeTransitionMode } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

const MODES: readonly OptionItem[] = [
  { id: 'reveal', label: 'Круг' },
  { id: 'fade', label: 'Затухание' },
  { id: 'none', label: 'Мгновенно' },
]

const { theme, setTheme, transitionMode, setTransitionMode } = useTheme()
const { isReduced } = useMotion()

const mode = computed({
  get: () => transitionMode.value,
  set: (value: string) => setTransitionMode(value as ThemeTransitionMode),
})
const supported = typeof document !== 'undefined' && typeof document.startViewTransition === 'function'
</script>

<template>
  <MotionDemo
    title="Смена темы"
    tier="occasional"
    purpose="jarring"
    description="Тема меняется на всей странице сразу, и без перехода это резкая вспышка. Круг растёт от точки нажатия: видно, откуда пришло изменение. То же работает и для переключателя в шапке."
    :specs="[
      { label: 'Инструмент', value: 'View Transitions API + WAAPI' },
      { label: 'Свойство', value: 'clip-path: circle(0 at x y) → circle(r at x y)' },
      { label: 'Кривая', value: 'var(--ease-out)' },
      { label: 'Длительность', value: '420 мс (--dur-theme)' },
    ]"
  >
    <template #note>
      При уменьшенном движении круг заменяется затуханием на 200 мс. Где нет View Transitions (старые браузеры), тема меняется мгновенно.
      <UiBadge v-if="!supported" variant="warning">В этом браузере недоступно</UiBadge>
    </template>
    <UiStack :gap="4" align="start">
      <UiSegmented v-model="mode" :items="MODES" label="Вид перехода темы" />
      <UiCluster>
        <UiButton :icon-left="theme === 'dark' ? 'sparkle' : 'bookmark'" @click="setTheme(theme === 'dark' ? 'light' : 'dark')">
          {{ theme === 'dark' ? 'Включить светлую' : 'Включить тёмную' }}
        </UiButton>
        <UiBadge variant="neutral">{{ isReduced && mode === 'reveal' ? 'Сейчас: затухание' : theme === 'dark' ? 'Сейчас: тёмная' : 'Сейчас: светлая' }}</UiBadge>
      </UiCluster>
    </UiStack>
  </MotionDemo>
</template>
