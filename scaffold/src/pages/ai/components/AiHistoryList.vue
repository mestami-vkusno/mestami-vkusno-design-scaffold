<script setup lang="ts">
import { UiListRow, UiSurface } from '@/design-system'
import { formatAgo } from '@/mocks/format'
import type { AiConversation } from '@/mocks/types'

/* История диалогов (§23.2). Читается всегда: после окончания Премиум старые диалоги остаются доступны (§23.8). */
defineProps<{ conversations: readonly AiConversation[] }>()
</script>

<template>
  <UiSurface variant="card" as="ul" class="ai-history">
    <li v-for="conversation in conversations" :key="conversation.id">
      <UiListRow :title="conversation.title" :description="formatAgo(conversation.updatedAt)" icon="comment" :href="`/ai/chat/${conversation.id}`" divider />
    </li>
  </UiSurface>
</template>

<style scoped>
.ai-history {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
