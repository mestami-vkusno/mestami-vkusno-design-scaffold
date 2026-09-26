<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge } from '@/design-system'
import AuthorRow from '../AuthorRow/AuthorRow.vue'
import CollectionCard from '../CollectionCard/CollectionCard.vue'
import { FEATURE_LABELS } from '../labels'
import SaveButton from '../SaveButton/SaveButton.vue'
import ShareButton from '../ShareButton/ShareButton.vue'
import type { HeadingLevel } from '../shared/types'
import type { CollectionPostCardData } from './types'

const props = defineProps<{ data: CollectionPostCardData; headingLevel: HeadingLevel; deferred: boolean }>()

const collection = computed(() => props.data.collection)
const link = computed(() => `/collection/${collection.value.id}`)
</script>

<template>
  <article class="collection-post" :class="{ 'collection-post--deferred': deferred }">
    <CollectionCard as="div" :collection="collection" :byline="data.byline" :heading-level="headingLevel" class="collection-post__cover" />
    <footer class="collection-post__foot">
      <AuthorRow v-if="data.author" :author="data.author" size="sm" subtitle="Автор подборки" />
      <UiBadge v-else variant="accent" pill>{{ FEATURE_LABELS.editorial }}</UiBadge>
      <div class="collection-post__actions">
        <SaveButton kind="collection" :id="collection.id" :subject="collection.title" />
        <ShareButton :target="{ kind: 'collection', id: collection.id, title: collection.title, href: link }" />
      </div>
    </footer>
  </article>
</template>

<style scoped>
.collection-post {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.collection-post--deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 340px;
}

.collection-post__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
}

.collection-post__actions {
  display: flex;
  align-items: center;
  flex: none;
}
</style>
