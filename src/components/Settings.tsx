import styled from "@emotion/styled";
import { useSettingsStore } from "../store/settings";
import { Modal } from "./Modal";
import { useState } from "react";

const SettingSection = styled.div`
  padding: ${({ theme }) => theme.spacing.md};

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  label {
    flex: 1;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Slider = styled.input`
  flex: 2;
  height: 32px;
`;

const Select = styled.select`
  flex: 2;
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
`;

const ActionButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => `${theme.colors.error}1a`};
  color: ${({ theme }) => theme.colors.error};
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
    background: ${({ theme }) => `${theme.colors.error}33`};
  }

  &:not(:disabled):active {
    transform: scale(0.98);
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

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { metronome, setMetronomeSettings } = useSettingsStore();
  const [isClearing, setIsClearing] = useState(false);

  const clearCache = async () => {
    setIsClearing(true);
    try {
      // 获取所有的 Service Worker 注册
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // 清除每个 Service Worker 的缓存
      await Promise.all(registrations.map(async (registration) => {
        // 获取该 Service Worker 控制的所有缓存名称
        const cacheNames = await caches.keys();
        
        // 删除所有缓存
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        
        // 注销 Service Worker
        await registration.unregister();
      }));

      // 刷新页面以重新安装 Service Worker
      window.location.reload();
    } catch (error) {
      console.error('清除缓存失败:', error);
      alert('清除缓存失败，请重试');
      setIsClearing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="设置">
      <SettingSection>
        <h3>节拍器</h3>
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
          <label>音量</label>
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
          <label>重拍音量</label>
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
      </SettingSection>

      <ActionSection>
        <ActionButton 
          onClick={clearCache}
          disabled={isClearing}
        >
          {isClearing ? (
            <>
              <LoadingSpinner />
              正在清除缓存...
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 0 0-9-9M3 12a9 9 0 0 1 9-9M21 12a9 9 0 0 1-9 9M3 12a9 9 0 0 0 9 9" />
              </svg>
              清除应用缓存
            </>
          )}
        </ActionButton>
      </ActionSection>
    </Modal>
  );
};
