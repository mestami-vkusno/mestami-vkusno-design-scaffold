<script setup lang="ts">
import { UiButton, UiChip, UiCluster, UiIconButton } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'
</script>

<template>
  <MotionDemo
    title="Нажатие"
    tier="often"
    purpose="feedback"
    description="Нажмите и подержите любую кнопку: она чуть уменьшается, как физическая. Реакция мгновенная, отпускание плавное."
    :specs="[
      { label: 'Инструмент', value: 'CSS transition + :active' },
      { label: 'Свойство', value: 'transform: scale(0.97)' },
      { label: 'Кривая', value: 'var(--ease-out)' },
      { label: 'Длительность', value: '160 мс (--dur-press)' },
    ]"
  >
    <template #note>Наведение красит фон только на устройствах с мышью: на тач-экране :hover срабатывает ложно, поэтому он под <code>@media (hover: hover) and (pointer: fine)</code>. Нажатие на любом устройстве настоящее и не гейтится.</template>
    <UiCluster>
      <UiButton>Главная</UiButton>
      <UiButton variant="outline">Контурная</UiButton>
      <UiButton variant="neutral">Нейтральная</UiButton>
      <UiButton variant="secondary">Вторичная</UiButton>
      <UiButton variant="ghost">Текстовая</UiButton>
      <UiIconButton icon="share" label="Поделиться" />
      <UiChip>Чип</UiChip>
    </UiCluster>
  </MotionDemo>
</template>
