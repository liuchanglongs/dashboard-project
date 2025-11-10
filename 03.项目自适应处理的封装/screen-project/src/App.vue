<script setup lang="ts">
import { useResize } from "@/composables/useResize";
const { screenRef } = useResize();

import ScaleScreen from "@/components/scale-screen"
</script>

<template>
  <!-- <div class="screen-container">
    <div ref="screenRef" class="screen-wrapper">
      <img src="./assets/bg.jpg" alt="" />
    </div>
  </div> -->
  <ScaleScreen>
    <img src="./assets/bg.jpg" alt="" />
  </ScaleScreen>
</template>

<style scoped>
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
