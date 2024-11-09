import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Controls,
  PendulumContainer,
  Pendulum,
  PendulumArm,
  PendulumBob,
  TempoDisplay,
  BpmText,
  BeatIndicator,
  Beat,
  TempoControl,
  TempoSlider,
  TempoPresets,
  PresetButton,
  TempoNumber,
} from "../styles/components/MetronomeStyles";
import { Button } from "../styles/components";
import { useSettingsStore } from "../store/settings";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface MetronomeProps {
  isPlaying: boolean;
  onPlayingChange: (isPlaying: boolean) => void;
}

// 添加常量配置
const METRONOME_CONFIG = {
  BPM: {
    MIN: 30,
    MAX: 180,
    DEFAULT: 120,
    PRESETS: [60, 90, 120, 140] as const,
  },
  SWING: {
    ANGLE: 30, // 摆动角度
    DURATION_FORMULA: 60, // 用于计算摆动周期：DURATION_FORMULA / tempo
  },
  PENDULUM: {
    MIN_POS: 40,
    MAX_POS: 100,
  },
} as const;

export const Metronome = ({ isPlaying, onPlayingChange }: MetronomeProps) => {
  const [tempo, setTempo] = useState<number | null>(null);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickTimeoutRef = useRef<number | null>(null);
  const beatCountRef = useRef(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [isTempoChanging, setIsTempoChanging] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTempo =
      typeof window !== "undefined" ? localStorage.getItem("lastTempo") : null;
    setTempo(savedTempo ? parseInt(savedTempo) : 120);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (tempo !== null) {
      localStorage.setItem("lastTempo", tempo.toString());
    }
  }, [tempo]);

  const playClick = useCallback(async (beatNumber: number) => {
    const { volume, accentVolume, soundType, accentFirst } =
      useSettingsStore.getState().metronome;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    const getSoundFrequency = (isAccent: boolean) => {
      switch (soundType) {
        case "beep":
          return isAccent ? 1800 : 1200; // 电子音 - 高频
        case "wood":
          return isAccent ? 180 : 120; // 木鱼音 - 低频
        case "click":
        default:
          return isAccent ? 1500 : 1000; // 点击音 - 中频
      }
    };

    const now = audioContextRef.current.currentTime;
    const isAccent = accentFirst && beatNumber === 0;

    oscillator.frequency.value = getSoundFrequency(isAccent);
    const clickVolume = isAccent ? volume * accentVolume : volume;
    gainNode.gain.value = clickVolume;

    switch (soundType) {
      case "beep":
        oscillator.start(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        oscillator.stop(now + 0.15);
        break;

      case "wood":
        const lowOscillator = audioContextRef.current.createOscillator();
        lowOscillator.connect(gainNode);
        lowOscillator.frequency.value = getSoundFrequency(isAccent) * 0.5;

        oscillator.start(now);
        lowOscillator.start(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        oscillator.stop(now + 0.08);
        lowOscillator.stop(now + 0.08);
        break;

      case "click":
      default:
        oscillator.start(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        oscillator.stop(now + 0.05);
        break;
    }

    setCurrentBeat(beatNumber);
  }, []);

  const startTicking = useCallback(() => {
    const currentTempo = tempo ?? METRONOME_CONFIG.BPM.DEFAULT;
    const interval = (60 / currentTempo) * 1000; // 一个完整周期的时间

    const tick = async () => {
      if (!isPlaying) return;

      // 设置下一次的完整周期定时器
      tickTimeoutRef.current = window.setTimeout(tick, interval);

      // 计算摆锤从一边到中间的时间（四分之一周期）
      const quarterPeriod = interval / 4;

      // 等待摆锤到达中间位置
      setTimeout(async () => {
        beatCountRef.current = (beatCountRef.current + 1) % 4;
        await playClick(beatCountRef.current);
      }, quarterPeriod);

      // 等待摆锤从另一边到达中间位置
      setTimeout(async () => {
        beatCountRef.current = (beatCountRef.current + 1) % 4;
        await playClick(beatCountRef.current);
      }, quarterPeriod * 3);
    };

    beatCountRef.current = -1;
    tick();
  }, [tempo, isPlaying, playClick]);

  useEffect(() => {
    if (isPlaying && !isDragging) {
      startTicking();
    } else {
      if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
        tickTimeoutRef.current = null;
      }
      if (!isPlaying) {
        setCurrentBeat(-1);
      }
    }

    return () => {
      if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
        tickTimeoutRef.current = null;
      }
    };
  }, [isPlaying, isDragging, startTicking]);

  const handleTempoChange = (newTempo: number) => {
    const clampedTempo = Math.min(
      Math.max(newTempo, METRONOME_CONFIG.BPM.MIN),
      METRONOME_CONFIG.BPM.MAX
    );
    setTempo(clampedTempo);
    setIsTempoChanging(true);
    setTimeout(() => setIsTempoChanging(false), 300);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleTempoChange(parseInt(e.target.value));
  };

  // 修改配重块位置计算逻辑
  const calculateBobPosition = useCallback((currentTempo: number) => {
    const { MIN_POS, MAX_POS } = METRONOME_CONFIG.PENDULUM;
    const { MIN, MAX } = METRONOME_CONFIG.BPM;

    const position =
      MIN_POS + ((currentTempo - MIN) / (MAX - MIN)) * (MAX_POS - MIN_POS);
    return Math.round(position);
  }, []);

  return (
    <Controls style={{ visibility: isLoaded ? "visible" : "hidden" }}>
      <PendulumContainer>
        <Pendulum
          className={isPlaying ? "active" : ""}
          style={
            {
              "--tempo": tempo,
            } as React.CSSProperties
          }
        >
          <PendulumArm />
          <PendulumBob
            style={{
              top: `${calculateBobPosition(tempo ?? 120)}px`,
            }}
          />
        </Pendulum>
      </PendulumContainer>

      <TempoDisplay>
        <TempoNumber className={isTempoChanging ? "changing" : ""}>
          {tempo ?? ""}
        </TempoNumber>
        <BpmText>BPM</BpmText>
      </TempoDisplay>

      <BeatIndicator>
        {[0, 1, 2, 3].map((beat) => (
          <Beat
            key={beat}
            active={currentBeat === beat}
            firstBeat={beat === 0}
          />
        ))}
      </BeatIndicator>

      <TempoControl>
        <TempoSlider
          type="range"
          min={METRONOME_CONFIG.BPM.MIN}
          max={METRONOME_CONFIG.BPM.MAX}
          value={tempo ?? METRONOME_CONFIG.BPM.DEFAULT}
          onMouseDown={() => {
            setIsDragging(true);
            if (isPlaying && tickTimeoutRef.current) {
              clearTimeout(tickTimeoutRef.current);
              tickTimeoutRef.current = null;
            }
          }}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => {
            setIsDragging(true);
            if (isPlaying && tickTimeoutRef.current) {
              clearTimeout(tickTimeoutRef.current);
              tickTimeoutRef.current = null;
            }
          }}
          onTouchEnd={() => setIsDragging(false)}
          onChange={handleSliderChange}
        />
        <TempoPresets>
          {METRONOME_CONFIG.BPM.PRESETS.map((presetTempo) => (
            <PresetButton
              key={presetTempo}
              isSelected={Number(tempo) === presetTempo}
              onClick={() => handleTempoChange(presetTempo)}
            >
              {presetTempo}
            </PresetButton>
          ))}
        </TempoPresets>
      </TempoControl>

      <Button onClick={() => onPlayingChange(!isPlaying)}>
        {isPlaying ? "停止" : "开始"}
      </Button>
    </Controls>
  );
};
