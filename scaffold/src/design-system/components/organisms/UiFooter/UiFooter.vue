<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useMediaQuery } from '../../../composables/useMediaQuery'
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import UiIconButton from '../../atoms/UiIconButton/UiIconButton.vue'
import UiLogo from '../../atoms/UiLogo/UiLogo.vue'
import type { UiFooterProps } from './types'

const props = withDefaults(defineProps<UiFooterProps>(), { socials: () => [], homeHref: '/', collapsible: false })
defineSlots<{ /** Нижняя строка на всю ширину: права, служебные ссылки. */ bottom?(): unknown }>()

const uid = useId()
const compact = useMediaQuery('(max-width: 720px)')
/** Аккордеон включается только на узком экране: на широком заголовки — обычные заголовки, а не кнопки. */
const accordion = computed(() => props.collapsible && compact.value)
const opened = ref<readonly string[]>([])

const isOpen = (title: string): boolean => opened.value.includes(title)

function toggle(title: string): void {
  opened.value = isOpen(title) ? opened.value.filter((item) => item !== title) : [...opened.value, title]
}
</script>

<template>
  <footer class="ui-footer" :class="{ 'ui-footer--accordion': accordion }" :style="{ '--ui-footer-columns': columns.length }">
    <div class="ui-footer__about">
      <UiLogo :href="homeHref" />
      <p v-if="description" class="ui-footer__description">{{ description }}</p>
      <div v-if="socials.length" class="ui-footer__socials">
        <UiIconButton v-for="social in socials" :key="social.label" :icon="social.icon" :label="social.label" :href="social.href" size="sm" />
      </div>
    </div>
    <nav v-for="(column, index) in columns" :key="column.title" class="ui-footer__column" :class="{ 'ui-footer__column--open': isOpen(column.title) }" :aria-label="column.title">
      <h5 v-if="!accordion" class="ui-footer__title">{{ column.title }}</h5>
      <h5 v-else class="ui-footer__title ui-footer__title--toggle">
        <button class="ui-footer__toggle" type="button" :aria-expanded="isOpen(column.title)" :aria-controls="`${uid}-${index}`" @click="toggle(column.title)">
          {{ column.title }}
          <UiIcon class="ui-footer__chevron" name="chev-d" :size="18" />
        </button>
      </h5>
      <div :id="`${uid}-${index}`" class="ui-footer__links" :inert="accordion && !isOpen(column.title)">
        <div class="ui-footer__links-inner">
          <a
            v-for="link in column.links"
            :key="link.label"
            class="ui-footer__link"
            :href="link.href"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener noreferrer' : undefined"
          >
            {{ link.label }}
            <template v-if="link.external">
              <UiIcon name="external" :size="12" />
              <span class="ui-footer__sr">(откроется в новой вкладке)</span>
            </template>
          </a>
        </div>
      </div>
    </nav>
    <div v-if="$slots.bottom" class="ui-footer__bottom"><slot name="bottom" /></div>
  </footer>
</template>

<style scoped>
.ui-footer {
  display: grid;
  grid-template-columns: 1.4fr repeat(var(--ui-footer-columns, 3), 1fr);
  gap: var(--s-8);
  padding: var(--s-8) var(--s-6);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
}

.ui-footer__description {
  max-width: 260px;
  margin: var(--s-3) 0;
  color: var(--text-3);
  font-size: 13px;
}

.ui-footer__socials {
  display: flex;
  gap: 10px;
}

.ui-footer__title {
  margin: 0 0 var(--s-3);
  font-size: 15px;
  font-weight: 600;
}

.ui-footer__link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  color: var(--text-2);
  font-size: 14px;
  text-decoration: none;
}

.ui-footer__link:hover {
  color: var(--text);
}

.ui-footer__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.ui-footer__bottom {
  grid-column: 1 / -1;
}

/* Узкий экран без аккордеона: две колонки. */
@media (max-width: 720px) {
  .ui-footer {
    grid-template-columns: 1fr 1fr;
    gap: var(--s-6);
    padding: var(--s-6) var(--s-4);
  }

  .ui-footer__about {
    grid-column: 1 / -1;
  }

  .ui-footer__description {
    max-width: none;
  }
}

/* Аккордеон: один столбец, разделы разделены линиями. Высота раскрывается за 200 мс: у неё нет аналога на transform. */
.ui-footer--accordion {
  grid-template-columns: 1fr;
  gap: 0;
}

.ui-footer--accordion .ui-footer__about {
  padding-bottom: var(--s-4);
}

.ui-footer--accordion .ui-footer__column {
  border-top: 1px solid var(--border);
}

.ui-footer--accordion .ui-footer__title {
  margin: 0;
}

.ui-footer__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--text);
  font: 600 15px var(--font);
  text-align: left;
  cursor: pointer;
}

.ui-footer__chevron {
  color: var(--text-2);
  transition: transform var(--dur-dropdown) var(--ease-out);
}

.ui-footer__column--open .ui-footer__chevron {
  transform: rotate(calc(180deg * var(--motion-distance)));
}

.ui-footer--accordion .ui-footer__links {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows var(--dur-dropdown) var(--ease-out),
    opacity var(--dur-dropdown) var(--ease-out);
}

.ui-footer--accordion .ui-footer__column--open .ui-footer__links {
  grid-template-rows: 1fr;
  opacity: 1;
}

.ui-footer--accordion .ui-footer__links-inner {
  min-height: 0;
  overflow: hidden;
}

.ui-footer--accordion .ui-footer__link:last-child {
  margin-bottom: var(--s-3);
}

.ui-footer--accordion .ui-footer__bottom {
  padding-top: var(--s-4);
  border-top: 1px solid var(--border);
}

@media (pointer: coarse) {
  .ui-footer__link {
    padding: 9px 0;
  }
}
</style>
