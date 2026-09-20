<script setup lang="ts">
import ShowcaseFooter from '@/showcase/components/ShowcaseFooter.vue'
import ShowcaseHero from '@/showcase/components/ShowcaseHero.vue'
import SiteTopbar from '@/shell/SiteTopbar.vue'
import { SHOWCASE_SECTIONS } from '@/showcase/data/sections'
import BadgesSection from '@/showcase/sections/BadgesSection.vue'
import ButtonsSection from '@/showcase/sections/ButtonsSection.vue'
import CardsSection from '@/showcase/sections/CardsSection.vue'
import ColorsSection from '@/showcase/sections/ColorsSection.vue'
import FiltersSection from '@/showcase/sections/FiltersSection.vue'
import FormsSection from '@/showcase/sections/FormsSection.vue'
import IconsSection from '@/showcase/sections/IconsSection.vue'
import NavigationSection from '@/showcase/sections/NavigationSection.vue'
import ShapeSection from '@/showcase/sections/ShapeSection.vue'
import ThemesSection from '@/showcase/sections/ThemesSection.vue'
import TypographySection from '@/showcase/sections/TypographySection.vue'
</script>

<template>
  <div class="page">
  <SiteTopbar :sections="SHOWCASE_SECTIONS" />
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
  </div>
</template>
