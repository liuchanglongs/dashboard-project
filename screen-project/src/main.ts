import { createApp } from 'vue'
import "@/assets/css/index.scss";
import App from './App.vue'
import router from '@/routers'
import chart from '@/components/chart'
import "element-plus/dist/index.css";
import ElementPlus from 'element-plus';
import pinia from "@/stores";


createApp(App).use(router).use(chart).use(pinia).use(ElementPlus).mount('#app')
