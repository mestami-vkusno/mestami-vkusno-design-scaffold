<script setup lang="ts">
import { computed } from 'vue'
import { useLibrary } from '@/state/useLibrary'
import ActionButton from '../ActionButton/ActionButton.vue'
import { FEATURE_LABELS } from '../labels'
import type { LikeButtonProps } from './types'

const props = defineProps<LikeButtonProps>()

const library = useLibrary()
const liked = computed(() => library.isLiked(props.postId))
// Счётчик меняется на месте, без «набегания»: число в интерфейсе не анимируется.
const count = computed(() => library.likesCountOf(props.postId, props.baseCount))
</script>

<template>
  <ActionButton icon="heart" :label="FEATURE_LABELS.like" :pressed="liked" :count="count" bounce @click="library.toggleLike(postId, origin)" />
</template>
