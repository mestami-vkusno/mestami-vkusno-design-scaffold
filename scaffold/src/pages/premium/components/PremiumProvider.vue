<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { UiButton, UiIcon, UiSurface } from '@/design-system'

/*
  PR2: заглушка внешнего платёжного провайдера. Настоящий переход уходит с сайта; здесь показываем
  тот же шаг на месте и три исхода. Реквизитов карт нет (§25Б). Результат сообщает страница,
  а истина о покупке — на сервере, поэтому «Оплата прошла» здесь только имитация ответа провайдера.
*/
export type ProviderOutcome = 'success' | 'failed' | 'canceled'

defineProps<{ trial: boolean }>()
const emit = defineEmits<{ outcome: [outcome: ProviderOutcome] }>()

const heading = ref<HTMLElement | null>(null)
// Шаг пришёл на место предложения: фокус на заголовок, чтобы скринридер объявил смену.
onMounted(() => heading.value?.focus({ preventScroll: true }))
</script>

<template>
  <UiSurface variant="panel" as="section" class="premium-provider" aria-labelledby="premium-provider-title">
    <p class="premium-provider__eyebrow"><UiIcon name="external" :size="16" /> Страница платёжного провайдера (заглушка)</p>
    <h2 id="premium-provider-title" ref="heading" class="premium-provider__title" tabindex="-1">{{ trial ? 'Подключение пробного периода' : 'Оплата Премиум' }}</h2>
    <p class="premium-provider__text">Сумма и срок появятся здесь, когда будут утверждены. Реквизиты карты вводятся только на стороне провайдера, мы их не видим и не храним.</p>
    <div class="premium-provider__actions">
      <UiButton size="lg" @click="emit('outcome', 'success')">Оплата прошла</UiButton>
      <UiButton size="lg" variant="outline" @click="emit('outcome', 'failed')">Платёж не прошёл</UiButton>
      <UiButton size="lg" variant="ghost" @click="emit('outcome', 'canceled')">Отменить и вернуться</UiButton>
    </div>
  </UiSurface>
</template>

<style scoped>
.premium-provider {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
  border-style: dashed;
}

.premium-provider__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  font-size: 12.5px;
  color: var(--text-3);
}

.premium-provider__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.premium-provider__title:focus-visible {
  outline: none;
}

.premium-provider__text {
  margin: 0;
  max-width: 560px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-2);
}

.premium-provider__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}

@media (max-width: 480px) {
  .premium-provider__actions > * {
    flex: 1 1 100%;
  }
}
</style>
