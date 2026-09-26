<script setup lang="ts">
import { computed } from 'vue'
import { UiButton, UiEmptyState, UiSurface, UiText } from '@/design-system'
import { PhotoAvatar } from '@/features'
import { getAuthor } from '@/mocks/selectors/social'
import { useLibrary } from '@/state/useLibrary'
import MeList from '@/pages/me/components/MeList.vue'
import SettingsSubScreen from './components/SettingsSubScreen.vue'

/* ST1 · Заблокированные (§12.4, `/settings/blocked`): «Разблокировать» возвращает автора, но подписка не восстанавливается — так и сказано в подсказке. */
const library = useLibrary()
const authors = computed(() => library.blockedAuthorIds.value.flatMap((id) => getAuthor(id) ?? []))
</script>

<template>
  <SettingsSubScreen title="Заблокированные" hash="privacy">
    <UiText variant="caption" class="blocked__hint">Заблокированный автор не видит ваши действия, его публикации и комментарии скрыты. После разблокировки подписка не восстановится.</UiText>
    <UiEmptyState v-if="authors.length === 0" title="Заблокированных нет" description="Заблокировать автора можно в меню публикации (⋯)." />
    <MeList v-else>
      <li v-for="author in authors" :key="author.id">
        <UiSurface variant="panel" class="blocked__row">
          <PhotoAvatar :photo="author.avatar" :name="author.displayName" size="md" decorative />
          <span class="blocked__name">{{ author.displayName }}<UiText variant="caption" class="blocked__username">@{{ author.username }}</UiText></span>
          <UiButton size="sm" variant="outline" @click="library.unblockAuthor(author.id)">Разблокировать</UiButton>
        </UiSurface>
      </li>
    </MeList>
  </SettingsSubScreen>
</template>

<style scoped>
.blocked__hint {
  color: var(--text-3);
}

.blocked__row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3);
}

.blocked__name {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow-wrap: anywhere;
  font-weight: 600;
}

.blocked__username {
  color: var(--text-3);
  font-weight: 400;
}
</style>
