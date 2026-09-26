<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiButton, UiSurface } from '@/design-system'
import { formatDate } from '@/mocks/format'
import type { IsoDate } from '@/mocks/types'
import type { PremiumPhase } from '@/state/usePremium'
import { PHASE_COPY } from '../copy'

/* Состояние подписки (§25): фаза, срок, отмена автопродления «в один шаг» — без подтверждающих уловок. */
const props = defineProps<{ phase: Exclude<PremiumPhase, 'none'>; activeUntil: IsoDate | null; autoRenew: boolean }>()
const emit = defineEmits<{ cancelAutoRenew: []; renew: [] }>()

const copy = computed(() => PHASE_COPY[props.phase])
const untilLabel = computed(() => (props.activeUntil === null ? '' : ` до ${formatDate(props.activeUntil)}`))
const canCancel = computed(() => props.phase === 'active' || props.phase === 'trial' || props.phase === 'grace')
const renewLabel = computed(() => (props.phase === 'grace' ? 'Обновить оплату' : 'Продлить Премиум'))
const canRenew = computed(() => props.phase === 'grace' || props.phase === 'canceled_active' || props.phase === 'expired')
</script>

<template>
  <UiSurface variant="panel" as="section" class="premium-status" aria-labelledby="premium-status-title">
    <div class="premium-status__head">
      <h2 id="premium-status-title" class="premium-status__title">{{ copy.title }}</h2>
      <UiBadge :variant="copy.variant" pill>{{ copy.badge }}</UiBadge>
    </div>
    <p class="premium-status__text">{{ copy.text(untilLabel) }}</p>
    <dl v-if="activeUntil" class="premium-status__facts">
      <div>
        <dt>{{ phase === 'expired' ? 'Закончился' : 'Действует до' }}</dt>
        <dd>{{ formatDate(activeUntil) }}</dd>
      </div>
      <div>
        <dt>Автопродление</dt>
        <dd>{{ autoRenew ? 'Включено' : 'Отключено' }}</dd>
      </div>
    </dl>
    <div v-if="canCancel || canRenew" class="premium-status__actions">
      <UiButton v-if="canRenew" @click="emit('renew')">{{ renewLabel }}</UiButton>
      <UiButton v-if="canCancel" variant="outline" @click="emit('cancelAutoRenew')">Отключить автопродление</UiButton>
    </div>
  </UiSurface>
</template>

<style scoped>
.premium-status {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.premium-status__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3);
}

.premium-status__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.premium-status__text {
  margin: 0;
  max-width: 620px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-2);
}

.premium-status__facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-6);
  margin: 0;
}

.premium-status__facts dt {
  font-size: 12.5px;
  color: var(--text-3);
}

.premium-status__facts dd {
  margin: 2px 0 0;
  font-size: 15px;
  font-weight: 600;
}

.premium-status__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}

@media (max-width: 480px) {
  .premium-status__actions > * {
    flex: 1 1 100%;
  }
}
</style>
