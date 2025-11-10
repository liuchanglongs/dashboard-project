## 自适应封装

### 组合式函数封装

```typescript
import { ref, onMounted, onBeforeUnmount } from "vue";

// 默认适配宽高
export const width = 1920;
export const height = 1080;

type ResizeType = {
  w?: number;
  h?: number;
  fullScreen?: boolean;
  delay?: number;
};

export const useResize = (options: ResizeType = {}) => {
  const { w = width, h = height, fullScreen = false, delay = 100 } = options;
  // 缩放元素
  const screenRef = ref();
  const scale = ref(1);
  function resize() {
    // 浏览器宽高
    const clientWidth = document.body.clientWidth;
    const clientHeight = document.body.clientHeight;

    // 计算宽高缩放比例
    const scaleW = clientWidth / w;
    const scaleH = clientHeight / h;

    if (clientWidth / clientHeight > w / h) {
      // 如果浏览器的宽高比大于设计稿的宽高比，就取浏览器高度和设计稿高度之比
      scale.value = scaleH;
    } else {
      // 如果浏览器的宽高比小于设计稿的宽高比，就取浏览器宽度和设计稿宽度之比
      scale.value = scaleW;
    }

    if (fullScreen) {
      // 如果不在乎缩放失真的情况，可以设置全屏
      screenRef.value.style.transform = `scale(${scaleW}, ${scaleH})`;
    } else {
      // 否则选择适配比例缩放
      screenRef.value.style.transform = "scale(" + scale.value + ")";

      // 默认是左上角，计算居中(也可以外部设置css处理居中)
      // screenRef.value.style.left = (clientWidth - w * scale.value) / 2 + "px";
      // screenRef.value.style.top = (clientHeight - h * scale.value) / 2 + "px";

    }


  }

  const resizeDelay = debounce(resize, delay);
  onMounted(() => {
    if (screenRef.value) {
      resize();
      window.addEventListener("resize", resizeDelay);
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeDelay);
  });

  return {
    scale,
    screenRef,
  };
};

/**
 * 防抖函数
 * @param {Function} fn
 * @param {number} delay
 * @returns {() => void}
 */
function debounce(fn: Function, delay: number): () => void {
  let timer: NodeJS.Timeout;
  return function (...args: any[]): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(
      () => {
        typeof fn === "function" && fn.apply(null, args);
        clearTimeout(timer);
      },
      delay > 0 ? delay : 100
    );
  };
}

```

### 组件封装

