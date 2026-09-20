<script setup lang="ts">
import { computed } from 'vue'
import UiIcon from '../UiIcon/UiIcon.vue'
import type { UiRatingProps } from './types'

const props = withDefaults(defineProps<UiRatingProps>(), { variant: 'summary' })

const label = computed(() => `Оценка ${props.value} из 5`)
const filledStars = computed(() => Math.round(props.value))
</script>

<template>
  <span class="ui-rating" role="img" :aria-label="label">
    <template v-if="variant === 'stars'">
      <UiIcon v-for="n in 5" :key="n" name="star" :size="14" :filled="n <= filledStars" class="ui-rating__star" />
    </template>
    <template v-else>
      <UiIcon name="star" :size="14" filled class="ui-rating__star" />
      {{ value }}
      <span v-if="count !== undefined" class="ui-rating__count">({{ count }})</span>
    </template>
  </span>
</template>

<style scoped>
.ui-rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.ui-rating__star {
  color: var(--star);
}

.ui-rating__count {
  color: var(--text-3);
}
</style>
