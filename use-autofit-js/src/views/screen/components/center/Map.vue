<template>
  <div class="screen-block">
    <Title>商家分布</Title>
    <div style="width: 100%; height: 90%">
      <v-chart :option="option" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Title from "../Title.vue";
import * as echarts from "echarts";
import mapJson from "@/assets/data/china.json";
import mapData from "@/assets/data/map.json";
const option = ref({})
// 注册地图数据
echarts.registerMap("china", mapJson as any);
const setOption = () => { 
  option.value = {
    geo: {
      type: "map",
      map: "china",
      top: "5%",
      bottom: "5%",
      layoutCenter: ["50%", "50%"],
      layoutSize: "98%",
      itemStyle: {
        areaColor: "#2c3e50",
        borderColor: "#111",
      }
    },
    legend: {
      left: "5%",
      bottom: "5%",
      orient: "vertical",
      data: mapData.map((item) => item.name),
      textStyle: {
        color: "#aaa",
      },
    },
    series: mapData.map(item => { 
      return {
        type: "effectScatter",
        rippleEffect: {
          scale: 5,
          brushType: "stroke"
        },
        name: item.name,
        data: item.children,
        coordinateSystem: "geo",
      }
    })
  };
} 

onMounted(() => { 
  setOption();
})
</script>

<style lang="scss" scoped>
.screen-block {
  width: 100%;
  height: 100%;
}
</style>
