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
    gainNode.gain.value = isAccent ? accentVolume : volume;

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
    const currentTempo = tempo ?? 120;
    const interval = (60 / currentTempo) * 1000;

    const tick = async () => {
      if (!isPlaying) return;

      // 设置下一次的定时器（一个完整周期）
      tickTimeoutRef.current = window.setTimeout(tick, interval);

      // 在摆针到达两侧时设置定时器，让声音在经过中间时触发
      setTimeout(async () => {
        beatCountRef.current = (beatCountRef.current + 1) % 4;
        await playClick(beatCountRef.current);
      }, interval / 4); // 四分之一周期后（摆针经过中点时）发声

      setTimeout(async () => {
        beatCountRef.current = (beatCountRef.current + 1) % 4;
        await playClick(beatCountRef.current);
      }, interval * 3/4); // 四分之三周期后（摆针再次经过中点时）发声
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
    const clampedTempo = Math.min(Math.max(newTempo, 30), 240);
    setTempo(clampedTempo);
    setIsTempoChanging(true);
    setTimeout(() => setIsTempoChanging(false), 300);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleTempoChange(parseInt(e.target.value));
  };

  // 修改配重块位置计算逻辑
  const calculateBobPosition = useCallback((currentTempo: number) => {
    // 速度范围是30-240，我们将配重块位置映射到20-140px
    const minPos = 20; // 最高位置（最慢速度）
    const maxPos = 140; // 最低位置（最快速度）
    const position =
      minPos + ((currentTempo - 30) / (240 - 30)) * (maxPos - minPos);
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
          min="30"
          max="240"
          value={tempo ?? 120}
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
          {[60, 90, 120, 160].map((presetTempo) => (
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
