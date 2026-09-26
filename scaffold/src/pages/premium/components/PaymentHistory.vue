<script setup lang="ts">
import { computed } from 'vue'
import { UiEmptyState, UiSurface } from '@/design-system'
import { formatDate } from '@/mocks/format'
import { addDays } from '@/mocks/time'
import type { IsoDate } from '@/mocks/types'
import { PREMIUM_PERIOD_DAYS, type PremiumPhase } from '@/state/usePremium'

/*
  История платежей и условия продления доступны пользователю (§25). В моке платежей как сущности нет
  (assumption): по фазе и дате окончания восстанавливается один период. Сумма не показывается, пока цены не утверждены (§24.3).
*/
const props = defineProps<{ phase: PremiumPhase; activeUntil: IsoDate | null }>()

const rows = computed(() => {
  if (props.phase === 'none' || props.activeUntil === null) return []
  const started = addDays(props.activeUntil, -PREMIUM_PERIOD_DAYS)
  return [{ id: 'current', title: props.phase === 'trial' ? 'Пробный период' : `Премиум, ${PREMIUM_PERIOD_DAYS} дней`, date: formatDate(started), amount: 'Сумма не утверждена', status: props.phase === 'trial' ? 'Пробный' : 'Оплачено' }]
})
</script>

<template>
  <section class="payment-history" aria-labelledby="payment-history-title">
    <h2 id="payment-history-title" class="payment-history__title">История платежей</h2>
    <UiSurface v-if="rows.length > 0" variant="card" as="ul" class="payment-history__list">
      <li v-for="row in rows" :key="row.id" class="payment-history__row">
        <span class="payment-history__main">
          <span class="payment-history__name">{{ row.title }}</span>
          <span class="payment-history__meta">{{ row.date }} · {{ row.amount }}</span>
        </span>
        <span class="payment-history__status">{{ row.status }}</span>
      </li>
    </UiSurface>
    <UiEmptyState v-else mode="empty" title="Платежей пока нет" description="После первой оплаты здесь появятся период, сумма и статус." :heading-level="3" />
  </section>
</template>

<style scoped>
.payment-history {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
}

.payment-history__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.payment-history__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.payment-history__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding: var(--s-4);
}

.payment-history__main {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.payment-history__name {
  font-weight: 600;
}

.payment-history__meta {
  font-size: 13px;
  color: var(--text-3);
}

.payment-history__status {
  flex: none;
  font-size: 13px;
  color: var(--text-2);
}
</style>
