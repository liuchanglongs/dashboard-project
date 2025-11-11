<template>
  <div class="map-center">
    <Map />
  </div>
</template>

<script setup lang="ts">
import Map from "./Map.vue";
</script>

<style lang="scss" scoped>
.map-center {
  position: relative;
  width: 900px;
  height: 900px;
  padding: 0 16px;
  animation: slideAndFade-aee216da 1.5s;
  margin: auto;
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