```typescript
import {
  type CSSProperties,
  defineComponent,
  h,
  nextTick,
  onMounted,
  onUnmounted,
  type PropType,
  reactive,
  onActivated,
  ref,
} from "vue";

/**
 * 防抖函数
 * @param {Function} fn
 * @param {number} delay
 * @returns {() => void}
 */
function debounce(fn: Function, delay: number): () => void {
  let timer: NodeJS.Timeout;
  return function (...args: any[]): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(
      () => {
        typeof fn === "function" && fn.apply(null, args);
        clearTimeout(timer);
      },
      delay > 0 ? delay : 100
    );
  };
}

interface IState {
  originalWidth: string | number; // 原始设计稿宽度
  originalHeight: string | number; // 原始设计稿高度
  width?: string | number; // 当前计算宽度
  height?: string | number; // 当前计算高度
  observer: null | MutationObserver; // DOM变化观察器
}

type IAutoScale = // 缩放方向配置

    | boolean // 是否启用自动缩放
    | {
        x?: boolean; // X轴缩放
        y?: boolean; // Y轴缩放
      };

export default defineComponent({
  name: "ScaleScreen",
  props: {
    width: {
      // 设计稿基准宽度
      type: [String, Number],
      default: 1920,
    },
    height: {
      // 设计稿基准高度
      type: [String, Number],
      default: 1080,
    },
    fullScreen: {
      // 是否全屏拉伸
      type: Boolean,
      default: false,
    },
    autoScale: {
      // 缩放方向配置
      type: [Object, Boolean] as PropType<IAutoScale>,
      default: true,
    },
    delay: {
      // 防抖延迟时间
      type: Number,
      default: 500,
    },
    boxStyle: {
      // 外层容器样式
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    wrapperStyle: {
      // 内容包裹层样式
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    bodyOverflowHidden: {
      // 是否隐藏页面滚动条
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    let bodyOverflowHidden: string;
    const state = reactive<IState>({
      width: 0, // 当前宽度
      height: 0, // 当前高度
      originalWidth: 0, // 原始宽度
      originalHeight: 0, // 原始高度
      observer: null, // MutationObserver实例
    });

    // 基础样式配置
    const styles: Record<string, CSSProperties> = {
      box: {
        // 外层容器样式
        overflow: "hidden",
        backgroundSize: `100% 100%`,
        backgroundColor: `#000`,
        width: `100vw`,
        height: `100vh`,
      },
      wrapper: {
        // 内容包裹层样式
        transition: `all 500ms cubic-bezier(0.4, 0, 0.2, 1)`,
        position: `relative`,
        overflow: `hidden`,
        zIndex: 100,
        transformOrigin: `left top`,
      },
    };

    const el = ref<HTMLElement>();
    /**
     * 初始化大屏容器宽高
     */
    const initSize = () => {
      return new Promise<void>((resolve) => {
        nextTick(() => {
          // region 获取大屏真实尺寸
          if (props.width && props.height) {
            state.width = props.width;
            state.height = props.height;
          } else {
            state.width = el.value?.clientWidth;
            state.height = el.value?.clientHeight;
          }
          // endregion

          // region 获取画布尺寸
          if (!state.originalHeight || !state.originalWidth) {
            state.originalWidth = window.screen.width;
            state.originalHeight = window.screen.height;
          }
          // endregion
          resolve();
        });
      });
    };

    /** 初始化body样式 */
    function initBodyStyle() {
      if (props.bodyOverflowHidden) {
        bodyOverflowHidden = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
    }

    /** 更新容器尺寸 */
    const updateSize = () => {
      if (state.width && state.height) {
        el.value!.style.width = `${state.width}px`;
        el.value!.style.height = `${state.height}px`;
      } else {
        el.value!.style.width = `${state.originalWidth}px`;
        el.value!.style.height = `${state.originalHeight}px`;
      }
    };

    /** 应用缩放变换 */
    const autoScale = (scale: number) => {
      if (!props.autoScale) return;
      const domWidth = el.value!.clientWidth;
      const domHeight = el.value!.clientHeight;
      const currentWidth = document.body.clientWidth;
      const currentHeight = document.body.clientHeight;
      el.value!.style.transform = `scale(${scale},${scale})`;
      // 计算居中偏移量
      let mx = Math.max((currentWidth - domWidth * scale) / 2, 0);
      let my = Math.max((currentHeight - domHeight * scale) / 2, 0);
      // 处理方向锁定
      if (typeof props.autoScale === "object") {
        !props.autoScale.x && (mx = 0);
        !props.autoScale.y && (my = 0);
      }
      el.value!.style.margin = `${my}px ${mx}px`;
    };

    /** 计算并更新缩放比例 */
    const updateScale = () => {
      // 获取真实视口尺寸
      const currentWidth = document.body.clientWidth;
      const currentHeight = document.body.clientHeight;
      // 获取大屏最终的宽高
      const realWidth = state.width || state.originalWidth;
      const realHeight = state.height || state.originalHeight;
      // 计算缩放比例
      const widthScale = currentWidth / +realWidth;
      const heightScale = currentHeight / +realHeight;
      // 若要铺满全屏，则按照各自比例缩放
      if (props.fullScreen) {
        el.value!.style.transform = `scale(${widthScale},${heightScale})`;
        return false;
      }
      // 按照宽高最小比例进行缩放
      const scale = Math.min(widthScale, heightScale);
      autoScale(scale);
    };

    /** 防抖处理的重置函数 */
    const onResize = debounce(async () => {
      await initSize();
      updateSize();
      updateScale();
    }, props.delay);

    /** 初始化DOM变化观察器 */
    const initMutationObserver = () => {
      const observer = (state.observer = new MutationObserver(() => {
        onResize();
      }));
      observer.observe(el.value!, {
        attributes: true,
        attributeFilter: ["style"],
        attributeOldValue: true,
      });
    };
    onMounted(() => {
      initBodyStyle();
      nextTick(async () => {
        await initSize();
        updateSize();
        updateScale();
        window.addEventListener("resize", onResize);
        initMutationObserver();
      });
    });
    onUnmounted(() => {
      window.removeEventListener("resize", onResize);
      state.observer?.disconnect();
      if (props.bodyOverflowHidden) {
        document.body.style.overflow = bodyOverflowHidden;
      }
    });
    onActivated(updateScale);

    /** 渲染函数 */
    return () => {
      return h(
        "div",
        {
          className: "v-screen-box",
          style: { ...styles.box, ...props.boxStyle },
        },
        [
          h(
            "div",
            {
              className: "screen-wrapper",
              style: { ...styles.wrapper, ...props.wrapperStyle },
              ref: el,
            },
            slots.default?.()
          ),
        ]
      );
    };
  },
});

```

为了方便调用，创建index.ts

```typescript
import ScaleScreen from './scale-screen'

export default ScaleScreen
```

### 全局运用

```vue
<script setup lang="ts">
// import { useResize } from '@/utils/useResize'
// const { screenRef } = useResize()

import ScaleScreen from './components/scale-screen';
</script>

