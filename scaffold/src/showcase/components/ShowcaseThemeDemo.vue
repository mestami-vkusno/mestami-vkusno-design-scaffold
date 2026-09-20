<script setup lang="ts">
import { UiBadge, UiButton, UiChip, UiCluster, UiField, UiInput, UiLink, UiMediaCard, UiRating, UiStack, UiText, UiThemeScope } from '@/design-system'
import type { ThemeName } from '@/design-system'

defineProps<{ theme: ThemeName; title: string }>()
</script>

<!-- Одинаковый набор компонентов в обеих темах: отличаются только значения токенов. -->
<template>
  <UiThemeScope :theme="theme" class="showcase-theme-demo">
    <UiStack :gap="4" align="start">
      <UiText variant="overline">{{ title }}</UiText>
      <UiCluster>
        <UiButton>Главное действие</UiButton>
        <UiButton variant="outline">Контурная</UiButton>
        <UiButton variant="neutral">Нейтральная</UiButton>
      </UiCluster>
      <UiField label="Поле" class="showcase-theme-demo__field">
        <template #default="{ id }"><UiInput :id="id" placeholder="Подсказка в поле" /></template>
      </UiField>
      <UiCluster>
        <UiChip selected>Все</UiChip>
        <UiChip>Вариант</UiChip>
        <UiBadge variant="new">Новое</UiBadge>
        <UiBadge>Метка</UiBadge>
        <UiBadge variant="success">Успех</UiBadge>
        <UiBadge variant="warning">Внимание</UiBadge>
      </UiCluster>
      <UiMediaCard class="showcase-theme-demo__card" title="Заголовок карточки" subtitle="Категория · Район">
        <UiRating :value="4.7" :count="1287" />
      </UiMediaCard>
      <p class="showcase-theme-demo__links">
        <UiLink href="#themes">Ссылка</UiLink>{{ ' ' }}
        <UiText as="span">и вторичный текст</UiText>
      </p>
    </UiStack>
  </UiThemeScope>
</template>

<style scoped>
.showcase-theme-demo {
  padding: var(--s-6);
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-lg);
}

.showcase-theme-demo__field,
.showcase-theme-demo__card {
  align-self: stretch;
}

.showcase-theme-demo__card {
  max-width: 280px;
}

.showcase-theme-demo__links {
  margin: 0;
}

@media (max-width: 720px) {
  .showcase-theme-demo {
    padding: var(--s-4);
  }
}
</style>
