type EventCallback = () => void;

// 添加事件类型定义
export type AppEvent = 'recordingsUpdated';

class EventEmitter {
  private listeners: { [key in AppEvent]?: EventCallback[] } = {};

  on(event: AppEvent, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: AppEvent, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: AppEvent) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback());
  }
}

export const eventBus = new EventEmitter(); 