<template>
  <!-- composables -->
  <!-- <div class="screen-container">
    <div ref="screenRef" class="screen-wrapper">
      <img src="./assets/img.png" alt="" />
    </div>
  </div> -->

  <ScaleScreen>
    <img src="./assets/img.png" alt="" />
  </ScaleScreen>
</template>

<style lang='scss' scoped>
.screen-container{
  overflow: hidden;
  background-size: 100% 100%;
  background-color: #000;
  width: 100vw;
  height: 100vh
}
.screen-wrapper{
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 500ms;
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
  z-index: 100;
  transform-origin: left top;
}
</style>

```

## 布局处理

**app.vue**

```vue
<template>
  <div class="screen-app">
    <RouterView></RouterView>
  </div>
</template>

<style lang='scss' scoped>
.screen-app{
  width: 100%;
  height: 100%;
}
</style>

```

**路由处理：**

```typescript
import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import Screen from "@/views/screen/index.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/screen",
  },
  {
    path: "/screen",
    component: Screen,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

```

**大屏首页：**

```vue
<template>
  <ScaleScreen>
    <div class="screen">
      <!-- 头 -->
      <Header />
      <div class="screen-main">
        <!-- 左 -->
        <div class="screen-left"></div>
        <!-- 中 -->
        <div class="screen-center"></div>
        <!-- 右 -->
        <div class="screen-right"></div>
      </div>
    </div>
  </ScaleScreen>
</template>

<script setup lang="ts">
import ScaleScreen from "@/components/scale-screen";
</script>

<style lang="scss" scoped>
.screen {
  --ds-screen-width: 1920px;
  --ds-screen-height: 1080px;
  --ds-header-height: 72px;
  --ds-block-bg: #222733;
  --ds-screen-bg: rgb(22, 21, 34);
  --ds-screen-text-color: #fff;
  position: absolute;
  padding: 0 20px;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
</style>

```

**Header.vue**

```vue
<template>
  <div class="screen-header">
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
.screen-header{
  position: relative;
	width: 100%;
	height: var(--ds-header-height);
  background-size: 100% 100%;
}
</style>
```



## echarts快速上手

如果你对echarts还不熟悉，官网的[快速上手](https://echarts.apache.org/handbook/zh/get-started)能让你快速的了解echarts，其实基本所有的echarts处理都能简单的分解为三步：

1. 获取DOM实例，通过`echarts.init()`方法，生成`echarts`实例
2. 配置`options`对象，该对象决定着`echarts`的显示样式
3. 通过`echarts`实例的`setOption`方法，设置配置对象

### 柱状图

```typescript
<template>
  <div class="screen-block">
    <Title>销售统计</Title>
    <div ref="chartRef" style="width: 100%; height: 90%"></div>
  </div>
</template>

<script setup lang="ts">
import type { ECharts, EChartsCoreOption } from "echarts";
import * as echarts from "echarts";
import { shallowRef, onMounted } from "vue";
import Title from "../Title.vue";

// 1.初始化实例
const chartRef = shallowRef<HTMLElement | null>(null);
const chart = shallowRef<ECharts | null>(null);

onMounted(() => {
  chart.value = echarts.init(chartRef.value!);
  renderChart();
});
// 2.构建option配置对象
const renderChart = () => {
  const option: EChartsCoreOption = {
    // title: { // 丑，不如自己做一个头部
    //   text: "销售统计",
    //   textStyle: {
    //     color: "#fff",
    //   },
    // },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        z: 0,
        lineStyle: {
          color: "#2D3443",
        },
      },
    },
    legend: {
      data: [
        {
          name: "销量",
          icon: "circle",
          textStyle: {
            color: "#fff",
          },
        },
      ],
    },
    // x轴 展示数据
    xAxis: {
      splitLine: { show: false }, // 是否显示网格线
      axisLine: { show: true }, // 是否显示轴线
      type: "value", // 作为数据展示
      max: function (value: any) {
        return parseInt(value.max * 1.2 + "");
      }, // 最大值控制
    },
    yAxis: {
      type: "category",
      data: ["商家1", "商家2", "商家3", "商家4", "商家5", "商家6"],
      inverse: true, // y轴反向
      axisLine: {
        show: true, // 是否显示轴线
      },
      axisTick: {
        show: false, // 是否显示刻度
      },
      axisLabel: {
        color: "#fff", // 字体颜色
      },
    },
    // 图标绘制位置
    grid: {
      top: "3%",
      right: "4%",
      bottom: "3%",
      left: "3%",
      containLabel: true,
    },
    series: [
      // {
      //   type: "bar",
      //   label: {
      //     show: true,
      //     position: "right",
      //   },
      //   data: [5, 20, 36, 10, 10, 20],
      //   barWidth: 22,
      //   roundCap: true,
      //   showBackground: true, // 是否显示背景
      //   backgroundStyle: {
      //     color: "rgba(220, 220, 220, 0.3)", // 柱状图背景
      //   },
      //   itemStyle: {
      //     borderWidth: 0,
      //     borderRadius: [0, 11, 11, 0],
      //     color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
      //       {
      //         offset: 0,
      //         color: "#5052EE",
      //       },
      //       {
      //         offset: 1,
      //         color: "#AB6EE5",
      //       },
      //     ]),
      //   },
      // },
      {
        name: "销量",
        type: "bar",
        data: [5, 20, 36, 10, 10, 20],
        showBackground: true, // 是否显示背景
        backgroundStyle: {
          color: "rgba(220, 220, 220, 0.3)", // 柱状图背景
        },
        itemStyle: {
          color: "#f00", // 柱状图颜色
          barBorderRadius: 5, // 柱状图圆角
          shadowColor: "rgba(0, 0, 0, 0.5)", // 阴影颜色
          shadowBlur: 10, // 阴影模糊度
        },
        barWidth: 10, // 柱状图宽度
        label: {
          show: true, // 是否显示标签
          position: "right", // 标签位置
          textStyle: {
            color: "#fff", // 标签颜色
          },
        },
      },
    ],
  };
  // 3.实例.setOption(option)
  chart.value!.setOption(option);
};
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
```

**Title组件：**

```vue
<template>
  <h3 class="screen-title">
    <slot>
      {{ title }}
    </slot>
  </h3>
