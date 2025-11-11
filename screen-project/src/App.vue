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
* {
  margin: 0;
  padding: 0;
}
.screen-app {
  width: 100vw;
  height: 100vh;
}
</style>
