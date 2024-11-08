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