</template>

<script setup lang="ts">
defineProps({
  title: String,
});
</script>

<style lang="scss" scoped>
.screen-title {
  position: relative;
  padding-left: 20px;
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 100%;
    background-color: var(--ds-screen-text-color);
  }
}
</style>
```

### 折线图

```typescript
<template>
  <div class="screen-block">
    <Title>地区销量趋势</Title>
    <div ref="chartRef" style="width: 100%; height: 90%"></div>
  </div>
</template>

<script setup lang="ts">
import type { ECharts, EChartsCoreOption } from "echarts";
import * as echarts from "echarts";
import Title from "../Title.vue";
import { shallowRef, onMounted } from "vue";

// 1.初始化实例
const chartRef = shallowRef<HTMLElement | null>(null);
const chart = shallowRef<ECharts | null>(null);

onMounted(() => {
  chart.value = echarts.init(chartRef.value!);
  renderChart();
});
const data = [
  {
    name: "上海",
    data: [
      "155.13",
      "154.65",
      "171.46",
      "164.38",
      "237.23",
      "300.65",
      "240.29",
      "232.07",
      "193.31",
      "136.70",
      "48.64",
      "90.20",
    ],
  },
  {
    name: "北京",
    data: [
      "86.25",
      "33.80",
      "145.58",
      "21.79",
      "176.09",
      "132.41",
      "291.05",
      "191.89",
      "151.54",
      "94.25",
      "141.75",
      "157.14",
    ],
  },
  {
    name: "深圳",
    data: [
      "143.94",
      "186.29",
      "183.64",
      "251.48",
      "195.48",
      "152.16",
      "52.47",
      "184.12",
      "203.79",
      "39.16",
      "56.37",
      "161.64",
    ],
  },
  {
    name: "广州",
    data: [
      "57.60",
      "77.61",
      "307.24",
      "165.05",
      "175.41",
      "276.88",
      "269.04",
      "296.11",
      "105.31",
      "283.39",
      "134.08",
      "265.38",
    ],
  },
  {
    name: "重庆",
    data: [
      "200.82",
      "215.56",
      "249.80",
      "222.67",
      "216.98",
      "60.12",
      "309.68",
      "273.35",
      "150.99",
      "251.97",
      "26.15",
      "186.99",
    ],
  },
];
// 2.构建option配置对象
const renderChart = () => {
  const option: EChartsCoreOption = {
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
      data: data.map((item) => item.name),
      textStyle: {
        color: "#aaa",
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
    },
    yAxis: {
      type: "value",
    },
    series: getSeries(),
  };
  // 3.实例.setOption(option)
  chart.value!.setOption(option);
};

