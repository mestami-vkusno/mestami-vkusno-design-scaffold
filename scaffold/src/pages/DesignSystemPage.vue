<script setup lang="ts">
import { UiToast } from '@/design-system'
import { useProgressiveMount } from '@/shell/useProgressiveMount'
import ShowcaseFooter from '@/showcase/components/ShowcaseFooter.vue'
import ShowcaseHero from '@/showcase/components/ShowcaseHero.vue'
import BadgesSection from '@/showcase/sections/BadgesSection.vue'
import ButtonsSection from '@/showcase/sections/ButtonsSection.vue'
import CardsSection from '@/showcase/sections/CardsSection.vue'
import ColorsSection from '@/showcase/sections/ColorsSection.vue'
import FeedbackSection from '@/showcase/sections/FeedbackSection.vue'
import FiltersSection from '@/showcase/sections/FiltersSection.vue'
import FormsSection from '@/showcase/sections/FormsSection.vue'
import IconsSection from '@/showcase/sections/IconsSection.vue'
import InputsSection from '@/showcase/sections/InputsSection.vue'
import ListsSection from '@/showcase/sections/ListsSection.vue'
import NavigationSection from '@/showcase/sections/NavigationSection.vue'
import ShapeSection from '@/showcase/sections/ShapeSection.vue'
import ThemesSection from '@/showcase/sections/ThemesSection.vue'
import TypographySection from '@/showcase/sections/TypographySection.vue'

const SECTIONS = [ColorsSection, ThemesSection, TypographySection, ShapeSection, ButtonsSection, FormsSection, InputsSection, FiltersSection, BadgesSection, CardsSection, ListsSection, FeedbackSection, NavigationSection, IconsSection]
const { shown, done } = useProgressiveMount(SECTIONS.length)
</script>

<template>
  <div class="page">
    <main id="top">
      <ShowcaseHero />
      <component :is="section" v-for="(section, index) in SECTIONS.slice(0, shown)" :key="index" />
    </main>
    <ShowcaseFooter v-if="done" />
    <UiToast />
  </div>
</template>
