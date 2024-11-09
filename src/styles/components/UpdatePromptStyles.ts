import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const UpdatePromptContainer = styled.div<{ visible: boolean }>`
  position: fixed;
  bottom: max(env(safe-area-inset-bottom, 16px), 16px);
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 1000;
  display: ${({ visible }) => (visible ? "block" : "none")};
  animation: ${slideIn} 0.3s ease-out;
  max-width: min(360px, calc(100vw - 32px));
`;

export const UpdateMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

export const UpdateButton = styled.button<{
  variant?: "primary" | "secondary";
}>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  background: ${({ theme, variant }) =>
    variant === "primary" ? theme.colors.primary : theme.colors.background};
  color: ${({ theme, variant }) =>
    variant === "primary" ? "white" : theme.colors.text};
  border: 1px solid
    ${({ theme, variant }) =>
      variant === "primary" ? "transparent" : theme.colors.border};
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;
