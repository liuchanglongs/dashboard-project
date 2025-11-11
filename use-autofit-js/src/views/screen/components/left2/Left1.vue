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
import { getSalesList } from "@/api/modules/sales";
import type { Sales } from "@/api/interface";
import { useAsync } from "@/composables/useAsync";

const option = ref({})

// const state = ref<Sales[]>([]);

// const getData = () => { 
//   getSalesList().then(res => { 
//     if (res.code === 200) { 
//       state.value = res.data!;
//       setOption();
//     }
//   })
// }

// onMounted(() => { 
//   getData();
// })


const { data:state, loading } = useAsync(getSalesList, {
  onSuccess: (res) => {
    console.log('销售数据加载成功',res);
    // state.value = res.data!;
    if (res.code === 200) { 
      setOption(res.data!);
    }
  },
  onError: (err) => { 
    console.error('销售数据加载失败',err);
  }
})

const setOption = (state:Sales[]) => { 
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
      data: state.map((item) => item.name),
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
        data: state.map((item) => item.value),
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

/*
const data = [
  {
    name: "商家1",
    value: 99,
  },
  {
    name: "商家2",
    value: 88,
  },
  {
    name: "商家3",
    value: 77,
  },
  {
    name: "商家4",
    value: 66,
  },
  {
    name: "商家5",
    value: 55,
  },
  {
    name: "商家6",
    value: 44,
  },
];

const option = ref({
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
    data: data.map((item) => item.name),
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
      data: data.map((item) => item.value),
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
});
*/
</script>

<style lang="scss" scoped>
.screen-block {
  width: 100%;
  height: 100%;
}
</style>
