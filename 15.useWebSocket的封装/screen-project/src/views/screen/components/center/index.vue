<template>
  <div class="map-center">
    <Map />
  </div>
</template>

<script setup lang="ts">
import Map from "./Map.vue" 
</script>

<style lang="scss" scoped>
.map-center{
  position: relative;
  width: 100%;
  height: 1000px;
  padding: 0 16px;
  animation: slideAndFade 1.5s;
}
@keyframes slideAndFade {
  0% {
    transform: translateY(218px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>