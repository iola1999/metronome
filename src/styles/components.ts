import styled from '@emotion/styled';
import { Theme } from './theme';

type ThemedProps = {
  theme: Theme;
};

export const Container = styled.div<ThemedProps>`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  margin-top: -5vh;
`;

export const Button = styled.button<ThemedProps>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: 1.2rem;
  background-color: ${({ theme }) => theme.colors.accent};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const IconButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: 40px;
  height: 40px;
`;

export const Modal = styled.div<ThemedProps & { isOpen: boolean }>`
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: none;
  touch-action: none;
`;

export const ModalContent = styled.div<ThemedProps>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ModalHeader = styled.div<ThemedProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid #f1f1f1;
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.colors.surface};
  z-index: 1;
`;