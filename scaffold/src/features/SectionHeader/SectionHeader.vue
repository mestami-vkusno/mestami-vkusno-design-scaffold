<script setup lang="ts">
import { UiLink } from '@/design-system'
import { FEATURE_LABELS } from '../labels'
import '../shared/base.css'
import type { SectionHeaderProps } from './types'

withDefaults(defineProps<SectionHeaderProps>(), { headingLevel: 2, size: 'md', linkLabel: FEATURE_LABELS.viewAll })
defineSlots<{
  /** Действия справа вместо ссылки «Смотреть все». */
  actions?(): unknown
}>()
</script>

<template>
  <header class="section-header">
    <div class="section-header__text">
      <component :is="`h${headingLevel}`" :id="id" class="section-header__title" :class="`section-header__title--${size}`">
        {{ title }}
        <span v-if="count" class="section-header__count">{{ count }}</span>
      </component>
      <p v-if="description" class="section-header__description">{{ description }}</p>
    </div>
    <slot name="actions">
      <UiLink v-if="href" :href="href" icon-right="arrow-r" class="section-header__link">
        {{ linkLabel }}<span class="fx-sr-only">: {{ title }}</span>
      </UiLink>
    </slot>
  </header>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--s-3) var(--s-4);
  margin-bottom: var(--s-4);
}

.section-header__text {
  min-width: 0;
}

.section-header__title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--s-1) var(--s-3);
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.section-header__title--md {
  font-size: 20px;
  line-height: 1.25;
}

.section-header__title--lg {
  font-size: 28px;
  line-height: 1.15;
}

.section-header__count {
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
  color: var(--text-3);
}

.section-header__description {
  margin: var(--s-1) 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-3);
}

/* Цель нажатия ≥ 44 px на тач-экране: ссылка вытянута по высоте, а не по тексту. */
.section-header__link {
  display: inline-flex;
  align-items: center;
  flex: none;
  gap: var(--s-1);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

@media (pointer: coarse) {
  .section-header__link {
    min-height: 44px;
  }
}

@media (max-width: 720px) {
  .section-header__title--lg {
    font-size: 24px;
  }
}
</style>
