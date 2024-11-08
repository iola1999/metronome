import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export const Metronome = () => {
  const [tempo, setTempo] = useState(() => 
    parseInt(localStorage.getItem("lastTempo") || "120")
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickTimeoutRef = useRef<number | null>(null);
  const currentBeatRef = useRef(0);

  useEffect(() => {
    localStorage.setItem("lastTempo", tempo.toString());
  }, [tempo]);

  const playClick = async () => {
    if (!audioContextRef.current) return;

    currentBeatRef.current = (currentBeatRef.current + 1) % 4;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    if (currentBeatRef.current === 0) {
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
  };

  const start = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    setIsPlaying(true);
    const interval = (60 / tempo) * 1000;
    await playClick();

    const tick = async () => {
      if (!isPlaying) return;

      if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
      }

      tickTimeoutRef.current = window.setTimeout(async () => {
        if (isPlaying) {
          await playClick();
          tick();
        }
      }, interval);
    };

    tick();
  };

  const stop = () => {
    setIsPlaying(false);
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = null;
    }
    currentBeatRef.current = -1;
  };

  const handleTempoChange = (newTempo: number) => {
    const clampedTempo = Math.min(Math.max(newTempo, 30), 240);
    setTempo(clampedTempo);
    if (isPlaying) {
      stop();
      start();
    }
  };

  return (
    <div className="controls">
      <div className="tempo-display">
        <span>{tempo}</span>
        <span className="bpm-text">BPM</span>
      </div>
      
      <div className="beat-indicator">
        {[0, 1, 2, 3].map((beat) => (
          <div
            key={beat}
            className={`beat ${beat === currentBeatRef.current ? 'active' : ''}`}
          />
        ))}
      </div>

      <div className="tempo-control">
        <input
          type="range"
          min="30"
          max="240"
          value={tempo}
          onChange={(e) => handleTempoChange(parseInt(e.target.value))}
        />
        <div className="tempo-presets">
          {[60, 90, 120, 160].map((presetTempo) => (
            <button
              key={presetTempo}
              className={`preset-btn ${tempo === presetTempo ? 'active' : ''}`}
              onClick={() => handleTempoChange(presetTempo)}
            >
              {presetTempo}
            </button>
          ))}
        </div>
      </div>

      <button onClick={isPlaying ? stop : start}>
        {isPlaying ? '停止' : '开始'}
      </button>
    </div>
  );
}; 