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
  pointer-events: none;
  padding-top: calc(env(safe-area-inset-top, 20px) + 20px);
  padding-bottom: 20px;
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
      const newMessage = event.detail;
      
      // 添加新消息
      setMessages(prev => [...prev, newMessage]);
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

export default MessageContainer; 