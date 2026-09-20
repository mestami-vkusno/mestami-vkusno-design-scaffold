import { createApp } from 'vue'
import App from './App.vue'
import { initMotion, initTheme } from '@/design-system'
import '@/design-system/styles/index.css'
import { router } from './router'

initTheme()
initMotion()
createApp(App).use(router).mount('#app')
