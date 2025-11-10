import { createApp } from 'vue'
import "@/assets/css/index.scss";
import App from './App.vue'
import router from '@/routers'
import chart from '@/components/chart'

createApp(App).use(router).use(chart).mount('#app')