function getSeries() {
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

  const seriesArr = data.map((item, index) => {
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

<style scoped>
.screen-block {
  width: 100%;
  height: 550px;
  background-color: var(--ds-block-bg);
  padding: 16px;
  margin-top: 20px;
}
</style>
```

## echarts封装

### Chart组件封装

```typescript
<template>
	<div ref="chartRef" style="width: 100%; height: 100%;"></div>
</template>

<script setup lang="ts">
import { shallowRef, watch, type PropType, onMounted } from "vue" 
import * as echarts from 'echarts'
import type { ECharts, EChartsCoreOption } from 'echarts'

const props = defineProps({
	option: {
		type: Object as PropType<EChartsCoreOption>,
		required: true,
		default: () => ({})
	},
	loading: Boolean
})

// 1.初始化实例
const chartRef = shallowRef<HTMLElement | null>(null);
const chart = shallowRef<ECharts | null>(null);

function init() {
	if (props.option) {
		chart.value = echarts.init(chartRef.value!)
		setOption(props.option)
	}
}
function setOption(option: any, notMerge?: boolean, lazyUpdate?: boolean) {
	chart.value!.setOption(option, notMerge, lazyUpdate)
}

onMounted(() => {
  init()
});

function resize() {
	chart.value!.resize()
}

watch(() => props.option, () => {
	setOption(props.option)
})

defineExpose({
	chart,
	setOption,
	resize
})
</script>

<style scoped>
</style>
```

### 按需导入echarts处理

echarts包含的内容很多，我们没有必要完全引入，可以按需引入的接口来打包必须的组件

```typescript
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from 'echarts/core';
// 引入柱状图图表，图表后缀都为 Chart
import { BarChart } from 'echarts/charts';
// 引入标题，提示框，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components';
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers';

import Chart from './Chart.vue'
import type { App } from 'vue'

// 作为插件，方便全局引入
export const install = (app: App) => {
	app.component('v-chart', Chart)
}

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

export default {
	install
}
```

在**main.ts**中进行引入：

```typescript
import { createApp } from 'vue'
import '@/assets/css/index.scss'
import App from './App.vue'
import router from '@/router'
import chart from '@/components/chart'

createApp(App).use(router).use(chart).mount('#app')
```

## 封装处理

我们封装了**Chart**组件，那么之前的代码，我们就可以进行改写，并且，整个布局分成了左中右，那么我们可以把先把左边进行统一处理

### 左边首页

```vue
<template>
  <div>
    <component
      v-for="item in components"
      :key="item.name"
      :is="item.component"
      class="screen-left-item"
      :name="item.name"
    >
    </component>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from "vue";

import Left1 from "./Left1.vue";
import Left2 from "./Left2.vue";
const components = shallowRef([
  { name: "left1", component: Left1 },
  { name: "left2", component: Left2 },
]);
</script>

<style lang="scss" scoped>
.screen-left-item {
  width: 100%;
  height: 430px;
  background-color: var(--ds-block-bg);
  padding: 16px;
  animation-name: slide;

  & + & {
    margin-top: 20px;
  }
  &[name="left1"] {
    animation-duration: 0.8s;
  }
  &[name="left2"] {
    height: 550px;
    animation-duration: 1.5s;
  }
}

@keyframes slide {
  0% {
    transform: translateX(-100%);
  }
  80% {
    transform: translateX(20px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
```

### 柱状图的options处理

```typescript
<template>
  <div class="screen-block">
    <Title>销售统计</Title>
    <div style="width: 100%; height: 90%">
      <v-chart :option="option" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Title from "../Title.vue";
import * as echarts from "echarts";

const data = [
  {
    name: "商家1",
    value: 99,
  },
  {
    name: "商家2",
    value: 102,
  },
  {
    name: "商家3",
    value: 83,
  },
  {
    name: "商家4",
    value: 49,
  },
  {
    name: "商家5",
    value: 200,
  },
];

const option = ref({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "line",
      z: 0,
      lineStyle: {
        color: "#2D3443",
      },
    },
  },
  // x轴 展示数据
  xAxis: {
    splitLine: { show: false }, // 是否显示网格线
    axisLine: { show: true }, // 是否显示轴线
    type: "value", // 作为数据展示
    max: function (value: any) {
      return parseInt(value.max * 1.2 + "");
    }, // 最大值控制
  },
  yAxis: {
    type: "category",
    data: data.map((item) => item.name),
    inverse: true, // y轴反向
    axisLine: {
      show: true, // 是否显示轴线
    },
    axisTick: {
      show: false, // 是否显示刻度
    },
    axisLabel: {
      color: "#fff", // 字体颜色
    },
  },
  // 图标绘制位置
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
      showBackground: true, // 是否显示背景
      backgroundStyle: {
        color: "rgba(220, 220, 220, 0.3)", // 柱状图背景
      },
      itemStyle: {
        borderWidth: 0,
        borderRadius: [0, 11, 11, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          {
            offset: 0,
            color: "#5052EE",
          },
          {
            offset: 1,
            color: "#AB6EE5",
          },
        ]),
      },
    },
  ],
});
</script>

<style lang="scss" scoped>
.screen-block {
  width: 100%;
  height: 100%;
}
</style>

```

### 折线图处理

```vue
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
const data = [
  {
    name: "上海",
    data: [
      "155.13",
      "154.65",
      "171.46",
      "164.38",
      "237.23",
      "300.65",
      "240.29",
      "232.07",
      "193.31",
      "136.70",
      "48.64",
      "90.20",
    ],
  },
  {
    name: "北京",
    data: [
      "86.25",
      "33.80",
      "145.58",
      "21.79",
      "176.09",
      "132.41",
      "291.05",
      "191.89",
      "151.54",
      "94.25",
      "141.75",
      "157.14",
    ],
  },
  {
    name: "深圳",
    data: [
      "143.94",
      "186.29",
      "183.64",
      "251.48",
      "195.48",
      "152.16",
      "52.47",
      "184.12",
      "203.79",
      "39.16",
      "56.37",
      "161.64",
    ],
  },
  {
    name: "广州",
    data: [
      "143.94",
      "186.29",
      "183.64",
      "251.48",
      "195.48",
      "152.16",
      "52.47",
      "184.12",
      "203.79",
      "39.16",
      "56.37",
      "161.64",
    ],
  },
  {
    name: "杭州",
    data: [
      "143.94",
      "186.29",
      "183.64",
      "251.48",
      "195.48",
      "152.16",
      "52.47",
      "184.12",
      "203.79",
      "39.16",
      "56.37",
      "161.64",
    ],
  },
]
const option = ref({
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
      data: data.map((item) => item.name),
      textStyle: {
        color: "#aaa",
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
    },
    yAxis: {
      type: "value",
    },
    series: getSeries(),
});

function getSeries() {
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

  const seriesArr = data.map((item, index) => {
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
```

## 远程数据读取

```vue
<template>
  <div class="screen-block">
    <Title>销售统计</Title>
    <div style="width: 100%; height: 90%">
      <v-chart :option="option" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Title from "../Title.vue";
import * as echarts from "echarts";

import { getSalesList } from "@/api/modules/sales";
import type { Sales } from "@/api/interface";

const option = ref({});

const state = ref<Sales[]>([]);

const getData = () => {
  getSalesList().then((res) => {
    if (res.code === 200) { 
      state.value = res.data!;
      setOption();
    }
  });
};

onMounted(() => {
  getData();
});

const setOption = () => {
  option.value = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        z: 0,
        lineStyle: {
          color: "#2D3443",
        },
      },
    },
    // x轴 展示数据
    xAxis: {
      splitLine: { show: false }, // 是否显示网格线
      axisLine: { show: true }, // 是否显示轴线
      type: "value", // 作为数据展示
      max: function (value: any) {
        return parseInt(value.max * 1.2 + "");
      }, // 最大值控制
    },
    yAxis: {
      type: "category",
      data: state.value.map((item) => item.name),
      inverse: true, // y轴反向
      axisLine: {
        show: true, // 是否显示轴线
      },
      axisTick: {
        show: false, // 是否显示刻度
      },
      axisLabel: {
        color: "#fff", // 字体颜色
      },
    },
    // 图标绘制位置
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
        data: state.value.map((item) => item.value),
        barWidth: 22,
        roundCap: true,
        showBackground: true, // 是否显示背景
        backgroundStyle: {
          color: "rgba(220, 220, 220, 0.3)", // 柱状图背景
        },
        itemStyle: {
          borderWidth: 0,
          borderRadius: [0, 11, 11, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            {
              offset: 0,
              color: "#5052EE",
            },
            {
              offset: 1,
              color: "#AB6EE5",
            },
          ]),
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

```

### 数据读取的封装

**useAsync.ts**

```typescript
import type { Ref } from 'vue'
import { ref, shallowRef, unref, watchEffect } from 'vue'

interface UseAsyncOptions<T, Params extends any[]> {
  /**
   * 是否立即执行请求
   * @default true
   */
  immediate?: boolean
  
  /**
   * 是否使用浅层响应式数据
   * @default false
   */
  shallow?: boolean
  
  /**
   * 请求参数
   */
  params?: Params
  
  /**
   * 错误处理回调
   */
  onError?: (error: unknown) => void
  
  /**
   * 成功处理回调
   */
  onSuccess?: (data: T) => void
  
  /**
   * 请求前处理
   */
  onBefore?: () => void
}

interface UseAsyncReturn<T, Params extends any[]> {
  /**
   * 响应式数据
   */
  data: Ref<T | undefined>
  
  /**
   * 加载状态
   */
  loading: Ref<boolean>
  
  /**
   * 错误信息
   */
  error: Ref<unknown>
  
  /**
   * 手动触发请求
   */
  execute: (...params: Params) => Promise<T | undefined>
  
  /**
   * 刷新数据 (使用上次参数)
   */
  refresh: () => Promise<T | undefined>
}

/**
 * 通用异步请求组合式函数
 * @param fn 异步请求函数
 * @param options 配置选项
 */
export function useAsync<T, Params extends any[] = []>(
  fn: (...args: Params) => Promise<T>,
  options: UseAsyncOptions<T, Params> = {}
): UseAsyncReturn<T, Params> {
  const {
    immediate = true,
    shallow = false,
    params = [] as unknown as Params,
    onError,
    onSuccess,
    onBefore
  } = options

  // 响应式状态
  const data = shallow ? shallowRef<T>() : ref<T>()
  const loading = ref(false)
  const error = ref<unknown>()
  const lastParams = ref<Params>(params)

  // 核心请求方法
  const execute = async (...args: Params): Promise<T | undefined> => {
    try {
      loading.value = true
      error.value = undefined
      onBefore?.()
      
      const response = await fn(...args)
      data.value = response
      lastParams.value = args
      
      onSuccess?.(response)
      return response
    } catch (err) {
      error.value = err
      onError?.(err)
      return undefined
    } finally {
      loading.value = false
    }
  }

  // 使用上次参数重新请求
  const refresh = () => execute(...unref(lastParams))

  // 自动执行逻辑
  if (immediate) {
    watchEffect(() => {
      if (params) {
        execute(...unref(params))
      }
    })
  }

  return {
    data,
    loading,
    error,
    execute,
    refresh
  }
}
```

**界面使用**

```vue
<template>
  <div class="screen-block">
    <Title>销售统计</Title>
    <div style="width: 100%; height: 90%">
      <v-chart :option="option" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Title from "../Title.vue";
import * as echarts from "echarts";

import { getSalesList } from "@/api/modules/sales";
import type { Sales } from "@/api/interface";

import { useAsync } from '@/composables/useAsync'

const option = ref({});

const { data:state } = useAsync(getSalesList, {
  onSuccess: (data) => {
    console.log('销售数据加载成功:', data)
    if(data.code === 200) {
      setOption(data.data!)
    }
  },
  onError: (err) => {
    console.error('销售数据加载失败:', err)
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
          color: "#2D3443",
        },
      },
    },
    // x轴 展示数据
    xAxis: {
      splitLine: { show: false }, // 是否显示网格线
      axisLine: { show: true }, // 是否显示轴线
      type: "value", // 作为数据展示
      max: function (value: any) {
        return parseInt(value.max * 1.2 + "");
      }, // 最大值控制
    },
    yAxis: {
      type: "category",
      data: state.map((item) => item.name),
      inverse: true, // y轴反向
      axisLine: {
        show: true, // 是否显示轴线
      },
      axisTick: {
        show: false, // 是否显示刻度
      },
      axisLabel: {
        color: "#fff", // 字体颜色
      },
    },
    // 图标绘制位置
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
        showBackground: true, // 是否显示背景
        backgroundStyle: {
          color: "rgba(220, 220, 220, 0.3)", // 柱状图背景
        },
        itemStyle: {
          borderWidth: 0,
          borderRadius: [0, 11, 11, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            {
              offset: 0,
              color: "#5052EE",
            },
            {
              offset: 1,
              color: "#AB6EE5",
            },
          ]),
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

```



### **附录：useAsync使用示例**

#### **基础用法：获取销售数据**

```typescript
// 在组件中
import { useAsync } from '@/composables/useAsync'
import { getSalesList } from '@/api/sales'

const {
  data: salesData,
  loading: salesLoading,
  refresh: reloadSales
} = useAsync(getSalesList, {
  onSuccess: (data) => {
    console.log('销售数据加载成功:', data)
  },
  onError: (err) => {
    console.error('销售数据加载失败:', err)
  }
})
```

#### **带参数的请求：获取用户详情**

```typescript
import { getUserDetail } from '@/api/user'

const userId = ref('123')

const {
  data: userDetail,
  execute: fetchUser
} = useAsync(
  (id: string) => getUserDetail(id),
  {
    immediate: false, // 不自动执行
    params: [userId.value] as [string] // 初始参数
  }
)

// 手动触发请求
const loadUserData = () => {
  fetchUser('456').then(data => {
    if (data) {
      // 处理数据
    }
  })
}
```

#### **表格分页请求**

```typescript
interface QueryParams {
  page: number
  pageSize: number
  keyword?: string
}

const queryParams = reactive<QueryParams>({
  page: 1,
  pageSize: 10
})

const {
  data: tableData,
  loading: tableLoading,
  refresh: reloadTable
} = useAsync(
  (params: QueryParams) => getTableList(params),
  {
    params: [queryParams] as [QueryParams],
    onSuccess: (data) => {
      console.log('表格数据更新:', data)
    }
  }
)

// 翻页时自动触发
watch(() => queryParams.page, () => reloadTable())
```

## 头部处理

### 基本样式

```vue
<template>
  <div class="screen-header">
    <h1 class="screen-logo">
      <span>duyi Screen</span>
    </h1>
    <div class="screen-header-title">Title</div>
    <div class="screen-header-right">
      <img class="theme-change" :src="switch_light" @click="handleChangeTheme" />
      <span class="datetime">2025-01-01</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import switch_dark from "@/assets/img/switch_dark.png";
import switch_light from "@/assets/img/switch_light.png";
</script>

<style lang="scss" scoped>
.screen-header {
  position: relative;
  width: 100%;
  height: var(--ds-header-height);
  background-size: 100% 100%;
  animation: fade 3s;
  &-title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 487px;
    height: var(--ds-header-height);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    font-weight: 500;
    letter-spacing: 7px;
    text-shadow: 0px 2px 20px rgba(222, 171, 155, 0.6);
  }
  .screen-logo {
    display: flex;
    align-items: center;
    height: calc(var(--ds-header-height) - 20px);
  }
  &-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
    img {
      width: 30px;
      margin-right: 16px;
      cursor: pointer;
      transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      &:hover {
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

```

### 时间处理

**安装dayjs：**

```shell
pnpm add dayjs
```

代码：

```typescript
<template>
  <div class="screen-header">
    //...
    <div class="screen-header-right">
      //...
      <span class="datetime">{{ currentTime }}</span>
    </div>
  </div>
</template>

import dayjs from "dayjs";
// 时间处理
const currentTime = ref("");
const timeId = ref();
function startTime() {
  timeId.value = setTimeout(() => {
    currentTime.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
    startTime();
  }, 1000);
}
onBeforeUnmount(() => {
  clearTimeout(timeId.value);
});
```

### 主题切换

通过仓库进行处理，首先安装仓库

```shell
pnpm add pinia
```

仓库处理

**screen.ts**

```typescript
import { defineStore } from "pinia";

interface ScreenState {
  title: string;
  theme: "dark" | "light";
}

export const useScreenStore = defineStore("screen", {
  state: (): ScreenState => {
    return {
      title: "大屏可视化",
      theme: "dark",
    };
  },
});

```

**index.ts**

```typescript
import { type App } from "vue";
import { createPinia } from "pinia";

export * from "./screen";

const pinia = createPinia();
export default pinia;
```

在main.ts中调用

```typescript
import { createApp } from "vue";
import "@/assets/css/index.scss";
import App from "./App.vue";
import router from "@/router";
import chart from "@/components/chart";
import pinia from '@/store'

createApp(App).use(router).use(pinia).use(chart).mount("#app");
```

在Header.vue中处理

```typescript
<template>
  <div class="screen-header">
    <h1 class="screen-logo">
      <span>duyi Screen</span>
    </h1>
    <div class="screen-header-title">{{screenStore.title}}</div>
    <div class="screen-header-right">
      <img class="theme-change" :src="icon" @click="handleChangeTheme" />
      <span class="datetime">{{ currentTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, computed } from "vue";
import switch_dark from "@/assets/img/switch_dark.png";
import switch_light from "@/assets/img/switch_light.png";
import dayjs from "dayjs";
import { useScreenStore } from "@/store";
const screenStore = useScreenStore();

const icon = computed(() => screenStore.theme === 'dark' ? switch_light : switch_dark)

function handleChangeTheme() {
  screenStore.$patch({
    theme: screenStore.theme === "dark" ? "light" : "dark",
  });
}

// 时间处理
const currentTime = ref("");
const timeId = ref();
function startTime() {
  timeId.value = setTimeout(() => {
    currentTime.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
    startTime();
  }, 1000);
}
onBeforeUnmount(() => {
  clearTimeout(timeId.value);
});

startTime();
</script>

<style lang="scss" scoped>
.screen-header {
  position: relative;
  width: 100%;
  height: var(--ds-header-height);
  background-size: 100% 100%;
  animation: fade 3s;
  &-title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 487px;
    height: var(--ds-header-height);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    font-weight: 500;
    letter-spacing: 7px;
    text-shadow: 0px 2px 20px rgba(222, 171, 155, 0.6);
  }
  .screen-logo {
    display: flex;
    align-items: center;
    height: calc(var(--ds-header-height) - 20px);
  }
  &-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
    img {
      width: 30px;
      margin-right: 16px;
      cursor: pointer;
      transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      &:hover {
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
```

在大屏首页index.vue中进行处理

```typescript
<template>
  <ScaleScreen>
    <div :class="['screen', screenStore.theme]">
      //...
    </div>
  </ScaleScreen>
</template>

<script setup lang="ts">
import ScaleScreen from "@/components/scale-screen";
// ...
import { useScreenStore } from "@/store";
const screenStore = useScreenStore();

</script>

<style lang="scss" scoped>

.light {
  --ds-screen-bg: rgb(238, 238, 238);
  --ds-block-bg: #fff;
  --ds-screen-text-color: rgb(22, 21, 34);
}
</style>

```

