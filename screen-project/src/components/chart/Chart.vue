<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef, type PropType, watch } from "vue";
import type { ECharts, EChartsCoreOption } from "echarts";
import * as echarts from "echarts";

const props = defineProps({
  option: {
    type: Object as PropType<EChartsCoreOption>,
    required: true,
    default: () => ({}),
  },
  loading: Boolean,
});

// 1.根据DOM初始化echarts实例
const chartRef = shallowRef<HTMLElement | null>(null);
const chart = shallowRef<ECharts | null>(null);

function init() {
  if (props.option) {
    chart.value = echarts.init(chartRef.value);
    chart.value.on("click", function (params: any) {
      console.log(params);
    });
    setOption(props.option);
  }
}

function setOption(option: any, notMerge?: boolean, lazyUpdate?: boolean) {
  if (chart.value) {
    chart.value.setOption(option, notMerge, lazyUpdate);
  }
}

onMounted(() => {
  init();
});

function resize() {
  chart.value?.resize();
}

watch(
  () => props.option,
  () => {
    setOption(props.option);
  }
);

defineExpose({
  chart,
  setOption,
  resize,
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
