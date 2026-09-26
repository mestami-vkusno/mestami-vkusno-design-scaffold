<template>
  <div class="shell-container"><slot /></div>
</template>

<style scoped>
/* Ширина содержимого продукта: одна для шапки, страниц и подвала. */
.shell-container {
  /* Без явной ширины в flex-колонке `margin: 0 auto` отключает растяжение, и контейнер раздувается до `max-width` по ширине рядов карточек. */
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 max(var(--s-4), env(safe-area-inset-right)) 0 max(var(--s-4), env(safe-area-inset-left));
}

@media (min-width: 900px) {
  .shell-container {
    padding-inline: var(--s-6);
  }
}
</style>
