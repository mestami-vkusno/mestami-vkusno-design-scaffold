<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { LazyMotion, MotionConfig } from 'motion-v'
import { useMotion } from '@/design-system'
import { useProgressiveMount } from '@/shell/useProgressiveMount'
import ShowcaseFooter from '@/showcase/components/ShowcaseFooter.vue'
import MotionHero from '@/motion/components/MotionHero.vue'
import MotionToolbar from '@/motion/components/MotionToolbar.vue'
import MotionButtonsSection from '@/motion/sections/MotionButtonsSection.vue'
import MotionGesturesSection from '@/motion/sections/MotionGesturesSection.vue'
import MotionListsSection from '@/motion/sections/MotionListsSection.vue'
import MotionOverlaysSection from '@/motion/sections/MotionOverlaysSection.vue'
import MotionPagesSection from '@/motion/sections/MotionPagesSection.vue'
import MotionRestraintSection from '@/motion/sections/MotionRestraintSection.vue'
import MotionThemeSection from '@/motion/sections/MotionThemeSection.vue'
import MotionTokensSection from '@/motion/sections/MotionTokensSection.vue'

const SECTIONS = [MotionTokensSection, MotionButtonsSection, MotionThemeSection, MotionPagesSection, MotionOverlaysSection, MotionListsSection, MotionGesturesSection, MotionRestraintSection]
const { shown, done } = useProgressiveMount(SECTIONS.length)
const { motionConfigMode, setScale, setReducedMode } = useMotion()
const loadMotionFeatures = () => import('@/motion/features').then((module) => module.default)

// Замедление и принудительный режим нужны только на этой странице: остальные страницы не должны их наследовать.
onBeforeUnmount(() => {
  setScale(1)
  setReducedMode('auto')
})
</script>

<template>
  <div class="page">
    <MotionConfig :reduced-motion="motionConfigMode">
      <LazyMotion :features="loadMotionFeatures" strict>
        <main id="top" class="motion-page">
          <MotionHero />
          <component :is="section" v-for="(section, index) in SECTIONS.slice(0, shown)" :key="index" />
        </main>
      </LazyMotion>
    </MotionConfig>
    <ShowcaseFooter v-if="done" />
    <Teleport to="body"><MotionToolbar /></Teleport>
  </div>
</template>

<style scoped>
.motion-page {
  padding-bottom: 72px;
}
</style>
