import { io, type Socket } from "socket.io-client";
import { ref } from "vue";

interface WbeSocketOptions { 
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";
type EventCallback<T=any> = (data: T) => void;


export default function useWebSocket(
  url: string,
  options: WbeSocketOptions = {}
) { 
  const { 
    autoConnect = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 3000
  } = options;

  // 响应式状态
  const socket = ref<Socket | null>(null);
  const connectionStatus = ref<WebSocketStatus>("disconnected");
  const lastError = ref<Error | null>(null);
  const eventCallbacks = new Map<string, EventCallback>();

  // 初始化Socket.IO
  const initSocket = () => {
    socket.value = io(url, { autoConnect, reconnectionAttempts, reconnectionDelay });

    socket.value.on("connect", () => {
      connectionStatus.value = "connected";
      lastError.value = null;
    });

    socket.value.on("disconnect", () => {
      connectionStatus.value = "disconnected";
    });

    socket.value.on("error", (error: Error) => {
      connectionStatus.value = "error";
      lastError.value = error;
    });

    // 通用的消息处理
    socket.value.onAny((eventName: string, data: any) => {
      const callback = eventCallbacks.get(eventName);
      if (callback) {
        callback(data);
      }
    })
  };

  // 订阅事件
  const subscribe = <T>(eventName:string, callback:EventCallback<T>) => { 
    eventCallbacks.set(eventName, callback);
  }

  // 取消订阅
  const unsubscribe = (eventName: string) => { 
    eventCallbacks.delete(eventName);
  }

  // 手动连接
  const connect = () => { 
    if (!socket.value) { 
      initSocket();
    }
    socket.value?.connect();
  }

  const disconnect = () => {
    socket.value?.disconnect();
    eventCallbacks.clear();
  }

  if(autoConnect) { 
    initSocket();
  }

  return {
    socket,
    connectionStatus,
    lastError,
    subscribe,
    unsubscribe,
    connect,
    disconnect
  }
}