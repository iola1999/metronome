import styled from "@emotion/styled";

export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const PendulumContainer = styled.div`
  height: 100px;
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  overflow: hidden;
`;

export const Pendulum = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  width: 4px;
  height: 80px;
  transform-origin: top center;
  transform: translateX(-50%);

  &.active {
    animation: swing calc(60s / var(--tempo)) infinite ease-in-out alternate;
  }

  @keyframes swing {
    0% {
      transform: translateX(-50%) rotate(-30deg);
    }
    100% {
      transform: translateX(-50%) rotate(30deg);
    }
  }
`;

export const PendulumArm = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    ${({ theme }) => theme.colors.accent},
    ${({ theme }) => `${theme.colors.accent}cc`}
  );
`;

export const PendulumBob = styled.div`
  position: absolute;
  bottom: -12px;
  left: 50%;
  width: 24px;
  height: 24px;
  background: ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transform: translateX(-50%);
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const TempoDisplay = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const TempoNumber = styled.span`
  font-size: 3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.changing {
    animation: tempoChange 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes tempoChange {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
      color: ${({ theme }) => theme.colors.accent};
    }
    100% {
      transform: scale(1);
    }
  }
`;

export const BpmText = styled.span`
  font-size: 1rem;
  opacity: 0.6;
  margin-left: ${({ theme }) => theme.spacing.xs};
  font-weight: 500;
`;

export const BeatIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.xs} 0;
`;

export const Beat = styled.div<{ active?: boolean; firstBeat?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.background};
  transition: ${({ theme }) => theme.transitions.default};

  ${({ active, firstBeat, theme }) =>
    active &&
    `
    transform: scale(1.3);
    background-color: ${firstBeat ? theme.colors.error : theme.colors.accent};
    box-shadow: 0 0 10px ${
      firstBeat ? `${theme.colors.error}80` : `${theme.colors.accent}80`
    };
  `}
`;

export const TempoControl = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  margin: ${({ theme }) => `${theme.spacing.xs} -${theme.spacing.md}`};
  touch-action: none;
`;

export const TempoSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 40px;
  background: transparent;
  padding: 0;
  margin: 0;

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: ${({ theme }) => `${theme.colors.background}cc`};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    cursor: pointer;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 32px;
    width: 32px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    background: ${({ theme }) => theme.colors.accent};
    cursor: pointer;
    margin-top: -12px;
    box-shadow: ${({ theme }) => theme.shadows.sm};
    border: 2px solid white;
  }
`;

export const TempoPresets = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export const PresetButton = styled.button<{ active?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  font-size: 1rem;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.accent : theme.colors.background};
  color: ${({ theme, active }) => (active ? "white" : theme.colors.primary)};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accent};
    color: white;
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.95);
  }
`;
