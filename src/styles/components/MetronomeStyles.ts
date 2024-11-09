import styled from "@emotion/styled";

export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const PendulumContainer = styled.div`
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 20px;
`;

export const Pendulum = styled.div`
  position: relative;
  height: 160px;
  transform-origin: bottom center;
  transition: transform 0.2s ease;

  &.active {
    animation: swing calc(60s / var(--tempo)) infinite ease-in-out;
  }

  @keyframes swing {
    0% { transform: rotate(30deg); }
    50% { transform: rotate(-30deg); }
    100% { transform: rotate(30deg); }
  }
`;

export const PendulumArm = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  background: #666;
  transform: translateX(-50%);
`;

export const PendulumBob = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  width: 20px;
  height: 20px;
  background: #333;
  border-radius: 50%;
  transform: translateX(-50%);
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
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: ${({ theme }) => `${theme.colors.background}cc`};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    border: none;
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
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }
`;

export const TempoPresets = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export const PresetButton = styled.button<{ isSelected?: boolean }>`
  padding: 8px 16px;
  font-size: 1rem;
  border: none;
  background: ${props => props.isSelected ? '#007AFF' : '#f0f0f0'};
  color: ${props => props.isSelected ? 'white' : 'black'};
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;
