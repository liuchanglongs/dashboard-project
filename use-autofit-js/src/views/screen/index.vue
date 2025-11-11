<template>
  <div id="screenBox">
    <div :class="['screen', screenStore.theme]">
      <Header />
      <div class="screen-main">
        <div class="screen-left">
          <Left />
        </div>
        <div class="screen-center">
          <Center />
        </div>
        <div class="screen-right">
          <Right />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue";
// import Left1 from "./components/left/Left1.vue"
// import Left2 from "./components/left/Left2.vue"
import Left from "./components/left2/index.vue";
import Right from "./components/right/index.vue";
import Center from "./components/center/index.vue";
import { useScreenStore } from "@/stores";
import { onMounted } from "vue";
import autofit from "autofit.js";
const screenStore = useScreenStore();
onMounted(() => {
  autofit.init({
    dh: 1080,
    dw: 1920,
    el: "#screenBox",
    resize: true,
  });
});
</script>

<style lang="scss" scoped>
.screen {
  width: 100%;
  height: 100%;
  --ds-screen-width: 1920px;
  --ds-screen-height: 1080px;
  --ds-header-height: 72px;
  --ds-block-bg: #222733;
  --ds-screen-bg: rgb(22, 21, 24);
  --ds-screen-text-color: #fff;
  position: absolute;
  padding: 0 20px;
  background: var(--ds-screen-bg);
  color: var(--ds-screen-text-color);
  &-main {
    position: relative;
    display: flex;
    height: calc(100% - var(--ds-header-height));
  }
  &-center {
    flex: 1;
    width: calc(var(--ds-screen-width) - 1000px);
  }
  &-left,
  &-right {
    width: 460px;
  }
}

.light {
  --ds-screen-bg: rgb(238, 238, 238);
  --ds-block-bg: #fff;
  --ds-screen-text-color: rgb(22, 21, 34);
}
</style>
