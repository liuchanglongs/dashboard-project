<template>
  <div class="screen-header">
    <h1 class="screen-logo">
      <span>duyi screen</span>
    </h1>
    <div class="screen-header-title">{{screenStore.title}}</div>
    <div class="screen-header-right">
      <img class="theme-change" :src="icon" @click="handleChangeTheme" />
      <span class="datetime">{{ currentTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, computed } from "vue";
import switch_dark from "@/assets/img/switch_dark.png";
import switch_light from "@/assets/img/switch_light.png";
import dayjs from "dayjs";
import { useScreenStore } from "@/stores";

const screenStore = useScreenStore();

const icon = computed(() => screenStore.theme === "dark" ? switch_light : switch_dark);

const handleChangeTheme = () => { 
  screenStore.$patch({
    theme: screenStore.theme === "dark" ? "light" : "dark"
  })
}

const currentTime = ref("");
const timeId = ref();
function startTime() { 
  timeId.value = setTimeout(() => { 
    currentTime.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
    startTime();
  },1000)
}

startTime();

onBeforeUnmount(() => { 
  clearTimeout(timeId.value);
})
</script>

<style lang="scss" scoped>
.screen-header{
  position: relative;
  width: 100%;
  height: var(--ds-header-height);
  background-size: 100% 100%;
  background-image: url('@/assets/img/header.png');
  background-repeat: no-repeat;
  animation: fade 3s;
  &-title{
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 30px;
    width: 490px;
    height: var(--ds-header-height);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .screen-logo{
    display: flex;
    align-items: center;
    height: calc(var(--ds-header-height) - 20px);
  }
  &-right{
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
    img{
      width: 30px;
      margin-right: 16px;
      cursor: pointer;
      transition: 0.3s cubic-bezier(0.175, 0.88, 0.32, 1.275);
      &:hover{
        transform: scale(1.2);
      }
      stroke: #fff;
    }
  }
}

@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
