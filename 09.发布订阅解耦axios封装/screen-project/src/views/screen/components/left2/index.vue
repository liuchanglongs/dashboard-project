<template>
  <div>
    <component 
      v-for="item in components"
      :key="item.name"
      :is="item.component"
      :name="item.name"
      class="screen-left-item"
    ></component>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from "vue";
import Left1 from "./Left1.vue";
import Left2 from "./Left2.vue";
const components = shallowRef([
  { name: "left1", component: Left1 },
  { name: "left2", component: Left2 },
]);
</script>

<style lang="scss" scoped>
.screen-left-item {
  width:100%;
  height:430px;
  background-color: var(--ds-block-bg);
  padding: 16px;
  animation-name: slide;

  & + & {
    margin-top: 20px;
  }
  &[name="left1"]{
    animation-duration: 0.8s;
  }
  &[name="left2"]{
    height: 550px;
    animation-duration: 1.5s;
  }
}

@keyframes slide {
  0% {
    transform: translateX(-100%);
  }
  80% {
    transform: translateX(20px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
