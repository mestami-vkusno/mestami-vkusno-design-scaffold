<script setup lang="ts">
import { UiFooter, UiThemeSwitch, useTheme, type FooterColumn, type FooterLink } from '@/design-system'
import ShellContainer from './ShellContainer.vue'

defineProps<{
  columns: readonly FooterColumn[]
  description: string
  copyright: string
  /** Служебные ссылки: витрина дизайн-системы и анимации. */
  serviceLinks: readonly FooterLink[]
  /** Подвал гаснет вместе со страницей при переходе. */
  fading?: boolean
}>()

const { theme, setTheme } = useTheme()
</script>

<template>
  <div class="product-footer" :class="{ 'product-footer--fading': fading }">
    <ShellContainer>
      <UiFooter collapsible :columns="columns" :description="description">
        <template #bottom>
          <div class="product-footer__bottom">
            <p class="product-footer__copyright">{{ copyright }}</p>
            <nav class="product-footer__service" aria-label="Служебные страницы">
              <span class="product-footer__service-title">Служебное</span>
              <a v-for="link in serviceLinks" :key="link.href" class="product-footer__service-link" :href="link.href">{{ link.label }}</a>
            </nav>
            <UiThemeSwitch :model-value="theme" @update:model-value="setTheme" />
          </div>
        </template>
      </UiFooter>
    </ShellContainer>
  </div>
</template>

<style scoped>
/* Подвал далеко внизу: не считаем его, пока не доскроллили. Высота-заглушка не даёт странице прыгать. */
.product-footer {
  content-visibility: auto;
  contain-intrinsic-size: auto 520px;
  transition: opacity var(--dur-page-in) var(--ease-out);
}

.product-footer--fading {
  opacity: 0;
  transition-duration: var(--dur-page-out);
}

/* Во всю ширину страницы: карточка с рамкой из дизайн-системы превращается в полосу. */
.product-footer :deep(.ui-footer) {
  padding-inline: 0;
  border-width: 1px 0 0;
  border-radius: 0;
}

.product-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3) var(--s-6);
  padding-top: var(--s-4);
}

.product-footer__copyright {
  margin: 0;
  color: var(--text-3);
  font-size: 13px;
}

.product-footer__service {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 var(--s-4);
  margin-left: auto;
}

.product-footer__service-title {
  color: var(--text-3);
  font-size: 13px;
}

.product-footer__service-link {
  padding: 8px 0;
  color: var(--text-2);
  font-size: 13px;
  text-decoration: none;
}

@media (hover: hover) and (pointer: fine) {
  .product-footer__service-link:hover {
    color: var(--text);
    text-decoration: underline;
  }
}

@media (max-width: 720px) {
  .product-footer__service {
    flex: 1 0 100%;
    margin-left: 0;
  }
}
</style>
