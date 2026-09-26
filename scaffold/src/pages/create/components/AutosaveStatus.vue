<script setup lang="ts">
import { computed } from 'vue'
import { UiIcon } from '@/design-system'

/*
  Строка автосохранения под заголовком редактора (§13.2, §26.2): «Сохранено», «Сохраняем…», «Нет сети. Сохранено на устройстве».
  `role="status"` озвучивает итог вежливо, без перебивания набора.
*/
export type AutosaveState = 'idle' | 'saving' | 'saved' | 'offline'

const props = defineProps<{ state: AutosaveState; restored?: boolean }>()

const view = computed(() => {
  switch (props.state) {
    case 'saving':
      return { icon: 'refresh' as const, text: 'Сохраняем…' }
    case 'saved':
      return { icon: 'check' as const, text: props.restored ? 'Сохранено · восстановлено из черновика' : 'Сохранено' }
    case 'offline':
      return { icon: 'wifi-off' as const, text: 'Нет сети. Сохранено на устройстве' }
    default:
      return { icon: 'check' as const, text: props.restored ? 'Восстановлено из черновика' : 'Черновик сохраняется сам' }
  }
})
</script>

<template>
  <p class="autosave" :class="`autosave--${state}`" role="status">
    <UiIcon :name="view.icon" :size="14" />{{ view.text }}
  </p>
</template>

<style scoped>
.autosave {
  display: flex;
  align-items: center;
  gap: var(--s-1);
  margin: 0;
  color: var(--text-3);
  font-size: 13px;
}

.autosave--saved {
  color: var(--success);
}

.autosave--offline {
  color: var(--warning);
}
</style>
