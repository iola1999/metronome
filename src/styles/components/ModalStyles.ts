import styled from "@emotion/styled";

export const Modal = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  touch-action: none;
  padding: ${({ theme }) => theme.spacing.md};
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  width: 90%;
  max-width: 500px;
  height: min(600px, 80vh);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  box-shadow: ${({ theme }) => theme.shadows.lg};

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.primary}1a`};
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.surface};
  z-index: 1;
  border-top-left-radius: ${({ theme }) => theme.borderRadius.md};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.md};

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

  &:active {
    transform: scale(0.95);
  }
`; 