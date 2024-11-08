import { useEffect, useRef, useState, useCallback } from "react";
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
} from "../styles/components/MetronomeStyles";
import { Button } from "../styles/components";

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
  const [tempo, setTempo] = useState(() =>
    parseInt(localStorage.getItem("lastTempo") || "120")
  );
  const [currentBeat, setCurrentBeat] = useState(-1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickTimeoutRef = useRef<number | null>(null);
  const beatCountRef = useRef(-1);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem("lastTempo", tempo.toString());
  }, [tempo]);

  const playClick = useCallback(async (beatNumber: number) => {
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

    if (beatNumber === 0) {
      oscillator.frequency.value = 1500;
      gainNode.gain.value = 0.6;
    } else {
      oscillator.frequency.value = 1000;
      gainNode.gain.value = 0.4;
    }

    const now = audioContextRef.current.currentTime;
    oscillator.start(now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    oscillator.stop(now + 0.1);

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
        <span>{tempo}</span>
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
          onChange={(e) => handleTempoChange(parseInt(e.target.value))}
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
