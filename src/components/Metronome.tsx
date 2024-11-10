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
  CenterLine,
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
    MAX_POS: 110,
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
  const [isPendulumActive, setIsPendulumActive] = useState(false);
  const timeoutIdsRef = useRef<number[]>([]);

  const { timeSignature } = useSettingsStore((state) => state.metronome);
  const beatsPerBar = timeSignature === "3/4" ? 3 : 4;

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

    const now = audioContextRef.current.currentTime;
    const isAccent = accentFirst && beatNumber === 0;

    // 创建音频节点
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    const getSoundFrequency = (isAccent: boolean) => {
      switch (soundType) {
        case "beep":
          return isAccent ? 1800 : 1200;
        case "wood":
          return isAccent ? 180 : 120;
        case "click":
        default:
          return isAccent ? 1500 : 1000;
      }
    };

    oscillator.frequency.value = getSoundFrequency(isAccent);
    const clickVolume = isAccent ? volume * accentVolume : volume;

    // 使用精确的时间调度
    gainNode.gain.setValueAtTime(clickVolume, now);

    switch (soundType) {
      case "beep":
        oscillator.start(now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        oscillator.stop(now + 0.15);
        break;

      case "wood":
        const lowOscillator = audioContextRef.current.createOscillator();
        lowOscillator.connect(gainNode);
        lowOscillator.frequency.value = getSoundFrequency(isAccent) * 0.5;

        oscillator.start(now);
        lowOscillator.start(now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        oscillator.stop(now + 0.08);
        lowOscillator.stop(now + 0.08);
        break;

      case "click":
      default:
        oscillator.start(now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        oscillator.stop(now + 0.05);
        break;
    }

    setCurrentBeat(beatNumber);
  }, []);

  const clearAllTimeouts = useCallback(() => {
    // 清除主定时器
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = null;
    }

    // 清除所有存储的定时器
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];

    // 重置状态
    beatCountRef.current = -1;
    setCurrentBeat(-1);
    setIsPendulumActive(false);
  }, []);

  const startTicking = useCallback(() => {
    const currentTempo = tempo ?? METRONOME_CONFIG.BPM.DEFAULT;
    const interval = (60 / currentTempo) * 1000;
    const halfInterval = interval / 2; // 添加半拍间隔

    const tick = () => {
      if (!isPlaying) return;

      // 第一拍
      const firstBeatTimeout = setTimeout(() => {
        beatCountRef.current = (beatCountRef.current + 1) % beatsPerBar;
        playClick(beatCountRef.current);
      }, halfInterval) as unknown as number; // 延迟半拍，使声音在中间位置发出

      // 剩余的拍子
      for (let i = 1; i < beatsPerBar; i++) {
        const nextBeatTimeout = setTimeout(() => {
          beatCountRef.current = (beatCountRef.current + 1) % beatsPerBar;
          playClick(beatCountRef.current);
        }, interval * i + halfInterval) as unknown as number; // 每拍都延迟半拍
        timeoutIdsRef.current.push(nextBeatTimeout);
      }

      timeoutIdsRef.current.push(firstBeatTimeout);

      // 下一个小节
      tickTimeoutRef.current = window.setTimeout(tick, interval * beatsPerBar);
    };

    clearAllTimeouts();
    setIsPendulumActive(true);
    tick();
  }, [tempo, isPlaying, playClick, clearAllTimeouts, beatsPerBar]);

  useEffect(() => {
    if (isPlaying && !isDragging) {
      requestAnimationFrame(() => {
        setIsPendulumActive(true);
        startTicking();
      });
    } else {
      clearAllTimeouts();
    }

    return () => {
      clearAllTimeouts();
    };
  }, [isPlaying, isDragging, startTicking, clearAllTimeouts]);

  const handleTempoChange = (newTempo: number) => {
    const clampedTempo = Math.min(
      Math.max(newTempo, METRONOME_CONFIG.BPM.MIN),
      METRONOME_CONFIG.BPM.MAX
    );

    // 先停止所有计时器
    clearAllTimeouts();

    // 更新 tempo
    setTempo(clampedTempo);
    setIsTempoChanging(true);

    // 如果正在播放，重新开始
    if (isPlaying && !isDragging) {
      startTicking();
    }

    setTimeout(() => setIsTempoChanging(false), 300);
  };

  const handleSliderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleTempoChange(parseInt(e.target.value));
  };

  // 修改配重块位置计算逻辑
  const calculateBobPosition = useCallback((currentTempo: number) => {
    const { MIN_POS, MAX_POS } = METRONOME_CONFIG.PENDULUM;
    const { MIN, MAX } = METRONOME_CONFIG.BPM;

    const position =
      MIN_POS + ((currentTempo - MIN) / (MAX - MIN)) * (MAX_POS - MIN_POS);
    return Math.round(position);
  }, []);

  const handleSliderMouseDown = () => {
    setIsDragging(true);
    clearAllTimeouts();
  };

  const handleSliderMouseUp = () => {
    setIsDragging(false);
    if (isPlaying) {
      requestAnimationFrame(() => {
        setIsPendulumActive(true);
        startTicking();
      });
    }
  };

  return (
    <Controls style={{ visibility: isLoaded ? "visible" : "hidden" }}>
      <PendulumContainer>
        <CenterLine />
        <Pendulum
          className={isPendulumActive ? "active" : ""}
          style={
            {
              "--tempo": tempo,
              transform: !isPendulumActive ? "rotate(0deg)" : undefined,
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
        {Array.from({ length: beatsPerBar }).map((_, beat) => (
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
          onMouseDown={handleSliderMouseDown}
          onMouseUp={handleSliderMouseUp}
          onTouchStart={handleSliderMouseDown}
          onTouchEnd={handleSliderMouseUp}
          onChange={handleSliderChange}
        />
        <TempoPresets>
          {METRONOME_CONFIG.BPM.PRESETS.map((presetTempo) => (
            <PresetButton
              key={presetTempo}
              isSelected={Number(tempo) === presetTempo}
              onClick={async () => {
                await handleTempoChange(presetTempo);
              }}
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
