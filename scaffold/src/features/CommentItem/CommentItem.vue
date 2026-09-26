<script setup lang="ts">
import { computed } from 'vue'
import { UiButton, UiIconButton } from '@/design-system'
import { formatAgo } from '@/mocks/format'
import { FEATURE_LABELS } from '../labels'
import PhotoAvatar from '../PhotoAvatar/PhotoAvatar.vue'
import type { CommentItemProps } from './types'

const props = withDefaults(defineProps<CommentItemProps>(), { canReply: true, sendState: 'sent' })
const emit = defineEmits<{
  reply: [commentId: string]
  /** Меню комментария (O9а/O10): свой — изменить и удалить, чужой — пожаловаться. */
  menu: [commentId: string]
  retry: [commentId: string]
}>()
defineSlots<{ /** Ответы (`CommentItem` с `reply`), один уровень. */ replies?(): unknown }>()

const dateTime = computed(() => props.comment.createdAt)
</script>

<template>
  <article class="comment" :class="{ 'comment--reply': reply, 'comment--deferred': deferred, 'comment--sending': sendState === 'sending' }" :aria-label="`Комментарий: ${author.displayName}`">
    <PhotoAvatar :photo="author.avatar" :name="author.displayName" :size="reply ? 'xs' : 'sm'" decorative />
    <div class="comment__body">
      <p class="comment__head">
        <a class="comment__author" :href="`/u/${author.username}`">{{ author.displayName }}</a>
        <time class="comment__time" :datetime="dateTime">{{ formatAgo(comment.createdAt) }}</time>
      </p>
      <p class="comment__text">{{ comment.text }}</p>
      <p v-if="sendState === 'sending'" class="comment__state" role="status">{{ FEATURE_LABELS.sending }}</p>
      <p v-else-if="sendState === 'failed'" class="comment__state comment__state--failed" role="alert">
        {{ FEATURE_LABELS.sendFailed }}
        <UiButton variant="ghost" size="sm" @click="emit('retry', comment.id)">{{ FEATURE_LABELS.retry }}</UiButton>
      </p>
      <div v-else class="comment__actions">
        <UiButton v-if="canReply" variant="ghost" size="sm" @click="emit('reply', comment.id)">
          {{ FEATURE_LABELS.reply }}<span class="fx-sr-only"> {{ author.displayName }}</span>
        </UiButton>
        <UiIconButton icon="more" variant="plain" size="sm" :label="`${FEATURE_LABELS.more}: комментарий ${author.displayName}${own ? ' (ваш)' : ''}`" @click="emit('menu', comment.id)" />
      </div>
      <div v-if="$slots.replies" class="comment__replies"><slot name="replies" /></div>
    </div>
  </article>
</template>

<style scoped>
.comment {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--s-3);
}

.comment--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 96px;
}

/* Ответ вложен под родителем: отступ задаёт блок «replies», а не сам ответ. */
.comment--reply .comment__text {
  font-size: 14px;
}

.comment--sending {
  opacity: 0.7;
}

.comment__body {
  min-width: 0;
}

.comment__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 var(--s-2);
  margin: 0;
}

.comment__author {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
}

.comment__time {
  font-size: 12px;
  color: var(--text-3);
}

.comment__text {
  margin: var(--s-1) 0 0;
  font-size: 15px;
  line-height: 1.45;
  color: var(--text-2);
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.comment__actions {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin-top: var(--s-1);
  margin-left: calc(var(--s-3) * -1);
}

.comment__state {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: var(--s-1) 0 0;
  font-size: 12px;
  color: var(--text-3);
}

.comment__state--failed {
  color: var(--danger);
}

.comment__replies {
  display: grid;
  gap: var(--s-4);
  margin-top: var(--s-3);
  padding-left: var(--s-3);
  border-left: 1px solid var(--border);
}

@media (pointer: coarse) {
  .comment__author {
    padding-block: 12px;
    margin-block: -12px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .comment__author:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
