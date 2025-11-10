<template>
  <div class="screen-block">
    <Title>销售统计</Title>
    <div style="width: 100%; height: 90%">
      <v-chart :option="option" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Title from "../Title.vue";
import * as echarts from "echarts";
import useWebSocket from "@/composables/useWebSocket";

const { subscribe } = useWebSocket('http://localhost:3000', {
  autoConnect: true,
})

const option = ref({})


const initOption = () => { 
  option.value = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        z: 0,
        lineStyle: {
          color: "#2d3443",
        },
      },
    },
    //x轴
    xAxis: {
      splitLine: { show: false }, // 是否显示网格线
      axisLine: { show: true }, // 是否显示轴线
      type: "value", // 作为数据展示
    },
    //y轴
    yAxis: {
      type: "category",
      data: [],
      inverse: true, // y轴反向
      axisLine: { show: true }, // 是否显示轴线
      axisTick: { show: false }, // 是否显示刻度
      axisLabel: {
        color: "#fff",
      },
    },
    grid: {
      top: "3%",
      right: "4%",
      bottom: "3%",
      left: "3%",
      containLabel: true,
    },
    series: [
      {
        type: "bar",
        label: {
          show: true,
          position: "right",
        },
        data: [],
        barWidth: 22,
        roundCap: true,
        showBackground: true,
        backgroundStyle: {
          color: "rgba(220, 220, 220, 0.3)",
        },
        itemStyle: {
          borderWidth: 0,
          borderRadius: [0, 10, 10, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            {
              offset: 0,
              color: "#00fffb",
            },
            {
              offset: 1,
              color: "#0061ce",
            },
          ]),
        },
      },
    ],
  };
} 

onMounted(() => {
  initOption()
})

const updateOption = (data: Array<{name:string, value:number}>) => { 
  const categories = data.map((item) => item.name)
  const values = data.map((item) => item.value)

  option.value = {
    yAxis: {
      data: categories,
    },
    series: [
      {
        data: values,
      },
    ],
  }
}

subscribe('salesData', updateOption)
</script>

<style lang="scss" scoped>
.screen-block {
  width: 100%;
  height: 100%;
}
</style>
