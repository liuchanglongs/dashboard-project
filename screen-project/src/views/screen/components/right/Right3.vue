<template>
  <div class="screen-block">
    <Title>地区销售排行</Title>
    <div style="width: 100%; height: 90%">
      <v-chart :option="option" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Title from "../Title.vue";
import * as echarts from "echarts";
import { useAsync } from "@/composables/useAsync";
import { getRankList } from "@/api/modules/rank";
import type { Rank } from "@/api/interface";
const colorArr = [
  ["#0BA82C", "#4FF778"],
  ["#2E72BF", "#23E5E5"],
  ["#5052EE", "#AB6EE5"],
];
const startValue = ref(0);
const endValue = ref(7);
const barWidth = 20;

const option = ref({});
useAsync(getRankList, {
  onSuccess: (data) => {
    console.log("排行榜数据加载成功:", data);
    if (data.code === 200) {
      setOptions(data.data!);
    }
  },
  onError: (err) => {
    console.error("排行榜数据加载失败:", err);
  },
});

const setOptions = (state: Rank[]) => {
  option.value = {
    grid: {
      top: "10%",
      left: "5%",
      right: "5%",
      bottom: "5%",
      containLabel: true,
    },
    tooltip: {
      show: true,
    },
    xAxis: {
      type: "category",
      axisTick: { show: false },
      data: state.map((item) => item.name),
    },
    yAxis: {
      type: "value",
      splitLine: { show: false },
      axisLine: { show: true },
    },
    dataZoom: {
      show: false,
      startValue: startValue.value,
      endValue: endValue.value,
    },
    series: [
      {
        type: "bar",
        data: state.map((item) => item.value),
        barWidth: barWidth,
        itemStyle: {
          borderRadius: [barWidth / 2, barWidth / 2, 0, 0],
          color: (arg: any) => {
            let targetColorArr: string[] | null = null;
            if (arg.value > 300) {
              targetColorArr = colorArr[0];
            } else if (arg.value > 200) {
              targetColorArr = colorArr[1];
            } else {
              targetColorArr = colorArr[2];
            }
            return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: targetColorArr[0],
              },
              {
                offset: 1,
                color: targetColorArr[1],
              },
            ]);
          },
        },
      },
    ],
  };
};
</script>

<style lang="scss" scoped>
.screen-block {
  width: 100%;
  height: 100%;
}
</style>
