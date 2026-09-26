<script setup lang="ts">
import PostCardCollection from './PostCardCollection.vue'
import PostCardUser from './PostCardUser.vue'
import PostCardVenue from './PostCardVenue.vue'
import type { PostCardProps } from './types'

/*
  Карточка потока: три варианта в одном блоке (`data.variant`).
  Пользовательская и официальная выглядят по-разному сразу тремя признаками (§12.1): подпись «Заведение»,
  скруглённый квадрат вместо круглого аватара, рамка `--lime-line`.
*/
withDefaults(defineProps<PostCardProps>(), { headingLevel: 3, deferred: true })
const emit = defineEmits<{ /** Меню публикации (O10): страница открывает шторку. */ menu: [postId: string] }>()
</script>

<template>
  <PostCardUser v-if="data.variant === 'user'" :data="data" :heading-level="headingLevel" :deferred="deferred" @menu="emit('menu', $event)" />
  <PostCardVenue v-else-if="data.variant === 'venue'" :data="data" :heading-level="headingLevel" :deferred="deferred" />
  <PostCardCollection v-else :data="data" :heading-level="headingLevel" :deferred="deferred" />
</template>
