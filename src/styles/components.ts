import styled from "@emotion/styled";

export const StyledContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  margin-top: -5vh;
`;

export const Button = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
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

export const IconButton = styled.button<{ variant?: 'primary' | 'success' | 'error' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: 40px;
  height: 40px;
  border: none;
  transition: ${({ theme }) => theme.transitions.default};
  cursor: pointer;

  ${({ theme, variant }) => {
    switch (variant) {
      case 'success':
        return `
          color: ${theme.colors.success};
          background: ${theme.colors.success}1a;
          opacity: 0.7;
          &:hover {
            opacity: 1;
            background: ${theme.colors.success}33;
            transform: scale(1.05);
          }
        `;
      case 'error':
        return `
          color: ${theme.colors.error};
          background: ${theme.colors.error}1a;
          opacity: 0.7;
          &:hover {
            opacity: 1;
            background: ${theme.colors.error}33;
            transform: scale(1.05);
          }
          &.confirming {
            opacity: 1;
            background: ${theme.colors.error}33;
            animation: pulse-delete 1.5s infinite;
          }
        `;
      default:
        return `
          color: white;
          background: ${theme.colors.accent};
          &:hover {
            background: ${theme.colors.accent}dd;
            transform: scale(1.05);
          }
          &.playing {
            background: ${theme.colors.warning};
          }
        `;
    }
  }}

  @keyframes pulse-delete {
    0% {
      transform: scale(1);
      background: ${({ theme }) => `${theme.colors.error}33`};
    }
    50% {
      transform: scale(1.05);
      background: ${({ theme }) => `${theme.colors.error}4d`};
    }
    100% {
      transform: scale(1);
      background: ${({ theme }) => `${theme.colors.error}33`};
    }
  }
`;

export const Modal = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
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

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.primary}1a`};
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.colors.surface};
  z-index: 1;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.primary};
    flex: 1;
  }
`;

export const ModalCloseButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => `${theme.colors.primary}0a`};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 24px;
  line-height: 1;
  transition: ${({ theme }) => theme.transitions.default};
  margin-left: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}1a`};
    transform: scale(1.1);
  }
`;
