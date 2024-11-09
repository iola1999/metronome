import styled from "@emotion/styled";
import { useEffect, useState, useRef } from "react";

const MessageContainer = styled.div<{ type: MessageType; visible: boolean; height: number }>`
  opacity: ${({ visible }) => visible ? '1' : '0'};
  margin-bottom: ${({ visible, height }) => visible ? '8px' : '0'};
  height: ${({ visible, height }) => visible ? `${height}px` : '0'};
  background: ${({ theme, type }) => {
    switch (type) {
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.accent;
    }
  }};
  color: white;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.9rem;
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 2000;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: min(320px, calc(100vw - 48px));
  pointer-events: none;
  transform: translateY(${({ visible }) => visible ? '0' : '-20px'});
  overflow: hidden;
  box-sizing: border-box;
  word-break: break-word;
  line-height: 1.4;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

type MessageType = 'info' | 'error' | 'warning' | 'success';

// 添加 MessageItem 接口定义
interface MessageItem {
  id: number;
  content: React.ReactNode;
  type: MessageType;
  duration: number;
}

interface MessageProps {
  type?: MessageType;
  children: React.ReactNode;
  duration?: number;
  onClose?: () => void;
}

export const Message = ({ type = 'info', children, duration = 3000, onClose }: MessageProps) => {
  const [visible, setVisible] = useState(true);
  const [height, setHeight] = useState(0);
  const [removed, setRemoved] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      setHeight(messageRef.current.offsetHeight);
    }

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(hideTimer);
  }, [duration]);

  // 监听 visible 状态变化，处理动画完成后的移除
  useEffect(() => {
    if (!visible && !removed) {
      const removeTimer = setTimeout(() => {
        setRemoved(true);
        onClose?.();
      }, 300); // 动画持续时间

      return () => clearTimeout(removeTimer);
    }
  }, [visible, removed, onClose]);

  // 如果已被标记为移除，不再渲染
  if (removed) return null;

  const icons = {
    error: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    warning: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    success: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    info: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  return (
    <MessageContainer ref={messageRef} type={type} visible={visible} height={height}>
      <IconWrapper>{icons[type]}</IconWrapper>
      {children}
    </MessageContainer>
  );
};

// 消息管理器
interface MessageOptions {
  type?: MessageType;
  duration?: number;
}

// 创建自定义事件分发函数
const dispatchMessage = (messageData: MessageItem) => {
  const event = new CustomEvent('show-message', {
    detail: messageData
  });
  window.dispatchEvent(event);
};

// 创建消息的函数
const createMessage = (content: React.ReactNode, options: MessageOptions = {}) => {
  const id = Math.random();
  const messageData = {
    id,
    content,
    type: options.type || 'info',
    duration: options.duration || 3000,
  };
  
  // 确保在客户端环境下执行
  if (typeof window !== 'undefined') {
    dispatchMessage(messageData);
  }
  
  return id;
};

// 导出消息 API
export const message = {
  info: (content: React.ReactNode, options?: Omit<MessageOptions, 'type'>) =>
    createMessage(content, { ...options, type: 'info' }),
  error: (content: React.ReactNode, options?: Omit<MessageOptions, 'type'>) =>
    createMessage(content, { ...options, type: 'error' }),
  warning: (content: React.ReactNode, options?: Omit<MessageOptions, 'type'>) =>
    createMessage(content, { ...options, type: 'warning' }),
  success: (content: React.ReactNode, options?: Omit<MessageOptions, 'type'>) =>
    createMessage(content, { ...options, type: 'success' }),
}; 