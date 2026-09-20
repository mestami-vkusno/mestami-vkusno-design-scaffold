<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import { animate } from 'motion-v'
import { EASE, UiCheckbox, UiChip, UiCluster, UiIconButton, UiSwitch, UiStack, useMotion } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

const favorite = ref(false)
const notifications = ref(true)
const agreed = ref(false)
const chip = ref(false)

const heart = useTemplateRef<InstanceType<typeof UiIconButton>>('heart')
const { duration, isReduced } = useMotion()

watch(favorite, (on) => {
  const element = heart.value?.$el as HTMLElement | undefined
  if (!on || !element || isReduced.value) return
  animate(element, { transform: ['scale(1)', 'scale(1.3)', 'scale(1)'] }, { duration: duration(0.35), ease: [...EASE.out] })
})
</script>

<template>
  <MotionDemo
    title="Переключатели и выбор"
    tier="often"
    purpose="state"
    description="Избранное коротко «подпрыгивает» только при включении: это единственное приятное событие. Остальное — быстрая смена цвета и положения без лишнего."
    :specs="[
      { label: 'Сердце', value: 'Motion animate(): scale 1 → 1.3 → 1, 350 мс, ease-out' },
      { label: 'Переключатель', value: 'CSS transition: transform 200 мс (--dur-dropdown)' },
      { label: 'Чип, галочка', value: 'CSS transition: цвет и рамка 150 мс (--dur-hover)' },
    ]"
  >
    <UiStack :gap="4">
      <UiCluster>
        <UiIconButton ref="heart" v-model:pressed="favorite" icon="heart" label="В избранное" />
        <UiChip :selected="chip" @click="chip = !chip">Открыто сейчас</UiChip>
      </UiCluster>
      <UiSwitch v-model="notifications">Напоминания о событиях</UiSwitch>
      <UiCheckbox v-model="agreed">Согласен с условиями</UiCheckbox>
    </UiStack>
  </MotionDemo>
</template>
