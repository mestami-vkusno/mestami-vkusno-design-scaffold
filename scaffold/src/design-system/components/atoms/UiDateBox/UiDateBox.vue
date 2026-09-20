<script setup lang="ts">
import type { UiDateBoxProps } from './types'

defineProps<UiDateBoxProps>()
</script>

<template>
  <div class="ui-date-box">
    <b class="ui-date-box__day">{{ day }}</b>
    <span class="ui-date-box__month">{{ month }}</span>
  </div>
</template>

<style scoped>
.ui-date-box {
  width: 44px;
  padding: 4px 0;
  text-align: center;
  line-height: 1.05;
  border-radius: var(--r-sm);
  background: var(--lime);
  color: var(--on-accent);
}

.ui-date-box__day {
  display: block;
  font-size: 17px;
  font-weight: 800;
}

.ui-date-box__month {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}
</style>
