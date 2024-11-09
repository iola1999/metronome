import styled from "@emotion/styled";

export const RecordingControlsContainer = styled.div`
  position: fixed;
  bottom: env(safe-area-inset-bottom, 20px);
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 100;
  padding: 0 16px;
  padding-bottom: max(env(safe-area-inset-bottom), 20px);
  box-sizing: border-box;
  width: 100%;
`;

export const RecordingMainControls = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 1fr;
  gap: 16px;
  align-items: center;
  background: ${({ theme }) => `${theme.colors.surface}f2`};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  box-shadow: ${({ theme }) => theme.shadows.md};
  height: 56px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
`;

export const RecordingLabel = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary}99;
  width: 20px;
  height: 20px;
  margin-top: 2px;
`;

export const RecordButton = styled.button<{ recording: boolean }>`
  height: 40px;
  min-width: 120px;
  max-width: 160px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: none;
  font-size: 16px;
  white-space: nowrap;
  transition: all 0.3s ease;
  background: ${({ theme, recording }) =>
    recording ? theme.colors.error : theme.colors.accent};
  color: white;
`;

export const RecordIcon = styled.span`
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  flex-shrink: 0;
`;

export const RecordTime = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.accent};
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.3s forwards;

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const ShowRecordingsButton = styled.button`
  height: 40px;
  min-width: 120px;
  max-width: 160px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: none;
  font-size: 16px;
  white-space: nowrap;
  transition: ${({ theme }) => theme.transitions.default};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
`;

export const RecordingsCount = styled.span`
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-block;
  min-width: 20px;
  text-align: center;
  line-height: 1.2;
`;

// 录音列表样式
export const RecordingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: calc(
    ${({ theme }) => theme.spacing.md} + env(safe-area-inset-bottom, 0)
  );
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  /* 美化滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => `${theme.colors.background}40`};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => `${theme.colors.primary}20`};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => `${theme.colors.primary}40`};
    }
  }
`;

export const NoRecordings = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => `${theme.colors.primary}80`};
`;

// 录音项样式
export const RecordingItemContainer = styled.div<{
  playing?: boolean;
  deleting?: boolean;
}>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: ${({ theme }) => theme.transitions.default};
  overflow: hidden;
  flex-shrink: 0;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  ${({ playing, theme }) =>
    playing &&
    `
    background: linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%);
    border-left: 4px solid ${theme.colors.accent};
    padding-left: calc(${theme.spacing.md} - 4px);
  `}

  ${({ deleting }) =>
    deleting &&
    `
    transform: translateX(100%);
    opacity: 0;
  `}
`;

export const RecordingItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
`;

export const RecordingInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const RecordingTime = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const RecordingDate = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 2px;
`;

export const RecordingDuration = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: ${({ theme }) => `${theme.colors.primary}80`};
  margin-top: 2px;
`;

export const RecordingControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-left: auto;
  flex-shrink: 0;
  padding-right: 0;
`;

// 播放进度条
export const PlaybackProgress = styled.div`
  position: relative;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export const ProgressBar = styled.div`
  height: 3px;
  background: ${({ theme }) => `${theme.colors.accent}1a`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: ${({ theme }) => theme.colors.accent};
  transition: width 0.1s linear;
  width: ${({ progress }) => `${progress}%`};
`;
