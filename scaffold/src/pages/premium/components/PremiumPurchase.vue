<script setup lang="ts">
import { ref, watch } from 'vue'
import { UiButton, UiCheckbox, UiSurface, UiText } from '@/design-system'
import { AGE_ERROR, AGE_LABEL, PRICE_PLACEHOLDER } from '../copy'

/*
  Оформление (PR1): подтверждение 18+ (§5.8), заглушка цены (§24.3), кнопка ведёт к провайдеру (PR2, заглушка).
  Пробный период — только пока Премиума не было и только если его включает бизнес-конфигурация (§25): в моке включён.
*/
const props = defineProps<{
  /** Подпись главной кнопки: «Оформить Премиум», «Продлить», «Обновить оплату». */
  actionLabel: string
  /** Можно ли предложить пробный период. */
  trialAvailable: boolean
  signedIn: boolean
}>()

const emit = defineEmits<{ proceed: [trial: boolean] }>()

const ageConfirmed = ref(false)
const showError = ref(false)

function go(trial: boolean): void {
  if (!ageConfirmed.value) {
    showError.value = true
    return
  }
  emit('proceed', trial)
}

watch(ageConfirmed, (value) => {
  if (value) showError.value = false
})
</script>

<template>
  <UiSurface variant="panel" as="section" class="premium-purchase" aria-labelledby="premium-purchase-title">
    <h2 id="premium-purchase-title" class="premium-purchase__title">Оформление</h2>
    <p class="premium-purchase__price">{{ PRICE_PLACEHOLDER }}</p>
    <div class="premium-purchase__age">
      <UiCheckbox v-model="ageConfirmed">{{ AGE_LABEL }}</UiCheckbox>
      <p v-if="showError" id="premium-age-error" class="premium-purchase__error" role="alert">{{ AGE_ERROR }}</p>
    </div>
    <div class="premium-purchase__actions">
      <UiButton size="lg" icon-right="arrow-r" @click="go(false)">{{ props.actionLabel }}</UiButton>
      <UiButton v-if="trialAvailable" size="lg" variant="outline" @click="go(true)">Попробовать 7 дней</UiButton>
    </div>
    <UiText v-if="!signedIn" variant="caption" class="premium-purchase__hint">Для оформления нужен аккаунт: после входа вы вернётесь сюда.</UiText>
    <UiText variant="caption" class="premium-purchase__hint">Пробный период и его срок — рабочая гипотеза, не утверждённое условие.</UiText>
  </UiSurface>
</template>

<style scoped>
.premium-purchase {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.premium-purchase__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.premium-purchase__price {
  margin: 0;
  padding: var(--s-4);
  border: 1px dashed var(--border-strong);
  border-radius: var(--r-md);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-2);
}

.premium-purchase__age {
  display: grid;
  gap: var(--s-2);
}

.premium-purchase__error {
  margin: 0;
  font-size: 13px;
  color: var(--danger);
}

.premium-purchase__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}

.premium-purchase__hint {
  margin: 0;
  color: var(--text-3);
}

@media (max-width: 480px) {
  .premium-purchase__actions > * {
    flex: 1 1 100%;
  }
}
</style>
