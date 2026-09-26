<script setup lang="ts">
import { UiBadge, UiStack, UiSurface, UiText } from '@/design-system'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { useRoute } from 'vue-router'

defineSlots<{ /** Дополнительное содержимое под подсказкой. */ default?(): unknown }>()

// Снимок при создании: уходящая страница не должна перерисовываться под адрес следующей (страницы создаются заново на каждый адрес).
const { meta, params, path } = useRoute()
const title = meta.title ?? 'Страница'
const hint = meta.hint ?? 'Здесь будет содержимое страницы.'
const pageId = meta.pageId
const paramList = Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
</script>

<template>
  <main class="page-placeholder">
    <ShellContainer>
      <UiStack :gap="4" align="start">
        <UiBadge variant="warning">Заглушка{{ pageId ? ` · ${pageId}` : '' }}</UiBadge>
        <UiText variant="h1" class="page-placeholder__title">{{ title }}</UiText>
        <UiText variant="body-lg">{{ hint }}</UiText>
        <UiSurface variant="panel" class="page-placeholder__route">
          <UiText variant="caption">Адрес</UiText>
          <code>{{ path }}</code>
          <template v-if="paramList.length">
            <UiText variant="caption">Параметры</UiText>
            <code v-for="[key, value] in paramList" :key="key">{{ key }} = {{ value }}</code>
          </template>
        </UiSurface>
        <slot />
      </UiStack>
    </ShellContainer>
  </main>
</template>

<style scoped>
.page-placeholder {
  padding-block: var(--s-8) var(--s-12);
}

.page-placeholder__title {
  overflow-wrap: anywhere;
}

.page-placeholder__route {
  display: grid;
  gap: var(--s-1);
  min-width: min(100%, 280px);
  overflow-wrap: anywhere;
}
</style>
