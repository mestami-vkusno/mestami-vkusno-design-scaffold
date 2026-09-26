<template>
  <h1 class="sr-heading"><slot /></h1>
</template>

<!-- Заголовок страницы только для скринридера: у состояний «не найдено», «ошибка», «нет сети» (UiEmptyState) заголовок
     начинается с h2, а у страницы должен быть ровно один h1. -->
<style scoped>
.sr-heading {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
