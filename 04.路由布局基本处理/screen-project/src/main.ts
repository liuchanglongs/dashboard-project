import { createApp } from 'vue'
import "@/assets/css/index.scss";
import App from './App.vue'
import router from '@/routers'

createApp(App).use(router).mount('#app')
