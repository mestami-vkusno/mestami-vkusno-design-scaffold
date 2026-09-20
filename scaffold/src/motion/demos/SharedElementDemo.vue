<script setup lang="ts">
import { computed, ref } from 'vue'
import { LayoutGroup, Motion } from 'motion-v'
import { UiButton, useMotion } from '@/design-system'
import type { ImageTone } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'
import PhoneFrame from '../components/PhoneFrame.vue'

interface Place {
  id: string
  title: string
  tone: ImageTone
  gradient: string
}

const PLACES: readonly Place[] = [
  { id: 'a', title: 'Первое место', tone: 'ember', gradient: 'linear-gradient(160deg, #6b4a2b, #1a120b 75%)' },
  { id: 'b', title: 'Второе место', tone: 'dusk', gradient: 'linear-gradient(200deg, #2c3a5c, #0b0d12 75%)' },
  { id: 'c', title: 'Третье место', tone: 'rust', gradient: 'linear-gradient(170deg, #5c2f2a, #0d0909 75%)' },
]

const openId = ref<string | null>(null)
const { duration } = useMotion()
const opened = computed(() => PLACES.find((place) => place.id === openId.value))
const transition = computed(() => ({ type: 'spring' as const, duration: duration(0.45), bounce: 0.1 }))
</script>

<template>
  <MotionDemo
    title="Общий элемент"
    tier="occasional"
    purpose="spatial"
    description="Картинка карточки разворачивается в шапку страницы, а не исчезает и появляется заново. Так видно, что это тот же объект."
    :specs="[
      { label: 'Инструмент', value: 'Motion: layoutId' },
      { label: 'Свойства', value: 'layout (transform), border-radius' },
      { label: 'Пружина', value: 'duration 0.45, bounce 0.1' },
    ]"
  >
    <template #note>Прервите переход на середине — пружина сохраняет скорость, разворот не дёргается.</template>
    <LayoutGroup>
      <PhoneFrame>
        <div v-if="!opened" class="shared__list">
          <Motion
            v-for="place in PLACES"
            :key="place.id"
            as="button"
            type="button"
            class="shared__card"
            :layout-id="`shared-${place.id}`"
            :style="{ background: place.gradient, borderRadius: '14px' }"
            :transition="transition"
            @click="openId = place.id"
          >
            <span class="shared__caption">{{ place.title }}</span>
          </Motion>
        </div>
        <div v-else class="shared__detail">
          <Motion
            :key="opened.id"
            class="shared__hero"
            :layout-id="`shared-${opened.id}`"
            :style="{ background: opened.gradient, borderRadius: '0px' }"
            :transition="transition"
          />
          <Motion class="shared__text" :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ duration: duration(0.2), delay: duration(0.15) }">
            <b>{{ opened.title }}</b>
            <i class="shared__line" />
            <i class="shared__line shared__line--short" />
            <UiButton size="sm" variant="neutral" icon-left="arrow-l" @click="openId = null">К списку</UiButton>
          </Motion>
        </div>
      </PhoneFrame>
    </LayoutGroup>
  </MotionDemo>
</template>

<style scoped>
.shared__list {
  display: grid;
  gap: 10px;
  padding: 14px;
}

.shared__card {
  position: relative;
  height: 84px;
  padding: 0;
  border: 0;
  cursor: pointer;
  text-align: left;
}

.shared__caption {
  position: absolute;
  left: 12px;
  bottom: 10px;
  color: #fff;
  font: 600 14px var(--font);
}

.shared__hero {
  height: 150px;
}

.shared__text {
  display: grid;
  gap: 10px;
  justify-items: start;
  padding: 16px;
}

.shared__line {
  width: 100%;
  height: 12px;
  border-radius: var(--r-pill);
  background: var(--border-strong);
}

.shared__line--short {
  width: 60%;
}
</style>
