<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import { UiButton, UiIcon, useMotion } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

type Status = 'idle' | 'loading' | 'success'

const LABEL: Record<Status, string> = { idle: 'Сохранить', loading: 'Сохраняем', success: 'Сохранено' }

const status = ref<Status>('idle')
const { duration } = useMotion()
let timer: ReturnType<typeof setTimeout> | undefined

function press(): void {
  if (status.value !== 'idle') return
  status.value = 'loading'
  timer = setTimeout(() => {
    status.value = 'success'
    timer = setTimeout(() => {
      status.value = 'idle'
    }, 1800)
  }, 1400)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <MotionDemo
    title="Смена состояния кнопки"
    tier="occasional"
    purpose="state"
    description="Сохранить → загрузка → готово. Содержимое кнопки сменяется целиком: прозрачность, лёгкий масштаб и размытие склеивают два состояния в одно."
    :specs="[
      { label: 'Инструмент', value: 'Motion: AnimatePresence + Motion' },
      { label: 'Свойства', value: 'opacity, transform: scale, filter: blur(4px)' },
      { label: 'Пружина', value: 'duration 0.3, bounce 0' },
    ]"
  >
    <template #note>Ширина кнопки фиксирована, поэтому она не прыгает при смене подписи. Во время загрузки повторные нажатия игнорируются.</template>
    <div class="status">
      <UiButton class="status__button" :aria-busy="status === 'loading'" @click="press">
        <AnimatePresence mode="popLayout" :initial="false">
          <Motion
            :key="status"
            as="span"
            class="status__content"
            :initial="{ opacity: 0, transform: 'scale(0.25)', filter: 'blur(4px)' }"
            :animate="{ opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' }"
            :exit="{ opacity: 0, transform: 'scale(0.25)', filter: 'blur(4px)' }"
            :transition="{ type: 'spring', duration: duration(0.3), bounce: 0 }"
          >
            <UiIcon v-if="status === 'loading'" name="refresh" class="status__spinner" />
            <UiIcon v-else-if="status === 'success'" name="check" />
            <UiIcon v-else name="bookmark" />
            {{ LABEL[status] }}
          </Motion>
        </AnimatePresence>
      </UiButton>
      <span class="status__live" role="status">{{ LABEL[status] }}</span>
    </div>
  </MotionDemo>
</template>

<style scoped>
.status {
  display: grid;
  place-items: center;
}

.status__button {
  position: relative;
  min-width: 180px;
}

.status__content {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
}

.status__spinner {
  animation: status-spin 0.8s linear infinite;
}

.status__live {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@keyframes status-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
