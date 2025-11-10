<template>
  <ScaleScreen>
    <div class="screen">
      <Header />
      <div class="screen-main">
        <div class="screen-left">
          <!-- <Left1 />
          <Left2 /> -->
          <Left />
        </div>
        <div class="screen-center">
          <!-- <Center/> -->
        </div>
        <div class="screen-right">
          <Right/>
        </div>
      </div>
    </div>
  </ScaleScreen>
</template>

<script setup lang="ts">
import ScaleScreen from "@/components/scale-screen"
import Header from "./components/Header.vue"
// import Left1 from "./components/left/Left1.vue"
// import Left2 from "./components/left/Left2.vue"
import Left from "./components/left2/index.vue"
import Right from "./components/right/index.vue"
</script>

<style lang="scss" scoped>
.screen{
  --ds-screen-width: 1920px;
  --ds-screen-height: 1080px;
  --ds-header-height: 72px;
  --ds-block-bg: #222733;
  --ds-screen-bg: rgb(22,21,24);
  --ds-screen-text-color: #fff;
  position: absolute;
  padding: 0 20px;
  background: var(--ds-screen-bg);
  color:var(--ds-screen-text-color);
  &-main{
    position: relative;
    display: flex;
    height: calc(100% - var(--ds-header-height));
  }
  &-center{
    flex:1;
    width: calc(var(--ds-screen-width) - 1000px);
  }
  &-left,
  &-right{
    width: 460px;
  }
}
</style>