<script setup lang="ts">
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import type { UiSearchInputProps } from './types'

withDefaults(defineProps<UiSearchInputProps>(), { buttonIcon: 'search', buttonLabel: 'Искать' })

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ submit: [query: string] }>()
</script>

<template>
  <form class="ui-search-input" role="search" @submit.prevent="emit('submit', model)">
    <input v-model="model" class="ui-search-input__field" type="search" :placeholder="placeholder" :aria-label="label" />
    <button class="ui-search-input__button" type="submit" :aria-label="buttonLabel">
      <UiIcon :name="buttonIcon" />
    </button>
  </form>
</template>

<style scoped>
.ui-search-input {
  display: flex;
  height: 48px;
  border-radius: var(--r-sm);
  overflow: hidden;
  background: var(--search-bg);
  border: 1px solid var(--search-border);
}

.ui-search-input__field {
  flex: 1;
  min-width: 0;
  padding: 0 16px;
  border: 0;
  background: transparent;
  font: 400 15px var(--font);
  color: var(--search-text);
}

.ui-search-input__field::placeholder {
  color: var(--search-ph);
}

.ui-search-input__field:focus {
  outline: none;
}

.ui-search-input:focus-within {
  box-shadow: 0 0 0 3px var(--lime-soft);
}

.ui-search-input__button {
  display: grid;
  place-items: center;
  width: 52px;
  border: 0;
  background: var(--lime);
  color: var(--on-accent);
  cursor: pointer;
}

.ui-search-input__button:hover {
  background: var(--lime-hover);
}
</style>
