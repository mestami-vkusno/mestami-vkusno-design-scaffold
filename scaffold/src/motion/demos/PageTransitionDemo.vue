<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiButton, UiCluster, UiSegmented, UiStack } from '@/design-system'
import type { OptionItem } from '@/design-system'
import { DEMO_SCREENS, PATTERNS } from '../data/screens'
import type { TransitionPattern } from '../data/screens'
import MotionDemo from '../components/MotionDemo.vue'
import PhoneFrame from '../components/PhoneFrame.vue'

const PATTERN_ITEMS: readonly OptionItem[] = PATTERNS.map(({ id, label }) => ({ id, label }))

const pattern = ref<TransitionPattern>('push')
const index = ref(0)
const direction = ref<'forward' | 'back'>('forward')

const info = computed(() => PATTERNS.find((item) => item.id === pattern.value) ?? PATTERNS[0]!)
const screen = computed(() => DEMO_SCREENS[index.value]!)
const transitionName = computed(() => `screen-${pattern.value}-${direction.value}`)
const mode = computed(() => (pattern.value === 'fade' ? 'out-in' : undefined))
const canBack = computed(() => index.value > 0)
const canForward = computed(() => index.value < DEMO_SCREENS.length - 1)

function go(step: 1 | -1): void {
  direction.value = step === 1 ? 'forward' : 'back'
  index.value += step
}

function setPattern(value: string): void {
  pattern.value = value as TransitionPattern
  index.value = 0
  direction.value = 'forward'
}
</script>

<template>
  <MotionDemo
    title="Переходы между экранами"
    tier="occasional"
    purpose="spatial"
    :description="info.when"
    :specs="[{ label: 'Инструмент', value: 'Vue <Transition> + CSS transition' }, ...info.specs]"
  >
    <template #note>Направление учитывается: «Назад» проигрывает переход в обратную сторону, как вход.</template>
    <UiStack :gap="4" align="center">
      <UiSegmented :model-value="pattern" :items="PATTERN_ITEMS" label="Вид перехода" @update:model-value="setPattern" />
      <PhoneFrame>
        <Transition :name="transitionName" :mode="mode">
          <div :key="`${pattern}-${screen.id}`" class="screen" :class="`screen--${index}`">
            <header class="screen__bar">{{ screen.title }}</header>
            <div class="screen__body">
              <i class="screen__image" />
              <i class="screen__line" />
              <i class="screen__line screen__line--short" />
              <i class="screen__line" />
            </div>
          </div>
        </Transition>
      </PhoneFrame>
      <UiCluster>
        <UiButton variant="neutral" size="sm" icon-left="arrow-l" :disabled="!canBack" @click="go(-1)">Назад</UiButton>
        <UiButton size="sm" icon-right="arrow-r" :disabled="!canForward" @click="go(1)">Вперёд</UiButton>
      </UiCluster>
    </UiStack>
  </MotionDemo>
</template>

<style scoped>
.screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.screen--1 {
  background: var(--surface);
}

.screen--2 {
  background: var(--surface-2);
}

.screen__bar {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-weight: 600;
}

.screen__body {
  display: grid;
  gap: 10px;
  padding: 16px;
}

.screen__image {
  height: 96px;
  border-radius: var(--r-md);
  background: linear-gradient(160deg, #2a221b, #0f0d0b 70%);
}

.screen__line {
  height: 12px;
  border-radius: var(--r-pill);
  background: var(--border-strong);
}

.screen__line--short {
  width: 60%;
}

/* Сдвиг: вперёд новый приходит справа, старый уходит влево и темнеет. Назад — наоборот. */
.screen-push-forward-enter-active,
.screen-push-forward-leave-active,
.screen-push-back-enter-active,
.screen-push-back-leave-active {
  transition:
    transform calc(350ms * var(--motion-scale)) var(--ease-drawer),
    opacity calc(350ms * var(--motion-scale)) var(--ease-drawer);
}

.screen-push-forward-enter-from,
.screen-push-back-leave-to {
  transform: translateX(calc(100% * var(--motion-distance)));
  opacity: var(--motion-distance);
}

.screen-push-forward-leave-to,
.screen-push-back-enter-from {
  transform: translateX(calc(-30% * var(--motion-distance)));
  opacity: 0;
}

.screen-push-forward-enter-active,
.screen-push-back-leave-active {
  z-index: 2;
}

/* Затухание: уходит быстро, приходит с лёгким увеличением. */
.screen-fade-forward-leave-active,
.screen-fade-back-leave-active {
  transition: opacity var(--dur-page-out) var(--ease-out);
}

.screen-fade-forward-enter-active,
.screen-fade-back-enter-active {
  transition:
    opacity var(--dur-page-in) var(--ease-out),
    transform var(--dur-page-in) var(--ease-out);
}

.screen-fade-forward-leave-to,
.screen-fade-back-leave-to {
  opacity: 0;
}

.screen-fade-forward-enter-from,
.screen-fade-back-enter-from {
  opacity: 0;
  transform: scale(calc(1 - 0.02 * var(--motion-distance)));
}

/* Шторка: новый экран поднимается снизу, основа отступает; назад — шторка уходит вниз. */
.screen-sheet-forward-enter-active,
.screen-sheet-forward-leave-active,
.screen-sheet-back-enter-active,
.screen-sheet-back-leave-active {
  transition:
    transform var(--dur-drawer) var(--ease-drawer),
    opacity var(--dur-drawer) var(--ease-drawer);
}

.screen-sheet-forward-enter-from,
.screen-sheet-back-leave-to {
  transform: translateY(calc(100% * var(--motion-distance)));
  opacity: var(--motion-distance);
}

.screen-sheet-forward-leave-to,
.screen-sheet-back-enter-from {
  transform: scale(calc(1 - 0.06 * var(--motion-distance)));
  opacity: 0.6;
}

.screen-sheet-forward-enter-active,
.screen-sheet-back-leave-active {
  z-index: 2;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.35);
}
</style>
