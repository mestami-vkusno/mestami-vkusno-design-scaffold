<script setup lang="ts">
import { UiBadge } from '@/design-system'
import { PURPOSE_LABEL, TIER_LABEL } from '../data/labels'
import type { FrequencyTier, MotionPurpose, MotionSpec } from '../types'

defineProps<{
  title: string
  tier: FrequencyTier
  purpose: MotionPurpose
  /** Из чего собрана анимация: инструмент, свойства, кривая, длительность. */
  specs: readonly MotionSpec[]
  description?: string
  /** Высокая сцена: для демо, где что-то раскрывается за пределы контрола (списки, подсказки). */
  tall?: boolean
}>()
defineSlots<{ default(): unknown; actions?(): unknown; note?(): unknown }>()
</script>

<template>
  <article class="motion-demo">
    <header class="motion-demo__head">
      <div class="motion-demo__titles">
        <h3 class="motion-demo__title">{{ title }}</h3>
        <div class="motion-demo__badges">
          <UiBadge variant="neutral">{{ TIER_LABEL[tier] }}</UiBadge>
          <UiBadge>{{ PURPOSE_LABEL[purpose] }}</UiBadge>
        </div>
      </div>
      <div v-if="$slots.actions" class="motion-demo__actions"><slot name="actions" /></div>
    </header>
    <p v-if="description" class="motion-demo__description">{{ description }}</p>
    <div class="motion-demo__stage" :class="{ 'motion-demo__stage--tall': tall }"><slot /></div>
    <p v-if="$slots.note" class="motion-demo__note"><slot name="note" /></p>
    <dl class="motion-demo__specs">
      <div v-for="spec in specs" :key="spec.label" class="motion-demo__spec">
        <dt>{{ spec.label }}</dt>
        <dd>{{ spec.value }}</dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.motion-demo {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  min-width: 0;
  padding: var(--s-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
}

.motion-demo__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s-3);
}

.motion-demo__titles {
  flex: 1;
  min-width: 0;
}

.motion-demo__title {
  margin: 0 0 var(--s-2);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.25;
}

.motion-demo__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.motion-demo__actions {
  flex: none;
}

.motion-demo__description,
.motion-demo__note {
  margin: 0;
  color: var(--text-2);
  font-size: 14px;
}

.motion-demo__note {
  color: var(--text-3);
  font-size: 13px;
}

.motion-demo__stage {
  position: relative;
  display: grid;
  min-height: 140px;
  padding: var(--s-4);
  background: var(--bg);
  border: 1px dashed var(--border-strong);
  border-radius: var(--r-md);
  overflow: hidden;
}

.motion-demo__stage--tall {
  min-height: 250px;
}

.motion-demo__specs {
  display: grid;
  gap: 4px;
  margin: 0;
  font-size: 12.5px;
}

.motion-demo__spec {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: var(--s-3);
}

.motion-demo__spec dt {
  color: var(--text-3);
}

.motion-demo__spec dd {
  margin: 0;
  color: var(--text-2);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  overflow-wrap: anywhere;
}

@media (max-width: 720px) {
  .motion-demo {
    padding: var(--s-4);
  }

  .motion-demo__head {
    flex-wrap: wrap;
  }

  .motion-demo__spec {
    grid-template-columns: 100px 1fr;
    gap: var(--s-2);
  }
}
</style>
