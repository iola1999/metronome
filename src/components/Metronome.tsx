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
  const [tempo, setTempo] = useState<number>(120);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickTimeoutRef = useRef<number | null>(null);
  const beatCountRef = useRef(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [isTempoChanging, setIsTempoChanging] = useState(false);

  useEffect(() => {
    const savedTempo =
      typeof window !== "undefined" ? localStorage.getItem("lastTempo") : null;
    if (savedTempo) {
      setTempo(parseInt(savedTempo));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lastTempo", tempo.toString());
  }, [tempo]);

  const playClick = useCallback(async (beatNumber: number) => {
    const { volume, accentVolume, soundType } =
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
    const isAccent = beatNumber === 0;

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
    const interval = (60 / tempo) * 1000;

    const tick = async () => {
      if (!isPlaying) return;

      beatCountRef.current = (beatCountRef.current + 1) % 4;

      await playClick(beatCountRef.current);

      tickTimeoutRef.current = window.setTimeout(tick, interval);
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

  return (
    <Controls>
      <PendulumContainer>
        <Pendulum
          className={isPlaying ? "active" : ""}
          style={{ "--tempo": tempo } as React.CSSProperties}
        >
          <PendulumArm />
          <PendulumBob />
        </Pendulum>
      </PendulumContainer>

      <TempoDisplay>
        <TempoNumber className={isTempoChanging ? "changing" : ""}>
          {tempo}
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
          value={tempo}
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
              active={tempo === presetTempo}
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
