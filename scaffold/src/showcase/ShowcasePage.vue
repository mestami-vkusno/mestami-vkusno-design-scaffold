<script setup lang="ts">
import ShowcaseFooter from './components/ShowcaseFooter.vue'
import ShowcaseHero from './components/ShowcaseHero.vue'
import ShowcaseTopbar from './components/ShowcaseTopbar.vue'
import BadgesSection from './sections/BadgesSection.vue'
import ButtonsSection from './sections/ButtonsSection.vue'
import CardsSection from './sections/CardsSection.vue'
import ColorsSection from './sections/ColorsSection.vue'
import FiltersSection from './sections/FiltersSection.vue'
import FormsSection from './sections/FormsSection.vue'
import IconsSection from './sections/IconsSection.vue'
import NavigationSection from './sections/NavigationSection.vue'
import ShapeSection from './sections/ShapeSection.vue'
import ThemesSection from './sections/ThemesSection.vue'
import TypographySection from './sections/TypographySection.vue'
</script>

<template>
  <ShowcaseTopbar />
  <main id="top">
    <ShowcaseHero />
    <ColorsSection />
    <ThemesSection />
    <TypographySection />
    <ShapeSection />
    <ButtonsSection />
    <FormsSection />
    <FiltersSection />
    <BadgesSection />
    <CardsSection />
    <NavigationSection />
    <IconsSection />
  </main>
  <ShowcaseFooter />
</template>
