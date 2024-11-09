import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Message } from "./Message";
import styled from "@emotion/styled";

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
`;

interface MessageItem {
  id: number;
  content: React.ReactNode;
  type: 'info' | 'error' | 'warning' | 'success';
  duration: number;
}

const MessageContainer = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMessage = (event: CustomEvent<MessageItem>) => {
      setMessages(prev => [...prev, event.detail]);
    };

    window.addEventListener('show-message' as any, handleMessage);
    return () => window.removeEventListener('show-message' as any, handleMessage);
  }, []);

  const handleClose = (id: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  if (!mounted) return null;

  return createPortal(
    <Container>
      {messages.map(msg => (
        <Message
          key={msg.id}
          type={msg.type}
          duration={msg.duration}
          onClose={() => handleClose(msg.id)}
        >
          {msg.content}
        </Message>
      ))}
    </Container>,
    document.body
  );
};

// 默认导出组件
export default MessageContainer; 