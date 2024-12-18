import styled from "@emotion/styled";

export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const PendulumContainer = styled.div`
  height: 160px;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 0;
`;

// 新增参考线组件
export const CenterLine = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: ${({ theme }) => `${theme.colors.border}40`};
  z-index: 0;
  pointer-events: none;
`;

export const PendulumArm = styled.div`
  width: 4px;
  height: 140px;
  background: linear-gradient(
    to right,
    #666666,
    #999999 20%,
    #cccccc 50%,
    #999999 80%,
    #666666
  );
  position: absolute;
  bottom: 0;
  transform-origin: bottom center;
  box-shadow: -1px 0 1px rgba(255, 255, 255, 0.5), 1px 0 1px rgba(0, 0, 0, 0.3);
  border-radius: 2px;
`;

export const PendulumBob = styled.div`
  width: 24px;
  height: 36px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(
    to right,
    #d0d0d0,
    #e8e8e8 20%,
    #f5f5f5 40%,
    #e8e8e8 80%,
    #d0d0d0 100%
  );
  border: 1px solid #999;
  border-radius: 2px;
  box-shadow: inset -1px -1px 2px rgba(0, 0, 0, 0.2),
    inset 1px 1px 2px rgba(255, 255, 255, 0.3), 2px 2px 4px rgba(0, 0, 0, 0.1);

  // 添加刻度线效果
  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 1px;
    background: #999;
  }

  &::before {
    top: 33%;
  }

  &::after {
    top: 66%;
  }
`;

export const Pendulum = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  transform-origin: bottom center;
  transition: transform 0.3s ease-out;
  z-index: 1;

  &.active {
    transition: none;
    animation: swing calc(120s / var(--tempo)) infinite;
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }

  @keyframes swing {
    0% {
      transform: rotate(calc(min(40deg, 30deg * (120 / var(--tempo)))));
    }
    50% {
      transform: rotate(calc(max(-40deg, -30deg * (120 / var(--tempo)))));
    }
    100% {
      transform: rotate(calc(min(40deg, 30deg * (120 / var(--tempo)))));
    }
  }
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
  font-family: "JetBrains Mono", Consolas, Monaco, "Courier New", monospace;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 3.6ch;
  display: inline-block;
  text-align: right;

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
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  margin: ${({ theme }) => `${theme.spacing.xs} -${theme.spacing.sm}`};
  touch-action: none;
`;

export const TempoSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 32px;
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
    height: 28px;
    width: 28px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    background: ${({ theme }) => theme.colors.accent};
    cursor: pointer;
    margin-top: -10px;
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
  padding: 6px 12px;
  font-size: 1rem;
  border: none;
  background: ${(props) => (props.isSelected ? "#007AFF" : "#f0f0f0")};
  color: ${(props) => (props.isSelected ? "white" : "black")};
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;
