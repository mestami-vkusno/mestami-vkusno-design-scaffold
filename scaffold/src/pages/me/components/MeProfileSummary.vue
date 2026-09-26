<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiButton, UiSurface, UiText } from '@/design-system'
import { formatDate, formatFollowers, pluralRu } from '@/mocks/format'
import { getAuthor } from '@/mocks/selectors/social'
import { PhotoAvatar } from '@/features'
import { openProfileEdit } from '@/overlays/useOverlays'
import { useViewer } from '@/shell/composables/useViewer'

/*
  Режим «Профиль» страницы P1 (§4.6): «авторский профиль и свой контент». Публикации, вкладки
  «Обзоры / Фото / Подборки» и подписчики — это уже сам авторский профиль U1 (`/u/:username`, задача 0010);
  здесь — только сводка своих данных и переход туда, без дублирования его содержимого.
*/

const { userId } = useViewer()
const author = computed(() => (userId.value ? getAuthor(userId.value) : undefined))

const followers = computed(() => {
  if (!author.value) return ''
  const count = author.value.followersCount
  const [one, few, many] = ['подписчик', 'подписчика', 'подписчиков']
  return `${formatFollowers(count)} ${count >= 1000 ? many : pluralRu(count, one, few, many)}`
})

</script>

<template>
  <UiSurface v-if="author" variant="panel" class="me-profile">
    <div class="me-profile__head">
      <PhotoAvatar :photo="author.avatar" :name="author.displayName" size="xl" decorative />
      <div class="me-profile__id">
        <UiText variant="h2" class="me-profile__name">{{ author.displayName }}</UiText>
        <p class="me-profile__username">@{{ author.username }}</p>
        <UiBadge :variant="author.profileVisibility === 'public' ? 'neutral' : 'warning'" pill :icon="author.profileVisibility === 'public' ? 'eye' : 'lock'">
          {{ author.profileVisibility === 'public' ? 'Публичный профиль' : 'Закрытый профиль' }}
        </UiBadge>
      </div>
    </div>

    <UiText v-if="author.about" variant="body" class="me-profile__about">{{ author.about }}</UiText>

    <p class="me-profile__meta">{{ followers }} · на сервисе с {{ formatDate(author.joinedAt) }}</p>

    <div class="me-profile__actions">
      <UiButton variant="primary" :href="`/u/${author.username}`">Открыть публичный профиль</UiButton>
      <UiButton variant="outline" icon-left="edit" @click="openProfileEdit()">Изменить профиль</UiButton>
    </div>
  </UiSurface>
</template>

<style scoped>
.me-profile {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-6);
}

.me-profile__head {
  display: flex;
  align-items: center;
  gap: var(--s-4);
}

.me-profile__id {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-1);
  min-width: 0;
}

.me-profile__name {
  overflow-wrap: anywhere;
}

.me-profile__username {
  margin: 0;
  color: var(--text-3);
  font-size: 14px;
}

.me-profile__about {
  color: var(--text-2);
}

.me-profile__meta {
  margin: 0;
  color: var(--text-3);
  font-size: 13px;
}

.me-profile__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}
</style>
