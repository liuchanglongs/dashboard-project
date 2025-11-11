<template>
  <div class="screen-block">
    <Title>销售统计</Title>
    <div ref="chartRef" style="width: 100%; height: 90%"></div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted, ref, onBeforeUnmount } from "vue";
import type { ECharts, EChartsCoreOption } from "echarts";
import * as echarts from "echarts";
import Title from "../Title.vue";
import { io, Socket } from "socket.io-client";

// 1.根据DOM初始化echarts实例
const chartRef = shallowRef<HTMLElement | null>(null);
const chart = shallowRef<ECharts | null>(null);

// Socket.IO相关内容
const socket = ref<Socket | null>(null);
const connectionStatus = ref<'connected' | 'disconnected'>('disconnected');

const initSocket = () => {
  socket.value = io('http://localhost:3000', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  // 连接事件
  socket.value.on('connect', () => {
    connectionStatus.value = 'connected';
    console.log('Socket.IO 已经连接');
  })

  // 断开连接事件
  socket.value.on('disconnect', () => {
    connectionStatus.value = 'disconnected';
    console.log('Socket.IO 已经断开连接');
  })

  // 接受数据

  socket.value.on('salesData', handleData)
}

const handleData = (newData: Array<{name:string, value:number}>) => {
  if (!chart.value) return;

  const categories = newData.map(item => item.name);
  const values = newData.map(item => item.value);

  chart.value.setOption({
    yAxis: {
      data: categories,
    },
    series: [
      {
        data: values,
      },
    ],
  })
}

const initChart = () => {
  chart.value = echarts.init(chartRef.value!);

  const initialOption: EChartsCoreOption = {
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
  // 3.echarts实例调用setOption方法，传入option对象
  chart.value!.setOption(initialOption);
}

onMounted(() => {
  initSocket();
  initChart();
})

onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
})

// 2.构建option配置对象
// const renderChart = () => {
//   const option: EChartsCoreOption = {
//     tooltip: {
//       trigger: "axis",
//       axisPointer: {
//         type: "line",
//         z: 0,
//         lineStyle: {
//           color: "#2d3443",
//         },
//       },
//     },
//     //x轴
//     xAxis: {
//       splitLine: { show: false }, // 是否显示网格线
//       axisLine: { show: true }, // 是否显示轴线
//       type: "value", // 作为数据展示
//       // max: function (value: any) {
//       //   return parseInt(value.max * 1.2 + "");
//       // },
//     },
//     //y轴
//     yAxis: {
//       type: "category",
//       data: ["商家1", "商家2", "商家3", "商家4", "商家5", "商家6"],
//       inverse: true, // y轴反向
//       axisLine: { show: true }, // 是否显示轴线
//       axisTick: { show: false }, // 是否显示刻度
//       axisLabel: {
//         color: "#fff",
//       },
//     },
//     grid: {
//       top: "3%",
//       right: "4%",
//       bottom: "3%",
//       left: "3%",
//       containLabel: true,
//     },
//     series: [
//       {
//         type: "bar",
//         label: {
//           show: true,
//           position: "right",
//         },
//         data: [5, 20, 36, 10, 10, 20],
//         barWidth: 22,
//         roundCap: true,
//         showBackground: true,
//         backgroundStyle: {
//           color: "rgba(220, 220, 220, 0.3)",
//         },
//         itemStyle: {
//           borderWidth: 0,
//           borderRadius: [0, 10, 10, 0],
//           color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
//             {
//               offset: 0,
//               color: "#00fffb",
//             },
//             {
//               offset: 1,
//               color: "#0061ce",
//             },
//           ]),
//         },
//       },
//     ],
//   };

//   // 3.echarts实例调用setOption方法，传入option对象
//   chart.value!.setOption(option);
// };
</script>

<style lang="scss" scoped>
.screen-block {
  width: 100%;
  height: 460px;
  background-color: var(--ds-block-bg);
  padding: 16px;
  margin-top: 20px;
}
</style>
