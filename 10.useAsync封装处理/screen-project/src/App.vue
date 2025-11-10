<script setup lang="ts">
// import { useResize } from "@/composables/useResize";
// const { screenRef } = useResize();

// import ScaleScreen from "@/components/scale-screen"

// import axios from "axios";

// axios.get("/api/trends/list").then((res) => {
//   console.log(res.data);
// });

// import request from "@/api/request"
// import { getSalesList } from '@/api/modules/sales';

// getSalesList().then(res => {
//   console.log(res);
// })

</script>

<template>
  <div class="screen-app">
    <RouterView />
  </div>
  <!-- <div class="screen-container">
    <div ref="screenRef" class="screen-wrapper">
      <img src="./assets/bg.jpg" alt="" />
    </div>
  </div> -->
  <!-- <ScaleScreen>
    <img src="./assets/bg.jpg" alt="" />
  </ScaleScreen> -->
</template>

<style scoped>
.screen-app{
  width: 100%;
  height: 100%;
}
/* .screen-container {
  overflow: hidden;
  height: 100vh;
  width: 100vw;
  background-color: #000;
  background-size: 100% 100%;
}
.screen-wrapper {
  transition-property:all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.5s;
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
  transform-origin: 0 0;
} */
</style>
