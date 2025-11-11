const eventNames = ["API:UN_AUTHORIZED", "API:INVALID", "API:NETWORK_ERROR", "API:SESSION_EXPIRED"] as const;
type EventName = typeof eventNames[number];

// 发布订阅模式
class EventEmitter { 
  private listeners: Record<EventName, Set<Function>> = {
    "API:UN_AUTHORIZED": new Set,
    "API:INVALID": new Set,
    "API:NETWORK_ERROR": new Set,
    "API:SESSION_EXPIRED": new Set
  }

  // 监听事件，和dom注册事件是一个道理，将来某个事件发生的时候需要运行哪个函数
  on(eventName: EventName, listener: Function) { 
    this.listeners[eventName].add(listener);
  }

  // 触发事件，当某个事件发生的时候，调用监听的函数
  emit(eventName: EventName, ...args: any[]) { 
    this.listeners[eventName].forEach(listener => listener(...args));
  }
}

export default new EventEmitter();