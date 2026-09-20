<template>
  <div class="phone-frame"><slot /></div>
</template>

<style scoped>
.phone-frame {
  position: relative;
  width: min(100%, 260px);
  height: 320px;
  margin: 0 auto;
  overflow: hidden;
  background: var(--bg);
  border: 2px solid var(--border-strong);
  border-radius: 28px;
  isolation: isolate;
}
</style>
