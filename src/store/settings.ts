import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MetronomeSettings {
  volume: number;
  soundType: "beep" | "click" | "wood";
  accentVolume: number;
  accentFirst: boolean;
  timeSignature: "3/4" | "4/4";
}

const DEFAULT_SETTINGS = {
  volume: 0.5,
  soundType: "click" as const,
  accentVolume: 0.6,
  accentFirst: true,
  timeSignature: "4/4" as const,
};

interface SettingsState {
  metronome: MetronomeSettings;
  setMetronomeSettings: (settings: Partial<MetronomeSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      metronome: DEFAULT_SETTINGS,
      setMetronomeSettings: (settings) =>
        set((state) => ({
          metronome: {
            ...state.metronome,
            ...settings,
          },
        })),
      resetSettings: () =>
        set(() => ({
          metronome: DEFAULT_SETTINGS,
        })),
    }),
    {
      name: "app-settings",
    }
  )
);
