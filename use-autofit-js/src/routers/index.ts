import {
  createWebHashHistory,
  createRouter,
  type RouteRecordRaw,
} from "vue-router";
import Screen from "@/views/screen/index.vue";
import event from "@/api/eventEmitter";
import { ElMessageBox } from "element-plus";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/screen",
  },
  {
    path: "/screen",
    component: Screen,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

event.on("API:INVALID", () => {
  ElMessageBox.alert("参数错误", "提示");
  // router.push("/invalid");
});

event.on("API:SESSION_EXPIRED", () => {
  ElMessageBox.alert("登录过期", "提示");
  // router.push("/login");
});

export default router;
