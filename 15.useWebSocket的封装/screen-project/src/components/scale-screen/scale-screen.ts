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
     * 初始化容器尺寸（异步）
     * 优先使用props传入的宽高，否则获取DOM实际尺寸
     */
    const initSize = () => {
      return new Promise<void>((resolve) => {
        // 等待DOM更新，nextTick 能保证获取到的是 DOM 更新后的最新值
        // 如果数据加载过慢，很可能导致clientWidth=0
        nextTick(() => {
          // 获取容器尺寸逻辑
          if (props.width && props.height) {
            state.width = props.width;
            state.height = props.height;
          } else {
            state.width = el.value?.clientWidth;
            state.height = el.value?.clientHeight;
          }

          // 初始化原始尺寸（取屏幕分辨率）
          if (!state.originalHeight || !state.originalWidth) {
            state.originalWidth = window.screen.width;
            state.originalHeight = window.screen.height;
          }
          resolve();
        });
      });
    };

    /** 初始化body样式（隐藏滚动条） */
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
        // 回退到原始尺寸
        el.value!.style.width = `${state.originalWidth}px`;
        el.value!.style.height = `${state.originalHeight}px`;
      }
    };

    /**
     * 应用缩放变换
     * @param {number} scale - 计算出的缩放比例
     */
    const autoScale = (scale: number) => {
      if (!props.autoScale) return;
      const domWidth = el.value!.clientWidth;
      const domHeight = el.value!.clientHeight;
      const currentWidth = document.body.clientWidth;
      const currentHeight = document.body.clientHeight;
      el.value!.style.transform = `scale(${scale},${scale})`;
      // 计算居中偏移量（确保内容始终居中）
      let mx = Math.max((currentWidth - domWidth * scale) / 2, 0);
      let my = Math.max((currentHeight - domHeight * scale) / 2, 0);
      // 处理轴向锁定配置   ???
      if (typeof props.autoScale === "object") {
        !props.autoScale.x && (mx = 0);
        !props.autoScale.y && (my = 0);
      }
      el.value!.style.margin = `${my}px ${mx}px`; // 应用偏移
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

    /**
     * 初始化DOM变化观察器
     * MutationObserver 可以捕获 元素自身属性变化（如手动修改style、动态内容导致的尺寸变化等）
     * 如果其他代码意外修改了.screen-wrapper的内联样式
     * 确保会触发 onResize，重新计算正确比例
     */
    const initMutationObserver = () => {
      const observer = (state.observer = new MutationObserver(() => {
        onResize(); // DOM属性变化时触发重计算
      }));
      observer.observe(el.value!, {
        attributes: true, // 监听属性变化
        attributeFilter: ["style"], // 只监听style属性
        attributeOldValue: true, // 记录旧值
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
      state.observer?.disconnect(); // 清理观察器
      if (props.bodyOverflowHidden) {
        document.body.style.overflow = bodyOverflowHidden;
      }
    });
    onActivated(updateScale); // keep-alive激活时更新

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
