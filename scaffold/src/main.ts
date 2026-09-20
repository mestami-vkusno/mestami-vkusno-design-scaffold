import { createApp } from 'vue'
import App from './App.vue'
import { initTheme } from '@/design-system'
import '@/design-system/styles/index.css'

initTheme()
createApp(App).mount('#app')
