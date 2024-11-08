import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MetronomeSettings {
  volume: number;
  soundType: "beep" | "click" | "wood";
  accentVolume: number;
}

interface SettingsState {
  metronome: MetronomeSettings;
  setMetronomeSettings: (settings: Partial<MetronomeSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      metronome: {
        volume: 0.5,
        soundType: "click",
        accentVolume: 0.6,
      },
      setMetronomeSettings: (settings) =>
        set((state) => ({
          metronome: {
            ...state.metronome,
            ...settings,
          },
        })),
    }),
    {
      name: "app-settings",
    }
  )
);
