<script setup lang="ts">
import { UiButton, UiCluster, UiText, useMotion } from '@/design-system'
import { useAnimatedDialog } from '../composables/useAnimatedDialog'
import MotionDemo from '../components/MotionDemo.vue'

const { duration } = useMotion()
const { state, open, close, onBackdropClick } = useAnimatedDialog('dialog', () => duration(0.25) * 1000)
</script>

<template>
  <MotionDemo
    title="Модальное окно"
    tier="occasional"
    purpose="state"
    description="Окно не привязано к кнопке, поэтому растёт из центра, а не из точки нажатия. Фон затемняется вместе с ним: это одна поверхность."
    :specs="[
      { label: 'Инструмент', value: 'нативный <dialog> + CSS transition' },
      { label: 'Свойства', value: 'opacity, transform: scale(0.96 → 1)' },
      { label: 'Кривая', value: 'var(--ease-out)' },
      { label: 'Длительность', value: '250 мс (--dur-modal), выход тем же путём' },
    ]"
  >
    <template #note>Фокус, Escape и клик по фону дают браузер и <code>showModal()</code>. Для продукта окна лучше взять из безголовой библиотеки; здесь это демонстрация движения.</template>
    <UiButton @click="open">Открыть окно</UiButton>
    <dialog ref="dialog" class="modal" :data-state="state" aria-labelledby="modal-demo-title" @cancel.prevent="close" @click="onBackdropClick">
      <div class="modal__card">
        <h4 id="modal-demo-title" class="modal__title">Отменить запись?</h4>
        <UiText>Столик освободится, и его сможет занять кто-то другой.</UiText>
        <UiCluster justify="end">
          <UiButton variant="neutral" @click="close">Оставить</UiButton>
          <UiButton @click="close">Отменить запись</UiButton>
        </UiCluster>
      </div>
    </dialog>
  </MotionDemo>
</template>

<style scoped>
.modal {
  width: min(360px, calc(100vw - 32px));
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  overflow: visible;
  transform-origin: center;
  transition:
    opacity var(--dur-modal) var(--ease-out),
    transform var(--dur-modal) var(--ease-out);
}

.modal[data-state='closed'] {
  opacity: 0;
  transform: scale(calc(1 - 0.04 * var(--motion-distance)));
}

.modal::backdrop {
  background: rgba(0, 0, 0, 0.6);
  transition: opacity var(--dur-modal) var(--ease-out);
}

.modal[data-state='closed']::backdrop {
  opacity: 0;
}

.modal__card {
  display: grid;
  gap: var(--s-4);
  padding: var(--s-6);
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-lg);
}

.modal__title {
  margin: 0;
  font-size: 20px;
}
</style>
