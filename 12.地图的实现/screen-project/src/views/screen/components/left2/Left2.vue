<template>
  <div class="screen-block">
    <Title>地区销量趋势</Title>
    <div style="width: 100%; height: 90%">
      <v-chart :option="option" />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import Title from "../Title.vue";
import { ref } from "vue";
import { useAsync } from "@/composables/useAsync";
import { getTrendsList } from "@/api/modules/trends";
import type { Trends } from "@/api/interface";

const option = ref({});
useAsync(getTrendsList, {
  onSuccess: (data) => {
    console.log("趋势数据加载成功:", data);
    if (data.code === 200) {
      setOptions(data.data!);
    }
  },
  onError: (err) => {
    console.error("趋势数据加载失败:", err);
  },
});

const setOptions = (state: Trends[]) => {
  option.value = {
    grid: {
      left: "3%",
      top: "25%",
      right: "4%",
      bottom: "1%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      left: 20,
      top: "8%",
      icon: "circle",
      data: state.map((item) => item.name),
      textStyle: {
        color: "#aaa",
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [
        "一月",
        "二月",
        "三月",
        "四月",
        "五月",
        "六月",
        "七月",
        "八月",
        "九月",
        "十月",
        "十一月",
        "十二月",
      ],
    },
    yAxis: {
      type: "value",
    },
    series: getSeries(state),
  };
};

function getSeries(state: Trends[]) {
  // 半透明的颜色值
  const colorArr1 = [
    "rgba(11, 168, 44, 0.5)",
    "rgba(44, 110, 255, 0.5)",
    "rgba(22, 242, 217, 0.5)",
    "rgba(254, 33, 30, 0.5)",
    "rgba(250, 105, 0, 0.5)",
  ];
  // 全透明的颜色值
  const colorArr2 = [
    "rgba(11, 168, 44, 0)",
    "rgba(44, 110, 255, 0)",
    "rgba(22, 242, 217, 0)",
    "rgba(254, 33, 30, 0)",
    "rgba(250, 105, 0, 0)",
  ];
  // y轴的数据 series下的数据

  const seriesArr = state.map((item, index) => {
    return {
      name: item.name,
      type: "line",
      data: item.data,
      itemStyle: {
        borderWidth: 4,
      },
      lineStyle: {
        width: 3,
      },
      symbolSize: 0,
      symbol: "circle",
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: colorArr1[index],
          }, // %0的颜色值
          {
            offset: 1,
            color: colorArr2[index],
          }, // 100%的颜色值
        ]),
      },
    };
  });

  return seriesArr;
}
</script>

<style lang="scss" scoped>
.screen-block {
  width: 100%;
  height: 100%;
}
</style>
