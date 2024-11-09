import styled from "@emotion/styled";
import { useSettingsStore } from "../store/settings";
import { Modal } from "./Modal";
import { useState } from "react";
import { message } from "./Message";
import { eventBus } from "../util/events";
import { RecordingsDB } from "../util/db";

const SettingSection = styled.div`
  padding: ${({ theme }) => theme.spacing.md};

  &:not(:first-of-type) {
    border-top: 1px solid ${({ theme }) => `${theme.colors.primary}1a`};
  }

  h3 {
    margin: -${({ theme }) => theme.spacing.md} -${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    position: sticky;
    top: 0;
    background: ${({ theme }) => `${theme.colors.primary}08`};
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(64px);
    border-bottom: 1px solid ${({ theme }) => `${theme.colors.primary}1a`};
    z-index: 1;
  }
`;

const SettingsContent = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 70vh; // 设置最大高度
  
  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => `${theme.colors.primary}0a`};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => `${theme.colors.primary}33`};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => `${theme.colors.primary}66`};
    }
  }
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  label {
    flex: none;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Slider = styled.input`
  width: 120px;
  height: 32px;
`;

const Select = styled.select`
  width: 120px;
  height: 32px;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}33`};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};

  /* 禁用 iOS 上的默认选中效果 */
  -webkit-appearance: none;
  appearance: none;
  outline: none;

  /* 添加自定义箭头 */
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 32px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.accent}33`};
  }
`;

const ActionSection = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => `${theme.colors.primary}1a`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled.button<{ variant?: "primary" | "danger" }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, variant }) =>
    variant === "danger"
      ? `${theme.colors.error}1a`
      : `${theme.colors.primary}1a`};
  color: ${({ theme, variant }) =>
    variant === "danger" ? theme.colors.error : theme.colors.primary};
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: ${({ theme, variant }) =>
      variant === "danger"
        ? `${theme.colors.error}33`
        : `${theme.colors.primary}33`};
  }

  &:not(:disabled):active {
    transform: scale(0.98);
  }

  &.confirming {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => `${theme.colors.primary}33`};
    transition: 0.3s;
    border-radius: 20px;

    &:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: ${({ theme }) => theme.colors.accent};
  }

  input:checked + span:before {
    transform: translateX(16px);
  }
`;

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { metronome, setMetronomeSettings, resetSettings } = useSettingsStore();
  const [isClearing, setIsClearing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);

  const clearCache = async () => {
    setIsClearing(true);
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(async (registration) => {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map((cacheName) => caches.delete(cacheName))
            );
            await registration.unregister();
          })
        );
        window.location.reload();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        message.success("缓存已清除");
        setIsClearing(false);
      }
    } catch (error) {
      console.error("清除缓存失败:", error);
      message.error("清除缓存失败，请重试");
      setIsClearing(false);
    }
  };

  const clearData = async () => {
    if (!showClearDataConfirm) {
      setShowClearDataConfirm(true);
      setTimeout(() => setShowClearDataConfirm(false), 3000);
      return;
    }

    try {
      // 创建数据库实例
      const db = new RecordingsDB();
      await db.init();

      // 获取所有录音并逐个删除
      const recordings = await db.getAllRecordings();
      for (const recording of recordings) {
        if (recording.id) {
          await db.deleteRecording(recording.id);
        }
      }

      message.success("已删除所有录音");
      setShowClearDataConfirm(false);
      // 触发录音列表更新事件
      eventBus.emit("recordingsUpdated");
    } catch (error) {
      console.error("删除数据失败:", error);
      message.error("删除数据失败，请重试");
      setShowClearDataConfirm(false);
    }
  };

  const handleResetSettings = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
      return;
    }

    resetSettings();
    message.success("设置已重置");
    setShowResetConfirm(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="设置">
      <SettingsContent>
        <SettingSection>
          <h3>节拍器</h3>
          <SettingRow>
            <label>拍号</label>
            <Select
              value={metronome.timeSignature}
              onChange={(e) =>
                setMetronomeSettings({ timeSignature: e.target.value as "3/4" | "4/4" })
              }
            >
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
            </Select>
          </SettingRow>
          <SettingRow>
            <label>音效</label>
            <Select
              value={metronome.soundType}
              onChange={(e) =>
                setMetronomeSettings({ soundType: e.target.value as any })
              }
            >
              <option value="beep">电子音</option>
              <option value="click">点击音</option>
              <option value="wood">木鱼音</option>
            </Select>
          </SettingRow>
          <SettingRow>
            <label>总音量</label>
            <Slider
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={metronome.volume}
              onChange={(e) =>
                setMetronomeSettings({ volume: Number(e.target.value) })
              }
            />
          </SettingRow>
          <SettingRow>
            <label>首拍重音</label>
            <Switch>
              <input
                type="checkbox"
                checked={metronome.accentFirst}
                onChange={(e) =>
                  setMetronomeSettings({ accentFirst: e.target.checked })
                }
              />
              <span />
            </Switch>
          </SettingRow>
          {metronome.accentFirst && (
            <SettingRow>
              <label>重音音量</label>
              <Slider
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={metronome.accentVolume}
                onChange={(e) =>
                  setMetronomeSettings({ accentVolume: Number(e.target.value) })
                }
              />
            </SettingRow>
          )}
        </SettingSection>

        <SettingSection>
          <h3>系统</h3>
          <SettingRow>
            <label>清除缓存</label>
            <ActionButton 
              onClick={clearCache} 
              disabled={isClearing}
              style={{ width: '120px' }}
            >
              {isClearing ? (
                <>
                  <LoadingSpinner />
                  清除中...
                </>
              ) : (
                "清除"
              )}
            </ActionButton>
          </SettingRow>
          <SettingRow>
            <label>恢复默认设置</label>
            <ActionButton
              onClick={handleResetSettings}
              className={showResetConfirm ? "confirming" : ""}
              style={{ width: '120px' }}
            >
              {showResetConfirm ? "确认重置" : "重置"}
            </ActionButton>
          </SettingRow>
          <SettingRow>
            <label>删除所有录音</label>
            <ActionButton
              variant="danger"
              onClick={clearData}
              className={showClearDataConfirm ? "confirming" : ""}
              style={{ width: '120px' }}
            >
              {showClearDataConfirm ? "确认删除" : "删除"}
            </ActionButton>
          </SettingRow>
        </SettingSection>
      </SettingsContent>
    </Modal>
  );
};
