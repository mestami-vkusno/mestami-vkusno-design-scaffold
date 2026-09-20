import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Инспектор Vue тяжёлый и вешает свой оверлей: включается только по запросу (VUE_DEVTOOLS=1 bun dev).
    process.env.VUE_DEVTOOLS === '1' ? vueDevTools() : null,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
