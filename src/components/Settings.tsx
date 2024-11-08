import styled from "@emotion/styled";
import { useSettingsStore } from "../store/settings";
import { Modal } from "./Modal";

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
`;

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { metronome, setMetronomeSettings } = useSettingsStore();

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
    </Modal>
  );
};
