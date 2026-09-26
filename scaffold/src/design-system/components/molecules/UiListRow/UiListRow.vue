<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import UiSwitch from '../../atoms/UiSwitch/UiSwitch.vue'
import type { UiListRowProps } from './types'

const props = withDefaults(defineProps<UiListRowProps>(), { clickable: undefined, chevron: undefined })
const slots = defineSlots<{
  /** Слева вместо иконки: миниатюра, аватар. */
  leading?(): unknown
  /** Справа вместо значения и шеврона: бейдж, кнопка. */
  trailing?(): unknown
}>()

/** Переключатель справа: `v-model:toggle` включает режим «строка-настройка», нажимается вся строка. */
const toggle = defineModel<boolean | undefined>('toggle', { default: undefined })
const attrs = useAttrs()

const isToggle = computed(() => toggle.value !== undefined)
// Слушатель @click лежит в attrs, а они не реактивны: тег считаем при каждой отрисовке, а не кэшируем.
const tag = (): 'a' | 'button' | 'div' => {
  if (isToggle.value) return 'div'
  if (props.href) return 'a'
  return (props.clickable ?? Boolean(attrs.onClick)) ? 'button' : 'div'
}
const showChevron = (): boolean => props.chevron ?? (tag() !== 'div' && !props.selected && !slots.trailing)
</script>

<template>
  <component
    :is="tag()"
    class="ui-list-row"
    :class="{ 'ui-list-row--interactive': tag() !== 'div', 'ui-list-row--toggle': isToggle, 'ui-list-row--danger': danger, 'ui-list-row--divider': divider, 'ui-list-row--disabled': disabled }"
    :href="tag() === 'a' && !disabled ? href : undefined"
    :type="tag() === 'button' ? 'button' : undefined"
    :disabled="tag() === 'button' ? disabled : undefined"
    :aria-disabled="tag() === 'a' && disabled ? true : undefined"
    :aria-current="selected ? 'true' : undefined"
    :data-preview="previewState"
  >
    <span v-if="icon || $slots.leading" class="ui-list-row__leading">
      <slot name="leading"><UiIcon v-if="icon" :name="icon" :size="22" /></slot>
    </span>
    <span class="ui-list-row__text">
      <span class="ui-list-row__title">{{ title }}</span>
      <span v-if="description" class="ui-list-row__description">{{ description }}</span>
    </span>
    <span v-if="value || $slots.trailing || isToggle || selected || showChevron()" class="ui-list-row__trailing">
      <span v-if="value" class="ui-list-row__value">{{ value }}</span>
      <slot name="trailing" />
      <UiSwitch v-if="isToggle" v-model="toggle" :disabled="disabled"><span class="ui-list-row__sr">{{ title }}</span></UiSwitch>
      <UiIcon v-if="selected" name="check" :size="20" class="ui-list-row__check" />
      <UiIcon v-if="showChevron()" name="chev-r" :size="18" class="ui-list-row__chevron" />
    </span>
  </component>
</template>

<style scoped>
.ui-list-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--s-3);
  width: 100%;
  min-height: 48px;
  padding: var(--s-2) var(--s-3);
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--text);
  font: inherit;
  text-align: start;
  text-decoration: none;
  transition: background var(--dur-hover) ease;
}

.ui-list-row--divider {
  border-bottom: 1px solid var(--border);
  border-radius: 0;
}

.ui-list-row--interactive {
  cursor: pointer;
}

.ui-list-row--interactive:active,
.ui-list-row[data-preview='pressed'] {
  background: var(--surface-2);
}

/* --text-3 на нажатой подложке в светлой теме даёт 4.4:1: описание в этот момент темнее. */
.ui-list-row--interactive:active .ui-list-row__description,
.ui-list-row[data-preview='pressed'] .ui-list-row__description {
  color: var(--text-2);
}

.ui-list-row[data-preview='hover'] {
  background: var(--surface);
}

.ui-list-row:focus-visible,
.ui-list-row[data-preview='focus'] {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--accent-fg);
  border-radius: var(--r-md);
}

.ui-list-row--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.ui-list-row__leading {
  display: grid;
  flex: none;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--r-md);
  background: var(--surface-2);
  color: var(--accent-fg);
  overflow: hidden;
}

.ui-list-row__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ui-list-row__title {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.ui-list-row--danger .ui-list-row__title {
  color: var(--danger);
}

.ui-list-row__description {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-3);
}

.ui-list-row__trailing {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--s-2);
  color: var(--text-3);
}

.ui-list-row__value {
  font-size: 14px;
  color: var(--text-2);
  white-space: nowrap;
}

.ui-list-row__check {
  color: var(--accent-fg);
}

/* Строка-настройка: невидимая подпись переключателя растягивается на всю строку, поэтому нажимается любая её часть. */
.ui-list-row--toggle :deep(.ui-switch)::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  cursor: pointer;
}

.ui-list-row--toggle:has(:focus-visible) {
  box-shadow: inset 0 0 0 2px var(--accent-fg);
}

.ui-list-row--toggle :deep(.ui-switch__input:focus-visible) {
  box-shadow: none;
}

.ui-list-row__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (pointer: coarse) {
  .ui-list-row {
    min-height: 56px;
  }
}

/* Наведение только там,
где есть настоящий указатель: на тач-экранах :hover срабатывает ложно. */
@media (hover: hover) and (pointer: fine) {
  .ui-list-row--interactive:hover {
    background: var(--surface);
  }

  .ui-list-row--interactive:active {
    background: var(--surface-2);
  }
}
</style>
