<!-- 地图上的点位会出现偏移/点击位置不准 -->

<template>
  <div class="screen-container">
    <div class="control-panel">
      <h3>大屏缩放控制</h3>
      <button @click="scale -= 1">- 缩小</button>
      <span class="scale-value">{{ scale.toFixed(1) }}</span>
      <button @click="scale += 1">+ 放大</button>
      <p style="color: #ff4d4f">问题：缩放后百度地图点位偏移，点击位置不准</p>
    </div>

    <!-- 缩放容器 -->
    <div
      class="map-zoom-wrapper"
      :style="{
        transform: `scale(${scale})`,
        // transformOrigin: '0 0',
        width: `${baseWidth}px`,
        height: `${baseHeight}px`,
        position: 'relative',
      }"
      ref="zoomWrapper"
    >
      <!-- 百度地图容器 -->
      <div
        ref="mapContainer"
        class="map-container"
        :style="{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
        }"
      ></div>
    </div>

    <div class="log-panel">
      <h4>操作日志</h4>
      <ul>
        <li v-for="(log, i) in logs" :key="i" :class="{ error: log.error }">
          {{ log.msg }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";

// 基础配置
const baseWidth = 1920; // 设计稿宽度
const baseHeight = 1080; // 设计稿高度
const scale = ref(1); // 缩放比例
const mapContainer = ref(null);
const zoomWrapper = ref(null);
const logs = ref([]);
let map = null; // 百度地图实例
let markers = []; // 点位标记数组

// 初始点位数据（经纬度）
const points = ref([
  { name: "北京", lng: 116.404, lat: 39.915, id: 1 },
  { name: "上海", lng: 121.4737, lat: 31.2304, id: 2 },
  { name: "广州", lng: 113.2644, lat: 23.1291, id: 3 },
]);

// 记录日志
const addLog = (msg, error = false) => {
  logs.value.unshift({ msg, error });
  if (logs.value.length > 5) logs.value.pop();
};

// 初始化百度地图
const initBaiduMap = () => {
  // 加载百度地图API（需替换为自己的AK）
  const script = document.createElement("script");
  script.src = `https://api.map.baidu.com/api?v=3.0&ak=uj3wblA81cD47ZJh4k5WwL0BucjHitVX&callback=initMap`;
  document.head.appendChild(script);

  // 全局回调函数初始化地图
  window.initMap = () => {
    // 创建地图实例（中心点设为北京）
    map = new BMap.Map(mapContainer.value);
    const center = new BMap.Point(points.value[0].lng, points.value[0].lat);
    map.centerAndZoom(center, 5); // 缩放级别5（全国范围）
    map.enableScrollWheelZoom(false); // 禁用地图自带缩放

    // 添加初始点位
    points.value.forEach((point) => {
      addMarker(point);
    });

    // 绑定地图点击事件（未处理缩放，导致偏移）
    map.addEventListener("click", (e) => {
      // 问题核心：直接使用点击坐标，未考虑scale缩放影响
      const { lng, lat } = e.point;

      // 添加新点位（会偏移）
      const newPoint = {
        name: "新点",
        lng,
        lat,
        id: Date.now(),
      };
      points.value.push(newPoint);
      addMarker(newPoint);

      addLog(
        `缩放${scale.value}倍时添加点位，经纬度：(${lng.toFixed(
          6
        )}, ${lat.toFixed(6)})（可能偏移）`,
        true
      );
    });
    //   map.addEventListener("click", (e) => {
    //       // 获取缩放容器的缩放比例和位置信息
    //       const wrapper = zoomWrapper.value;
    //       const rect = wrapper.getBoundingClientRect(); // 缩放后的容器位置和尺寸
    //       const currentScale = scale.value;

    //       // 1. 将点击事件的屏幕坐标转换为相对于缩放容器的坐标（去除容器偏移）
    //       const clickX = e.clientX - rect.left;
    //       const clickY = e.clientY - rect.top;

    //       // 2. 校正坐标：除以缩放比例，得到原始容器中的像素坐标
    //       const originalX = clickX / currentScale;
    //       const originalY = clickY / currentScale;

    //       // 3. 将校正后的像素坐标转换为百度地图经纬度
    //       const originalPixel = new BMap.Pixel(originalX, originalY);
    //       const correctedPoint = map.pixelToPoint(originalPixel); // 校正后的经纬度
    //       const { lng, lat } = correctedPoint;

    //       // 添加新点位（此时无偏移）
    //       const newPoint = {
    //         name: "新点",
    //         lng,
    //         lat,
    //         id: Date.now(),
    //       };
    //       points.value.push(newPoint);
    //       addMarker(newPoint);

    //       addLog(
    //         `缩放${currentScale}倍时添加点位（已校正），经纬度：(${lng.toFixed(
    //           6
    //         )}, ${lat.toFixed(6)})`,
    //         false
    //       );
    //     });

    addLog("百度地图初始化完成，尝试缩放后点击地图添加点位");
  };
};

// 添加点位标记
const addMarker = (point) => {
  const marker = new BMap.Marker(new BMap.Point(point.lng, point.lat));
  map.addOverlay(marker);
  markers.push(marker);

  // 添加标签
  const label = new BMap.Label(point.name, { offset: new BMap.Size(20, -10) });
  marker.setLabel(label);

  // 点位点击事件（验证偏移）
  marker.addEventListener("click", () => {
    addLog(
      `点击点位：${point.name}，经纬度：(${point.lng.toFixed(
        6
      )}, ${point.lat.toFixed(6)})`
    );
  });
};

// 监听缩放变化（仅视觉缩放，不校正地图坐标）
watch(scale, async () => {
  await nextTick();
  if (map) {
    // 错误处理：仅通过CSS缩放容器，不通知百度地图
    addLog(`缩放至${scale.value}倍，未校正地图坐标`, true);
  }
});

onMounted(() => {
  initBaiduMap();
});
</script>

<style scoped>
.screen-container {
  width: 1000px;
  height: 700px;
  overflow: auto;
  background: #0a0f25;
  color: #fff;
  padding: 20px;
  box-sizing: border-box;
}

.control-panel {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 8px;
}

button {
  padding: 5px 10px;
  margin: 0 5px;
  cursor: pointer;
  background: #2a79d8;
  border: none;
  color: white;
  border-radius: 4px;
}

.scale-value {
  display: inline-block;
  width: 40px;
  text-align: center;
  font-size: 16px;
}

.map-zoom-wrapper {
  transition: transform 0.3s ease;
  /*  margin: 20px auto;  */
  position: absolute;
  left: 20px;
}

.map-container {
  background: #e8e8e8;
}

.log-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  max-height: 200px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
}

.log-panel .error {
  color: #ff4d4f;
}
</style>
